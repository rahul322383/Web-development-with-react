// 'use strict';

// const asyncHandler = require('../../utils/asyncHandler');
// const leaveService = require('./leaveService');
// const { sendNotification } = require('../../config/socket');

// // ─────────────────────────────────────────────────────────────
// // APPLY FOR LEAVE
// // Notifies: employee ✅ + manager ✅ + HR team ✅
// // ─────────────────────────────────────────────────────────────

// const applyLeave = asyncHandler(async (req, res) => {
//   const result = await leaveService.applyForLeave({
//     employeeId: req.user.id,
//     startDate: req.body.startDate,
//     endDate: req.body.endDate,
//     reason: req.body.reason,
//     ipAddress: req.ip,
//     actor: req.user,
//   });

//   if (result.success) {
//     const { id, daysRequested, managerId } = result.data;
//     const employeeName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Employee';

//     // ✅ 1. Notify employee — confirmation
//     sendNotification(req.user.id, {
//       type: 'LEAVE_APPLIED',
//       title: 'Leave Application Submitted',
//       message: `Your leave request from ${req.body.startDate} to ${req.body.endDate} has been submitted and is pending approval.`,
//       leaveId: id,
//       startDate: req.body.startDate,
//       endDate: req.body.endDate,
//       status: 'Pending',
//       days: daysRequested,
//     });

//     // ✅ 2. Notify manager — action required
//     if (managerId) {
//       sendNotification(managerId, {
//         type: 'LEAVE_PENDING_REVIEW',
//         title: 'New Leave Request Awaiting Approval',
//         message: `${employeeName} has requested leave from ${req.body.startDate} to ${req.body.endDate} (${daysRequested} day${daysRequested > 1 ? 's' : ''}).`,
//         leaveId: id,
//         employeeId: req.user.id,
//         days: daysRequested,
//         reason: req.body.reason,
//       });
//     }

//     // ✅ 3. Notify all HR users — visibility
//     const hrIds = await leaveService.getHRTeamIds();
//     for (const hrId of hrIds) {
//       if (hrId !== managerId && hrId !== req.user.id) {
//         sendNotification(hrId, {
//           type: 'LEAVE_APPLIED_HR',
//           title: 'New Leave Application',
//           message: `${employeeName} applied for ${daysRequested} day(s) of leave from ${req.body.startDate} to ${req.body.endDate}.`,
//           leaveId: id,
//           employeeId: req.user.id,
//         });
//       }
//     }
//   }

//   return res.status(result.success ? 201 : (result.statusCode || 400)).json(result);
// });

// // ─────────────────────────────────────────────────────────────
// // REVIEW LEAVE (approve / reject)
// // Notifies: employee ✅ + team members ✅ + HR team ✅
// // ─────────────────────────────────────────────────────────────

// const reviewLeave = asyncHandler(async (req, res) => {
//   const allowedRoles = ['Manager', 'Admin'];
//   if (!allowedRoles.includes(req.user.role)) {
//     return res.status(403).json({
//       success: false,
//       message: 'Access denied: Only Manager or Admin can review leaves',
//     });
//   }

//   const result = await leaveService.managerDecision({
//     managerId: req.user.id,
//     role: req.user.role,
//     requestId: Number(req.params.id),
//     status: req.body.status,
//     decisionNote: req.body.decisionNote,
//     ipAddress: req.ip,
//     actor: req.user,
//   });

//   if (result.success) {
//     const leaveRequest = result.data;
//     const { employeeId, startDate, endDate, daysRequested, managerId, status } = leaveRequest;

//     const decisionNote = req.body.decisionNote || null;
//     const statusLabel = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
//     const managerName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Your manager';

//     // ✅ 1. Notify employee — decision result
//     sendNotification(employeeId, {
//       type: `LEAVE_${status.toUpperCase()}`,
//       title: `Leave ${statusLabel}`,
//       message: `Your leave from ${startDate} to ${endDate} has been ${status.toLowerCase()} by ${managerName}.${decisionNote ? ` Note: ${decisionNote}` : ''}`,
//       leaveId: leaveRequest.id,
//       status,
//       decisionNote,
//       days: daysRequested,
//     });

//     // ✅ 2. If approved — notify team members so they know colleague is on leave
//     if (status.toLowerCase() === 'approved') {
//       const teamMemberIds = await leaveService.getTeamMembers(managerId);

//       for (const memberId of teamMemberIds) {
//         if (memberId !== employeeId) {
//           sendNotification(memberId, {
//             type: 'TEAM_MEMBER_ON_LEAVE',
//             title: 'Team Leave Update',
//             message: `A team member will be on leave from ${startDate} to ${endDate} (${daysRequested} day${daysRequested > 1 ? 's' : ''}).`,
//             leaveId: leaveRequest.id,
//             employeeId,
//           });
//         }
//       }
//     }

//     // ✅ 3. Notify HR — audit trail visibility
//     const hrIds = await leaveService.getHRTeamIds();
//     for (const hrId of hrIds) {
//       if (hrId !== req.user.id) {
//         sendNotification(hrId, {
//           type: `LEAVE_${status.toUpperCase()}_HR`,
//           title: `Leave ${statusLabel} — HR Notice`,
//           message: `${managerName} has ${status.toLowerCase()} a leave request (${daysRequested} day${daysRequested > 1 ? 's' : ''}, ${startDate} → ${endDate}).${decisionNote ? ` Reason: ${decisionNote}` : ''}`,
//           leaveId: leaveRequest.id,
//           employeeId,
//         });
//       }
//     }
//   }

//   return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
// });

// // ─────────────────────────────────────────────────────────────
// // CANCEL LEAVE
// // Notifies: employee ✅ + manager ✅ + HR team ✅
// // ─────────────────────────────────────────────────────────────

// const cancelLeave = asyncHandler(async (req, res) => {
//   const result = await leaveService.cancelLeave({
//     requestId: Number(req.params.id),
//     employeeId: req.user.id,
//     actor: req.user,
//   });

//   if (result.success) {
//     const leaveRequest = result.data;
//     const { startDate, endDate, daysRequested, managerId } = leaveRequest;
//     const employeeName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Employee';

//     // ✅ 1. Notify employee — confirmation
//     sendNotification(req.user.id, {
//       type: 'LEAVE_CANCELLED',
//       title: 'Leave Cancelled',
//       message: `Your leave from ${startDate} to ${endDate} has been successfully cancelled.`,
//       leaveId: leaveRequest.id,
//       days: daysRequested,
//     });

//     // ✅ 2. Notify manager — so they know their queue changed
//     if (managerId) {
//       sendNotification(managerId, {
//         type: 'LEAVE_CANCELLED_MANAGER',
//         title: 'Leave Request Cancelled',
//         message: `${employeeName} has cancelled their leave request from ${startDate} to ${endDate}.`,
//         leaveId: leaveRequest.id,
//         employeeId: req.user.id,
//       });
//     }

//     // ✅ 3. Notify HR — visibility
//     const hrIds = await leaveService.getHRTeamIds();
//     for (const hrId of hrIds) {
//       if (hrId !== managerId && hrId !== req.user.id) {
//         sendNotification(hrId, {
//           type: 'LEAVE_CANCELLED_HR',
//           title: 'Leave Cancelled — HR Notice',
//           message: `${employeeName} cancelled their leave from ${startDate} to ${endDate}.`,
//           leaveId: leaveRequest.id,
//           employeeId: req.user.id,
//         });
//       }
//     }
//   }

//   return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
// });

// // ─────────────────────────────────────────────────────────────
// // READ-ONLY HANDLERS — no notification needed
// // ─────────────────────────────────────────────────────────────

// const listMyLeaves = asyncHandler(async (req, res) => {
//   const result = await leaveService.listMyLeaves({
//     employeeId: req.user.id,
//     cursor: req.query.cursor ? Number(req.query.cursor) : null,
//     limit: Math.min(Number(req.query.limit || 20), 100),
//     actor: req.user,
//   });
//   return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
// });

// const listPendingLeaves = asyncHandler(async (req, res) => {
//   const { limit = 10, page = 1 } = req.query;
//   const result = await leaveService.listPendingLeaves({
//     actor: req.user,
//     limit: Number(limit),
//     page: Number(page),
//   });
//   return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
// });

// const getLeaveBalance = asyncHandler(async (req, res) => {
//   const result = await leaveService.getMyLeaveBalance(req.user.id, req.user);
//   return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
// });

// const getLeaveById = asyncHandler(async (req, res) => {
//   const result = await leaveService.findLeaveRequestById(Number(req.params.id), req.user);
//   return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
// });

// const listTeamLeaves = asyncHandler(async (req, res) => {
//   const managerId = req.user?.id;
//   if (!managerId) {
//     return res.status(400).json({ success: false, message: 'Manager ID missing in request' });
//   }
//   const result = await leaveService.listTeamLeaves({
//     managerId,
//     status: req.query.status,
//     limit: req.query.limit,
//     page: req.query.page,
//   });
//   return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
// });

// const getDashboardSummary = asyncHandler(async (req, res) => {
//   const result = await leaveService.getDashboardSummary({
//     userId: req.user.id,
//     year: req.query.year,
//     actor: req.user,
//   });
//   return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
// });

// const getLeaveStats = asyncHandler(async (req, res) => {
//   const result = await leaveService.getLeaveStats({ year: req.query.year, actor: req.user });
//   return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
// });

// const resetLeaveBalances = asyncHandler(async (req, res) => {
//   const result = await leaveService.yearlyLeaveReset(req.body.year, req.user);
//   return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
// });

// // ─────────────────────────────────────────────────────────────

// module.exports = {
//   applyLeave,
//   reviewLeave,
//   cancelLeave,
//   listMyLeaves,
//   listPendingLeaves,
//   getLeaveBalance,
//   getLeaveById,
//   listTeamLeaves,
//   getDashboardSummary,
//   getLeaveStats,
//   resetLeaveBalances,
// };

'use strict';

// leaveController.js
// ─────────────────────────────────────────────────────────────
// BUG FIXES:
//  1. company_id was always 0 — now forwarded from req.user.companyId
//  2. leaveType and leaveUnit were not forwarded from req.body to service
//  3. publicHolidays not forwarded
// ─────────────────────────────────────────────────────────────

const asyncHandler = require('../../utils/asyncHandler');
const leaveService = require('./leaveService');
const { sendNotification } = require('../../config/socket');

// ─────────────────────────────────────────────────────────────
// APPLY FOR LEAVE
// ─────────────────────────────────────────────────────────────

const applyLeave = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    reason,
    leaveType = 'CASUAL',   // ← FIX: was missing, defaulted in service but never read
    leaveUnit = 'FULL_DAY', // ← FIX: same
    publicHolidays = [],
  } = req.body;

  const result = await leaveService.applyForLeave({
    employeeId: req.user.id,
    companyId: req.user.companyId,   // ← FIX: company_id was 0 because this was missing
    startDate,
    endDate,
    reason,
    leaveType,
    leaveUnit,
    publicHolidays,
    ipAddress: req.ip,
    actor: req.user,
  });

  if (result.success) {
    const { id, daysRequested, managerId } = result.data;
    const employeeName =
      `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Employee';

    // 1. Confirm to employee
    sendNotification(req.user.id, {
      type: 'LEAVE_APPLIED',
      title: 'Leave Application Submitted',
      message: `Your ${leaveType.toLowerCase()} leave from ${startDate} to ${endDate} is pending approval.`,
      leaveId: id,
      startDate,
      endDate,
      status: 'Pending',
      days: daysRequested,
      leaveType,
      leaveUnit,
    });

    // 2. Alert manager
    if (managerId) {
      sendNotification(managerId, {
        type: 'LEAVE_PENDING_REVIEW',
        title: 'New Leave Request Awaiting Approval',
        message: `${employeeName} has requested ${leaveType.toLowerCase()} leave from ${startDate} to ${endDate} (${daysRequested} day${daysRequested > 1 ? 's' : ''}).`,
        leaveId: id,
        employeeId: req.user.id,
        days: daysRequested,
        reason,
        leaveType,
      });
    }

    // 3. Alert HR
    const hrIds = await leaveService.getHRTeamIds();
    for (const hrId of hrIds) {
      if (hrId !== managerId && hrId !== req.user.id) {
        sendNotification(hrId, {
          type: 'LEAVE_APPLIED_HR',
          title: 'New Leave Application',
          message: `${employeeName} applied for ${daysRequested} day(s) of ${leaveType.toLowerCase()} leave from ${startDate} to ${endDate}.`,
          leaveId: id,
          employeeId: req.user.id,
          leaveType,
        });
      }
    }
  }

  return res
    .status(result.success ? 201 : result.statusCode || 400)
    .json(result);
});

// ─────────────────────────────────────────────────────────────
// REVIEW LEAVE (approve / reject)
// ─────────────────────────────────────────────────────────────

const reviewLeave = asyncHandler(async (req, res) => {
  const allowedRoles = ['Manager', 'Admin', 'HR'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Only Manager, Admin or HR can review leaves',
    });
  }

  const result = await leaveService.managerDecision({
    managerId: req.user.id,
    role: req.user.role,
    requestId: Number(req.params.id),
    status: req.body.status,
    decisionNote: req.body.decisionNote,
    ipAddress: req.ip,
    actor: req.user,
  });

  if (result.success) {
    const leaveRequest = result.data;
    const { employeeId, startDate, endDate, daysRequested, managerId, status, leaveType } = leaveRequest;

    const decisionNote = req.body.decisionNote || null;
    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    const managerName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Your manager';

    // 1. Notify employee
    sendNotification(employeeId, {
      type: `LEAVE_${status.toUpperCase()}`,
      title: `Leave ${statusLabel}`,
      message: `Your ${(leaveType || '').toLowerCase()} leave from ${startDate} to ${endDate} has been ${status.toLowerCase()} by ${managerName}.${decisionNote ? ` Note: ${decisionNote}` : ''}`,
      leaveId: leaveRequest.id,
      status,
      decisionNote,
      days: daysRequested,
    });

    // 2. Notify team if approved
    if (status.toLowerCase() === 'approved') {
      const teamMemberIds = await leaveService.getTeamMembers(managerId);
      for (const memberId of teamMemberIds) {
        if (memberId !== employeeId) {
          sendNotification(memberId, {
            type: 'TEAM_MEMBER_ON_LEAVE',
            title: 'Team Leave Update',
            message: `A team member will be on leave from ${startDate} to ${endDate} (${daysRequested} day${daysRequested > 1 ? 's' : ''}).`,
            leaveId: leaveRequest.id,
            employeeId,
          });
        }
      }
    }

    // 3. Notify HR
    const hrIds = await leaveService.getHRTeamIds();
    for (const hrId of hrIds) {
      if (hrId !== req.user.id) {
        sendNotification(hrId, {
          type: `LEAVE_${status.toUpperCase()}_HR`,
          title: `Leave ${statusLabel} — HR Notice`,
          message: `${managerName} has ${status.toLowerCase()} a ${(leaveType || '').toLowerCase()} leave request (${daysRequested} day${daysRequested > 1 ? 's' : ''}, ${startDate} → ${endDate}).${decisionNote ? ` Reason: ${decisionNote}` : ''}`,
          leaveId: leaveRequest.id,
          employeeId,
        });
      }
    }
  }

  return res
    .status(result.success ? 200 : result.statusCode || 400)
    .json(result);
});

// ─────────────────────────────────────────────────────────────
// CANCEL LEAVE
// ─────────────────────────────────────────────────────────────

const cancelLeave = asyncHandler(async (req, res) => {
  const result = await leaveService.cancelLeave({
    requestId: Number(req.params.id),
    employeeId: req.user.id,
    actor: req.user,
  });

  if (result.success) {
    const leaveRequest = result.data;
    const { startDate, endDate, daysRequested, managerId } = leaveRequest;
    const employeeName =
      `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Employee';

    // 1. Confirm to employee
    sendNotification(req.user.id, {
      type: 'LEAVE_CANCELLED',
      title: 'Leave Cancelled',
      message: `Your leave from ${startDate} to ${endDate} has been successfully cancelled.`,
      leaveId: leaveRequest.id,
      days: daysRequested,
    });

    // 2. Alert manager
    if (managerId) {
      sendNotification(managerId, {
        type: 'LEAVE_CANCELLED_MANAGER',
        title: 'Leave Request Cancelled',
        message: `${employeeName} cancelled their leave from ${startDate} to ${endDate}.`,
        leaveId: leaveRequest.id,
        employeeId: req.user.id,
      });
    }

    // 3. Alert HR
    const hrIds = await leaveService.getHRTeamIds();
    for (const hrId of hrIds) {
      if (hrId !== managerId && hrId !== req.user.id) {
        sendNotification(hrId, {
          type: 'LEAVE_CANCELLED_HR',
          title: 'Leave Cancelled — HR Notice',
          message: `${employeeName} cancelled their leave from ${startDate} to ${endDate}.`,
          leaveId: leaveRequest.id,
          employeeId: req.user.id,
        });
      }
    }
  }

  return res
    .status(result.success ? 200 : result.statusCode || 400)
    .json(result);
});

// ─────────────────────────────────────────────────────────────
// READ-ONLY HANDLERS
// ─────────────────────────────────────────────────────────────

const listMyLeaves = asyncHandler(async (req, res) => {
  const result = await leaveService.listMyLeaves({
    employeeId: req.user.id,
    cursor: req.query.cursor ? Number(req.query.cursor) : null,
    limit: Math.min(Number(req.query.limit || 20), 100),
    actor: req.user,
  });
  return res.status(result.success ? 200 : result.statusCode || 400).json(result);
});

const listPendingLeaves = asyncHandler(async (req, res) => {
  const result = await leaveService.listPendingLeaves({
    actor: req.user,
    limit: Number(req.query.limit || 10),
    page: Number(req.query.page || 1),
  });
  return res.status(result.success ? 200 : result.statusCode || 400).json(result);
});

const getLeaveBalance = asyncHandler(async (req, res) => {
  const result = await leaveService.getMyLeaveBalance(req.user.id, req.user);
  return res.status(result.success ? 200 : result.statusCode || 400).json(result);
});

const getLeaveById = asyncHandler(async (req, res) => {
  const result = await leaveService.findLeaveRequestById(Number(req.params.id), req.user);
  return res.status(result.success ? 200 : result.statusCode || 400).json(result);
});

const listTeamLeaves = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    return res.status(400).json({ success: false, message: 'Manager ID missing in request' });
  }
  const result = await leaveService.listTeamLeaves({
    managerId: req.user.id,
    status: req.query.status,
    limit: req.query.limit,
    page: req.query.page,
  });
  return res.status(result.success ? 200 : result.statusCode || 400).json(result);
});

const getDashboardSummary = asyncHandler(async (req, res) => {
  const result = await leaveService.getDashboardSummary({
    userId: req.user.id,
    year: req.query.year,
    actor: req.user,
  });
  return res.status(result.success ? 200 : result.statusCode || 400).json(result);
});

const getLeaveStats = asyncHandler(async (req, res) => {
  const result = await leaveService.getLeaveStats({ year: req.query.year, actor: req.user });
  return res.status(result.success ? 200 : result.statusCode || 400).json(result);
});

const resetLeaveBalances = asyncHandler(async (req, res) => {
  const result = await leaveService.yearlyLeaveReset(req.body.year, req.user);
  return res.status(result.success ? 200 : result.statusCode || 400).json(result);
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
  resetLeaveBalances,
};