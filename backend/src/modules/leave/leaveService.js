


const sequelize = require('../../database/sequelize');
const env = require('../../config/env');
const leaveRepository = require('./leaveRepository');
const { cursorPaginate } = require('../../utils/pagination');
const { logAuditEvent } = require('../../utils/auditLogger');
const { clearCacheKeys } = require('../../utils/cache');

// 📌 Calculate leave days
const calculateRequestedDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

// 📌 Ensure Leave Balance Exists
const ensureLeaveBalance = async (employeeId, transaction) => {
  const year = new Date().getFullYear();
  const existing = await leaveRepository.findLeaveBalance(employeeId, year);
  if (existing) return existing;

  return leaveRepository.createLeaveBalance(
    {
      employeeId,
      totalAnnual: env.DEFAULT_ANNUAL_LEAVE,
      used: 0,
      remaining: env.DEFAULT_ANNUAL_LEAVE,
      year
    },
    transaction
  );
};


const applyForLeave = async ({ employeeId, startDate, endDate, reason, ipAddress }) => {
  try {
    return await sequelize.transaction(async (transaction) => {

const employee = await leaveRepository.findEmployee(employeeId);

if (!employee || !employee.managerId) {
  return { success: false, message: 'Employee manager mapping missing' };
}
      if (new Date(startDate) > new Date(endDate)) {
        return { success: false, message: 'startDate cannot be after endDate' };
      }

      const daysRequested = calculateRequestedDays(startDate, endDate);
      const leaveBalance = await ensureLeaveBalance(employeeId, transaction);

      if (leaveBalance.remaining < daysRequested) {
        return { success: false, message: 'Insufficient leave balance' };
      }

      const request = await leaveRepository.createLeaveRequest(
        {
          employeeId,
          managerId: employee.managerId,
          startDate,
          endDate,
          reason,
          daysRequested,
          status: 'Pending'
        },
        transaction
      );

      await logAuditEvent({
        userId: employeeId,
        moduleName: 'Leave',
        actionType: 'CREATE',
        oldData: null,
        newData: request,
        ipAddress
      });

      await clearCacheKeys([`dashboard_summary:${employeeId}:${new Date().getFullYear()}`]);

      return {
        success: true,
        message: 'Leave applied successfully',
        data: request
      };
    });
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Something went wrong'
    };
  }
};

// 🚀 Manager Decision (Approve / Reject)
const managerDecision = async ({ managerId, requestId, status, decisionNote, ipAddress }) => {
  try {
    return await sequelize.transaction(async (transaction) => {

      const leaveRequest = await leaveRepository.findLeaveRequestById(requestId);
      if (!leaveRequest) {
        return { success: false, message: 'Leave request not found' };
      }

      if (leaveRequest.managerId !== managerId) {
        return { success: false, message: 'Not authorized to review this request' };
      }

      if (leaveRequest.status !== 'Pending') {
        return { success: false, message: 'Leave request already processed' };
      }

      await leaveRepository.updateLeaveRequest(
        requestId,
        { status, decisionNote },
        transaction
      );

      if (status === 'Approved') {
        const year = new Date(leaveRequest.startDate).getFullYear();
        const balance = await leaveRepository.findLeaveBalance(leaveRequest.employeeId, year);

        if (!balance || balance.remaining < leaveRequest.daysRequested) {
          return { success: false, message: 'Insufficient balance at approval time' };
        }

        await leaveRepository.updateLeaveBalance(
          leaveRequest.employeeId,
          year,
          {
            used: balance.used + leaveRequest.daysRequested,
            remaining: balance.remaining - leaveRequest.daysRequested
          },
          transaction
        );
      }

      await logAuditEvent({
        userId: managerId,
        moduleName: 'Leave',
        actionType: 'APPROVE',
        oldData: { status: 'Pending' },
        newData: { status, decisionNote },
        ipAddress
      });

      await clearCacheKeys([
        `dashboard_summary:${leaveRequest.employeeId}:${new Date().getFullYear()}`,
        `dashboard_summary:${managerId}:${new Date().getFullYear()}`
      ]);

      const updatedRequest = await leaveRepository.findLeaveRequestById(requestId);

      return {
        success: true,
        message: `Leave ${status.toLowerCase()} successfully`,
        data: updatedRequest
      };
    });
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Something went wrong'
    };
  }
};

// 📄 List My Leaves
const listMyLeaves = async ({ employeeId, cursor, limit }) => {
  try {
    const rows = await leaveRepository.listEmployeeLeavesWithCursor({
      employeeId,
      cursor,
      limit
    });

    return {
      success: true,
      data: cursorPaginate({ rows, limit, cursorKey: 'id' })
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// 📄 Manager Pending Leaves
const listPendingLeavesForManager = async (managerId) => {
  try {
    const data = await leaveRepository.listPendingManagerLeaves(managerId);

    return {
      success: true,
      data
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// 📊 Leave Balance
const getMyLeaveBalance = async (employeeId) => {
  try {
    const year = new Date().getFullYear();
    const leaveBalance = await leaveRepository.findLeaveBalance(employeeId, year);

    if (!leaveBalance) {
      return {
        success: true,
        data: {
          totalAnnual: env.DEFAULT_ANNUAL_LEAVE,
          used: 0,
          remaining: env.DEFAULT_ANNUAL_LEAVE,
          year
        }
      };
    }

    return {
      success: true,
      data: leaveBalance
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// 🔁 Yearly Reset
const yearlyLeaveReset = async (year) => {
  try {
    await sequelize.transaction(async (transaction) => {
      await leaveRepository.resetAllLeaveBalances(
        {
          totalAnnual: env.DEFAULT_ANNUAL_LEAVE,
          year
        },
        transaction
      );
    });

    return {
      success: true,
      message: 'Leave balances reset successfully'
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = {
  applyForLeave,
  managerDecision,
  listMyLeaves,
  listPendingLeavesForManager,
  getMyLeaveBalance,
  yearlyLeaveReset
};