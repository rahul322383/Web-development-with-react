'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const leaveService = require('./leaveService');
const { sendNotification } = require('../../config/socket');

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Safely format a full name from a user object */
const fullName = (user) =>
  `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Employee';

/** HTTP status from a service result */
const httpStatus = (result, successCode = 200) =>
  result.success ? successCode : result.statusCode || 400;

/**
 * Fire-and-forget HR broadcast.
 * Skips the acting user and (optionally) one more exclusion ID (e.g. manager).
 */
const notifyHR = async (hrIds, excludeIds = [], payload) => {
  const exclude = new Set(excludeIds.filter(Boolean));
  for (const hrId of hrIds) {
    if (!exclude.has(hrId)) sendNotification(hrId, payload);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// APPLY FOR LEAVE
// ─────────────────────────────────────────────────────────────────────────────

const applyLeave = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    reason,
    leaveType = 'CASUAL',
    leaveUnit = 'FULL_DAY',
    publicHolidays = [],
  } = req.body;

  const result = await leaveService.applyForLeave({
    employeeId: req.user.id,
    companyId: req.user.companyId,
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
    const name = fullName(req.user);
    const dayWord = daysRequested === 1 ? 'day' : 'days';

    // 1 — Confirm to employee
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

    // 2 — Alert manager
    if (managerId) {
      sendNotification(managerId, {
        type: 'LEAVE_PENDING_REVIEW',
        title: 'New Leave Request Awaiting Approval',
        message: `${name} has requested ${leaveType.toLowerCase()} leave from ${startDate} to ${endDate} (${daysRequested} ${dayWord}).`,
        leaveId: id,
        employeeId: req.user.id,
        days: daysRequested,
        reason,
        leaveType,
      });
    }

    // 3 — Alert HR (skip manager + employee to avoid duplicates)
    const hrIds = await leaveService.getHRTeamIds();
    await notifyHR(hrIds, [managerId, req.user.id], {
      type: 'LEAVE_APPLIED_HR',
      title: 'New Leave Application',
      message: `${name} applied for ${daysRequested} ${dayWord} of ${leaveType.toLowerCase()} leave from ${startDate} to ${endDate}.`,
      leaveId: id,
      employeeId: req.user.id,
      leaveType,
    });
  }

  return res.status(httpStatus(result, 201)).json(result);
});

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW LEAVE — approve / reject  (Manager · Admin · HR)
// ─────────────────────────────────────────────────────────────────────────────

const reviewLeave = asyncHandler(async (req, res) => {
  // FIX — use primaryRole (consistent with service/repo); fall back to role
  const actorRole = req.user.primaryRole || req.user.role;

  const allowedRoles = ['Manager', 'Admin', 'HR'];
  if (!allowedRoles.includes(actorRole)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Only Manager, Admin, or HR can review leaves',
    });
  }

  const result = await leaveService.managerDecision({
    managerId: req.user.id,
    role: actorRole,          // FIX — was req.user.role, which may be undefined
    requestId: Number(req.params.id),
    status: req.body.status,
    decisionNote: req.body.decisionNote,
    ipAddress: req.ip,
    actor: req.user,
  });

  if (result.success) {
    const leave = result.data;
    const {
      employeeId, startDate, endDate,
      daysRequested, managerId, status, leaveType,
    } = leave;

    const note = req.body.decisionNote || null;
    const label = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    const manName = fullName(req.user);
    const dayWord = daysRequested === 1 ? 'day' : 'days';
    const noteStr = note ? ` Note: ${note}` : '';
    const noteStrHR = note ? ` Reason: ${note}` : '';

    // 1 — Notify employee
    sendNotification(employeeId, {
      type: `LEAVE_${status.toUpperCase()}`,
      title: `Leave ${label}`,
      message: `Your ${(leaveType || '').toLowerCase()} leave from ${startDate} to ${endDate} has been ${status.toLowerCase()} by ${manName}.${noteStr}`,
      leaveId: leave.id,
      status,
      decisionNote: note,
      days: daysRequested,
    });

    // 2 — Notify team members if approved
    if (status.toLowerCase() === 'approved') {
      const teamIds = await leaveService.getTeamMembers(managerId);
      for (const memberId of teamIds) {
        if (memberId !== employeeId) {
          sendNotification(memberId, {
            type: 'TEAM_MEMBER_ON_LEAVE',
            title: 'Team Leave Update',
            message: `A team member will be on ${(leaveType || '').toLowerCase()} leave from ${startDate} to ${endDate} (${daysRequested} ${dayWord}).`,
            leaveId: leave.id,
            employeeId,
          });
        }
      }
    }

    // 3 — Notify HR (skip the reviewer to avoid self-notification)
    const hrIds = await leaveService.getHRTeamIds();
    await notifyHR(hrIds, [req.user.id], {
      type: `LEAVE_${status.toUpperCase()}_HR`,
      title: `Leave ${label} — HR Notice`,
      message: `${manName} has ${status.toLowerCase()} a ${(leaveType || '').toLowerCase()} leave request (${daysRequested} ${dayWord}, ${startDate} → ${endDate}).${noteStrHR}`,
      leaveId: leave.id,
      employeeId,
    });
  }

  return res.status(httpStatus(result)).json(result);
});

// ─────────────────────────────────────────────────────────────────────────────
// CANCEL LEAVE  (employee cancels their own pending leave)
// ─────────────────────────────────────────────────────────────────────────────

const cancelLeave = asyncHandler(async (req, res) => {
  const result = await leaveService.cancelLeave({
    requestId: Number(req.params.id),
    employeeId: req.user.id,
    actor: req.user,
  });

  if (result.success) {
    const leave = result.data;
    const { startDate, endDate, daysRequested, managerId } = leave;
    const name = fullName(req.user);

    // 1 — Confirm to employee
    sendNotification(req.user.id, {
      type: 'LEAVE_CANCELLED',
      title: 'Leave Cancelled',
      message: `Your leave from ${startDate} to ${endDate} has been successfully cancelled.`,
      leaveId: leave.id,
      days: daysRequested,
    });

    // 2 — Alert manager
    if (managerId) {
      sendNotification(managerId, {
        type: 'LEAVE_CANCELLED_MANAGER',
        title: 'Leave Request Cancelled',
        message: `${name} cancelled their leave from ${startDate} to ${endDate}.`,
        leaveId: leave.id,
        employeeId: req.user.id,
      });
    }

    // 3 — Alert HR
    const hrIds = await leaveService.getHRTeamIds();
    await notifyHR(hrIds, [managerId, req.user.id], {
      type: 'LEAVE_CANCELLED_HR',
      title: 'Leave Cancelled — HR Notice',
      message: `${name} cancelled their leave from ${startDate} to ${endDate}.`,
      leaveId: leave.id,
      employeeId: req.user.id,
    });
  }

  return res.status(httpStatus(result)).json(result);
});

// ─────────────────────────────────────────────────────────────────────────────
// READ-ONLY HANDLERS
// ─────────────────────────────────────────────────────────────────────────────

/** GET /leaves/mine  — cursor-paginated list of own leaves */
const listMyLeaves = asyncHandler(async (req, res) => {
  const result = await leaveService.listMyLeaves({
    employeeId: req.user.id,
    cursor: req.query.cursor ? Number(req.query.cursor) : null,
    limit: Math.min(Number(req.query.limit || 20), 100),
    actor: req.user,
  });
  return res.status(httpStatus(result)).json(result);
});

/**
 * GET /leaves/pending
 * Role-aware:
 *   Admin / HR  → company-wide pending + recent approved
 *   Manager     → own team pending + recent approved
 *   Employee    → own pending only
 */
const listPendingLeaves = asyncHandler(async (req, res) => {
  const result = await leaveService.listPendingLeaves({
    actor: req.user,                           // FIX — was missing actor in some paths
    limit: Number(req.query.limit || 10),
    page: Number(req.query.page || 1),
  });
  return res.status(httpStatus(result)).json(result);
});

/** GET /leaves/balance  — own leave balance */
const getLeaveBalance = asyncHandler(async (req, res) => {
  const result = await leaveService.getMyLeaveBalance(req.user.id, req.user);
  return res.status(httpStatus(result)).json(result);
});

/** GET /leaves/:id  — single leave request */
const getLeaveById = asyncHandler(async (req, res) => {
  const result = await leaveService.findLeaveRequestById(Number(req.params.id), req.user);
  return res.status(httpStatus(result)).json(result);
});

/**
 * GET /leaves/team
 * FIX — was passing managerId to service which then only showed that manager's
 * direct reports. Now passes actor so service + repo can apply correct scoping:
 *   Admin / HR  → all company leaves
 *   Manager     → direct reports only
 *
 * Supported query params: status, leaveType, startDate, endDate, limit, page
 */
const listTeamLeaves = asyncHandler(async (req, res) => {
  const result = await leaveService.listTeamLeaves({
    actor: req.user,                    // FIX — was passing managerId, broke Admin/HR
    status: req.query.status || null,
    leaveType: req.query.leaveType || null,
    startDate: req.query.startDate || null,
    endDate: req.query.endDate || null,
    limit: Number(req.query.limit || 20),
    page: Number(req.query.page || 1),
  });
  return res.status(httpStatus(result)).json(result);
});

/** GET /leaves/dashboard  — leave balance + recent leaves */
const getDashboardSummary = asyncHandler(async (req, res) => {
  const result = await leaveService.getDashboardSummary({
    userId: req.user.id,
    year: req.query.year,
    actor: req.user,
  });
  return res.status(httpStatus(result)).json(result);
});

/**
 * GET /leaves/stats
 * Role-aware counts:
 *   Admin / HR  → company-wide
 *   Manager     → team only
 *   Employee    → own only
 */
const getLeaveStats = asyncHandler(async (req, res) => {
  const result = await leaveService.getLeaveStats({
    year: req.query.year,
    actor: req.user,           // FIX — actor was passed but service wasn't using it
  });
  return res.status(httpStatus(result)).json(result);
});

/** POST /leaves/reset  — yearly balance reset (Admin / HR only) */
const resetLeaveBalances = asyncHandler(async (req, res) => {
  const result = await leaveService.yearlyLeaveReset(req.body.year, req.user);
  return res.status(httpStatus(result)).json(result);
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

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