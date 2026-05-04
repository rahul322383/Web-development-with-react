'use strict';

const attendanceService = require('./attendance.service');

const getEmployeeId = (req, res) => {
  const id = req.user?.id ?? req.user?.userId ?? req.user?.employeeId;
  if (!id) {
    res.status(401).json({ success: false, message: 'Authenticated user ID not found on request. Check auth middleware.' });
    return null;
  }
  return id;
};

const checkIn = async (req, res) => {
  try {
    const employeeId = getEmployeeId(req, res);
    if (!employeeId) return;

    const companyId = req.user.companyId; // ✅ GET FROM JWT

    const record = await attendanceService.checkIn({
      employeeId,
      companyId, // ✅ PASS IT
      checkInTime: req.body.checkInTime,
      ip: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: record.isLate
        ? `Checked in. Marked late by ${record.lateMinutes} min.`
        : 'Checked in successfully.',
      data: record,
    });

  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message
    });
  }
};

const checkOut = async (req, res) => {
  try {
    const employeeId = getEmployeeId(req, res);
    if (!employeeId) return;

    const record = await attendanceService.checkOut({
      employeeId,
      checkOutTime: req.body.checkOutTime,
      ip: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Checked out successfully.',
      data: {
        ...record.toJSON(),
        summary: {
          workedHours: +(record.workedMinutes / 60).toFixed(2),
          overtimeHours: +(record.overtimeMinutes / 60).toFixed(2),
          lateMinutes: record.lateMinutes,
        },
      },
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const employeeId = getEmployeeId(req, res);
    if (!employeeId) return;

    const result = await attendanceService.getMyAttendance({
      employeeId,
      ...req.query,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getTodaySummary = async (req, res) => {
  try {
    const result = await attendanceService.getTodaySummary();
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getTeamReport = async (req, res) => {
  try {
    const result = await attendanceService.getTeamReport(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getOvertimeSummary = async (req, res) => {
  try {
    const result = await attendanceService.getOvertimeSummary(req.query);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const adminRecord = async (req, res) => {
  try {
    const employeeId = getEmployeeId(req, res);
    if (!employeeId) return;

    const { record, created } = await attendanceService.adminRecord({
      ...req.body,
      approvedBy: employeeId,
    });

    return res.status(created ? 201 : 200).json({
      success: true,
      message: created ? 'Attendance record created.' : 'Attendance record updated.',
      data: record,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const record = await attendanceService.getById(req.params.id);
    return res.status(200).json({ success: true, data: record });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getTodaySummary,
  getTeamReport,
  getOvertimeSummary,
  adminRecord,
  getById,
};