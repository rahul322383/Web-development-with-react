

'use strict';

const bcrypt = require('bcrypt');
const sequelize = require('../../database/sequelize');
const userRepository = require('./userRepository');
const { clearCacheKeys } = require('../../utils/cache');
const { logAuditEvent } = require('../../utils/auditLogger');
const logger = require('../../config/logger');
const eventBus = require('../../utils/Eventbus');
const { assertPermission } = require('../../utils/permissions');
const { notifyUserCreated, notifyUserUpdated, notifyUserDeleted } = require('./userNotifications');
const { buildChangelog, fullName } = require('./userFormatter');
const { getSummaryStats, getChartData, getLeaveData, getExpenseData, getUserListData } = require('./userDashboard');
const {
  listUsersSchema,
  createUserSchema,
  updateUserSchema,
  dashboardQuerySchema,
  departmentSchema,
  validate,
} = require('./user.validation');

const fail = (message, statusCode = 400, data = null) => ({
  success: false, message, statusCode, data,
});

const handleError = (event, error, fallback = 'Operation failed') => {
  logger.error({ event, error: error.message, stack: error.stack });
  return fail(error.message || fallback, error.statusCode || 500);
};

const listUsers = async (query, actor) => {
  const perm = assertPermission(actor, 'LIST_USERS');
  if (!perm.allowed) return fail(perm.message, 403);

  const validation = validate(listUsersSchema, query);
  if (!validation.valid) return fail(validation.message);

  const { limit, page, search } = validation.value;
  const offset = (page - 1) * limit;

  try {
    const { rows, count } = await userRepository.findUsers({
      limit,
      offset,
      search
    });

    return {
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    return handleError('LIST_USERS_FAILED', error, 'Failed to fetch users');
  }
};

const getUserById = async (id, actor) => {
  const perm = assertPermission(actor, 'VIEW_USER');
  if (!perm.allowed) return fail(perm.message, 403);

  if (!id || isNaN(Number(id))) return fail('Invalid user ID');

  try {
    const user = await userRepository.findUserById(id);
    if (!user) return fail('User not found', 404);
    return { success: true, statusCode: 200, data: user };
  } catch (error) {
    return handleError('GET_USER_FAILED', error, 'Failed to fetch user');
  }
};

const createUser = async (payload, actor, ipAddress) => {
  const perm = assertPermission(actor, 'CREATE_USER');
  if (!perm.allowed) return fail(perm.message, 403);

  const validation = validate(createUserSchema, payload);
  if (!validation.valid) return fail(validation.message);

  const { value } = validation;

  try {
    const existing = await userRepository.findUsers({ limit: 1, offset: 0, search: value.email });
    if (existing.count > 0) return fail('Email already registered', 409);

    if (value.managerId) {
      const manager = await userRepository.findUserById(value.managerId);
      if (!manager) return fail('Specified manager does not exist', 400);
    }

    let createdRaw;

    try {
      createdRaw = await sequelize.transaction(async (transaction) => {
        const passwordHash = await bcrypt.hash(value.password, Number(process.env.BCRYPT_ROUNDS) || 12);

        const created = await userRepository.createUser(
          {
            employeeCode: value.employeeCode,
            firstName: value.firstName,
            lastName: value.lastName,
            email: value.email,
            passwordHash,
            managerId: value.managerId || null,
            department: value.department || null,
            baseSalary: value.baseSalary,
          },
          transaction,
        );

        const [role] = await userRepository.findOrCreateRole(value.role, transaction);
        await userRepository.mapRoleToUser(created.id, role.id, transaction);

        return created;
      });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') return fail('Email already registered', 409);
      throw err;
    }

    const fullUser = await userRepository.findUserById(createdRaw.id);

    try {
      await logAuditEvent({
        userId: actor.id, moduleName: 'User', actionType: 'CREATE',
        oldData: null, newData: { id: fullUser.id, email: fullUser.email }, ipAddress,
      });
    } catch (auditErr) {
      logger.error({ event: 'AUDIT_LOG_FAILED', error: auditErr.message });
    }

    const [adminIds, hrTeamIds] = await Promise.all([
      userRepository.getAdminIds(),
      userRepository.getHRTeamIds(),
    ]);

    notifyUserCreated({ actor, user: fullUser, role: value.role, adminIds, hrTeamIds });
    eventBus.emit('USER_CREATED', { user: fullUser, actorId: actor.id });

    return { success: true, statusCode: 201, data: fullUser };

  } catch (error) {
    return handleError('CREATE_USER_FAILED', error, 'Failed to create user');
  }
};

const updateUser = async (id, payload, actor, ipAddress) => {
  const perm = assertPermission(actor, 'UPDATE_USER');
  if (!perm.allowed) return fail(perm.message, 403);

  if (!id || isNaN(Number(id))) return fail('Invalid user ID');

  const validation = validate(updateUserSchema, payload);
  if (!validation.valid) return fail(validation.message);

  const { value } = validation;

  try {
    const existing = await userRepository.findUserById(id);
    if (!existing) return fail('User not found', 404);

    if (value.managerId) {
      const manager = await userRepository.findUserById(value.managerId);
      if (!manager) return fail('Specified manager does not exist', 400);
    }

    const mappedPayload = {};
    if (value.employeeCode !== undefined) mappedPayload.employeeCode = value.employeeCode;
    if (value.firstName !== undefined) mappedPayload.firstName = value.firstName;
    if (value.lastName !== undefined) mappedPayload.lastName = value.lastName;
    if (value.email !== undefined) mappedPayload.email = value.email;
    if (value.managerId !== undefined) mappedPayload.managerId = value.managerId;
    if (value.department !== undefined) mappedPayload.department = value.department;
    if (value.baseSalary !== undefined) mappedPayload.baseSalary = value.baseSalary;
    if (value.isActive !== undefined) mappedPayload.isActive = value.isActive;
    if (value.role !== undefined) mappedPayload.role = value.role;

    await sequelize.transaction(async (transaction) => {
      await userRepository.updateUserById(id, mappedPayload, transaction);

      if (value.role) {
        const [role] = await userRepository.findOrCreateRole(value.role, transaction);
        await userRepository.updateUserRole(id, role.id, transaction);
      }
    });

    const updatedUser = await userRepository.findUserById(id);

    clearCacheKeys([`dashboard_summary:${id}:${new Date().getFullYear()}`])
      .catch((err) => logger.error({ event: 'CACHE_BUST_FAILED', error: err.message }));

    try {
      await logAuditEvent({
        userId: actor.id, moduleName: 'User', actionType: 'UPDATE',
        oldData: existing.toJSON?.() ?? existing,
        newData: updatedUser.toJSON?.() ?? updatedUser,
        ipAddress,
      });
    } catch (auditErr) {
      logger.error({ event: 'AUDIT_LOG_FAILED', error: auditErr.message });
    }

    const changes = buildChangelog(existing, updatedUser);
    const adminIds = await userRepository.getAdminIds();

    notifyUserUpdated({ actor, existing, updated: updatedUser, changes, adminIds });
    eventBus.emit('USER_UPDATED', { user: updatedUser, actorId: actor.id, changes });

    return { success: true, statusCode: 200, data: updatedUser };

  } catch (error) {
    return handleError('UPDATE_USER_FAILED', error, 'Failed to update user');
  }
};

const deleteUser = async (id, actor, ipAddress) => {
  const perm = assertPermission(actor, 'DELETE_USER');
  if (!perm.allowed) return fail(perm.message, 403);

  if (!id || isNaN(Number(id))) return fail('Invalid user ID');

  try {
    const existing = await userRepository.findUserById(id);
    if (!existing.isActive) return fail('User already deleted');

    await userRepository.softDeleteUser(id);

    try {
      await logAuditEvent({
        userId: actor.id, moduleName: 'User', actionType: 'DELETE',
        oldData: existing, newData: null, ipAddress,
      });
    } catch (auditErr) {
      logger.error({ event: 'AUDIT_LOG_FAILED', error: auditErr.message });
    }

    const [adminIds, hrTeamIds] = await Promise.all([
      userRepository.getAdminIds(),
      userRepository.getHRTeamIds(),
    ]);

    notifyUserDeleted({ actor, user: existing, adminIds, hrTeamIds });
    eventBus.emit('USER_DELETED', { userId: id, actorId: actor.id });

    return { success: true, statusCode: 200, message: 'User deleted successfully' };

  } catch (error) {
    return handleError('DELETE_USER_FAILED', error, 'Failed to delete user');
  }
};

const getDashboardSummary = async ({ year, page, limit, user: actor }) => {
  const perm = assertPermission(actor, 'VIEW_DASHBOARD');
  if (!perm.allowed) return fail(perm.message, 403);

  const validation = validate(dashboardQuerySchema, { year, page, limit });
  if (!validation.valid) return fail(validation.message);

  const { value } = validation;
  const role = actor.primaryRole;
  const canViewFinance = ['Admin', 'Finance'].includes(role);
  const canViewAll = ['Admin', 'HR'].includes(role);

  try {
    const [summary, charts, leaves, expenses, users] = await Promise.allSettled([
      getSummaryStats(value.year, canViewFinance),
      getChartData(value.year, canViewFinance),
      getLeaveData(value.year, value.page, value.limit),
      getExpenseData(value.year, value.page, value.limit, role),
      canViewAll ? getUserListData(value.page, value.limit) : Promise.resolve(null),
    ]);

    const unwrap = (settled) =>
      settled.status === 'fulfilled' ? settled.value : null;

    return {
      success: true,
      statusCode: 200,
      data: {
        summary: unwrap(summary),
        charts: unwrap(charts),
        leaves: unwrap(leaves),
        expenses: unwrap(expenses),
        users: unwrap(users),
      },
    };

  } catch (error) {
    return handleError('GET_DASHBOARD_FAILED', error, 'Failed to fetch dashboard');
  }
};

const getUsersByDepartment = async (department, actor) => {
  const perm = assertPermission(actor, 'VIEW_DEPARTMENT');
  if (!perm.allowed) return fail(perm.message, 403);

  const validation = validate(departmentSchema, { department });
  if (!validation.valid) return fail(validation.message);

  try {
    const users = await userRepository.getUsersByDepartment(validation.value.department);
    return { success: true, statusCode: 200, data: users };
  } catch (error) {
    return handleError('GET_USERS_BY_DEPARTMENT_FAILED', error, 'Failed to fetch department users');
  }
};

const assignManager = async ({ employeeId, managerId }) => {
  try {
    // 🔍 check employee
    const employee = await User.findByPk(employeeId);
    if (!employee) return fail('Employee not found', 404);

    // 🔍 check manager
    const manager = await User.findByPk(managerId);
    if (!manager) return fail('Manager not found', 404);

    // ❌ prevent self assignment
    if (Number(employeeId) === Number(managerId)) {
      return fail('Employee cannot be their own manager', 422);
    }

    // ✅ assign manager
    employee.managerId = managerId;
    await employee.save();

    return {
      success: true,
      message: 'Manager assigned successfully',
      statusCode: 200,
      data: employee,
    };

  } catch (error) {
    return fail(error.message || 'Failed to assign manager', 500);
  }
};

module.exports = {
  assignManager,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getDashboardSummary,
  getUsersByDepartment,
};