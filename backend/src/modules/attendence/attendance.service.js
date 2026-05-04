'use strict';

const { Op } = require('sequelize');
const { Attendance, User, Role } = require('../../database/initModels');
const eventBus = require('../../utils/Eventbus');
const logger = require('../../config/logger');

// ─────────────────────────────────────────────────────────────
// Constants (fallback defaults when no shift assigned)
// ─────────────────────────────────────────────────────────────

const DEFAULT_SHIFT = {
  startTime: '09:00',
  endTime: '18:00',
  graceMins: 15,
};

const STANDARD_MINS = 9 * 60; // 9 hours

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const toMins = (t) => {
  const [h, m] = (t || '00:00').split(':').map(Number);
  return h * 60 + m;
};
const todayISO = () => {
  return new Date().toLocaleDateString('en-CA');
};
const makeError = (msg, code = 400) => {
  const e = new Error(msg);
  e.statusCode = code;
  return e;
};

// ─────────────────────────────────────────────────────────────
// Resolve employee's shift (with fallback to defaults)
// ─────────────────────────────────────────────────────────────

const resolveShift = async (employeeId) => {
  try {
    const user = await User.findByPk(employeeId, {
      include: [{ association: 'shift', required: false }],
    });

    const shift = user?.shift;
    if (!shift) return DEFAULT_SHIFT;

    return {
      startTime: shift.startTime ?? DEFAULT_SHIFT.startTime,
      endTime: shift.endTime ?? DEFAULT_SHIFT.endTime,
      graceMins: shift.graceMins ?? DEFAULT_SHIFT.graceMins,
    };
  } catch {
    return DEFAULT_SHIFT;
  }
};

// ─────────────────────────────────────────────────────────────
// Metrics calculation (shift-aware)
// ─────────────────────────────────────────────────────────────

const calcMetricsWithShift = (checkInTime, checkOutTime, shift) => {
  const cinM = toMins(checkInTime);
  const coutM = toMins(checkOutTime);

  let workedMinutes;
  if (coutM < cinM) {
    // overnight shift
    workedMinutes = (1440 - cinM) + coutM;
  } else {
    workedMinutes = coutM - cinM;
  }

  const shiftStartM = toMins(shift.startTime);
  const shiftEndM = toMins(shift.endTime);
  const standardM = shiftEndM - shiftStartM;

  // const workedMinutes = coutM - cinM;
  const isLate = cinM > shiftStartM + (shift.graceMins ?? 15);
  const lateMinutes = isLate ? cinM - shiftStartM : 0;
  const overtimeMinutes = Math.max(0, workedMinutes - standardM);
  const hasOvertime = overtimeMinutes > 0;

  let status;
  if (workedMinutes < standardM / 2) status = 'half_day';
  else if (isLate) status = 'late';
  else status = 'present';

  return { workedMinutes, isLate, lateMinutes, overtimeMinutes, hasOvertime, status };
};

// Legacy wrapper (for adminRecord which doesn't need shift lookup)
const calcMetrics = (checkInTime, checkOutTime) =>
  calcMetricsWithShift(checkInTime, checkOutTime, DEFAULT_SHIFT);

// ─────────────────────────────────────────────────────────────
// Fetch manager + HR + admin IDs for notifications
// ─────────────────────────────────────────────────────────────

const getNotifyTargets = async (employeeId) => {
  try {
    const employee = await User.findByPk(employeeId, {
      attributes: ['id', 'firstName', 'lastName', 'managerId'],
      include: [{ association: 'role', attributes: ['name'], required: false }],
    });

    if (!employee) return { employee: null, managerIds: [], hrAdminIds: [] };

    // HR and Admin users
    const hrAdmins = await User.findAll({
      include: [{
        association: 'role',
        where: { name: ['HR', 'Admin'] },
        required: true,
        attributes: ['name'],
      }],
      where: { isActive: true },
      attributes: ['id'],
    });

    const hrAdminIds = hrAdmins.map(u => u.id).filter(id => id !== employeeId);
    const managerIds = employee.managerId
      ? [employee.managerId].filter(id => !hrAdminIds.includes(id))
      : [];

    return { employee, managerIds, hrAdminIds };
  } catch (err) {
    logger.error({ event: 'GET_NOTIFY_TARGETS_ERROR', employeeId, error: err.message });
    return { employee: null, managerIds: [], hrAdminIds: [] };
  }
};

// ─────────────────────────────────────────────────────────────
// Emit late check-in event to all relevant parties
// ─────────────────────────────────────────────────────────────

const emitLateCheckIn = async ({ employeeId, date, lateMinutes, checkInTime }) => {
  try {
    const { employee, managerIds, hrAdminIds } = await getNotifyTargets(employeeId);
    if (!employee) return;

    const employeeName = `${employee.firstName} ${employee.lastName}`.trim();

    // 1. Notify the employee themselves
    eventBus.emit('ATTENDANCE_CHECKED_IN_LATE', {
      employeeId,
      date,
      lateMinutes,
    });

    // 2. Notify manager
    for (const managerId of managerIds) {
      eventBus.emit('SEND_NOTIFICATION', {
        userId: managerId,
        payload: {
          type: 'TEAM_LATE_CHECKIN',
          title: 'Team Member Late Check-In',
          message: `${employeeName} checked in at ${checkInTime} — ${lateMinutes} min late.`,
          employeeId,
          date,
          lateMinutes,
          checkInTime,
        },
      });
    }

    // 3. Notify HR + Admin
    for (const adminId of hrAdminIds) {
      eventBus.emit('SEND_NOTIFICATION', {
        userId: adminId,
        payload: {
          type: 'TEAM_LATE_CHECKIN',
          title: 'Late Attendance Alert',
          message: `${employeeName} was ${lateMinutes} min late on ${date}.`,
          employeeId,
          date,
          lateMinutes,
          checkInTime,
        },
      });
    }
  } catch (err) {
    logger.error({ event: 'EMIT_LATE_CHECKIN_ERROR', employeeId, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Emit checkout summary to manager/HR/admin (overtime / early)
// ─────────────────────────────────────────────────────────────

const emitCheckOutSummary = async ({
  employeeId,
  date,
  checkOutTime,
  workedMinutes,
  overtimeMinutes,
  status,
}) => {
  try {
    const { employee, managerIds, hrAdminIds } = await getNotifyTargets(employeeId);
    if (!employee) return;

    const employeeName = `${employee.firstName} ${employee.lastName}`.trim();
    const workedHours = (workedMinutes / 60).toFixed(1);
    const otHours = (overtimeMinutes / 60).toFixed(1);

    const isEarlyExit = status === 'half_day';
    const hasOvertime = overtimeMinutes > 0;

    // Only notify supervisor on half-day (early exit) or overtime
    if (!isEarlyExit && !hasOvertime) return;

    const title = isEarlyExit
      ? `Early Exit — ${employeeName}`
      : `Overtime Recorded — ${employeeName}`;

    const message = isEarlyExit
      ? `${employeeName} checked out at ${checkOutTime} after only ${workedHours}h on ${date}.`
      : `${employeeName} worked ${workedHours}h (${otHours}h overtime) on ${date}.`;

    const payload = {
      type: isEarlyExit ? 'TEAM_EARLY_EXIT' : 'TEAM_OVERTIME',
      title,
      message,
      employeeId,
      date,
      checkOutTime,
      workedMinutes,
      overtimeMinutes,
      status,
    };

    for (const id of [...managerIds, ...hrAdminIds]) {
      eventBus.emit('SEND_NOTIFICATION', { userId: id, payload });
    }
  } catch (err) {
    logger.error({ event: 'EMIT_CHECKOUT_SUMMARY_ERROR', employeeId, error: err.message });
  }
};


const checkIn = async ({ employeeId, checkInTime, ip }) => {
  if (!employeeId) throw makeError('employeeId is required.', 500);

  const user = await User.findByPk(employeeId);
  if (!user) throw makeError('User not found.', 404);

  const companyId = user.companyId; // ✅ FIX

  const date = todayISO();

  const existing = await Attendance.findOne({
    where: { employeeId, companyId, date },
  });

  if (existing?.checkIn) {
    throw makeError('Already checked in today.', 409);
  }

  const shift = await resolveShift(employeeId);

  const shiftStartM = toMins(shift.startTime);
  const cinM = toMins(checkInTime);

  const grace = shift.graceMins ?? 15;

  const isLate = cinM > shiftStartM + grace;
  const lateMinutes = isLate ? cinM - shiftStartM : 0;

  const payload = {
    employeeId,
    companyId, // ✅ MUST INCLUDE
    date,
    checkIn: checkInTime,
    checkInIp: ip || null,
    isLate,
    lateMinutes,
    status: isLate ? 'late' : 'present',
  };

  let record;

  if (existing) {
    await existing.update(payload);
    record = await existing.reload();
  } else {
    record = await Attendance.create(payload);
  }

  // 🔔 async notification (non-blocking)
  if (isLate) {
    emitLateCheckIn({
      employeeId,
      date,
      lateMinutes,
      checkInTime,
    }).catch(() => { });
  }

  return record;
};

// ─────────────────────────────────────────────────────────────
// CHECK OUT
// ─────────────────────────────────────────────────────────────

const checkOut = async ({ employeeId, checkOutTime, ip }) => {
  if (!employeeId) throw makeError('employeeId is required.', 500);

  const date = todayISO();
  const record = await Attendance.findOne({ where: { employeeId, date } });

  if (!record) throw makeError('No check-in record found for today.', 404);
  if (!record.checkIn) throw makeError('Cannot check out without checking in first.', 400);
  if (record.checkOut) throw makeError('Already checked out today.', 409);

  const shift = await resolveShift(employeeId);
  const metrics = calcMetricsWithShift(record.checkIn, checkOutTime, shift);

  await record.update({ checkOut: checkOutTime, checkOutIp: ip || null, ...metrics });
  await record.reload();

  // Fire checkout summary notifications non-blocking
  emitCheckOutSummary({
    employeeId,
    date,
    checkOutTime,
    workedMinutes: metrics.workedMinutes,
    overtimeMinutes: metrics.overtimeMinutes,
    status: metrics.status,
  }).catch(() => { });

  return record;
};

// ─────────────────────────────────────────────────────────────
// ADMIN MANUAL RECORD
// ─────────────────────────────────────────────────────────────

const adminRecord = async ({ employeeId, date, checkIn: ci, checkOut: co, status, notes, approvedBy }) => {
  const metrics = ci && co ? calcMetrics(ci, co) : {};
  const finalStatus = status || metrics.status || 'absent';

  const [record, created] = await Attendance.upsert({
    employeeId,
    companyId,
    date,
    checkIn: ci || null,
    checkOut: co || null,
    notes: notes || null,
    approvedBy: approvedBy || null,
    status: finalStatus,
    ...metrics,
  }, { returning: true });

  return { record, created };
};

// ─────────────────────────────────────────────────────────────
// READ FUNCTIONS (unchanged from original)
// ─────────────────────────────────────────────────────────────

const getTodaySummary = async () => {
  const date = todayISO();
  const records = await Attendance.findAll({
    where: { date },
    include: [{
      model: User,
      as: 'employee',
      attributes: ['id', 'first_name', 'last_name', 'email'],
    }],
  });

  const summary = { present: 0, late: 0, absent: 0, half_day: 0, on_leave: 0, holiday: 0 };
  records.forEach(r => { if (summary[r.status] !== undefined) summary[r.status]++; });

  return { date, summary, records };
};

const getMyAttendance = async ({ employeeId, startDate, endDate, page = 1, limit = 20 }) => {
  if (!employeeId) throw makeError('employeeId is required.', 500);

  const where = { employeeId };
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date[Op.gte] = startDate;
    if (endDate) where.date[Op.lte] = endDate;
  }

  const offset = (Number(page) - 1) * Number(limit);
  const { count, rows } = await Attendance.findAndCountAll({
    where,
    order: [['date', 'DESC']],
    limit: Number(limit),
    offset,
  });

  const stats = {
    totalPresent: rows.filter(r => r.status === 'present').length,
    totalLate: rows.filter(r => r.status === 'late').length,
    totalAbsent: rows.filter(r => r.status === 'absent').length,
    totalOvertimeMinutes: rows.reduce((s, r) => s + (r.overtimeMinutes || 0), 0),
    totalWorkedMinutes: rows.reduce((s, r) => s + (r.workedMinutes || 0), 0),
  };

  return {
    meta: { count, page: Number(page), limit: Number(limit), totalPages: Math.ceil(count / limit) },
    stats,
    records: rows,
  };
};

const getTeamReport = async ({ startDate, endDate, employeeId, status, page = 1, limit = 50 }) => {
  const where = {};
  if (employeeId) where.employeeId = Number(employeeId);
  if (status) where.status = status;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date[Op.gte] = startDate;
    if (endDate) where.date[Op.lte] = endDate;
  }

  const offset = (Number(page) - 1) * Number(limit);
  const { count, rows } = await Attendance.findAndCountAll({
    where,
    include: [{
      model: User,
      as: 'employee',
      attributes: ['id', 'first_name', 'last_name', 'email'],
    }],
    order: [['date', 'DESC']],
    limit: Number(limit),
    offset,
  });

  return {
    meta: { count, page: Number(page), limit: Number(limit), totalPages: Math.ceil(count / limit) },
    records: rows,
  };
};

const getOvertimeSummary = async ({ employeeId, month, year }) => {
  const mm = String(month).padStart(2, '0');
  const startDate = `${year}-${mm}-01`;
  const endDate = new Date(year, Number(month), 0).toISOString().slice(0, 10);

  const records = await Attendance.findAll({
    where: {
      employeeId: Number(employeeId),
      date: { [Op.between]: [startDate, endDate] },
      hasOvertime: true,
    },
  });

  const totalOvertimeMinutes = records.reduce((s, r) => s + (r.overtimeMinutes || 0), 0);

  return {
    employeeId: Number(employeeId),
    month: Number(month),
    year: Number(year),
    overtimeDays: records.length,
    totalOvertimeMinutes,
    totalOvertimeHours: +(totalOvertimeMinutes / 60).toFixed(2),
    records,
  };
};

const getById = async (id) => {
  const record = await Attendance.findByPk(id, {
    include: [
      { model: User, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'email'] },
      { model: User, as: 'approver', attributes: ['id', 'first_name', 'last_name'] },
    ],
  });

  if (!record) throw makeError('Attendance record not found.', 404);
  return record;
};

// ─────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────







module.exports = {
  checkIn,
  checkOut,
  adminRecord,
  getTodaySummary,
  getMyAttendance,
  getTeamReport,
  getById,
  getOvertimeSummary,
  calcMetrics,
  calcMetricsWithShift,
};