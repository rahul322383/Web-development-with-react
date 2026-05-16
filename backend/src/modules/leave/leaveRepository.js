'use strict';

const { Op } = require('sequelize');
const { LeaveRequest, LeaveBalance, User, Role } = require('../../database/initModels');

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a role-aware WHERE clause for LeaveRequest queries.
 *
 * Role         Scope
 * ──────────── ────────────────────────────────────────────────
 * admin        entire company  (companyId)
 * hr           entire company  (companyId)
 * manager      direct reports  (managerId = actor.id)
 * employee     own leaves      (employeeId = actor.id)
 */
const buildRoleScope = (actor, extra = {}) => {
  const role = actor?.primaryRole?.toLowerCase();

  let scope = {};

  if (role === 'admin' || role === 'hr') {
    // Company-wide — no employee/manager restriction
    if (actor.companyId) scope.companyId = actor.companyId;
  } else if (role === 'manager') {
    scope.managerId = actor.id;
  } else {
    // Default: employee sees only their own
    scope.employeeId = actor.id;
  }

  return { ...scope, ...extra };
};

// Standard employee include used across all queries
const employeeInclude = (extraAttributes = []) => ({
  model: User,
  as: 'employee',
  attributes: [
    'id', 'firstName', 'lastName', 'email',
    'employeeCode', 'department', 'designation',
    ...extraAttributes,
  ],
});

const managerInclude = () => ({
  model: User,
  as: 'manager',
  attributes: ['id', 'firstName', 'lastName', 'email'],
});

// ─────────────────────────────────────────────────────────────────────────────
// USER / EMPLOYEE
// ─────────────────────────────────────────────────────────────────────────────

const findEmployee = (id) => User.findByPk(id);

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE BALANCE
// ─────────────────────────────────────────────────────────────────────────────

const findLeaveBalance = (employeeId, year, transaction) =>
  LeaveBalance.findOne({ where: { employeeId, year }, transaction });

const createLeaveBalance = (payload, transaction) =>
  LeaveBalance.create(payload, { transaction });

const updateLeaveBalance = (employeeId, year, data, transaction) =>
  LeaveBalance.update(data, { where: { employeeId, year }, transaction });

const resetAllLeaveBalances = async ({ totalAnnual, year }, transaction) => {
  const employees = await User.findAll({
    where: { isActive: true },
    attributes: ['id'],
    transaction,
  });

  await Promise.all(
    employees.map((emp) =>
      LeaveBalance.upsert(
        { employeeId: emp.id, totalAnnual, used: 0, remaining: totalAnnual, year },
        { transaction }
      )
    )
  );

  return employees.length;
};

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE REQUEST — CRUD
// ─────────────────────────────────────────────────────────────────────────────

const createLeaveRequest = (payload, transaction) =>
  LeaveRequest.create(payload, { transaction });

const findLeaveRequestById = (id, transaction) =>
  LeaveRequest.findByPk(id, {
    include: [employeeInclude(), managerInclude()],
    transaction,
  });

const updateLeaveRequest = (id, data, transaction) =>
  LeaveRequest.update(data, { where: { id }, transaction });

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE REQUEST — LIST (cursor-based, for employees)
// ─────────────────────────────────────────────────────────────────────────────

const listEmployeeLeavesWithCursor = async ({ employeeId, cursor, limit }) => {
  const where = { employeeId };
  if (cursor) where.id = { [Op.lt]: cursor };

  return LeaveRequest.findAll({
    where,
    limit: limit + 1,
    order: [['id', 'DESC']],
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE REQUEST — PENDING (role-aware)
//
// actor.primaryRole  → scoping
//   admin / hr       → company-wide
//   manager          → managerId = actor.id
//   employee         → employeeId = actor.id (own pending)
// ─────────────────────────────────────────────────────────────────────────────

const listPendingLeaves = async (actor, { limit = 10, offset = 0 } = {}) => {
  const where = buildRoleScope(actor, { status: 'Pending' });

  return LeaveRequest.findAndCountAll({
    where,
    include: [employeeInclude(), managerInclude()],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    distinct: true, // required when include + findAndCountAll
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE REQUEST — TEAM / ALL LEAVES (role-aware, with optional filters)
//
// actor.primaryRole  → scoping
//   admin / hr       → ALL leaves in the company (companyId)
//   manager          → direct reports only (managerId = actor.id)
//   employee         → own leaves only
//
// Optional filters: status, leaveType, startDate, endDate
// ─────────────────────────────────────────────────────────────────────────────

const listTeamLeaves = async ({
  actor,
  status,
  leaveType,
  startDate,
  endDate,
  limit = 20,
  offset = 0,
}) => {
  // Start with role scope
  const where = buildRoleScope(actor);

  // ── Optional filters ──────────────────────────────────────────────────
  if (status) where.status = status;
  if (leaveType) where.leaveType = leaveType;

  if (startDate && endDate) {
    where.startDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
  } else if (startDate) {
    where.startDate = { [Op.gte]: new Date(startDate) };
  } else if (endDate) {
    where.startDate = { [Op.lte]: new Date(endDate) };
  }

  return LeaveRequest.findAndCountAll({
    where,
    include: [employeeInclude(), managerInclude()],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    distinct: true,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE REQUEST — GENERIC LIST (used internally by service for recentApproved etc.)
// ─────────────────────────────────────────────────────────────────────────────

const listLeaves = async (where, { limit = 10, offset = 0, order = [['createdAt', 'DESC']] } = {}) => {
  return LeaveRequest.findAndCountAll({
    where,
    include: [employeeInclude(), managerInclude()],
    order,
    limit,
    offset,
    distinct: true,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE STATS — role-aware counts
//
// actor.primaryRole  → scoping
//   admin / hr       → company-wide counts
//   manager          → team counts (managerId)
//   employee         → own counts
// ─────────────────────────────────────────────────────────────────────────────

const getLeaveStats = async ({ year, actor }) => {
  // Base scope by role
  const baseWhere = buildRoleScope(actor);

  // Year filter — full day boundaries to avoid timezone truncation
  if (year) {
    baseWhere.createdAt = {
      [Op.between]: [
        new Date(`${year}-01-01T00:00:00.000Z`),
        new Date(`${year}-12-31T23:59:59.999Z`),
      ],
    };
  }

  const [total, approved, pending, rejected, cancelled] = await Promise.all([
    LeaveRequest.count({ where: baseWhere }),
    LeaveRequest.count({ where: { ...baseWhere, status: 'Approved' } }),
    LeaveRequest.count({ where: { ...baseWhere, status: 'Pending' } }),
    LeaveRequest.count({ where: { ...baseWhere, status: 'Rejected' } }),
    LeaveRequest.count({ where: { ...baseWhere, status: 'Cancelled' } }),
  ]);

  return {
    total,
    approved,
    pending,
    rejected,
    cancelled,
    approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

const getDashboardSummary = async (employeeId) => {
  const year = new Date().getFullYear();
  const [leaveBalance, recentLeaves] = await Promise.all([
    findLeaveBalance(employeeId, year),
    LeaveRequest.findAll({
      where: { employeeId },
      limit: 5,
      order: [['createdAt', 'DESC']],
    }),
  ]);
  return { leaveBalance, recentLeaves };
};

// ─────────────────────────────────────────────────────────────────────────────
// APPROVED LEAVES (for manager calendar view)
// ─────────────────────────────────────────────────────────────────────────────

const listApprovedManagerLeaves = (managerId) =>
  LeaveRequest.findAll({
    where: { managerId, status: 'Approved' },
    include: [employeeInclude()],
    order: [['startDate', 'ASC']],
  });

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  // User
  findEmployee,

  // Balance
  findLeaveBalance,
  createLeaveBalance,
  updateLeaveBalance,
  resetAllLeaveBalances,

  // Leave requests
  createLeaveRequest,
  findLeaveRequestById,
  updateLeaveRequest,
  listEmployeeLeavesWithCursor,
  listPendingLeaves,
  listTeamLeaves,
  listLeaves,
  listApprovedManagerLeaves,

  // Aggregates
  getDashboardSummary,
  getLeaveStats,
};