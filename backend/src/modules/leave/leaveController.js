const asyncHandler = require('../../utils/asyncHandler');
const leaveService = require('./leaveService');

// const applyLeave = asyncHandler(async (req, res) => {
//   const result = await leaveService.applyForLeave({
//     employeeId: req.user.id,
//     startDate: req.body.startDate,
//     endDate: req.body.endDate,
//     reason: req.body.reason,
//     ipAddress: req.ip
//   });
//   res.status(201).json(result);
// });
 
// const reviewLeave = asyncHandler(async (req, res) => {
//   const result = await leaveService.managerDecision({
//     managerId: req.user.id,
//     requestId: Number(req.params.id),
//     status: req.body.status,
//     decisionNote: req.body.decisionNote,
//     ipAddress: req.ip
//   });
//   res.status(200).json(result);
// });

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
  const data = await leaveService.getMyLeaveBalance(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Leave balance fetched successfully',
    data
  });
});

const resetLeaveBalances = asyncHandler(async (req, res) => {
  await leaveService.resetAllLeaveBalances({
    totalAnnual: req.body.totalAnnual,
    year: req.body.year
  });
  res.status(200).json({ message: 'Leave balances reset successfully' });
});



/**
 * Apply Leave
 */
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

/**
 * Manager Review (Approve / Reject)
 */
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

/**
 * My Leaves (Pagination)
 */
// const listMyLeaves = asyncHandler(async (req, res) => {
//   const result = await leaveService.listMyLeaves({
//     employeeId: req.user.id,
//     cursor: req.query.cursor ? Number(req.query.cursor) : null,
//     limit: Math.min(Number(req.query.limit || 20), 100)
//   });
//   res.status(200).json(result);
// });

/**
 * Pending Leaves for Manager
 */
// const listPendingForManager = asyncHandler(async (req, res) => {
//   const result = await leaveService.listPendingLeavesForManager(req.user.id);
//   res.status(200).json(result);
// });

/**
 * Leave Balance
 */
// const getLeaveBalance = asyncHandler(async (req, res) => {
//   const data = await leaveService.getMyLeaveBalance(req.user.id);

//   res.status(200).json({
//     success: true,
//     message: 'Leave balance fetched successfully',
//     data
//   });
// });

/**
 * Get Single Leave Request
 */
const getLeaveById = asyncHandler(async (req, res) => {
  const result = await leaveService.getLeaveById(Number(req.params.id));

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * Cancel Leave (only if pending)
 */
const cancelLeave = asyncHandler(async (req, res) => {
  const result = await leaveService.cancelLeave({
    requestId: Number(req.params.id),
    employeeId: req.user.id
  });

  res.status(200).json(result);
});

/**
 * Team Leave History (Manager)
 */
const listTeamLeaves = asyncHandler(async (req, res) => {
  const result = await leaveService.listTeamLeaves({
    managerId: req.user.id,
    status: req.query.status, // optional filter
  });

  res.status(200).json(result);
});

/**
 * Dashboard Summary
 */
const getDashboardSummary = asyncHandler(async (req, res) => {
  const result = await leaveService.getDashboardSummary({
    userId: req.user.id,
    role: req.user.role,
    year: req.query.year
  });

  res.status(200).json({
    success: true,
    data: result
  });
});
/**
 * Admin / Manager Leave Stats
 */
const getLeaveStats = asyncHandler(async (req, res) => {
  const result = await leaveService.getLeaveStats({
    year: req.query.year
  });

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * Reset Leave Balances (Admin)
 */
// const resetLeaveBalances = asyncHandler(async (req, res) => {
//   await leaveService.resetAllLeaveBalances({
//     totalAnnual: req.body.totalAnnual,
//     year: req.body.year
//   });

//   res.status(200).json({
//     success: true,
//     message: 'Leave balances reset successfully'
//   });
// });


module.exports = {
  applyLeave,
  reviewLeave,
  listMyLeaves,
  listPendingForManager,
  getLeaveBalance,
  getLeaveById,
  cancelLeave,
  listTeamLeaves,
  getDashboardSummary,
  getLeaveStats,
  resetLeaveBalances // ✅ you forgot to export this earlier
};

