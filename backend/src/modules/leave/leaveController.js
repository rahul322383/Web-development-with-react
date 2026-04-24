'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const leaveService = require('./leaveService');
const { sendNotification } = require('../../config/socket');

const applyLeave = asyncHandler(async (req, res) => {
  const result = await leaveService.applyForLeave({
    employeeId: req.user.id,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    reason: req.body.reason,
    ipAddress: req.ip,
    actor: req.user                          // FIX: pass actor
  });

  if (result.success) {
    sendNotification(req.user.id, {
      type: 'LEAVE_APPLIED',
      title: 'Leave Application Submitted',
      message: `Your leave request from ${req.body.startDate} to ${req.body.endDate} has been submitted.`,
      leaveId: result.data.id,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      status: 'PENDING',
      days: result.data.daysRequested
    });

    if (result.data.managerId) {
      sendNotification(result.data.managerId, {
        type: 'LEAVE_PENDING_REVIEW',
        title: 'New Leave Request',
        message: `${req.user.name || 'Employee'} requested leave from ${req.body.startDate} to ${req.body.endDate}.`,
        leaveId: result.data.id,
        employeeId: req.user.id,
        days: result.data.daysRequested,
        reason: req.body.reason
      });
    }

    // HR notifications are handled via eventBus in the service
  }

  return res.status(result.success ? 201 : (result.statusCode || 400)).json(result);
});

// const reviewLeave = asyncHandler(async (req, res) => {
//   const result = await leaveService.managerDecision({
//     managerId: req.user.id,
//     role: req.user.role,
//     requestId: Number(req.params.id),
//     status: req.body.status,
//     decisionNote: req.body.decisionNote,
//     ipAddress: req.ip,
//     actor: req.user                          // FIX: pass actor
//   });

//   if (result.success) {
//     const leaveRequest = result.data;

//     sendNotification(leaveRequest.employeeId, {
//       type: `LEAVE_${leaveRequest.status.toUpperCase()}`,
//       title: `Leave ${leaveRequest.status}`,
//       message: `Your leave from ${leaveRequest.startDate} to ${leaveRequest.endDate} has been ${leaveRequest.status.toLowerCase()}.`,
//       leaveId: leaveRequest.id,
//       status: leaveRequest.status,
//       decisionNote: req.body.decisionNote,
//       days: leaveRequest.daysRequested
//     });

//     // Balance updates, HR notifications, team notifications
//     // are handled via eventBus listeners in the service
//   }

//   return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
// });



const reviewLeave = asyncHandler(async (req, res) => {
  const allowedRoles = ['Manager', 'Admin'];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Only Manager or Admin can review leaves',
    });
  }

  const result = await leaveService.managerDecision({
    managerId: req.user.id,
    role: req.user.role,
    requestId: Number(req.params.id),
    status: req.body.status,
    decisionNote: req.body.decisionNote,
    ipAddress: req.ip,
    actor: req.user
  });

  if (result.success) {
    const leaveRequest = result.data;

    sendNotification(leaveRequest.employeeId, {
      type: `LEAVE_${leaveRequest.status.toUpperCase()}`,
      title: `Leave ${leaveRequest.status}`,
      message: `Your leave from ${leaveRequest.startDate} to ${leaveRequest.endDate} has been ${leaveRequest.status.toLowerCase()}.`,
      leaveId: leaveRequest.id,
      status: leaveRequest.status,
      decisionNote: req.body.decisionNote,
      days: leaveRequest.daysRequested
    });
  }

  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const cancelLeave = asyncHandler(async (req, res) => {
  const result = await leaveService.cancelLeave({
    requestId: Number(req.params.id),
    employeeId: req.user.id,
    actor: req.user                          // FIX: pass actor
  });

  if (result.success) {
    const leaveRequest = result.data;

    sendNotification(req.user.id, {
      type: 'LEAVE_CANCELLED',
      title: 'Leave Cancelled',
      message: `Leave from ${leaveRequest.startDate} to ${leaveRequest.endDate} cancelled.`,
      leaveId: leaveRequest.id,
      days: leaveRequest.daysRequested
    });

    if (leaveRequest.managerId) {
      sendNotification(leaveRequest.managerId, {
        type: 'LEAVE_CANCELLED_MANAGER',
        title: 'Leave Cancelled',
        message: `${req.user.name || 'Employee'} cancelled a leave request.`,
        leaveId: leaveRequest.id,
        employeeId: req.user.id
      });
    }
  }

  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const listMyLeaves = asyncHandler(async (req, res) => {
  const result = await leaveService.listMyLeaves({
    employeeId: req.user.id,
    cursor: req.query.cursor ? Number(req.query.cursor) : null,
    limit: Math.min(Number(req.query.limit || 20), 100),
    actor: req.user                          // FIX: pass actor
  });
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

// const listPendingForManager = asyncHandler(async (req, res) => {
//   const { limit = 10, page = 1 } = req.query;

//   const result = await leaveService.listPendingLeavesForManager(
//     req.user.id,
//     req.user,
//     { limit: Number(limit), page: Number(page) }
//   );

//   return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
// });


const listPendingLeaves = asyncHandler(async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  const actor = req.user;

  const result = await leaveService.listPendingLeaves({
    actor,
    limit: Number(limit),
    page: Number(page)
  });

  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});


const getLeaveBalance = asyncHandler(async (req, res) => {
  const result = await leaveService.getMyLeaveBalance(
    req.user.id,
    req.user                                 // FIX: pass actor
  );
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const getLeaveById = asyncHandler(async (req, res) => {
  const result = await leaveService.findLeaveRequestById(
    Number(req.params.id),
    req.user                                 // FIX: pass actor
  );
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const listTeamLeaves = asyncHandler(async (req, res) => {
  const managerId = req.user?.id;


  if (!managerId) {
    return res.status(400).json({
      success: false,
      message: "Manager ID missing in request"
    });
  }

  const result = await leaveService.listTeamLeaves({
    managerId,
    status: req.query.status,
    limit: req.query.limit,
    page: req.query.page
  });

  return res
    .status(result.success ? 200 : (result.statusCode || 400))
    .json(result);
});

const getDashboardSummary = asyncHandler(async (req, res) => {
  const result = await leaveService.getDashboardSummary({
    userId: req.user.id,
    year: req.query.year,
    actor: req.user                          // FIX: pass actor
  });
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const getLeaveStats = asyncHandler(async (req, res) => {
  const result = await leaveService.getLeaveStats({
    year: req.query.year,
    actor: req.user                          // FIX: pass actor
  });
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const resetLeaveBalances = asyncHandler(async (req, res) => {
  const result = await leaveService.yearlyLeaveReset(
    req.body.year,
    req.user                                 // FIX: pass actor
  );
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

module.exports = {
  applyLeave,
  reviewLeave,
  cancelLeave,
  listMyLeaves,
  listPendingLeaves,
  getLeaveBalance,
  getLeaveById,
  listTeamLeaves,
  getDashboardSummary,
  getLeaveStats,
  resetLeaveBalances
};