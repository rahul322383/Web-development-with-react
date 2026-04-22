'use strict';

const { Op } = require('sequelize');
const { Attendance, User } = require('../../database/initModels');

const SHIFT_START_MINS = 9 * 60;
const SHIFT_END_MINS = 18 * 60;
const GRACE_MINS = 15;
const STANDARD_MINS = SHIFT_END_MINS - SHIFT_START_MINS;

const toMins = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const makeError = (msg, code = 400) => {
  const e = new Error(msg);
  e.statusCode = code;
  return e;
};

const calcMetrics = (checkIn, checkOut) => {
  const cinM = toMins(checkIn);
  const coutM = toMins(checkOut);

  if (coutM <= cinM) throw makeError('Check-out time must be after check-in time.');

  const workedMinutes = coutM - cinM;
  const isLate = cinM > (SHIFT_START_MINS + GRACE_MINS);
  const lateMinutes = isLate ? cinM - SHIFT_START_MINS : 0;
  const overtimeMinutes = Math.max(0, workedMinutes - STANDARD_MINS);
  const hasOvertime = overtimeMinutes > 0;

  let status;
  if (workedMinutes < STANDARD_MINS / 2) status = 'half_day';
  else if (isLate) status = 'late';
  else status = 'present';

  return { workedMinutes, isLate, lateMinutes, overtimeMinutes, hasOvertime, status };
};

const checkIn = async ({ employeeId, checkInTime, ip }) => {
  if (!employeeId) throw makeError('employeeId is required.', 500);

  const date = todayISO();

  const existing = await Attendance.findOne({ where: { employeeId, date } });

  if (existing) {
    if (existing.checkIn) throw makeError('Already checked in today.', 409);

    const cinM = toMins(checkInTime);
    const isLate = cinM > (SHIFT_START_MINS + GRACE_MINS);

    await existing.update({
      checkIn: checkInTime,
      checkInIp: ip || null,
      isLate,
      lateMinutes: isLate ? cinM - SHIFT_START_MINS : 0,
      status: isLate ? 'late' : 'present',
    });

    return existing.reload();
  }

  const cinM = toMins(checkInTime);
  const isLate = cinM > (SHIFT_START_MINS + GRACE_MINS);

  return Attendance.create({
    employeeId,
    date,
    checkIn: checkInTime,
    checkInIp: ip || null,
    isLate,
    lateMinutes: isLate ? cinM - SHIFT_START_MINS : 0,
    status: isLate ? 'late' : 'present',
  });
};

const checkOut = async ({ employeeId, checkOutTime, ip }) => {
  if (!employeeId) throw makeError('employeeId is required.', 500);

  const date = todayISO();
  const record = await Attendance.findOne({ where: { employeeId, date } });

  if (!record) throw makeError('No check-in record found for today.', 404);
  if (!record.checkIn) throw makeError('Cannot check out without checking in first.', 400);
  if (record.checkOut) throw makeError('Already checked out today.', 409);

  const metrics = calcMetrics(record.checkIn, checkOutTime);
  await record.update({ checkOut: checkOutTime, checkOutIp: ip || null, ...metrics });
  return record.reload();
};

const adminRecord = async ({ employeeId, date, checkIn: ci, checkOut: co, status, notes, approvedBy }) => {
  const metrics = ci && co ? calcMetrics(ci, co) : {};
  const finalStatus = status || metrics.status || 'absent';

  const [record, created] = await Attendance.upsert({
    employeeId,
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
};