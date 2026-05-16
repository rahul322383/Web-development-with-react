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

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const LEAVE_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',   // FIX — was missing, caused cancelLeave to set 'Rejected'
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
const MAX_CARRY_FORWARD = 5;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const fail = (message, statusCode = 400, data = null) => ({
  success: false, message, statusCode, data,
});

const checkPermission = (actor, permission) => {
  const perm = assertPermission(actor, permission);
  const granted = perm.success ?? perm.allowed ?? false;
  if (!granted) return fail(perm.message || 'Forbidden', perm.statusCode || 403);
  return null;
};

/**
 * Count working days between two dates, excluding weekends and public holidays.
 * Half-day always returns 0.5 regardless of date range.
 */
const calculateWorkingDays = (startDate, endDate, leaveUnit = LEAVE_UNIT.FULL_DAY, publicHolidays = []) => {
  if (leaveUnit === LEAVE_UNIT.HALF_DAY) return 0.5;

  const holidaySet = new Set(publicHolidays);
  const current = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;

  while (current <= end) {
    const dow = current.getDay();
    const dateString = current.toISOString().split('T')[0];
    if (dow !== 0 && dow !== 6 && !holidaySet.has(dateString)) count++;
    current.setDate(current.getDate() + 1);
  }

  return count;
};

/**
 * Return the LeaveBalance field names for a given leaveType.
 * Returns null for UNPAID (no balance tracking).
 */
const getBalanceFields = (leaveType) => {
  const map = {
    SICK: { total: 'sickTotal', used: 'sickUsed', remaining: 'sickRemaining' },
    CASUAL: { total: 'casualTotal', used: 'casualUsed', remaining: 'casualRemaining' },
    PAID: { total: 'paidTotal', used: 'paidUsed', remaining: 'paidRemaining' },
    UNPAID: null,
  };
  return map[leaveType] ?? null;
};

/**
 * Find or create a LeaveBalance row with row-level lock for safe concurrent updates.
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
        year,
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
      },
      { transaction }
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
  } catch {
    return [];
  }
};

const getTeamMembers = async (managerId) => {
  try {
    const users = await User.findAll({ where: { managerId }, attributes: ['id'] });
    return users.map((u) => u.id);
  } catch {
    return [];
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// APPLY FOR LEAVE
// ─────────────────────────────────────────────────────────────────────────────

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
  if (end < start) return fail('End date cannot be before start date');

  const daysRequested = calculateWorkingDays(start, end, leaveUnit, publicHolidays);

  if (daysRequested === 0) return fail('Selected dates fall entirely on weekends or holidays');
  if (daysRequested > MAX_LEAVE_DAYS) return fail(`Leave cannot exceed ${MAX_LEAVE_DAYS} working days`);

  try {
    let employeeData, managerData;

    const request = await sequelize.transaction(async (transaction) => {
      const employee = await User.findByPk(empId, { transaction });
      if (!employee) throw Object.assign(new Error('Employee not found'), { statusCode: 404 });
      if (!employee.managerId) throw Object.assign(new Error('No manager assigned to employee'), { statusCode: 422 });

      const manager = await User.findByPk(employee.managerId, { transaction });
      if (!manager) throw Object.assign(new Error('Assigned manager not found'), { statusCode: 422 });

      employeeData = employee;
      managerData = manager;

      // Overlap check — ignore rejected/cancelled leaves
      const overlapping = await LeaveRequest.findOne({
        where: {
          employeeId: empId,
          status: { [Op.notIn]: [LEAVE_STATUS.REJECTED, LEAVE_STATUS.CANCELLED] },
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

      // Balance check
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

    // Audit — non-blocking
    logAuditEvent({
      userId: empId,
      moduleName: 'Leave',
      actionType: 'CREATE',
      oldData: null,
      newData: request,
      ipAddress,
    }).catch(() => { });

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
      data: { ...request.toJSON(), daysRequested, leaveType, leaveUnit },
    };

  } catch (error) {
    return fail(error.message || 'Failed to apply for leave', error.statusCode || 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MANAGER / ADMIN / HR DECISION (approve or reject)
// ─────────────────────────────────────────────────────────────────────────────

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
    return fail('Only Manager, Admin, or HR can approve/reject leave requests', 403);
  }

  const denied = checkPermission(actor, 'REVIEW_LEAVE');
  if (denied) return denied;

  // FIX — normalise decision to stored status
  const normalizedStatus = status?.toLowerCase();
  if (!['approved', 'rejected'].includes(normalizedStatus)) {
    return fail('Status must be "approved" or "rejected"');
  }
  const storedStatus = normalizedStatus === 'approved'
    ? LEAVE_STATUS.APPROVED
    : LEAVE_STATUS.REJECTED;

  try {
    let oldLeaveData, affectedEmployee;

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

      // FIX — managers may only decide on their own direct reports;
      // Admin and HR can decide on any request in the company
      const isOwnTeam = Number(employee.managerId) === Number(managerId);
      const isPrivileged = ['Admin', 'HR'].includes(role);

      if (!isOwnTeam && !isPrivileged) {
        throw Object.assign(
          new Error('Not authorised to review this leave request'),
          { statusCode: 403 }
        );
      }

      oldLeaveData = { status: req.status, decisionNote: req.decisionNote };

      // Deduct balance on approval
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

          if (!balance) {
            throw Object.assign(new Error('Leave balance record not found'), { statusCode: 404 });
          }

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

    logAuditEvent({
      userId: managerId,
      moduleName: 'Leave',
      actionType: normalizedStatus === 'approved' ? 'APPROVE' : 'REJECT',
      oldData: oldLeaveData,
      newData: { status: storedStatus, decisionNote, leaveType: leaveRequest.leaveType },
      ipAddress,
    }).catch(() => { });

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

// ─────────────────────────────────────────────────────────────────────────────
// CANCEL LEAVE  (employee cancels their own pending leave)
// ─────────────────────────────────────────────────────────────────────────────

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

      // FIX — was incorrectly setting REJECTED; correct status is CANCELLED
      await req.update({ status: LEAVE_STATUS.CANCELLED }, { transaction });
      return req;
    });

    logAuditEvent({
      userId: employeeId,
      moduleName: 'Leave',
      actionType: 'CANCEL',
      oldData: { status: LEAVE_STATUS.PENDING },
      newData: { status: LEAVE_STATUS.CANCELLED },
    }).catch(() => { });

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

// ─────────────────────────────────────────────────────────────────────────────
// LIST MY LEAVES  (cursor paginated, employee only)
// ─────────────────────────────────────────────────────────────────────────────

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
    return fail(error.message || 'Failed to fetch leaves', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// LIST PENDING LEAVES + RECENT APPROVED
//
// Role         Pending scope          RecentApproved scope
// ──────────── ──────────────────── ────────────────────────
// Admin / HR   company-wide          company-wide
// Manager      managerId = actor.id  managerId = actor.id
// Employee     employeeId = actor.id employeeId = actor.id
// ─────────────────────────────────────────────────────────────────────────────

const listPendingLeaves = async ({ actor, limit = 10, page = 1 }) => {
  const denied = checkPermission(actor, 'VIEW_LEAVE');
  if (denied) return denied;

  page = Math.max(Number(page) || 1, 1);
  limit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const offset = (page - 1) * limit;

  try {
    // Pending — scoped by role inside repository
    const pendingResult = await leaveRepository.listPendingLeaves(actor, { limit, offset });

    // Recent approved — same role scope, last 5 by updatedAt
    const recentApproved = await leaveRepository.listLeaves(
      buildRoleScopeForService(actor, { status: 'Approved' }),
      { limit: 5, offset: 0, order: [['updatedAt', 'DESC']] }
    );

    return {
      success: true,
      statusCode: 200,
      data: {
        pending: pendingResult.rows,
        recentApproved: recentApproved.rows,
      },
      meta: {
        pendingCount: pendingResult.count,
        currentPage: page,
        limit,
      },
    };
  } catch (error) {
    return fail(error.message || 'Failed to fetch leaves', 500);
  }
};

/**
 * Mirror of repository's buildRoleScope — used by the service when it needs to
 * construct a WHERE object directly (e.g. for listLeaves calls).
 */
const buildRoleScopeForService = (actor, extra = {}) => {
  const role = actor?.primaryRole?.toLowerCase();
  let scope = {};

  if (role === 'admin' || role === 'hr') {
    if (actor.companyId) scope.companyId = actor.companyId;
  } else if (role === 'manager') {
    scope.managerId = actor.id;
  } else {
    scope.employeeId = actor.id;
  }

  return { ...scope, ...extra };
};

// ─────────────────────────────────────────────────────────────────────────────
// LIST TEAM LEAVES (paginated, grouped, role-aware)
//
// Admin / HR  → all company leaves
// Manager     → direct reports only
// ─────────────────────────────────────────────────────────────────────────────

const listTeamLeaves = async ({
  actor,
  status,
  leaveType,
  startDate,
  endDate,
  limit = 20,
  page = 1,
}) => {
  const denied = checkPermission(actor, 'VIEW_LEAVE');
  if (denied) return denied;

  page = Math.max(Number(page) || 1, 1);
  limit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const offset = (page - 1) * limit;

  try {
    // Repository handles all role-scoping internally
    const result = await leaveRepository.listTeamLeaves({
      actor,
      status,
      leaveType,
      startDate,
      endDate,
      limit,
      offset,
    });

    const data = Array.isArray(result?.rows) ? result.rows : [];
    const total = result?.count ?? 0;

    // Group for convenient front-end consumption
    const grouped = {
      pending: data.filter(l => l.status === 'Pending'),
      approved: data.filter(l => l.status === 'Approved'),
      rejected: data.filter(l => l.status === 'Rejected'),
      cancelled: data.filter(l => l.status === 'Cancelled'),
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
          cancelled: grouped.cancelled.length,
        },
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
        grouped,
        list: data,
      },
    };
  } catch (error) {
    return fail(error.message || 'Failed to fetch team leaves', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FIND LEAVE BY ID
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// GET MY LEAVE BALANCE
// ─────────────────────────────────────────────────────────────────────────────

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
            [Op.between]: [
              new Date(`${year}-01-01T00:00:00.000Z`),
              new Date(`${year}-12-31T23:59:59.999Z`),
            ],
          },
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

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

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
    return fail(error.message || 'Failed to fetch dashboard summary', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE STATS (role-aware counts)
//
// Role         Scope
// ──────────── ─────────────────────────────────────────────
// Admin / HR   company-wide   (companyId)
// Manager      team only      (managerId = actor.id)
// Employee     own only       (employeeId = actor.id)
// ─────────────────────────────────────────────────────────────────────────────

const getLeaveStats = async ({ year, actor }) => {
  const denied = checkPermission(actor, 'VIEW_LEAVE');
  if (denied) return denied;

  try {
    // Delegates all role scoping + year filtering to repository
    const stats = await leaveRepository.getLeaveStats({ year, actor });

    return {
      success: true,
      statusCode: 200,
      data: stats,
    };
  } catch (error) {
    return fail(error.message || 'Failed to fetch leave stats', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// YEARLY LEAVE RESET  (Admin / HR only — triggered at year start)
// ─────────────────────────────────────────────────────────────────────────────

const yearlyLeaveReset = async (year, actor) => {
  const denied = checkPermission(actor, 'APPROVE_LEAVE');
  if (denied) return denied;

  const parsedYear = Number(year);
  if (!parsedYear || parsedYear < 2000 || parsedYear > 2100) {
    return fail('A valid year between 2000 and 2100 is required');
  }

  try {
    await sequelize.transaction(async (transaction) => {
      const previousBalances = await LeaveBalance.findAll({
        where: { year: parsedYear - 1 },
        transaction,
      });

      await Promise.all(
        previousBalances.map(async (prev) => {
          const carryForward = Math.min(prev.remaining ?? 0, MAX_CARRY_FORWARD);
          const newPaidTotal = DEFAULT_QUOTAS.PAID + carryForward;

          return LeaveBalance.upsert(
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
        })
      );
    });

    eventBus.emit('LEAVE_BALANCES_RESET', { year: parsedYear, actorId: actor?.id });

    return {
      success: true,
      message: `Leave balances reset for ${parsedYear} with carry-forward of up to ${MAX_CARRY_FORWARD} days applied`,
      statusCode: 200,
    };
  } catch (error) {
    return fail(error.message || 'Failed to reset leave balances', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

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