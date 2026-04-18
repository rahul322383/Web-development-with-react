// const sequelize = require('../../database/sequelize');
// const env = require('../../config/env');
// const leaveRepository = require('./leaveRepository');
// const { cursorPaginate } = require('../../utils/pagination');
// const { logAuditEvent } = require('../../utils/auditLogger');
// const { clearCacheKeys } = require('../../utils/cache');
// const { LeaveRequest, LeaveBalance, User } = require('../../database/initModels');
// const { Op } = require('sequelize');

// /* -------------------- HELPERS -------------------- */

// const calculateRequestedDays = (startDate, endDate) => {
//   const start = new Date(startDate);
//   const end = new Date(endDate);
//   return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
// };

// const ensureLeaveBalance = async (employeeId, year, transaction) => {
//   let balance = await LeaveBalance.findOne({
//     where: { employeeId, year },
//     transaction,
//     lock: transaction.LOCK.UPDATE
//   });

//   if (!balance) {
//     balance = await LeaveBalance.create({
//       employeeId,
//       totalAnnual: env.DEFAULT_ANNUAL_LEAVE,
//       used: 0,
//       remaining: env.DEFAULT_ANNUAL_LEAVE,
//       year
//     }, { transaction });
//   }

//   return balance;
// };

// /* -------------------- APPLY LEAVE -------------------- */

// const applyForLeave = async ({
//   employeeId,
//   startDate,
//   endDate,
//   reason,
//   ipAddress
// }) => {
//   try {
//     const empId = Number(employeeId);

//     if (!empId || isNaN(empId)) {
//       return { success: false, message: "Invalid employeeId" };
//     }

//     if (!reason || reason.trim().length < 5) {
//       return { success: false, message: "Reason must be at least 5 characters" };
//     }

//     const start = new Date(startDate);
//     const end = new Date(endDate);

//     if (isNaN(start) || isNaN(end)) {
//       return { success: false, message: "Invalid date format" };
//     }

//     if (start > end) {
//       return { success: false, message: "startDate cannot be after endDate" };
//     }

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     if (start < today) {
//       return { success: false, message: "Cannot apply for past dates" };
//     }

//     const daysRequested = calculateRequestedDays(start, end);

//     if (daysRequested > 30) {
//       return { success: false, message: "Leave exceeds maximum allowed limit" };
//     }

//     return await sequelize.transaction(async (transaction) => {

//       const employee = await User.findByPk(empId, { transaction });

//       if (!employee) throw new Error("Employee not found");
//       if (!employee.managerId) throw new Error("Manager not assigned");

//       const manager = await User.findByPk(employee.managerId, { transaction });
//       if (!manager) throw new Error("Manager not found");

//       const overlapping = await LeaveRequest.findOne({
//         where: {
//           employeeId: empId,
//           [Op.and]: [
//             { startDate: { [Op.lte]: end } },
//             { endDate: { [Op.gte]: start } }
//           ]
//         },
//         transaction
//       });

//       if (overlapping) {
//         throw new Error("Leave already exists for selected dates");
//       }

//       const request = await LeaveRequest.create({
//         employeeId: empId,
//         managerId: employee.managerId,
//         startDate: start,
//         endDate: end,
//         reason,
//         daysRequested,
//         status: "Pending"
//       }, { transaction });

//       await logAuditEvent({
//         userId: empId,
//         moduleName: "Leave",
//         actionType: "CREATE",
//         oldData: null,
//         newData: request,
//         ipAddress
//       });

//       return {
//         success: true,
//         message: "Leave applied successfully",
//         data: request
//       };
//     });

//   } catch (error) {
//     return {
//       success: false,
//       message: error.message || "Something went wrong"
//     };
//   }
// };

// /* -------------------- MANAGER DECISION -------------------- */

// const managerDecision = async ({
//   managerId,
//   role,
//   requestId,
//   status,
//   decisionNote,
//   ipAddress
// }) => {
//   try {
//     if (!["Approved", "Rejected"].includes(status)) {
//       return { success: false, message: "Invalid status" };
//     }

//     return await sequelize.transaction(async (transaction) => {

//       const leaveRequest = await LeaveRequest.findByPk(requestId, {
//         transaction,
//         lock: transaction.LOCK.UPDATE
//       });

//       if (!leaveRequest) throw new Error("Leave request not found");
//       if (leaveRequest.status !== "Pending") throw new Error("Already processed");

//       const employee = await User.findByPk(leaveRequest.employeeId, { transaction });

//       if (
//         employee.managerId !== managerId &&
//         !["Admin", "HR"].includes(role)
//       ) {
//         throw new Error("Not authorized");
//       }

//       await leaveRequest.update({ status, decisionNote }, { transaction });

//       const year = new Date(leaveRequest.startDate).getFullYear();

//       if (status === "Approved") {

//         const balance = await ensureLeaveBalance(
//           leaveRequest.employeeId,
//           year,
//           transaction
//         );

//         if (balance.remaining < leaveRequest.daysRequested) {
//           throw new Error("Insufficient leave balance");
//         }

//         await balance.update({
//           used: balance.used + leaveRequest.daysRequested,
//           remaining: balance.remaining - leaveRequest.daysRequested
//         }, { transaction });
//       }

//       await logAuditEvent({
//         userId: managerId,
//         moduleName: "Leave",
//         actionType: status === "Approved" ? "APPROVE" : "REJECT",
//         oldData: { status: "Pending" },
//         newData: { status, decisionNote },
//         ipAddress
//       });

//       await clearCacheKeys([
//         `dashboard_summary:${leaveRequest.employeeId}:${year}`,
//         `dashboard_summary:${managerId}:${year}`,
//         `leave_balance:${leaveRequest.employeeId}:${year}`
//       ]);

//       return {
//         success: true,
//         message: `Leave ${status.toLowerCase()} successfully`,
//         data: leaveRequest
//       };
//     });

//   } catch (error) {
//     return {
//       success: false,
//       message: error.message || "Something went wrong"
//     };
//   }
// };

// /* -------------------- LIST FUNCTIONS -------------------- */

// const listMyLeaves = async ({ employeeId, cursor, limit }) => {
//   try {
//     const rows = await leaveRepository.listEmployeeLeavesWithCursor({
//       employeeId,
//       cursor,
//       limit
//     });

//     return {
//       success: true,
//       data: cursorPaginate({ rows, limit, cursorKey: 'id' })
//     };
//   } catch (error) {
//     return { success: false, message: error.message };
//   }
// };

// const listPendingLeavesForManager = async (managerId) => {
//   try {
//     const data = await leaveRepository.listPendingManagerLeaves(managerId);

//     return {
//       success: true,
//       count: data.length,
//       data
//     };
//   } catch (error) {
//     return {
//       success: false,
//       message: error.message
//     };
//   }
// };

// /* -------------------- LEAVE BALANCE -------------------- */

// const getMyLeaveBalance = async (employeeId) => {
//   try {
//     const year = new Date().getFullYear();

//     const balance = await LeaveBalance.findOne({
//       where: { employeeId, year }
//     });

//     const leaves = await LeaveRequest.findAll({
//       where: {
//         employeeId,
//         createdAt: {
//           [Op.gte]: new Date(`${year}-01-01`),
//           [Op.lte]: new Date(`${year}-12-31`)
//         }
//       },
//       order: [['createdAt', 'DESC']]
//     });

//     return {
//       ...(balance?.toJSON() || {
//         totalAnnual: env.DEFAULT_ANNUAL_LEAVE,
//         used: 0,
//         remaining: env.DEFAULT_ANNUAL_LEAVE,
//         year
//       }),
//       leaves
//     };

//   } catch (error) {
//     throw error;
//   }
// };

// /* -------------------- DASHBOARD -------------------- */

// const getDashboardSummary = async ({ userId, year }) => {
//   const selectedYear = year || new Date().getFullYear();

//   const leaveBalance = await LeaveBalance.findOne({
//     where: { employeeId: userId, year: selectedYear }
//   });

//   const recentLeaves = await LeaveRequest.findAll({
//     where: { employeeId: userId },
//     limit: 5,
//     order: [['createdAt', 'DESC']]
//   });

//   return {
//     leaveBalance,
//     recentLeaves
//   };
// };

// /* -------------------- RESET -------------------- */

// const yearlyLeaveReset = async (year) => {
//   try {
//     await sequelize.transaction(async (transaction) => {
//       await LeaveBalance.update(
//         {
//           totalAnnual: env.DEFAULT_ANNUAL_LEAVE,
//           used: 0,
//           remaining: env.DEFAULT_ANNUAL_LEAVE,
//           year
//         },
//         { where: {}, transaction }
//       );
//     });

//     return {
//       success: true,
//       message: "Leave reset done"
//     };
//   } catch (error) {
//     return { success: false, message: error.message };
//   }
// };

// const getHRTeamIds = async () => {
//   const hrUsers = await User.findAll({
//     where: { role: 'HR' },
//     attributes: ['id']
//   });

//   return hrUsers.map(user => user.id);
// };

// const getTeamMembers = async (managerId) => {
//   const users = await User.findAll({
//     where: { managerId },
//     attributes: ['id']
//   });

//   return users.map(u => u.id);
// };

// module.exports = {
//   getTeamMembers,
//   getHRTeamIds,
//   applyForLeave,
//   managerDecision,
//   listMyLeaves,
//   listPendingLeavesForManager,
//   getMyLeaveBalance,
//   yearlyLeaveReset,
//   getDashboardSummary
// };



'use strict';

const { Transaction } = require('sequelize');
const sequelize = require('../../database/sequelize');
const env = require('../../config/env');
const leaveRepository = require('./leaveRepository');
const { cursorPaginate } = require('../../utils/pagination');
const { logAuditEvent } = require('../../utils/auditLogger');
const { clearCacheKeys } = require('../../utils/cache');
const { LeaveRequest, LeaveBalance, User } = require('../../database/initModels');
const { Op } = require('sequelize');
const logger = require('../../config/logger');
const eventBus = require('../../utils/eventBus ');
const { assertPermission } = require('../../utils/permissions');
const {
  applyLeaveSchema,
  managerDecisionSchema,
  validate,
} = require('./leaveValidation');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LEAVE_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const MAX_LEAVE_DAYS = 30;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fail = (message, statusCode = 400, data = null) => ({
  success: false, message, statusCode, data,
});

const calculateRequestedDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * FIX: use Transaction.LOCK.UPDATE (class-level constant) instead of
 * transaction.LOCK.UPDATE which doesn't exist on the instance.
 */
const ensureLeaveBalance = async (employeeId, year, transaction) => {
  let balance = await LeaveBalance.findOne({
    where: { employeeId, year },
    transaction,
    lock: Transaction.LOCK.UPDATE,
  });

  if (!balance) {
    balance = await LeaveBalance.create(
      {
        employeeId,
        totalAnnual: env.DEFAULT_ANNUAL_LEAVE,
        used: 0,
        remaining: env.DEFAULT_ANNUAL_LEAVE,
        year,
      },
      { transaction },
    );
  }

  return balance;
};

const bustLeaveCacheKeys = (employeeId, managerId, year) =>
  clearCacheKeys([
    `dashboard_summary:${employeeId}:${year}`,
    `dashboard_summary:${managerId}:${year}`,
    `leave_balance:${employeeId}:${year}`,
  ]).catch((err) => logger.error({ event: 'CACHE_BUST_FAILED', error: err.message }));

// ---------------------------------------------------------------------------
// applyForLeave
// ---------------------------------------------------------------------------

const applyForLeave = async ({ employeeId, startDate, endDate, reason, ipAddress, actor }) => {
  const perm = assertPermission(actor, 'APPLY_LEAVE');
  if (!perm.allowed) return fail(perm.message, 403);

  const validation = validate(applyLeaveSchema, { employeeId, startDate, endDate, reason });
  if (!validation.valid) return fail(validation.message);

  const empId = Number(employeeId);
  const start = new Date(startDate);
  const end = new Date(endDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    return fail('Cannot apply for past dates');
  }

  const daysRequested = calculateRequestedDays(start, end);
  if (daysRequested > MAX_LEAVE_DAYS) {
    return fail(`Leave cannot exceed ${MAX_LEAVE_DAYS} days`);
  }

  try {
    // FIX: only DB writes inside transaction — audit is outside
    const request = await sequelize.transaction(async (transaction) => {
      const employee = await User.findByPk(empId, { transaction });
      if (!employee) throw Object.assign(new Error('Employee not found'), { statusCode: 404 });
      if (!employee.managerId) throw Object.assign(new Error('Manager not assigned to this employee'), { statusCode: 422 });

      const manager = await User.findByPk(employee.managerId, { transaction });
      if (!manager) throw Object.assign(new Error('Assigned manager not found'), { statusCode: 422 });

      const overlapping = await LeaveRequest.findOne({
        where: {
          employeeId: empId,
          status: { [Op.ne]: LEAVE_STATUS.REJECTED },
          [Op.and]: [
            { startDate: { [Op.lte]: end } },
            { endDate: { [Op.gte]: start } },
          ],
        },
        transaction,
      });

      if (overlapping) {
        throw Object.assign(new Error('A leave request already exists for the selected dates'), { statusCode: 409 });
      }

      return await LeaveRequest.create(
        {
          employeeId: empId,
          managerId: employee.managerId,
          startDate: start,
          endDate: end,
          reason,
          daysRequested,
          status: LEAVE_STATUS.PENDING,
        },
        { transaction },
      );
    });

    // FIX: audit OUTSIDE transaction — log failure never rolls back the leave
    try {
      await logAuditEvent({
        userId: empId, moduleName: 'Leave', actionType: 'CREATE',
        oldData: null, newData: request, ipAddress,
      });
    } catch (auditErr) {
      logger.error({ event: 'AUDIT_LOG_FAILED', error: auditErr.message });
    }

    eventBus.emit('LEAVE_APPLIED', { request, employeeId: empId });

    return { success: true, message: 'Leave applied successfully', statusCode: 201, data: request };

  } catch (error) {
    logger.error({ event: 'APPLY_LEAVE_FAILED', employeeId, error: error.message, stack: error.stack });
    return fail(error.message || 'Failed to apply for leave', error.statusCode || 500);
  }
};

// ---------------------------------------------------------------------------
// managerDecision
// ---------------------------------------------------------------------------

const managerDecision = async ({ managerId, role, requestId, status, decisionNote, ipAddress, actor }) => {
  const perm = assertPermission(actor, 'REVIEW_LEAVE');
  if (!perm.allowed) return fail(perm.message, 403);

  const validation = validate(managerDecisionSchema, { managerId, requestId, status, decisionNote });
  if (!validation.valid) return fail(validation.message);

  try {
    let oldLeaveData;

    // FIX: only DB writes inside transaction
    const leaveRequest = await sequelize.transaction(async (transaction) => {
      const req = await LeaveRequest.findByPk(requestId, {
        transaction,
        lock: Transaction.LOCK.UPDATE,
      });

      if (!req) throw Object.assign(new Error('Leave request not found'), { statusCode: 404 });
      if (req.status !== LEAVE_STATUS.PENDING) {
        throw Object.assign(new Error('Leave request has already been processed'), { statusCode: 409 });
      }

      const employee = await User.findByPk(req.employeeId, { transaction });

      if (Number(employee.managerId) !== Number(managerId) && !['Admin', 'HR'].includes(role)) {
        throw Object.assign(new Error('Not authorized to review this leave request'), { statusCode: 403 });
      }

      oldLeaveData = { status: req.status, decisionNote: req.decisionNote };

      await req.update({ status, decisionNote: decisionNote || null }, { transaction });

      if (status === LEAVE_STATUS.APPROVED) {
        const year = new Date(req.startDate).getFullYear();
        const balance = await ensureLeaveBalance(req.employeeId, year, transaction);

        if (balance.remaining < req.daysRequested) {
          throw Object.assign(new Error('Insufficient leave balance'), { statusCode: 422 });
        }

        // FIX: race condition — single atomic update with WHERE condition
        // instead of fetch-check-update in separate steps
        const [affected] = await LeaveBalance.update(
          {
            used: sequelize.literal(`used + ${req.daysRequested}`),
            remaining: sequelize.literal(`remaining - ${req.daysRequested}`),
          },
          {
            where: {
              employeeId: req.employeeId,
              year,
              remaining: { [Op.gte]: req.daysRequested },
            },
            transaction,
          },
        );

        if (!affected) {
          throw Object.assign(new Error('Insufficient leave balance'), { statusCode: 422 });
        }
      }

      return req;
    });

    const year = new Date(leaveRequest.startDate).getFullYear();

    // FIX: audit + cache bust OUTSIDE transaction
    try {
      await logAuditEvent({
        userId: managerId, moduleName: 'Leave',
        actionType: status === LEAVE_STATUS.APPROVED ? 'APPROVE' : 'REJECT',
        oldData: oldLeaveData, newData: { status, decisionNote }, ipAddress,
      });
    } catch (auditErr) {
      logger.error({ event: 'AUDIT_LOG_FAILED', error: auditErr.message });
    }

    bustLeaveCacheKeys(leaveRequest.employeeId, managerId, year);

    eventBus.emit('LEAVE_DECISION', { leaveRequest, managerId, status });

    return {
      success: true,
      message: `Leave ${status.toLowerCase()} successfully`,
      statusCode: 200,
      data: leaveRequest,
    };

  } catch (error) {
    logger.error({ event: 'MANAGER_DECISION_FAILED', managerId, requestId, error: error.message, stack: error.stack });
    return fail(error.message || 'Failed to process leave decision', error.statusCode || 500);
  }
};

// ---------------------------------------------------------------------------
// List functions
// ---------------------------------------------------------------------------

const listMyLeaves = async ({ employeeId, cursor, limit, actor }) => {
  const perm = assertPermission(actor, 'VIEW_MY_LEAVES');
  if (!perm.allowed) return fail(perm.message, 403);

  if (!employeeId) return fail('employeeId is required');

  try {
    const rows = await leaveRepository.listEmployeeLeavesWithCursor({ employeeId, cursor, limit });
    return {
      success: true,
      statusCode: 200,
      data: cursorPaginate({ rows, limit, cursorKey: 'id' }),
    };
  } catch (error) {
    logger.error({ event: 'LIST_MY_LEAVES_FAILED', employeeId, error: error.message });
    return fail(error.message || 'Failed to fetch leaves', 500);
  }
};

const listPendingLeavesForManager = async (managerId, actor) => {
  const perm = assertPermission(actor, 'REVIEW_LEAVE');
  if (!perm.allowed) return fail(perm.message, 403);

  if (!managerId) return fail('managerId is required');

  try {
    const data = await leaveRepository.listPendingManagerLeaves(managerId);
    return { success: true, statusCode: 200, count: data.length, data };
  } catch (error) {
    logger.error({ event: 'LIST_PENDING_LEAVES_FAILED', managerId, error: error.message });
    return fail(error.message || 'Failed to fetch pending leaves', 500);
  }
};

// ---------------------------------------------------------------------------
// Leave balance
// ---------------------------------------------------------------------------

const getMyLeaveBalance = async (employeeId, actor) => {
  const perm = assertPermission(actor, 'VIEW_MY_LEAVES');
  if (!perm.allowed) return fail(perm.message, 403);

  if (!employeeId) return fail('employeeId is required');

  try {
    const year = new Date().getFullYear();

    const balance = await LeaveBalance.findOne({ where: { employeeId, year } });

    const leaves = await LeaveRequest.findAll({
      where: {
        employeeId,
        createdAt: {
          [Op.gte]: new Date(`${year}-01-01`),
          [Op.lte]: new Date(`${year}-12-31`),
        },
      },
      order: [['createdAt', 'DESC']],
    });

    // FIX: was throwing instead of returning a response object
    return {
      success: true,
      statusCode: 200,
      data: {
        ...(balance?.toJSON() ?? {
          totalAnnual: env.DEFAULT_ANNUAL_LEAVE,
          used: 0,
          remaining: env.DEFAULT_ANNUAL_LEAVE,
          year,
        }),
        leaves,
      },
    };

  } catch (error) {
    logger.error({ event: 'GET_LEAVE_BALANCE_FAILED', employeeId, error: error.message });
    return fail(error.message || 'Failed to fetch leave balance', 500);
  }
};

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

const getDashboardSummary = async ({ userId, year, actor }) => {
  const perm = assertPermission(actor, 'VIEW_MY_LEAVES');
  if (!perm.allowed) return fail(perm.message, 403);

  if (!userId) return fail('userId is required');

  try {
    const selectedYear = Number(year) || new Date().getFullYear();

    const [leaveBalance, recentLeaves] = await Promise.all([
      LeaveBalance.findOne({ where: { employeeId: userId, year: selectedYear } }),
      LeaveRequest.findAll({
        where: { employeeId: userId },
        limit: 5,
        order: [['createdAt', 'DESC']],
      }),
    ]);

    // FIX: was returning raw data with no success wrapper and no error handling
    return {
      success: true,
      statusCode: 200,
      data: { leaveBalance, recentLeaves },
    };

  } catch (error) {
    logger.error({ event: 'GET_DASHBOARD_FAILED', userId, error: error.message });
    return fail(error.message || 'Failed to fetch dashboard summary', 500);
  }
};

// ---------------------------------------------------------------------------
// Yearly reset
// ---------------------------------------------------------------------------

const yearlyLeaveReset = async (year, actor) => {
  const perm = assertPermission(actor, 'RESET_LEAVE_BALANCES');
  if (!perm.allowed) return fail(perm.message, 403);

  const parsedYear = Number(year);
  if (!parsedYear || parsedYear < 2000 || parsedYear > 2100) {
    return fail('A valid year between 2000 and 2100 is required');
  }

  try {
    await sequelize.transaction(async (transaction) => {
      await LeaveBalance.update(
        {
          totalAnnual: env.DEFAULT_ANNUAL_LEAVE,
          used: 0,
          remaining: env.DEFAULT_ANNUAL_LEAVE,
          year: parsedYear,
        },
        // FIX: was using `where: {}` which updates EVERY row for any year
        // Now scoped to just the target year
        { where: { year: parsedYear }, transaction },
      );
    });

    logger.info({ event: 'YEARLY_LEAVE_RESET', year: parsedYear, actorId: actor?.id });

    eventBus.emit('LEAVE_BALANCES_RESET', { year: parsedYear, actorId: actor?.id });

    return { success: true, message: `Leave balances reset for ${parsedYear}`, statusCode: 200 };

  } catch (error) {
    logger.error({ event: 'YEARLY_LEAVE_RESET_FAILED', year: parsedYear, error: error.message });
    return fail(error.message || 'Failed to reset leave balances', 500);
  }
};

// ---------------------------------------------------------------------------
// Internal helpers (used by other services / controllers)
// ---------------------------------------------------------------------------

const getHRTeamIds = async () => {
  try {
    // FIX: use Roles association — same pattern as the rest of the codebase
    const hrUsers = await User.findAll({
      include: [{
        association: 'Roles',
        where: { name: 'HR' },
        attributes: [],
      }],
      attributes: ['id'],
    });
    return hrUsers.map((u) => u.id);
  } catch (error) {
    logger.error({ event: 'GET_HR_TEAM_IDS_FAILED', error: error.message });
    return [];
  }
};

const getTeamMembers = async (managerId) => {
  try {
    const users = await User.findAll({
      where: { managerId },
      attributes: ['id'],
    });
    return users.map((u) => u.id);
  } catch (error) {
    logger.error({ event: 'GET_TEAM_MEMBERS_FAILED', managerId, error: error.message });
    return [];
  }
};

// ---------------------------------------------------------------------------

module.exports = {
  applyForLeave,
  managerDecision,
  listMyLeaves,
  listPendingLeavesForManager,
  getMyLeaveBalance,
  getDashboardSummary,
  yearlyLeaveReset,
  getHRTeamIds,
  getTeamMembers,
};