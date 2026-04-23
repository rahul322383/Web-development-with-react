'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const payrollService = require('./payrollService');

// ─── Existing (unchanged) ─────────────────────────────────────────────────────

const processPayroll = asyncHandler(async (req, res) => {
  const result = await payrollService.processPayroll({
    month: req.body.month,
    year: req.body.year,
    actorId: req.user.id,
    ipAddress: req.ip,
    actor: req.user,
  });
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const lockPayroll = asyncHandler(async (req, res) => {
  const result = await payrollService.lockPayroll({
    payrollId: req.body.payrollId,
    actorId: req.user.id,
    ipAddress: req.ip,
    actor: req.user,
  });
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const getMyPayrollHistory = asyncHandler(async (req, res) => {
  const result = await payrollService.getPayrollHistory(req.user.id, req.user);
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const getPayrollByEmployee = asyncHandler(async (req, res) => {
  const result = await payrollService.getPayrollByEmployee(req.params.employeeId, req.user);
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

// ─── NEW: getSalaryBreakdown ──────────────────────────────────────────────────
/**
 * GET /payroll/:payrollId/breakdown
 * Full earnings + deductions breakdown for one payroll record.
 */
const getSalaryBreakdown = asyncHandler(async (req, res) => {
  const result = await payrollService.getSalaryBreakdown(req.params.payrollId, req.user);
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

// ─── NEW: getYTDSummary ───────────────────────────────────────────────────────
/**
 * GET /payroll/ytd?employeeId=&year=
 * Year-to-date totals for an employee.
 * Employees hit this with their own ID; HR can pass any employeeId.
 */
const getYTDSummary = asyncHandler(async (req, res) => {
  const employeeId = req.query.employeeId || req.user.id;
  const year = req.query.year || new Date().getFullYear();

  const result = await payrollService.getYTDSummary({
    employeeId: Number(employeeId),
    year: Number(year),
    actor: req.user,
  });
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

// ─── NEW: getMonthlyPayrollSummary ────────────────────────────────────────────
/**
 * GET /payroll/monthly-summary?month=&year=
 * HR / Admin: full team view for a specific month.
 */
const getMonthlyPayrollSummary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) {
    return res.status(400).json({ success: false, message: 'month and year are required.' });
  }

  const result = await payrollService.getMonthlyPayrollSummary({
    month: Number(month),
    year: Number(year),
    actor: req.user,
  });
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

// ─── NEW: downloadPayslip ─────────────────────────────────────────────────────
/**
 * GET /payroll/:payrollId/payslip
 * Streams a PDF payslip to the client.
 */
const downloadPayslip = asyncHandler(async (req, res) => {
  const result = await payrollService.downloadPayslip(req.params.payrollId, req.user);

  if (!result.success) {
    return res.status(result.statusCode || 400).json({ success: false, message: result.message });
  }

  const { pdfBuffer, payslipData } = result;
  const filename = `payslip_${payslipData.employeeCode || 'emp'}_${payslipData.month}_${payslipData.year}.pdf`;

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length': pdfBuffer.length,
  });

  return res.end(pdfBuffer);
});

module.exports = {
  // existing
  processPayroll,
  lockPayroll,
  getMyPayrollHistory,
  getPayrollByEmployee,
  // new
  getSalaryBreakdown,
  getYTDSummary,
  getMonthlyPayrollSummary,
  downloadPayslip,
};