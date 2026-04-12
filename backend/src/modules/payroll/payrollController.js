const asyncHandler = require('../../utils/asyncHandler');
const payrollService = require('./payrollService');

const enqueueProcessing = asyncHandler(async (req, res) => {
  const result = await payrollService.enqueuePayrollProcessing({
    month: req.body.month,
    year: req.body.year,
    actorId: req.user.id,
    ipAddress: req.ip
  });

  res.status(202).json(result);
});

const lockPayroll = asyncHandler(async (req, res) => {
  const result = await payrollService.lockPayroll({
    payrollId: req.body.payrollId,
    actorId: req.user.id,
    ipAddress: req.ip
  });

  res.status(200).json(result);
});

const getMyPayrollHistory = asyncHandler(async (req, res) => {
  const result = await payrollService.getPayrollHistory(req.user.id);
  res.status(200).json(result);
});

const getPayrollByEmployee = asyncHandler(async (req, res) => {
  const employeeId = req.params.employeeId;
  const result = await payrollService.getPayrollByEmployee(employeeId);
  res.status(200).json(result);
});

module.exports = {
  getPayrollByEmployee,
  enqueueProcessing,
  lockPayroll,
  getMyPayrollHistory
};