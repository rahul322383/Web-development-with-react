'use strict';

const { Transaction } = require('sequelize');
const sequelize = require('../../database/sequelize');
const env = require('../../config/env');
const leaveRepository = require('./leaveRepository');
const { cursorPaginate } = require('../../utils/pagination');
const { logAuditEvent } = require('../../utils/auditLogger');
const { clearCacheKeys } = require('../../utils/cache');
const { LeaveRequest, LeaveBalance, User, Role } = require('../../database/initModels');
const { Op } = require('sequelize');
const eventBus = require('../../utils/Eventbus');
const { assertPermission } = require('../../utils/permissions');
const { applyLeaveSchema, managerDecisionSchema } = require('./leaveValidation');

const LEAVE_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const LEAVE_TYPE = {
  SICK: 'SICK',
  CASUAL: 'CASUAL',
  PAID: 'PAID',
  UNPAID: 'UNPAID',
};

const LEAVE_UNIT = {
  FULL_DAY: 'FULL_DAY',
  HALF_DAY: 'HALF_DAY',
};

const DEFAULT_QUOTAS = {
  SICK: 7,
  CASUAL: 7,
  PAID: 14,
  UNPAID: Infinity,
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

const calculateWorkingDays = (startDate, endDate, leaveUnit = LEAVE_UNIT.FULL_DAY, publicHolidays = []) => {
  const holidaySet = new Set(publicHolidays);
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (leaveUnit === LEAVE_UNIT.HALF_DAY) return 0.5;

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    const dateString = current.toISOString().split('T')[0];
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidaySet.has(dateString);
    if (!isWeekend && !isHoliday) count++;
    current.setDate(current.getDate() + 1);
  }

  return count;
};

const getBalanceFields = (leaveType) => {
  const map = {
    SICK: { total: 'sickTotal', used: 'sickUsed', remaining: 'sickRemaining' },
    CASUAL: { total: 'casualTotal', used: 'casualUsed', remaining: 'casualRemaining' },
    PAID: { total: 'paidTotal', used: 'paidUsed', remaining: 'paidRemaining' },
    UNPAID: null,
  };
  return map[leaveType] || null;
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
        totalAnnual: env.DEFAULT_ANNUAL_LEAVE || 21,
        used: 0,
        remaining: env.DEFAULT_ANNUAL_LEAVE || 21,
        year,
        sickTotal: DEFAULT_QUOTAS.SICK,
        sickUsed: 0,
        sickRemaining: DEFAULT_QUOTAS.SICK,
        casualTotal: DEFAULT_QUOTAS.CASUAL,
        casualUsed: 0,
        casualRemaining: DEFAULT_QUOTAS.CASUAL,
        paidTotal: DEFAULT_QUOTAS.PAID,
        paidUsed: 0,
        paidRemaining: DEFAULT_QUOTAS.PAID,
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
  ]).catch(() => { });

const getHRTeamIds = async () => {
  try {
    const hrUsers = await User.findAll({
      include: [{ model: Role, as: 'role', where: { name: 'HR' }, attributes: [] }],
      attributes: ['id'],
    });
    return hrUsers.map((u) => u.id);
  } catch (error) {
    return [];
  }
};

const getTeamMembers = async (managerId) => {
  try {
    const users = await User.findAll({ where: { managerId }, attributes: ['id'] });
    return users.map((u) => u.id);
  } catch (error) {
    return [];
  }
};

const applyForLeave = async ({
  employeeId,
  companyId,
  startDate,
  endDate,
  reason,
  leaveType = LEAVE_TYPE.CASUAL,
  leaveUnit = LEAVE_UNIT.FULL_DAY,
  publicHolidays = [],
  ipAddress,
  actor,
}) => {
  const denied = checkPermission(actor, 'APPLY_LEAVE');
  if (denied) return denied;

  if (!Object.values(LEAVE_TYPE).includes(leaveType)) {
    return fail(`Invalid leave type. Must be one of: ${Object.values(LEAVE_TYPE).join(', ')}`);
  }
  if (!Object.values(LEAVE_UNIT).includes(leaveUnit)) {
    return fail('Invalid leave unit. Must be FULL_DAY or HALF_DAY');
  }

  const empId = Number(employeeId);
  const start = new Date(startDate);
  const end = new Date(endDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) return fail('Cannot apply for past dates');

  const daysRequested = calculateWorkingDays(start, end, leaveUnit, publicHolidays);

  if (daysRequested === 0) return fail('Selected dates fall entirely on weekends or holidays');
  if (daysRequested > MAX_LEAVE_DAYS) return fail(`Leave cannot exceed ${MAX_LEAVE_DAYS} working days`);

  try {
    let employeeData, managerData;

    const request = await sequelize.transaction(async (transaction) => {
      const employee = await User.findByPk(empId, { transaction });
      if (!employee) throw Object.assign(new Error('Employee not found'), { statusCode: 404 });
      if (!employee.managerId) throw Object.assign(new Error('Manager not assigned to this employee'), { statusCode: 422 });

      const manager = await User.findByPk(employee.managerId, { transaction });
      if (!manager) throw Object.assign(new Error('Assigned manager not found'), { statusCode: 422 });

      employeeData = employee;
      managerData = manager;

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
        throw Object.assign(
          new Error('A leave request already exists for the selected dates'),
          { statusCode: 409 }
        );
      }

      if (leaveType !== LEAVE_TYPE.UNPAID) {
        const fields = getBalanceFields(leaveType);
        const balance = await ensureLeaveBalance(empId, start.getFullYear(), transaction);

        if (balance[fields.remaining] < daysRequested) {
          throw Object.assign(
            new Error(
              `Insufficient ${leaveType.toLowerCase()} leave balance. ` +
              `Available: ${balance[fields.remaining]}, Requested: ${daysRequested}`
            ),
            { statusCode: 422 }
          );
        }
      }

      return LeaveRequest.create(
        {
          companyId: companyId || employee.companyId || 0,
          employeeId: empId,
          managerId: employee.managerId,
          startDate: start,
          endDate: end,
          reason,
          leaveType,
          leaveUnit,
          daysRequested,
          status: LEAVE_STATUS.PENDING,
        },
        { transaction }
      );
    });

    try {
      await logAuditEvent({
        userId: empId,
        moduleName: 'Leave',
        actionType: 'CREATE',
        oldData: null,
        newData: request,
        ipAddress,
      });
    } catch (auditErr) {
      // silent
    }

    eventBus.emit('LEAVE_REQUESTED', {
      leaveRequest: request,
      employee: { id: employeeData.id, firstName: employeeData.firstName, lastName: employeeData.lastName },
      manager: { id: managerData.id, firstName: managerData.firstName, lastName: managerData.lastName },
    });

    return {
      success: true,
      message: 'Leave request submitted',
      statusCode: 201,
      nextStep: 'Pending manager approval',
      data: {
        ...request.toJSON(),
        daysRequested,
        leaveType,
        leaveUnit,
      },
    };

  } catch (error) {
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
  const allowedRoles = ['Manager', 'Admin', 'HR'];
  if (!allowedRoles.includes(role)) {
    return fail('Only Manager, Admin or HR can approve/reject leave requests', 403);
  }

  const denied = checkPermission(actor, 'REVIEW_LEAVE');
  if (denied) return denied;

  const normalizedStatus = status.toLowerCase();
  const storedStatus =
    normalizedStatus === 'approved' ? LEAVE_STATUS.APPROVED : LEAVE_STATUS.REJECTED;

  try {
    let oldLeaveData;
    let affectedEmployee;

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
      if (!employee) throw Object.assign(new Error('Employee not found'), { statusCode: 404 });

      affectedEmployee = employee;

      if (Number(employee.managerId) !== Number(managerId) && !['Admin', 'HR'].includes(role)) {
        throw Object.assign(new Error('Not authorised to review this leave request'), { statusCode: 403 });
      }

      oldLeaveData = { status: req.status, decisionNote: req.decisionNote };

      if (normalizedStatus === 'approved') {
        const year = new Date(req.startDate).getFullYear();
        const fields = getBalanceFields(req.leaveType);

        if (fields) {
          await ensureLeaveBalance(req.employeeId, year, transaction);

          const balance = await LeaveBalance.findOne({
            where: { employeeId: req.employeeId, year },
            transaction,
            lock: Transaction.LOCK.UPDATE,
          });

          if (!balance) throw Object.assign(new Error('Leave balance record not found'), { statusCode: 404 });

          if (balance[fields.remaining] < req.daysRequested) {
            throw Object.assign(
              new Error(
                `Insufficient ${req.leaveType.toLowerCase()} leave balance. ` +
                `Available: ${balance[fields.remaining]}, Requested: ${req.daysRequested}`
              ),
              { statusCode: 422 }
            );
          }

          await balance.update(
            {
              [fields.used]: balance[fields.used] + Number(req.daysRequested),
              [fields.remaining]: balance[fields.remaining] - Number(req.daysRequested),
              used: balance.used + Number(req.daysRequested),
              remaining: balance.remaining - Number(req.daysRequested),
            },
            { transaction }
          );
        }
      }

      await req.update(
        { status: storedStatus, decisionNote: decisionNote || null },
        { transaction }
      );

      return req;
    });

    const year = new Date(leaveRequest.startDate).getFullYear();

    try {
      await logAuditEvent({
        userId: managerId,
        moduleName: 'Leave',
        actionType: normalizedStatus === 'approved' ? 'APPROVE' : 'REJECT',
        oldData: oldLeaveData,
        newData: { status: storedStatus, decisionNote, leaveType: leaveRequest.leaveType },
        ipAddress,
      });
    } catch (auditErr) {
      // silent
    }

    bustLeaveCacheKeys(leaveRequest.employeeId, managerId, year);

    eventBus.emit('LEAVE_DECISION', {
      leaveRequest,
      managerId,
      status: storedStatus,
      decisionNote,
      employee: affectedEmployee,
    });

    return {
      success: true,
      message: `Leave ${normalizedStatus} successfully`,
      statusCode: 200,
      data: leaveRequest,
    };

  } catch (error) {
    return fail(error.message || 'Failed to process leave decision', error.statusCode || 500);
  }
};

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
      if (Number(req.employeeId) !== Number(employeeId)) {
        throw Object.assign(new Error('Not authorised to cancel this leave'), { statusCode: 403 });
      }
      if (req.status !== LEAVE_STATUS.PENDING) {
        throw Object.assign(new Error('Only pending leaves can be cancelled'), { statusCode: 409 });
      }

      await req.update({ status: LEAVE_STATUS.REJECTED }, { transaction });
      return req;
    });

    eventBus.emit('LEAVE_CANCELLED', { leaveRequest, employeeId });

    return {
      success: true,
      message: 'Leave cancelled successfully',
      statusCode: 200,
      data: leaveRequest,
    };

  } catch (error) {
    return fail(error.message || 'Failed to cancel leave', error.statusCode || 500);
  }
};

const listMyLeaves = async ({ employeeId, cursor, limit, actor }) => {
  const denied = checkPermission(actor, 'VIEW_LEAVE');
  if (denied) return denied;

  if (!employeeId) return fail('employeeId is required');

  try {
    const rows = await leaveRepository.listEmployeeLeavesWithCursor({ employeeId, cursor, limit });
    return { success: true, statusCode: 200, data: cursorPaginate({ rows, limit, cursorKey: 'id' }) };
  } catch (error) {
    return fail(error.message || 'Failed to fetch leaves', 500);
  }
};

const listPendingLeaves = async ({
  actor,
  limit = 10,
  page = 1,
}) => {

  const denied =
    checkPermission(actor, 'VIEW_LEAVE');

  if (denied) return denied;

  page = Math.max(Number(page) || 1, 1);
  limit = Math.min(
    Math.max(Number(limit) || 10, 1),
    100
  );

  const offset = (page - 1) * limit;

  try {

    // =========================
    // PENDING LEAVES
    // =========================

    const pendingWhere = {
      status: 'Pending',
    };

    if (actor.primaryRole === 'Manager') {
      pendingWhere.managerId = actor.id;
    }

    const pendingResult =
      await leaveRepository.listPendingLeaves(
        pendingWhere,
        {
          limit,
          offset,
        }
      );

    // =========================
    // RECENTLY APPROVED LEAVES
    // =========================

    const approvedWhere = {
      status: 'Approved',
    };

    if (actor.primaryRole === 'Manager') {
      approvedWhere.managerId = actor.id;
    }

    const recentApproved =
      await leaveRepository.listLeaves(
        approvedWhere,
        {
          limit: 5,
          offset: 0,
          order: [['updatedAt', 'DESC']],
        }
      );

    // =========================
    // RESPONSE
    // =========================

    return {

      success: true,

      statusCode: 200,

      data: {

        pending: pendingResult.rows,

        recentApproved:
          recentApproved.rows,
      },

      meta: {

        pendingCount:
          pendingResult.count,

        currentPage: page,

        limit,
      },
    };

  } catch (error) {

    
    return fail(
      error.message ||
      'Failed to fetch leaves',
      500
    );
  }
};

const listTeamLeaves = async ({ managerId, actor, status, limit = 20, page = 1 }) => {
  const offset = (page - 1) * limit;

  try {
    const result = await leaveRepository.listTeamLeaves({ managerId, actor, status, limit, offset });
    const data = Array.isArray(result?.rows) ? result.rows : [];
    const total = result?.count || 0;

    const grouped = {
      pending: data.filter(l => l.status === 'Pending'),
      approved: data.filter(l => l.status === 'Approved'),
      rejected: data.filter(l => l.status === 'Rejected'),
    };

    return {
      success: true,
      statusCode: 200,
      data: {
        summary: {
          total,
          pending: grouped.pending.length,
          approved: grouped.approved.length,
          rejected: grouped.rejected.length,
        },
        pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
        grouped,
        list: data,
      },
    };
  } catch (error) {
    return fail(error.message || 'Failed to fetch team leaves', 500);
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
    return fail(error.message || 'Failed to fetch leave request', 500);
  }
};

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
          createdAt: { [Op.between]: [new Date(`${year}-01-01`), new Date(`${year}-12-31`)] },
        },
        order: [['createdAt', 'DESC']],
      }),
    ]);

    const base = balance?.toJSON() ?? {
      totalAnnual: env.DEFAULT_ANNUAL_LEAVE || 21,
      used: 0,
      remaining: env.DEFAULT_ANNUAL_LEAVE || 21,
      sickTotal: DEFAULT_QUOTAS.SICK,
      sickUsed: 0,
      sickRemaining: DEFAULT_QUOTAS.SICK,
      casualTotal: DEFAULT_QUOTAS.CASUAL,
      casualUsed: 0,
      casualRemaining: DEFAULT_QUOTAS.CASUAL,
      paidTotal: DEFAULT_QUOTAS.PAID,
      paidUsed: 0,
      paidRemaining: DEFAULT_QUOTAS.PAID,
      year,
    };

    return {
      success: true,
      statusCode: 200,
      data: {
        ...base,
        breakdown: {
          sick: { total: base.sickTotal, used: base.sickUsed, remaining: base.sickRemaining },
          casual: { total: base.casualTotal, used: base.casualUsed, remaining: base.casualRemaining },
          paid: { total: base.paidTotal, used: base.paidUsed, remaining: base.paidRemaining },
          unpaid: { total: null, used: null, remaining: null },
        },
        leaves,
      },
    };
  } catch (error) {
    return fail(error.message || 'Failed to fetch leave balance', 500);
  }
};

const getDashboardSummary = async ({ userId, year, actor }) => {
  const denied = checkPermission(actor, 'VIEW_LEAVE');
  if (denied) return denied;
  if (!userId) return fail('userId is required');

  try {
    const selectedYear = Number(year) || new Date().getFullYear();
    const [leaveBalance, recentLeaves] = await Promise.all([
      LeaveBalance.findOne({ where: { employeeId: userId, year: selectedYear } }),
      LeaveRequest.findAll({ where: { employeeId: userId }, limit: 5, order: [['createdAt', 'DESC']] }),
    ]);
    return { success: true, statusCode: 200, data: { leaveBalance, recentLeaves } };
  } catch (error) {
    return fail(error.message || 'Failed to fetch dashboard summary', 500);
  }
};

const getLeaveStats = async ({ year, actor }) => {
  const denied = checkPermission(actor, 'VIEW_LEAVE');
  if (denied) return denied;

  try {
    const where = {};
    if (year) {
      where.createdAt = { [Op.between]: [new Date(`${year}-01-01`), new Date(`${year}-12-31`)] };
    }
    const [total, approved, pending, rejected] = await Promise.all([
      LeaveRequest.count({ where }),
      LeaveRequest.count({ where: { ...where, status: 'Approved' } }),
      LeaveRequest.count({ where: { ...where, status: 'Pending' } }),
      LeaveRequest.count({ where: { ...where, status: 'Rejected' } }),
    ]);
    return { success: true, statusCode: 200, data: { total, approved, pending, rejected } };
  } catch (error) {
    return fail(error.message || 'Failed to fetch leave stats', 500);
  }
};

const yearlyLeaveReset = async (year, actor) => {
  const denied = checkPermission(actor, 'APPROVE_LEAVE');
  if (denied) return denied;

  const parsedYear = Number(year);
  if (!parsedYear || parsedYear < 2000 || parsedYear > 2100) {
    return fail('A valid year between 2000 and 2100 is required');
  }

  const MAX_CARRY_FORWARD = 5;

  try {
    await sequelize.transaction(async (transaction) => {
      const currentBalances = await LeaveBalance.findAll({
        where: { year: parsedYear - 1 },
        transaction,
      });

      for (const prev of currentBalances) {
        const carryForward = Math.min(prev.remaining || 0, MAX_CARRY_FORWARD);
        const newPaidTotal = DEFAULT_QUOTAS.PAID + carryForward;

        await LeaveBalance.upsert(
          {
            employeeId: prev.employeeId,
            year: parsedYear,
            totalAnnual: env.DEFAULT_ANNUAL_LEAVE || 21,
            used: 0,
            remaining: (env.DEFAULT_ANNUAL_LEAVE || 21) + carryForward,
            sickTotal: DEFAULT_QUOTAS.SICK,
            sickUsed: 0,
            sickRemaining: DEFAULT_QUOTAS.SICK,
            casualTotal: DEFAULT_QUOTAS.CASUAL,
            casualUsed: 0,
            casualRemaining: DEFAULT_QUOTAS.CASUAL,
            paidTotal: newPaidTotal,
            paidUsed: 0,
            paidRemaining: newPaidTotal,
          },
          { transaction }
        );
      }
    });

    eventBus.emit('LEAVE_BALANCES_RESET', { year: parsedYear, actorId: actor?.id });

    return {
      success: true,
      message: `Leave balances reset for ${parsedYear} with carry-forward applied`,
      statusCode: 200,
    };
  } catch (error) {
    return fail(error.message || 'Failed to reset leave balances', 500);
  }
};

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
  calculateWorkingDays,
};