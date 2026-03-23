const asyncHandler = require('../../utils/asyncHandler');
const leaveService = require('./leaveService');

const applyLeave = asyncHandler(async (req, res) => {
  const result = await leaveService.applyForLeave({
    employeeId: req.user.id,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    reason: req.body.reason,
    ipAddress: req.ip
  });
  res.status(201).json(result);
});

const reviewLeave = asyncHandler(async (req, res) => {
  const result = await leaveService.managerDecision({
    managerId: req.user.id,
    requestId: Number(req.params.id),
    status: req.body.status,
    decisionNote: req.body.decisionNote,
    ipAddress: req.ip
  });
  res.status(200).json(result);
});

const listMyLeaves = asyncHandler(async (req, res) => {
  const result = await leaveService.listMyLeaves({
    employeeId: req.user.id,
    cursor: req.query.cursor ? Number(req.query.cursor) : null,
    limit: Math.min(Number(req.query.limit || 20), 100)
  });
  res.status(200).json(result);
});

const listPendingForManager = asyncHandler(async (req, res) => {
  const result = await leaveService.listPendingLeavesForManager(req.user.id);
  res.status(200).json(result);
});

const getLeaveBalance = asyncHandler(async (req, res) => {
  const result = await leaveService.getMyLeaveBalance(req.user.id);
  res.status(200).json(result);
});

module.exports = {
  applyLeave,
  reviewLeave,
  listMyLeaves,
  listPendingForManager,
  getLeaveBalance
};