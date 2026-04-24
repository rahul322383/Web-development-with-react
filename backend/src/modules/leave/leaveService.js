

'use strict';

const { Transaction } = require('sequelize');
const sequelize = require('../../database/sequelize');
const env = require('../../config/env');
const leaveRepository = require('./leaveRepository');
const { cursorPaginate } = require('../../utils/pagination');
const { logAuditEvent } = require('../../utils/auditLogger');
const { clearCacheKeys } = require('../../utils/cache');
const { LeaveRequest, LeaveBalance, User,Role } = require('../../database/initModels');
const { Op } = require('sequelize');
const logger = require('../../config/logger');
const eventBus = require('../../utils/Eventbus');  
const { assertPermission } = require('../../utils/permissions');
const {
  applyLeaveSchema,
  managerDecisionSchema,
  validate,
} = require('./leaveValidation');


const LEAVE_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const MAX_LEAVE_DAYS = 30;


const fail = (message, statusCode = 400, data = null) => ({
  success: false, message, statusCode, data,
});

const checkPermission = (actor, permission) => {
  const perm = assertPermission(actor, permission);
  const granted = perm.success ?? perm.allowed ?? false;
  if (!granted) return fail(perm.message || 'Forbidden', perm.statusCode || 403);
  return null;
};

const calculateRequestedDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

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


const applyForLeave = async ({ employeeId, startDate, endDate, reason, ipAddress, actor }) => {
  const denied = checkPermission(actor, 'APPLY_LEAVE');
  if (denied) return denied;

  const validation = validate(applyLeaveSchema, { employeeId, startDate, endDate, reason });
  if (!validation.valid) return fail(validation.message);

  const empId = Number(employeeId);
  const start = new Date(startDate);
  const end = new Date(endDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) return fail('Cannot apply for past dates');

  const daysRequested = calculateRequestedDays(start, end);
  if (daysRequested > MAX_LEAVE_DAYS) return fail(`Leave cannot exceed ${MAX_LEAVE_DAYS} days`);

  try {
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

      if (overlapping) throw Object.assign(new Error('A leave request already exists for the selected dates'), { statusCode: 409 });

      return LeaveRequest.create(
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


const managerDecision = async ({
  managerId,
  role,
  requestId,
  status,
  decisionNote,
  ipAddress,
  actor,
}) => {

  // 🔐 HARD SECURITY GATE
  const allowedRoles = ['Manager', 'Admin'];

  if (!allowedRoles.includes(role)) {
    return {
      success: false,
      statusCode: 403,
      message: 'Only Manager or Admin can approve/reject leave requests',
    };
  }

  const denied = checkPermission(actor, 'REVIEW_LEAVE');
  if (denied) return denied;

  try {
    let oldLeaveData;

    const leaveRequest = await sequelize.transaction(async (transaction) => {

      // 🔒 Lock leave request
      const req = await LeaveRequest.findByPk(requestId, {
        transaction,
        lock: Transaction.LOCK.UPDATE,
      });

      if (!req) {
        throw Object.assign(new Error('Leave request not found'), { statusCode: 404 });
      }

      if (req.status !== LEAVE_STATUS.PENDING) {
        throw Object.assign(new Error('Leave request has already been processed'), { statusCode: 409 });
      }

      // 👤 Get employee
      const employee = await User.findByPk(req.employeeId, { transaction });

      if (!employee) {
        throw Object.assign(new Error('Employee not found'), { statusCode: 404 });
      }

      // 🔐 Authorization check
      if (Number(employee.managerId) !== Number(managerId) && !['Admin', 'HR'].includes(role)) {
        throw Object.assign(new Error('Not authorized to review this leave request'), { statusCode: 403 });
      }

      oldLeaveData = {
        status: req.status,
        decisionNote: req.decisionNote,
      };

      // 🧠 Normalize status
      const normalizedStatus = status.toLowerCase();

      // ✅ Handle APPROVAL
      if (normalizedStatus === LEAVE_STATUS.APPROVED.toLowerCase()) {

        const year = new Date(req.startDate).getFullYear();

        // Ensure balance row exists
        await ensureLeaveBalance(req.employeeId, year, transaction);

        // 🔒 Lock balance row
        const balance = await LeaveBalance.findOne({
          where: {
            employeeId: req.employeeId,
            year,
          },
          transaction,
          lock: Transaction.LOCK.UPDATE,
        });

        if (!balance) {
          throw Object.assign(new Error('Leave balance record not found'), { statusCode: 404 });
        }

        // ❌ Insufficient balance
        if (balance.remaining < req.daysRequested) {
          throw Object.assign(
            new Error(
              `Insufficient leave balance. Available: ${balance.remaining}, Requested: ${req.daysRequested}`
            ),
            { statusCode: 422 }
          );
        }

        // ✅ Update balance safely
        await balance.update(
          {
            used: balance.used + req.daysRequested,
            remaining: balance.remaining - req.daysRequested,
          },
          { transaction }
        );
      }

      // ✅ Finally update leave request
      await req.update(
        {
          status: normalizedStatus,
          decisionNote: decisionNote || null,
        },
        { transaction }
      );

      return req;
    });

    const year = new Date(leaveRequest.startDate).getFullYear();

    // 📝 Audit log (non-blocking)
    try {
      await logAuditEvent({
        userId: managerId,
        moduleName: 'Leave',
        actionType:
          status.toLowerCase() === LEAVE_STATUS.APPROVED.toLowerCase()
            ? 'APPROVE'
            : 'REJECT',
        oldData: oldLeaveData,
        newData: { status, decisionNote },
        ipAddress,
      });
    } catch (auditErr) {
      logger.error({ event: 'AUDIT_LOG_FAILED', error: auditErr.message });
    }

    // 🧹 Cache clear
    bustLeaveCacheKeys(leaveRequest.employeeId, managerId, year);

    // 📢 Event emit
    eventBus.emit('LEAVE_DECISION', { leaveRequest, managerId, status });

    return {
      success: true,
      message: `Leave ${status.toLowerCase()} successfully`,
      statusCode: 200,
      data: leaveRequest,
    };

  } catch (error) {
    logger.error({
      event: 'MANAGER_DECISION_FAILED',
      managerId,
      requestId,
      error: error.message,
      stack: error.stack,
    });

    return fail(
      error.message || 'Failed to process leave decision',
      error.statusCode || 500
    );
  }
};

// ---------------------------------------------------------------------------
// cancelLeave
// ---------------------------------------------------------------------------

const cancelLeave = async ({ requestId, employeeId, actor }) => {
  const denied = checkPermission(actor, 'APPLY_LEAVE');
  if (denied) return denied;

  if (!requestId) return fail('requestId is required');

  try {
    const leaveRequest = await sequelize.transaction(async (transaction) => {
      const req = await LeaveRequest.findByPk(requestId, {
        transaction,
        lock: Transaction.LOCK.UPDATE,
      });

      if (!req) throw Object.assign(new Error('Leave request not found'), { statusCode: 404 });
      if (Number(req.employeeId) !== Number(employeeId)) throw Object.assign(new Error('Not authorized to cancel this leave'), { statusCode: 403 });
      if (req.status !== LEAVE_STATUS.PENDING) throw Object.assign(new Error('Only pending leaves can be cancelled'), { statusCode: 409 });

      await req.update({ status: LEAVE_STATUS.REJECTED }, { transaction });
      return req;
    });

    eventBus.emit('LEAVE_CANCELLED', { leaveRequest, employeeId });

    return { success: true, message: 'Leave cancelled successfully', statusCode: 200, data: leaveRequest };

  } catch (error) {
    logger.error({ event: 'CANCEL_LEAVE_FAILED', requestId, employeeId, error: error.message });
    return fail(error.message || 'Failed to cancel leave', error.statusCode || 500);
  }
};

// ---------------------------------------------------------------------------
// List functions
// ---------------------------------------------------------------------------

const listMyLeaves = async ({ employeeId, cursor, limit, actor }) => {
  const denied = checkPermission(actor, 'VIEW_LEAVE');
  if (denied) return denied;

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

// const listPendingLeavesForManager = async (
//   managerId,
//   actor,
//   { limit = 10, page = 1 } = {}
// ) => {
//   const denied = checkPermission(actor, 'REVIEW_LEAVE');
//   if (denied) return denied;

//   if (!managerId) return fail('managerId is required');

//   const offset = (page - 1) * limit;

//   try {
//     const result = await leaveRepository.listPendingManagerLeaves(
//       managerId,
//       { limit, offset }
//     );
    

//     return {
//       success: true,
//       statusCode: 200,
//       count: result.count,
//       data: result.rows
//     };
//   } catch (error) {
//     logger.error({
//       event: 'LIST_PENDING_LEAVES_FAILED',
//       managerId,
//       error: error.message
//     });
//     return fail(error.message || 'Failed to fetch pending leaves', 500);
//   }
// };

const listPendingLeaves = async (
  { actor, limit = 10, page = 1 }
) => {
  const denied = checkPermission(actor, 'VIEW_LEAVE');
  if (denied) return denied;

  const offset = (page - 1) * limit;

  try {
    let where = { status: 'Pending' };

    // 🔥 ROLE LOGIC
    if (actor.primaryRole === 'Manager') {
      where.managerId = actor.id;
    }

    // Admin sees everything → no filter

    const result = await leaveRepository.listPendingLeaves(where, {
      limit,
      offset
    });

    return {
      success: true,
      statusCode: 200,
      data: result.rows,
      count: result.count
    };

  } catch (error) {
    logger.error({
      event: 'LIST_PENDING_LEAVES_FAILED',
      actor: actor.id,
      error: error.message
    });

    return {
      success: false,
      statusCode: 500,
      message: error.message || 'Failed to fetch pending leaves'
    };
  }
};


const listTeamLeaves = async ({
  managerId,
  status,
  limit = 20,
  page = 1
}) => {
  const offset = (page - 1) * limit;

  try {
    const result = await leaveRepository.listTeamLeaves({
      managerId,
      status,
      limit,
      offset
    });

    const data = result?.rows || [];
    const total = result?.count || 0;

    const safeData = Array.isArray(data) ? data : [];

    const grouped = {
      pending: safeData.filter(l => l.status === 'Pending'),
      approved: safeData.filter(l => l.status === 'Approved'),
      rejected: safeData.filter(l => l.status === 'Rejected')
    };

    return {
      success: true,
      statusCode: 200,
      data: {
        summary: {
          total,
          pending: grouped.pending.length,
          approved: grouped.approved.length,
          rejected: grouped.rejected.length
        },
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit)
        },
        grouped,
        list: safeData
      }
    };

  } catch (error) {
    logger.error({
      event: 'LIST_TEAM_LEAVES_FAILED',
      managerId,
      error: error.message
    });

    return {
      success: false,
      statusCode: 500,
      message: error.message || 'Failed to fetch team leaves',
      data: {
        summary: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        },
        pagination: {
          total: 0,
          page: Number(page),
          limit: Number(limit),
          totalPages: 0
        },
        grouped: {
          pending: [],
          approved: [],
          rejected: []
        },
        list: []
      }
    };
  }
};

const findLeaveRequestById = async (id, actor) => {
  const denied = checkPermission(actor, 'VIEW_LEAVE');
  if (denied) return denied;

  if (!id) return fail('id is required');

  try {
    const data = await leaveRepository.findLeaveRequestById(id);
    if (!data) return fail('Leave request not found', 404);
    return { success: true, statusCode: 200, data };
  } catch (error) {
    logger.error({ event: 'FIND_LEAVE_BY_ID_FAILED', id, error: error.message });
    return fail(error.message || 'Failed to fetch leave request', 500);
  }
};

// ---------------------------------------------------------------------------
// Leave balance
// ---------------------------------------------------------------------------

const getMyLeaveBalance = async (employeeId, actor) => {
  const denied = checkPermission(actor, 'VIEW_LEAVE');
  if (denied) return denied;

  if (!employeeId) return fail('employeeId is required');

  try {
    const year = new Date().getFullYear();

    const [balance, leaves] = await Promise.all([
      LeaveBalance.findOne({ where: { employeeId, year } }),
      LeaveRequest.findAll({
        where: {
          employeeId,
          createdAt: {
            [Op.gte]: new Date(`${year}-01-01`),
            [Op.lte]: new Date(`${year}-12-31`),
          },
        },
        order: [['createdAt', 'DESC']],
      }),
    ]);

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
// Dashboard & Stats
// ---------------------------------------------------------------------------

const getDashboardSummary = async ({ userId, year, actor }) => {
  const denied = checkPermission(actor, 'VIEW_LEAVE');
  if (denied) return denied;

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

    return { success: true, statusCode: 200, data: { leaveBalance, recentLeaves } };

  } catch (error) {
    logger.error({ event: 'GET_DASHBOARD_FAILED', userId, error: error.message });
    return fail(error.message || 'Failed to fetch dashboard summary', 500);
  }
};

const getLeaveStats = async ({ year, actor }) => {
  const denied = checkPermission(actor, 'VIEW_LEAVE');
  if (denied) return denied;

  try {
    const where = {};

    if (year) {
      where.createdAt = {
        [Op.between]: [
          new Date(`${year}-01-01`),
          new Date(`${year}-12-31`)
        ]
      };
    }

    const [total, approved, pending, rejected] = await Promise.all([
      LeaveRequest.findAll({ where }),
      LeaveRequest.findAll({ where: { ...where, status: 'Approved' } }),
      LeaveRequest.findAll({ where: { ...where, status: 'Pending' } }),
      LeaveRequest.findAll({ where: { ...where, status: 'Rejected' } }),
    ]);

    return {
      success: true,
      statusCode: 200,
      data: {
        total,
        approved,
        pending,
        rejected
      }
    };

  } catch (error) {
    logger.error({ event: 'GET_LEAVE_STATS_FAILED', error: error.message });
    return fail(error.message || 'Failed to fetch leave stats', 500);
  }
};

// ---------------------------------------------------------------------------
// Yearly reset
// ---------------------------------------------------------------------------

const yearlyLeaveReset = async (year, actor) => {
  const denied = checkPermission(actor, 'APPROVE_LEAVE');
  if (denied) return denied;

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
// Internal helpers
// ---------------------------------------------------------------------------

const getHRTeamIds = async () => {
  try {
    const hrUsers = await User.findAll({
      include: [{
        model: Role,
        as: 'role',        // FIX: singular
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
    const users = await User.findAll({ where: { managerId }, attributes: ['id'] });
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
  cancelLeave,
  listMyLeaves,
  listPendingLeaves,
  listTeamLeaves,
  findLeaveRequestById,
  getMyLeaveBalance,
  getDashboardSummary,
  getLeaveStats,
  yearlyLeaveReset,
  getHRTeamIds,
  getTeamMembers,
};