const sequelize = require('../../database/sequelize');
const env = require('../../config/env');
const leaveRepository = require('./leaveRepository');
const { cursorPaginate } = require('../../utils/pagination');
const { logAuditEvent } = require('../../utils/auditLogger');
const { clearCacheKeys } = require('../../utils/cache');
const { LeaveRequest, LeaveBalance, User } = require('../../database/initModels');
const { Op } = require('sequelize');

/* -------------------- HELPERS -------------------- */

const calculateRequestedDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

const ensureLeaveBalance = async (employeeId, year, transaction) => {
  let balance = await LeaveBalance.findOne({
    where: { employeeId, year },
    transaction,
    lock: transaction.LOCK.UPDATE
  });

  if (!balance) {
    balance = await LeaveBalance.create({
      employeeId,
      totalAnnual: env.DEFAULT_ANNUAL_LEAVE,
      used: 0,
      remaining: env.DEFAULT_ANNUAL_LEAVE,
      year
    }, { transaction });
  }

  return balance;
};

/* -------------------- APPLY LEAVE -------------------- */

const applyForLeave = async ({
  employeeId,
  startDate,
  endDate,
  reason,
  ipAddress
}) => {
  try {
    const empId = Number(employeeId);

    if (!empId || isNaN(empId)) {
      return { success: false, message: "Invalid employeeId" };
    }

    if (!reason || reason.trim().length < 5) {
      return { success: false, message: "Reason must be at least 5 characters" };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return { success: false, message: "Invalid date format" };
    }

    if (start > end) {
      return { success: false, message: "startDate cannot be after endDate" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return { success: false, message: "Cannot apply for past dates" };
    }

    const daysRequested = calculateRequestedDays(start, end);

    if (daysRequested > 30) {
      return { success: false, message: "Leave exceeds maximum allowed limit" };
    }

    return await sequelize.transaction(async (transaction) => {

      const employee = await User.findByPk(empId, { transaction });

      if (!employee) throw new Error("Employee not found");
      if (!employee.managerId) throw new Error("Manager not assigned");

      const manager = await User.findByPk(employee.managerId, { transaction });
      if (!manager) throw new Error("Manager not found");

      const overlapping = await LeaveRequest.findOne({
        where: {
          employeeId: empId,
          [Op.and]: [
            { startDate: { [Op.lte]: end } },
            { endDate: { [Op.gte]: start } }
          ]
        },
        transaction
      });

      if (overlapping) {
        throw new Error("Leave already exists for selected dates");
      }

      const request = await LeaveRequest.create({
        employeeId: empId,
        managerId: employee.managerId,
        startDate: start,
        endDate: end,
        reason,
        daysRequested,
        status: "Pending"
      }, { transaction });

      await logAuditEvent({
        userId: empId,
        moduleName: "Leave",
        actionType: "CREATE",
        oldData: null,
        newData: request,
        ipAddress
      });

      return {
        success: true,
        message: "Leave applied successfully",
        data: request
      };
    });

  } catch (error) {
    return {
      success: false,
      message: error.message || "Something went wrong"
    };
  }
};

/* -------------------- MANAGER DECISION -------------------- */

const managerDecision = async ({
  managerId,
  role,
  requestId,
  status,
  decisionNote,
  ipAddress
}) => {
  try {
    if (!["Approved", "Rejected"].includes(status)) {
      return { success: false, message: "Invalid status" };
    }

    return await sequelize.transaction(async (transaction) => {

      const leaveRequest = await LeaveRequest.findByPk(requestId, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!leaveRequest) throw new Error("Leave request not found");
      if (leaveRequest.status !== "Pending") throw new Error("Already processed");

      const employee = await User.findByPk(leaveRequest.employeeId, { transaction });

      if (
        employee.managerId !== managerId &&
        !["Admin", "HR"].includes(role)
      ) {
        throw new Error("Not authorized");
      }

      await leaveRequest.update({ status, decisionNote }, { transaction });

      const year = new Date(leaveRequest.startDate).getFullYear();

      if (status === "Approved") {

        const balance = await ensureLeaveBalance(
          leaveRequest.employeeId,
          year,
          transaction
        );

        if (balance.remaining < leaveRequest.daysRequested) {
          throw new Error("Insufficient leave balance");
        }

        await balance.update({
          used: balance.used + leaveRequest.daysRequested,
          remaining: balance.remaining - leaveRequest.daysRequested
        }, { transaction });
      }

      await logAuditEvent({
        userId: managerId,
        moduleName: "Leave",
        actionType: status === "Approved" ? "APPROVE" : "REJECT",
        oldData: { status: "Pending" },
        newData: { status, decisionNote },
        ipAddress
      });

      await clearCacheKeys([
        `dashboard_summary:${leaveRequest.employeeId}:${year}`,
        `dashboard_summary:${managerId}:${year}`,
        `leave_balance:${leaveRequest.employeeId}:${year}`
      ]);

      return {
        success: true,
        message: `Leave ${status.toLowerCase()} successfully`,
        data: leaveRequest
      };
    });

  } catch (error) {
    return {
      success: false,
      message: error.message || "Something went wrong"
    };
  }
};

/* -------------------- LIST FUNCTIONS -------------------- */

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

const listPendingLeavesForManager = async (managerId) => {
  try {
    const data = await leaveRepository.listPendingManagerLeaves(managerId);

    return {
      success: true,
      count: data.length,
      data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

/* -------------------- LEAVE BALANCE -------------------- */

const getMyLeaveBalance = async (employeeId) => {
  try {
    const year = new Date().getFullYear();

    const balance = await LeaveBalance.findOne({
      where: { employeeId, year }
    });

    const leaves = await LeaveRequest.findAll({
      where: {
        employeeId,
        createdAt: {
          [Op.gte]: new Date(`${year}-01-01`),
          [Op.lte]: new Date(`${year}-12-31`)
        }
      },
      order: [['createdAt', 'DESC']]
    });

    return {
      ...(balance?.toJSON() || {
        totalAnnual: env.DEFAULT_ANNUAL_LEAVE,
        used: 0,
        remaining: env.DEFAULT_ANNUAL_LEAVE,
        year
      }),
      leaves
    };

  } catch (error) {
    throw error;
  }
};

/* -------------------- DASHBOARD -------------------- */

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

/* -------------------- RESET -------------------- */

const yearlyLeaveReset = async (year) => {
  try {
    await sequelize.transaction(async (transaction) => {
      await LeaveBalance.update(
        {
          totalAnnual: env.DEFAULT_ANNUAL_LEAVE,
          used: 0,
          remaining: env.DEFAULT_ANNUAL_LEAVE,
          year
        },
        { where: {}, transaction }
      );
    });

    return {
      success: true,
      message: "Leave reset done"
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getHRTeamIds = async () => {
  const hrUsers = await User.findAll({
    where: { role: 'HR' },
    attributes: ['id']
  });

  return hrUsers.map(user => user.id);
};

const getTeamMembers = async (managerId) => {
  const users = await User.findAll({
    where: { managerId },
    attributes: ['id']
  });

  return users.map(u => u.id);
};

module.exports = {
  getTeamMembers,
  getHRTeamIds,
  applyForLeave,
  managerDecision,
  listMyLeaves,
  listPendingLeavesForManager,
  getMyLeaveBalance,
  yearlyLeaveReset,
  getDashboardSummary
};