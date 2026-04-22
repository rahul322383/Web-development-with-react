'use strict';

const { Op } = require('sequelize');
const { Attendance, User } = require('../../database/initModels');
const AppError = require('../utils/AppError');

const SHIFT = {
  startHour: 9,
  startMinute: 0,
  endHour: 18,
  endMinute: 0,
  graceMinutes: 15,
  standardMinutes: 9 * 60,
};

const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const minutesToHHMM = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const todayDate = () => new Date().toISOString().slice(0, 10);

const calculateAttendanceMetrics = (checkIn, checkOut) => {
  const cinMins = timeToMinutes(checkIn);
  const coutMins = timeToMinutes(checkOut);

  if (coutMins <= cinMins) {
    throw new AppError('Check-out time must be after check-in time.', 400);
  }

  const shiftStartMins = SHIFT.startHour * 60 + SHIFT.startMinute;
  const graceLimit = shiftStartMins + SHIFT.graceMinutes;

  const workedMinutes = coutMins - cinMins;
  const isLate = cinMins > graceLimit;
  const lateMinutes = isLate ? cinMins - shiftStartMins : 0;
  const overtimeMinutes = Math.max(0, workedMinutes - SHIFT.standardMinutes);
  const hasOvertime = overtimeMinutes > 0;

  let status;
  if (workedMinutes < SHIFT.standardMinutes / 2) {
    status = 'half_day';
  } else if (isLate) {
    status = 'late';
  } else {
    status = 'present';
  }

  return {
    workedMinutes,
    isLate,
    lateMinutes,
    overtimeMinutes,
    hasOvertime,
    status,
  };
};

const checkIn = async ({ employeeId, checkInTime, ip }) => {
  const date = todayDate();

  const existing = await Attendance.findOne({ where: { employeeId, date } });
  if (existing) {
    if (existing.checkIn) throw new AppError('Already checked in today.', 409);
    await existing.update({ checkIn: checkInTime, checkInIp: ip, status: 'present' });
    return existing;
  }

  const shiftStartMins = SHIFT.startHour * 60 + SHIFT.startMinute;
  const graceLimit = shiftStartMins + SHIFT.graceMinutes;
  const cinMins = timeToMinutes(checkInTime);
  const isLate = cinMins > graceLimit;
  const lateMinutes = isLate ? cinMins - shiftStartMins : 0;

  const record = await Attendance.create({
    employeeId,
    date,
    checkIn: checkInTime,
    checkInIp: ip,
    status: isLate ? 'late' : 'present',
    isLate,
    lateMinutes,
  });

  return record;
};

const checkOut = async ({ employeeId, checkOutTime, ip }) => {
  const date = todayDate();
  const record = await Attendance.findOne({ where: { employeeId, date } });

  if (!record) throw new AppError('No check-in record found for today.', 404);
  if (!record.checkIn) throw new AppError('Cannot check out without checking in first.', 400);
  if (record.checkOut) throw new AppError('Already checked out today.', 409);

  const metrics = calculateAttendanceMetrics(record.checkIn, checkOutTime);

  await record.update({ checkOut: checkOutTime, checkOutIp: ip, ...metrics });
  return record;
};

const adminRecord = async ({ employeeId, date, checkIn: ci, checkOut: co, notes, approvedBy }) => {
  const metrics = ci && co ? calculateAttendanceMetrics(ci, co) : {};

  const [record, created] = await Attendance.upsert({
    employeeId,
    date,
    checkIn: ci || null,
    checkOut: co || null,
    notes: notes || null,
    approvedBy,
    ...metrics,
  }, { returning: true });

  return { record, created };
};

const getTodaySummary = async () => {
  const date = todayDate();
  const records = await Attendance.findAll({
    where: { date },
    include: [{ model: User, as: 'employee', attributes: ['id', 'firstName', 'lastName', 'email'] }],
  });

  const summary = { present: 0, late: 0, absent: 0, half_day: 0, on_leave: 0 };
  records.forEach(r => { if (summary[r.status] !== undefined) summary[r.status]++; });

  return { date, summary, records };
};

const getMyAttendance = async ({ employeeId, startDate, endDate, page = 1, limit = 20 }) => {
  const where = { employeeId };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date[Op.gte] = startDate;
    if (endDate) where.date[Op.lte] = endDate;
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await Attendance.findAndCountAll({
    where,
    order: [['date', 'DESC']],
    limit,
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
    meta: { count, page, limit, totalPages: Math.ceil(count / limit) },
    stats,
    records: rows,
  };
};

const getTeamReport = async ({ startDate, endDate, employeeId, status, page = 1, limit = 50 }) => {
  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date[Op.gte] = startDate;
    if (endDate) where.date[Op.lte] = endDate;
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await Attendance.findAndCountAll({
    where,
    include: [{ model: User, as: 'employee', attributes: ['id', 'firstName', 'lastName', 'email', 'department'] }],
    order: [['date', 'DESC'], ['employee_id', 'ASC']],
    limit,
    offset,
  });

  return {
    meta: { count, page, limit, totalPages: Math.ceil(count / limit) },
    records: rows,
  };
};

const getById = async (id) => {
  const record = await Attendance.findByPk(id, {
    include: [
      { model: User, as: 'employee', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: User, as: 'approver', attributes: ['id', 'firstName', 'lastName'] },
    ],
  });
  if (!record) throw new AppError('Attendance record not found.', 404);
  return record;
};

const getOvertimeSummary = async ({ employeeId, month, year }) => {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

  const records = await Attendance.findAll({
    where: {
      employeeId,
      date: { [Op.between]: [startDate, endDate] },
      hasOvertime: true,
    },
  });

  const totalOvertimeMinutes = records.reduce((s, r) => s + r.overtimeMinutes, 0);

  return {
    employeeId,
    month,
    year,
    overtimeDays: records.length,
    totalOvertimeMinutes,
    totalOvertimeHours: +(totalOvertimeMinutes / 60).toFixed(2),
    records,
  };
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
  calculateAttendanceMetrics,
  minutesToHHMM,
};