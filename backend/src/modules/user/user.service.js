
// const bcrypt = require('bcrypt');
// const sequelize = require('../../database/sequelize');
// const AppError = require('../../utils/AppError');
// const userRepository = require('./userRepository');
// const { clearCacheKeys } = require('../../utils/cache');
// const { logAuditEvent } = require('../../utils/auditLogger');
// const { sendNotification, sendBulkNotifications } = require('../../config/socket');
// const { Op, fn, col, literal } = require('sequelize');

// const {
//   User,
//   LeaveRequest,
//   Expense,
//   Payroll
// } = require('../../database/initModels');
// const listUsers = async (query) => {
//   const limit = Math.min(Number(query.limit || 20), 100);
//   const page = Math.max(Number(query.page || 1), 1);
//   const offset = (page - 1) * limit;

//   const { rows, count } = await userRepository.findUsers({
//     limit,
//     offset,
//     search: query.search
//   });

//   return {
//     data: rows,
//     pagination: {
//       total: count,
//       page,
//       limit,
//       totalPages: Math.ceil(count / limit)
//     }
//   };
// };

// const getUserById = async (id) => {
//   const user = await userRepository.findUserById(id);
//   if (!user) {
//     throw new AppError('User not found', 404);
//   }

//   return user;
// };

// const createUser = async (payload, actor, ipAddress) =>
//   sequelize.transaction(async (transaction) => {
//     const existing = await userRepository.findUsers({
//       limit: 1,
//       offset: 0,
//       search: payload.email
//     });
//     if (existing.count > 0) {
//       throw new AppError('User email already exists', 409);
//     }

//     const passwordHash = await bcrypt.hash(payload.password, 12);
//     const createdUser = await userRepository.createUser(
//       {
//         employeeCode: payload.employeeCode,
//         firstName: payload.firstName,
//         lastName: payload.lastName,
//         email: payload.email,
//         passwordHash,
//         managerId: payload.managerId || null,
//         department: payload.department || null,
//         baseSalary: payload.baseSalary
//       },
//       transaction
//     );

//     const [role] = await userRepository.findOrCreateRole(payload.role, transaction);
//     await userRepository.mapRoleToUser(createdUser.id, role.id, transaction);

//     await logAuditEvent({
//       userId: actor.id,
//       moduleName: 'User',
//       actionType: 'CREATE',
//       oldData: null,
//       newData: { id: createdUser.id, email: createdUser.email },
//       ipAddress
//     });

//     const newUser = await userRepository.findUserById(createdUser.id);

//     sendNotification(actor.id, {
//       type: "USER_CREATED",
//       title: "User Created Successfully",
//       message: `New user ${newUser.firstName} ${newUser.lastName} (${newUser.email}) has been created.`,
//       userId: newUser.id,
//       employeeCode: newUser.employeeCode,
//       email: newUser.email,
//       role: payload.role,
//       department: newUser.department
//     });

//     if (payload.managerId) {
//       sendNotification(payload.managerId, {
//         type: "NEW_TEAM_MEMBER",
//         title: "New Team Member Added",
//         message: `${newUser.firstName} ${newUser.lastName} has been added to your team as ${payload.role}.`,
//         userId: newUser.id,
//         employeeName: `${newUser.firstName} ${newUser.lastName}`,
//         email: newUser.email,
//         role: payload.role,
//         department: newUser.department
//       });
//     }

//     const adminIds = await userRepository.getAdminIds();
//     adminIds.forEach(adminId => {
//       if (adminId !== actor.id) {
//         sendNotification(adminId, {
//           type: "USER_CREATED_ADMIN",
//           title: "New User Created",
//           message: `${actor.firstName} ${actor.lastName} created a new user: ${newUser.firstName} ${newUser.lastName}`,
//           userId: newUser.id,
//           employeeCode: newUser.employeeCode,
//           email: newUser.email,
//           role: payload.role,
//           department: newUser.department,
//           createdBy: `${actor.firstName} ${actor.lastName}`
//         });
//       }
//     });

//     const hrTeamIds = await userRepository.getHRTeamIds();
//     hrTeamIds.forEach(hrId => {
//       if (hrId !== actor.id && !adminIds.includes(hrId)) {
//         sendNotification(hrId, {
//           type: "USER_CREATED_HR",
//           title: "New Employee Onboarded",
//           message: `New employee ${newUser.firstName} ${newUser.lastName} has been onboarded.`,
//           userId: newUser.id,
//           employeeCode: newUser.employeeCode,
//           email: newUser.email,
//           department: newUser.department
//         });
//       }
//     });

//     return newUser;
//   });

// const updateUser = async (id, payload, actor, ipAddress) => {
//   return sequelize.transaction(async (transaction) => {
//     const existing = await getUserById(id, transaction);
//     if (!existing) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     const mappedPayload = {
//       employee_code: payload.employeeCode,
//       first_name: payload.firstName,
//       last_name: payload.lastName,
//       email: payload.email,
//       manager_id: payload.managerId,
//       department: payload.department,
//       base_salary: payload.baseSalary,
//       is_active: payload.isActive,
//       role: payload.role
//     };
    
//     Object.keys(mappedPayload).forEach(
//       key => mappedPayload[key] === undefined && delete mappedPayload[key]
//     );

//     await userRepository.updateUserById(id, mappedPayload, transaction);

//     const updatedUser = await userRepository.findUserById(id, transaction);

//     await clearCacheKeys([
//       `dashboard_summary:${id}:${new Date().getFullYear()}`
//     ]);

//     await logAuditEvent({
//       userId: actor.id,
//       moduleName: 'User',
//       actionType: 'UPDATE',
//       oldData: existing.toJSON ? existing.toJSON() : existing,
//       newData: updatedUser.toJSON ? updatedUser.toJSON() : updatedUser,
//       ipAddress,
//       transaction
//     });

//     const changes = [];
//     if (existing.firstName !== updatedUser.firstName || existing.lastName !== updatedUser.lastName) {
//       changes.push(`Name changed from ${existing.firstName} ${existing.lastName} to ${updatedUser.firstName} ${updatedUser.lastName}`);
//     }
//     if (existing.email !== updatedUser.email) {
//       changes.push(`Email changed from ${existing.email} to ${updatedUser.email}`);
//     }
//     if (existing.department !== updatedUser.department) {
//       changes.push(`Department changed from ${existing.department} to ${updatedUser.department}`);
//     }
//     if (existing.managerId !== updatedUser.managerId) {
//       changes.push(`Manager changed`);
//     }
//     if (existing.baseSalary !== updatedUser.baseSalary) {
//       changes.push(`Salary updated`);
//     }
//     if (existing.isActive !== updatedUser.isActive) {
//       changes.push(`Status changed to ${updatedUser.isActive ? 'Active' : 'Inactive'}`);
//     }

//     sendNotification(id, {
//       type: "USER_UPDATED",
//       title: "Profile Updated",
//       message: `Your profile has been updated by ${actor.firstName} ${actor.lastName}.`,
//       userId: id,
//       changes: changes,
//       updatedBy: `${actor.firstName} ${actor.lastName}`,
//       updatedAt: new Date().toISOString()
//     });

//     sendNotification(actor.id, {
//       type: "USER_UPDATED_SUCCESS",
//       title: "User Updated Successfully",
//       message: `User ${updatedUser.firstName} ${updatedUser.lastName} has been updated successfully.`,
//       userId: id,
//       employeeName: `${updatedUser.firstName} ${updatedUser.lastName}`,
//       changes: changes
//     });

//     if (updatedUser.managerId && updatedUser.managerId !== actor.id) {
//       sendNotification(updatedUser.managerId, {
//         type: "TEAM_MEMBER_UPDATED",
//         title: "Team Member Updated",
//         message: `${updatedUser.firstName} ${updatedUser.lastName}'s profile has been updated.`,
//         userId: id,
//         employeeName: `${updatedUser.firstName} ${updatedUser.lastName}`,
//         changes: changes
//       });
//     }

//     if (existing.managerId && existing.managerId !== updatedUser.managerId && existing.managerId !== actor.id) {
//       sendNotification(existing.managerId, {
//         type: "TEAM_MEMBER_REMOVED",
//         title: "Team Member Reassigned",
//         message: `${updatedUser.firstName} ${updatedUser.lastName} has been moved from your team.`,
//         userId: id,
//         employeeName: `${updatedUser.firstName} ${updatedUser.lastName}`
//       });
//     }

//     const adminIds = await userRepository.getAdminIds();
//     adminIds.forEach(adminId => {
//       if (adminId !== actor.id && adminId !== id) {
//         sendNotification(adminId, {
//           type: "USER_UPDATED_ADMIN",
//           title: "User Profile Updated",
//           message: `${actor.firstName} ${actor.lastName} updated ${updatedUser.firstName} ${updatedUser.lastName}'s profile.`,
//           userId: id,
//           employeeName: `${updatedUser.firstName} ${updatedUser.lastName}`,
//           changes: changes,
//           updatedBy: `${actor.firstName} ${actor.lastName}`
//         });
//       }
//     });

//     return updatedUser;
//   });
// };

// const deleteUser = async (id, actor, ipAddress) => {
//   const existing = await getUserById(id);
//   await userRepository.softDeleteUser(id);

//   await logAuditEvent({
//     userId: actor.id,
//     moduleName: 'User',
//     actionType: 'DELETE',
//     oldData: existing,
//     newData: null,
//     ipAddress
//   });

//   sendNotification(actor.id, {
//     type: "USER_DELETED",
//     title: "User Deleted",
//     message: `User ${existing.firstName} ${existing.lastName} (${existing.email}) has been deleted.`,
//     userId: id,
//     employeeName: `${existing.firstName} ${existing.lastName}`,
//     email: existing.email,
//     deletedAt: new Date().toISOString()
//   });

//   if (existing.managerId && existing.managerId !== actor.id) {
//     sendNotification(existing.managerId, {
//       type: "TEAM_MEMBER_DELETED",
//       title: "Team Member Removed",
//       message: `${existing.firstName} ${existing.lastName} has been removed from the system.`,
//       userId: id,
//       employeeName: `${existing.firstName} ${existing.lastName}`
//     });
//   }

//   const adminIds = await userRepository.getAdminIds();
//   adminIds.forEach(adminId => {
//     if (adminId !== actor.id) {
//       sendNotification(adminId, {
//         type: "USER_DELETED_ADMIN",
//         title: "User Account Deleted",
//         message: `${actor.firstName} ${actor.lastName} deleted user ${existing.firstName} ${existing.lastName}.`,
//         userId: id,
//         employeeName: `${existing.firstName} ${existing.lastName}`,
//         email: existing.email,
//         deletedBy: `${actor.firstName} ${actor.lastName}`
//       });
//     }
//   });

//   const hrTeamIds = await userRepository.getHRTeamIds();
//   hrTeamIds.forEach(hrId => {
//     if (hrId !== actor.id && !adminIds.includes(hrId)) {
//       sendNotification(hrId, {
//         type: "EMPLOYEE_OFFBOARDED",
//         title: "Employee Offboarded",
//         message: `${existing.firstName} ${existing.lastName} has been removed from the system.`,
//         userId: id,
//         employeeName: `${existing.firstName} ${existing.lastName}`,
//         email: existing.email,
//         department: existing.department
//       });
//     }
//   });

//   return { success: true };
// };

// const getDashboardSummary = async ({ year, page = 1, limit = 10, user }) => {
//   try {
//     const start = `${year}-01-01`;
//     const end = `${year}-12-31`;
//     const offset = (page - 1) * limit;

//     // 🔐 RBAC (IMPORTANT for your 403 issues)
//     if (!user) {
//       throw new Error("Unauthorized");
//     }

//     const isManager = user.role === "Manager";
//     const isFinance = user.role === "Finance";
//     const isAdmin = user.role === "Admin";
//     const isHR = user.role === "HR";
//     const canViewAll = isAdmin || isHR;
//     const canViewFinancials = isAdmin || isFinance;
//     const canViewLeaves = canViewAll || isManager;

//     const [
//       totalUsers,
//       leaveStats,
//       newLeaves,
//       expensesClaimed,
//       salaryPaid,
//       monthlyLeaves,
//       usersData,
//       allLeavesList,
//       expensesList,
//       monthlyExpenses,
//       monthlySalary
//     ] = await Promise.all([
//       User.count(),

//       LeaveRequest.findAll({
//         attributes: ['status', [fn('COUNT', col('id')), 'count']],
//         where: { startDate: { [Op.between]: [start, end] } },
//         group: ['status'],
//         raw: true
//       }),

//       LeaveRequest.count({
//         where: {
//           createdAt: {
//             [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
//           }
//         }
//       }),

//       Expense.sum('amount', {
//         where: {
//           managerApprovalStatus: 'Approved',
//           financeApprovalStatus: 'Approved',
//           createdAt: { [Op.between]: [start, end] }
//         }
//       }),

//       Payroll.sum('net_salary', {
//         where: {
//           status: { [Op.in]: ['Processed', 'Locked'] },
//           processedAt: { [Op.between]: [start, end] }
//         }
//       }),

//       LeaveRequest.findAll({
//         attributes: [
//           [fn('MONTH', col('start_date')), 'month'],
//           [fn('COUNT', col('id')), 'count']
//         ],
//         where: {
//           status: 'Approved',
//           startDate: { [Op.between]: [start, end] }
//         },
//         group: [fn('MONTH', col('start_date'))],
//         raw: true
//       }),

//       User.findAndCountAll({
//         attributes: { exclude: ['passwordHash'] },
//         limit: Number(limit),
//         offset: Number(offset),
//         order: [['createdAt', 'DESC']]
//       }),

//       LeaveRequest.findAndCountAll({
//         where: { startDate: { [Op.between]: [start, end] } },
//         include: [
//           { model: User, as: 'employee', attributes: ['id', 'firstName', 'lastName', 'email'] },
//           { model: User, as: 'approver', attributes: ['id', 'firstName', 'lastName', 'email'] }
//         ],
//         limit: Number(limit),
//         offset: Number(offset),
//         order: [['createdAt', 'DESC']]
//       }),

//       Expense.findAndCountAll({
//         where: { createdAt: { [Op.between]: [start, end] } },
//         include: [
//           { model: User, as: 'employee', attributes: ['id', 'firstName', 'lastName', 'email'] }
//         ],
//         limit: Number(limit),
//         offset: Number(offset),
//         order: [['createdAt', 'DESC']]
//       }),

//       Expense.findAll({
//         attributes: [
//           [fn('MONTH', col('created_at')), 'month'],
//           [fn('SUM', col('amount')), 'total']
//         ],
//         where: {
//           managerApprovalStatus: 'Approved',
//           financeApprovalStatus: 'Approved',
//           createdAt: { [Op.between]: [start, end] }
//         },
//         group: [fn('MONTH', col('created_at'))],
//         raw: true
//       }),

//       Payroll.findAll({
//         attributes: [
//           [fn('MONTH', col('processed_at')), 'month'],
//           [fn('SUM', col('net_salary')), 'total']
//         ],
//         where: {
//           status: { [Op.in]: ['Processed', 'Locked'] },
//           processedAt: { [Op.between]: [start, end] }
//         },
//         group: [fn('MONTH', col('processed_at'))],
//         raw: true
//       })
//     ]);

//     // 🔥 Leave Map Safe Handling
//     const leaveMap = { Approved: 0, Pending: 0, Rejected: 0 };
//     leaveStats.forEach(item => {
//       leaveMap[item.status] = Number(item.count);
//     });

//     // 🔥 Always 12 months safe
//     const formatMonthly = (data, key = 'count') => {
//       const map = {};
//       data.forEach(item => {
//         map[Number(item.month)] = Number(item[key]);
//       });

//       return Array.from({ length: 12 }, (_, i) => ({
//         month: i + 1,
//         value: map[i + 1] || 0
//       }));
//     };

//     // ✅ FIXED LEAVES CLEANING
//     const cleanLeaves = allLeavesList.rows.map(leave => ({
//       id: leave.id,
//       status: leave.status,
//       startDate: leave.startDate,
//       endDate: leave.endDate,
//       reason: leave.reason,
//       employeeName: leave.employee
//         ? `${leave.employee.firstName} ${leave.employee.lastName}`
//         : null,
//       employeeEmail: leave.employee?.email || null,
//       approverName: leave.approver
//         ? `${leave.approver.firstName} ${leave.approver.lastName}`
//         : null,
//       approverEmail: leave.approver?.email || null
//     }));

//     // 🚨 FIXED EXPENSE STATUS (BIG FIX)
//     const cleanExpenses = expensesList.rows.map(exp => ({
//       id: exp.id,
//       amount: Number(exp.amount),
//       category: exp.category,
//       managerStatus: exp.managerApprovalStatus,
//       financeStatus: exp.financeApprovalStatus,
//       createdAt: exp.createdAt,
//       employeeName: exp.employee
//         ? `${exp.employee.firstName} ${exp.employee.lastName}`
//         : null,
//       employeeEmail: exp.employee?.email || null
//     }));

//     // 🔐 Role-based filtering (optional but powerful)
//     const filteredExpenses = isManager
//       ? cleanExpenses.filter(e => e.managerStatus === 'Pending')
//       : isFinance
//         ? cleanExpenses.filter(e => e.financeStatus === 'Pending')
//         : cleanExpenses;

//     return {
//       summary: {
//         totalUsers,
//         approvedLeaves: leaveMap.Approved,
//         pendingLeaves: leaveMap.Pending,
//         rejectedLeaves: leaveMap.Rejected,
//         newLeaves,
//         expensesClaimed: Number(expensesClaimed || 0),
//         salaryPaid: Number(salaryPaid || 0)
//       },

//       charts: {
//         leaves: formatMonthly(monthlyLeaves),
//         expenses: formatMonthly(monthlyExpenses, 'total'),
//         salary: formatMonthly(monthlySalary, 'total')
//       },

//       users: {
//         data: usersData.rows,
//         pagination: {
//           total: usersData.count,
//           page: Number(page),
//           limit: Number(limit),
//           totalPages: Math.ceil(usersData.count / limit)
//         }
//       },

//       leaves: {
//         pending: cleanLeaves.filter(l => l.status === 'Pending'),
//         approved: cleanLeaves.filter(l => l.status === 'Approved'),
//         rejected: cleanLeaves.filter(l => l.status === 'Rejected'),
//         all: {
//           data: cleanLeaves,
//           pagination: {
//             total: allLeavesList.count,
//             page: Number(page),
//             limit: Number(limit),
//             totalPages: Math.ceil(allLeavesList.count / limit)
//           }
//         }
//       },

//       expenses: {
//         total: Number(expensesClaimed || 0),
//         all: {
//           data: filteredExpenses,
//           pagination: {
//             total: expensesList.count,
//             page: Number(page),
//             limit: Number(limit),
//             totalPages: Math.ceil(expensesList.count / limit)
//           }
//         }
//       },

//       salary: {
//         total: Number(salaryPaid || 0)
//       }
//     };

//   } catch (error) {
//     console.error('Dashboard Error:', error);
//     throw error;
//   }
// };

// const getUsersByDepartment = async (department) => {
//   if (!department) {
//     throw new Error('Department is required');
//   }

//   const users = await userRepository.getUsersByDepartment(department);

//   return users;
// };

// module.exports = {
//   getUsersByDepartment,
//   listUsers,
//   getUserById,
//   createUser,
//   updateUser,
//   deleteUser,
//   getDashboardSummary
// };


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
    const { rows, count } = await userRepository.findUsers({ limit, offset, search });
    return {
      success: true,
      statusCode: 200,
      data: rows,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
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

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getDashboardSummary,
  getUsersByDepartment,
};