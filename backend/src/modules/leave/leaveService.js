


const sequelize = require('../../database/sequelize');
const env = require('../../config/env');
const leaveRepository = require('./leaveRepository');
const { cursorPaginate } = require('../../utils/pagination');
const { logAuditEvent } = require('../../utils/auditLogger');
const { clearCacheKeys } = require('../../utils/cache');
const { LeaveRequest, LeaveBalance } = require('../../database/initModels');
 
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

const listTeamLeaves = async (managerId) => {
  try {
    const data = await leaveRepository.listTeamLeaves(managerId);

    return {
      success: true,
      data
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

const managerDecision = async ({
  managerId,
  role,
  requestId,
  status,
  decisionNote,
  ipAddress
}) => {
  try {
    // ✅ Validate status
    if (!['Approved', 'Rejected'].includes(status)) {
      throw new Error('Invalid status value');
    }

    return await sequelize.transaction(async (transaction) => {

      // ✅ Lock row to prevent race condition
      const leaveRequest = await LeaveRequest.findByPk(requestId, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!leaveRequest) {
        throw new Error('Leave request not found');
      }

      // ✅ Authorization (Manager OR Admin/HR)
      if (
        leaveRequest.managerId !== managerId &&
        !['Admin', 'HR', 'Manager'].includes(role)
      ) {
        throw new Error('Not authorized to review this request');
      }

      // ✅ Already processed check
      if (leaveRequest.status !== 'Pending') {
        throw new Error('Leave request already processed');
      }

      // ✅ Update leave request
      await leaveRepository.updateLeaveRequest(
        requestId,
        { status, decisionNote },
        transaction
      );

      // ✅ If Approved → Update Balance
      let year;
      if (status === 'Approved') {
        year = new Date(leaveRequest.startDate).getFullYear();

        const balance = await leaveRepository.findLeaveBalance(
          leaveRequest.employeeId,
          year,
          transaction
        );

        if (!balance || balance.remaining < leaveRequest.daysRequested) {
          throw new Error('Insufficient balance at approval time');
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
      const actionMap = {
        Approved: 'APPROVE',
        Rejected: 'REJECT'
      };

      // ✅ Audit Log
      await logAuditEvent({
        userId: managerId,
        moduleName: 'Leave',
         actionType: actionMap[status],
        oldData: { status: 'Pending' },
        newData: { status, decisionNote },
        ipAddress
      });

      // ✅ Cache clear (use correct year always)
      const cacheYear =
        year || new Date(leaveRequest.startDate).getFullYear();

      await clearCacheKeys([
        `dashboard_summary:${leaveRequest.employeeId}:${cacheYear}`,
        `dashboard_summary:${managerId}:${cacheYear}`
      ]);

      // ✅ Fetch updated record
      const updatedRequest = await leaveRepository.findLeaveRequestById(
        requestId,
        transaction
      );

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
// 📌 Additional functions for leaveRepository (moved from controller for better separation of concerns)
// leave delete and update functions are added in repository to be used in service layer for better transaction management and code organization.

// delete and update functions for leave requests

const deleteLeaveRequest = (id, transaction) =>
  LeaveRequest.destroy({
    where: { id },
    transaction
  });

const updateLeaveRequest = (id, data, transaction) =>
  LeaveRequest.update(data, {
    where: { id },
    transaction
  });

const findLeaveRequestById = (id, transaction) =>
  LeaveRequest.findByPk(id, { transaction });

const findLeaveBalance = (employeeId, year, transaction) =>
  LeaveBalance.findOne({
    where: { employeeId, year },
    transaction
  });

const updateLeaveBalance = (employeeId, year, data, transaction) =>
  LeaveBalance.update(data, {
    where: { employeeId, year },
    transaction
  }); 

const createLeaveBalance = async (payload, transaction) => LeaveBalance.create(payload, { transaction });

const createLeaveRequest = async (payload, transaction) => LeaveRequest.create(payload, { transaction });  

//find employee function is added in repository to be used in service layer for better transaction management and code organization.

const findEmployee = async (id) => User.findByPk(id);
const getLeaveStats = async ({ year }) => {
  try {
    const stats = await leaveRepository.getLeaveStats({ year });

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// get dashboard summary function is added in repository to be used in service layer for better transaction management and code organization.

const getDashboardSummary = async ({ userId, year }) => {
  const selectedYear = year || new Date().getFullYear();

  const leaveBalance = await LeaveBalance.findOne({
    where: { employeeId: userId, year: selectedYear }
  });

  const recentLeaves = await LeaveRequest.findAll({
    where: { employeeId: userId },
    limit: 5,
    order: [['createdAt', 'DESC']]
  });

  return {
    leaveBalance,
    recentLeaves
  };
};
module.exports = {
  getDashboardSummary,
  listTeamLeaves,
  findEmployee,
  findLeaveBalance,
  getLeaveStats,
  createLeaveBalance,
  updateLeaveBalance,
  createLeaveRequest,
  deleteLeaveRequest,
  updateLeaveRequest,
  findLeaveRequestById,
  applyForLeave,
  managerDecision,
  listMyLeaves,
  listPendingLeavesForManager,
  getMyLeaveBalance,
  yearlyLeaveReset
};