'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const payrollService = require('./payrollService');

const processPayroll = asyncHandler(async (req, res) => {
  const result = await payrollService.processPayroll({
    month: req.body.month,
    year: req.body.year,
    actorId: req.user.id,
    ipAddress: req.ip,
    actor: req.user                        // FIX: pass actor
  });
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const lockPayroll = asyncHandler(async (req, res) => {
  const result = await payrollService.lockPayroll({
    payrollId: req.body.payrollId,
    actorId: req.user.id,
    ipAddress: req.ip,
    actor: req.user                        // FIX: pass actor
  });
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const getMyPayrollHistory = asyncHandler(async (req, res) => {
  const result = await payrollService.getPayrollHistory(
    req.user.id,
    req.user                               // FIX: pass actor
  );
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const getPayrollByEmployee = asyncHandler(async (req, res) => {
  const result = await payrollService.getPayrollByEmployee(
    req.params.employeeId,
    req.user                               // FIX: pass actor
  );
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

module.exports = {
  processPayroll,
  lockPayroll,
  getMyPayrollHistory,
  getPayrollByEmployee,
};