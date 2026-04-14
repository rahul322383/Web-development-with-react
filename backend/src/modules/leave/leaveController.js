

const asyncHandler = require('../../utils/asyncHandler');
const leaveService = require('./leaveService');
const { sendNotification } = require('../../config/socket');

const applyLeave = asyncHandler(async (req, res) => {
  const result = await leaveService.applyForLeave({
    employeeId: req.user.id,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    reason: req.body.reason,
    ipAddress: req.ip
  });

  // Send notification to employee
  if (result.success) {
    sendNotification(req.user.id, {
      type: "LEAVE_APPLIED",
      title: "Leave Application Submitted",
      message: `Your leave request from ${req.body.startDate} to ${req.body.endDate} has been submitted and is pending approval.`,
      leaveId: result.data.id,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      status: "PENDING",
      days: result.data.daysRequested
    });

    // Notify manager about new leave request
    if (result.data.managerId) {
      sendNotification(result.data.managerId, {
        type: "LEAVE_PENDING_REVIEW",
        title: "New Leave Request",
        message: `${req.user.name || 'Employee'} has requested leave from ${req.body.startDate} to ${req.body.endDate} (${result.data.daysRequested} days).`,
        leaveId: result.data.id,
        employeeId: req.user.id,
        employeeName: req.user.name,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        days: result.data.daysRequested,
        reason: req.body.reason
      });
    }

    // Notify HR/Admin about new leave request
    const hrTeamIds = await leaveService.getHRTeamIds();
    hrTeamIds.forEach(hrId => {
      sendNotification(hrId, {
        type: "LEAVE_APPLIED_HR_NOTIFICATION",
        title: "New Leave Application",
        message: `${req.user.name || 'Employee'} has applied for ${result.data.daysRequested} days leave.`,
        leaveId: result.data.id,
        employeeId: req.user.id,
        employeeName: req.user.name,
        days: result.data.daysRequested
      });
    });
  }

  res.status(201).json(result);
});

/**
 * Manager Review (Approve / Reject)
 */
const reviewLeave = asyncHandler(async (req, res) => {
  const result = await leaveService.managerDecision({
    managerId: req.user.id,
    role: req.user.role,
    requestId: Number(req.params.id),
    status: req.body.status,
    decisionNote: req.body.decisionNote,
    ipAddress: req.ip
  });

  if (result.success) {
    const leaveRequest = result.data;
    
    // Notify employee about manager's decision
    sendNotification(leaveRequest.employeeId, {
      type: `LEAVE_${leaveRequest.status}`,
      title: `Leave ${leaveRequest.status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
      message: `Your leave request from ${leaveRequest.startDate} to ${leaveRequest.endDate} has been ${leaveRequest.status.toLowerCase()} by your manager.`,
      leaveId: leaveRequest.id,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      status: leaveRequest.status,
      decisionNote: req.body.decisionNote,
      managerName: req.user.name,
      days: leaveRequest.daysRequested
    });

    // If approved, update leave balance notification
    if (leaveRequest.status === 'APPROVED') {
      const balance = await leaveService.getMyLeaveBalance(leaveRequest.employeeId);
      sendNotification(leaveRequest.employeeId, {
        type: "LEAVE_BALANCE_UPDATED",
        title: "Leave Balance Updated",
        message: `Your leave balance has been updated. Remaining annual leave: ${balance.annual} days.`,
        balance: balance
      });

      // Notify HR about approved leave
      const hrTeamIds = await leaveService.getHRTeamIds();
      hrTeamIds.forEach(hrId => {
        sendNotification(hrId, {
          type: "LEAVE_APPROVED_HR_NOTIFICATION",
          title: "Leave Approved by Manager",
          message: `${req.user.name} approved leave for Employee #${leaveRequest.employeeId}`,
          leaveId: leaveRequest.id,
          managerId: req.user.id,
          managerName: req.user.name,
          days: leaveRequest.daysRequested
        });
      });

      // Notify team members (optional)
      const teamMembers = await leaveService.getTeamMembers(req.user.id);
      teamMembers.forEach(memberId => {
        if (memberId !== leaveRequest.employeeId) {
          sendNotification(memberId, {
            type: "TEAM_MEMBER_ON_LEAVE",
            title: "Team Member on Leave",
            message: `A team member will be on leave from ${leaveRequest.startDate} to ${leaveRequest.endDate}`,
            leaveId: leaveRequest.id,
            startDate: leaveRequest.startDate,
            endDate: leaveRequest.endDate
          });
        }
      });
    }

    // If rejected, also notify HR
    if (leaveRequest.status === 'REJECTED') {
      const hrTeamIds = await leaveService.getHRTeamIds();
      hrTeamIds.forEach(hrId => {
        sendNotification(hrId, {
          type: "LEAVE_REJECTED_HR_NOTIFICATION",
          title: "Leave Rejected by Manager",
          message: `${req.user.name} rejected leave for Employee #${leaveRequest.employeeId}`,
          leaveId: leaveRequest.id,
          managerId: req.user.id,
          managerName: req.user.name,
          decisionNote: req.body.decisionNote
        });
      });
    }
  }

  res.status(200).json(result);
});

/**
 * Cancel Leave (only if pending)
 */
const cancelLeave = asyncHandler(async (req, res) => {
  const result = await leaveService.cancelLeave({
    requestId: Number(req.params.id),
    employeeId: req.user.id
  });

  if (result.success) {
    const leaveRequest = result.data;
    
    // Notify employee about cancellation
    sendNotification(req.user.id, {
      type: "LEAVE_CANCELLED",
      title: "Leave Request Cancelled",
      message: `Your leave request from ${leaveRequest.startDate} to ${leaveRequest.endDate} has been cancelled successfully.`,
      leaveId: leaveRequest.id,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      days: leaveRequest.daysRequested
    });

    // Notify manager about cancellation
    if (leaveRequest.managerId) {
      sendNotification(leaveRequest.managerId, {
        type: "LEAVE_CANCELLED_MANAGER",
        title: "Leave Request Cancelled",
        message: `${req.user.name || 'Employee'} has cancelled their leave request from ${leaveRequest.startDate} to ${leaveRequest.endDate}`,
        leaveId: leaveRequest.id,
        employeeId: req.user.id,
        employeeName: req.user.name,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate
      });
    }

    // Notify HR about cancellation
    const hrTeamIds = await leaveService.getHRTeamIds();
    hrTeamIds.forEach(hrId => {
      sendNotification(hrId, {
        type: "LEAVE_CANCELLED_HR",
        title: "Leave Request Cancelled",
        message: `${req.user.name || 'Employee'} cancelled their leave request`,
        leaveId: leaveRequest.id,
        employeeId: req.user.id,
        employeeName: req.user.name
      });
    });
  }

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
  const data = await leaveService.listPendingLeavesForManager(req.user.id);
  res.status(200).json({
    success: true,
    data
  });
});

const getLeaveBalance = async (req, res) => {
  try {
    const data = await leaveService.getMyLeaveBalance(req.user.id);
    res.json({
      success: true,
      message: "Leave balance fetched successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const resetLeaveBalances = asyncHandler(async (req, res) => {
  await leaveService.resetAllLeaveBalances({
    totalAnnual: req.body.totalAnnual,
    year: req.body.year
  });
  
  // Notify all employees about balance reset
  const allEmployees = await leaveService.getAllEmployeeIds();
  allEmployees.forEach(employeeId => {
    sendNotification(employeeId, {
      type: "LEAVE_BALANCE_RESET",
      title: "Annual Leave Balance Reset",
      message: `Your annual leave balance has been reset to ${req.body.totalAnnual} days for year ${req.body.year}.`,
      totalAnnual: req.body.totalAnnual,
      year: req.body.year
    });
  });

  // Notify admins
  const adminIds = await leaveService.getAdminIds();
  adminIds.forEach(adminId => {
    sendNotification(adminId, {
      type: "LEAVE_BALANCE_RESET_COMPLETE",
      title: "Leave Balance Reset Complete",
      message: `Annual leave balances have been reset to ${req.body.totalAnnual} days for all employees.`,
      totalAnnual: req.body.totalAnnual,
      year: req.body.year,
      employeeCount: allEmployees.length
    });
  });

  res.status(200).json({ 
    success: true,
    message: 'Leave balances reset successfully' 
  });
});

const getLeaveById = asyncHandler(async (req, res) => {
  const result = await leaveService.getLeaveById(Number(req.params.id));
  res.status(200).json({
    success: true,
    data: result
  });
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
  resetLeaveBalances
};