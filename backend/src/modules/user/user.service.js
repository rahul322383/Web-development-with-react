

// const bcrypt = require('bcrypt');
// const sequelize = require('../../database/sequelize');
// const AppError = require('../../utils/AppError');
// const userRepository = require('./userRepository');
// const { getCache, setCache, clearCacheKeys } = require('../../utils/cache');
// const { logAuditEvent } = require('../../utils/auditLogger');
// const { Op, fn, col, literal } = require('sequelize');

// const {
//   User,
//   LeaveRequest,
//   Expense,
//   Payroll
// } = require('../../database/initModels');
// const { get } = require('./user.routes');

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

//     return userRepository.findUserById(createdUser.id);
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

//   return { success: true };
// };

// const getDashboardSummary = async ({ year, page = 1, limit = 10 }) => {
//   try {
//     const start = `${year}-01-01`;
//     const end = `${year}-12-31`;
//     const offset = (page - 1) * limit;

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
//         attributes: [
//           'status',
//           [fn('COUNT', col('id')), 'count']
//         ],
//         where: {
//           startDate: { [Op.between]: [start, end] }
//         },
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
//         where: {
//           startDate: { [Op.between]: [start, end] }
//         },
//         include: [
//           {
//             model: User,
//             as: 'employee',
//             attributes: ['id', 'firstName', 'lastName', 'email']
//           },
//           {
//             model: User,
//             as: 'approver',
//             attributes: ['id', 'firstName', 'lastName', 'email']
//           }
//         ],
//         limit: Number(limit),
//         offset: Number(offset),
//         order: [['createdAt', 'DESC']]
//       }),
      
//       Expense.findAndCountAll({
//         where: {
//           createdAt: { [Op.between]: [start, end] }
//         },
//         include: [
//           {
//             model: User,
//             as: 'employee',
//             attributes: ['id', 'firstName', 'lastName', 'email']
//           }
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

//     const leaveMap = { Approved: 0, Pending: 0, Rejected: 0 };
//     leaveStats.forEach(item => {
//       leaveMap[item.status] = Number(item.count);
//     });

//     const formatMonthly = (data, key = 'count') => {
//       const map = {};
//       data.forEach(item => {
//         map[item.month] = Number(item[key]);
//       });

//       return Array.from({ length: 12 }, (_, i) => ({
//         month: i + 1,
//         value: map[i + 1] || 0
//       }));
//     };

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

//     const cleanExpenses = expensesList.rows.map(exp => ({
//       id: exp.id,
//       amount: exp.amount,
//       category: exp.category,
//       status: `${exp.managerApprovalStatus} / ${exp.financeApprovalStatus}`,
//       createdAt: exp.createdAt,
//       employeeName: exp.employee
//         ? `${exp.employee.firstName} ${exp.employee.lastName}`
//         : null,
//       employeeEmail: exp.employee?.email || null
//     }));

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
//           data: cleanExpenses,
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

const bcrypt = require('bcrypt');
const sequelize = require('../../database/sequelize');
const AppError = require('../../utils/AppError');
const userRepository = require('./userRepository');
const { clearCacheKeys } = require('../../utils/cache');
const { logAuditEvent } = require('../../utils/auditLogger');
const { sendNotification, sendBulkNotifications } = require('../../config/socket');
const { Op, fn, col, literal } = require('sequelize');

const {
  User,
  LeaveRequest,
  Expense,
  Payroll
} = require('../../database/initModels');
const listUsers = async (query) => {
  const limit = Math.min(Number(query.limit || 20), 100);
  const page = Math.max(Number(query.page || 1), 1);
  const offset = (page - 1) * limit;

  const { rows, count } = await userRepository.findUsers({
    limit,
    offset,
    search: query.search
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  };
};

const getUserById = async (id) => {
  const user = await userRepository.findUserById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

const createUser = async (payload, actor, ipAddress) =>
  sequelize.transaction(async (transaction) => {
    const existing = await userRepository.findUsers({
      limit: 1,
      offset: 0,
      search: payload.email
    });
    if (existing.count > 0) {
      throw new AppError('User email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const createdUser = await userRepository.createUser(
      {
        employeeCode: payload.employeeCode,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        passwordHash,
        managerId: payload.managerId || null,
        department: payload.department || null,
        baseSalary: payload.baseSalary
      },
      transaction
    );

    const [role] = await userRepository.findOrCreateRole(payload.role, transaction);
    await userRepository.mapRoleToUser(createdUser.id, role.id, transaction);

    await logAuditEvent({
      userId: actor.id,
      moduleName: 'User',
      actionType: 'CREATE',
      oldData: null,
      newData: { id: createdUser.id, email: createdUser.email },
      ipAddress
    });

    const newUser = await userRepository.findUserById(createdUser.id);

    sendNotification(actor.id, {
      type: "USER_CREATED",
      title: "User Created Successfully",
      message: `New user ${newUser.firstName} ${newUser.lastName} (${newUser.email}) has been created.`,
      userId: newUser.id,
      employeeCode: newUser.employeeCode,
      email: newUser.email,
      role: payload.role,
      department: newUser.department
    });

    if (payload.managerId) {
      sendNotification(payload.managerId, {
        type: "NEW_TEAM_MEMBER",
        title: "New Team Member Added",
        message: `${newUser.firstName} ${newUser.lastName} has been added to your team as ${payload.role}.`,
        userId: newUser.id,
        employeeName: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        role: payload.role,
        department: newUser.department
      });
    }

    const adminIds = await userRepository.getAdminIds();
    adminIds.forEach(adminId => {
      if (adminId !== actor.id) {
        sendNotification(adminId, {
          type: "USER_CREATED_ADMIN",
          title: "New User Created",
          message: `${actor.firstName} ${actor.lastName} created a new user: ${newUser.firstName} ${newUser.lastName}`,
          userId: newUser.id,
          employeeCode: newUser.employeeCode,
          email: newUser.email,
          role: payload.role,
          department: newUser.department,
          createdBy: `${actor.firstName} ${actor.lastName}`
        });
      }
    });

    const hrTeamIds = await userRepository.getHRTeamIds();
    hrTeamIds.forEach(hrId => {
      if (hrId !== actor.id && !adminIds.includes(hrId)) {
        sendNotification(hrId, {
          type: "USER_CREATED_HR",
          title: "New Employee Onboarded",
          message: `New employee ${newUser.firstName} ${newUser.lastName} has been onboarded.`,
          userId: newUser.id,
          employeeCode: newUser.employeeCode,
          email: newUser.email,
          department: newUser.department
        });
      }
    });

    return newUser;
  });

const updateUser = async (id, payload, actor, ipAddress) => {
  return sequelize.transaction(async (transaction) => {
    const existing = await getUserById(id, transaction);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const mappedPayload = {
      employee_code: payload.employeeCode,
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      manager_id: payload.managerId,
      department: payload.department,
      base_salary: payload.baseSalary,
      is_active: payload.isActive,
      role: payload.role
    };
    
    Object.keys(mappedPayload).forEach(
      key => mappedPayload[key] === undefined && delete mappedPayload[key]
    );

    await userRepository.updateUserById(id, mappedPayload, transaction);

    const updatedUser = await userRepository.findUserById(id, transaction);

    await clearCacheKeys([
      `dashboard_summary:${id}:${new Date().getFullYear()}`
    ]);

    await logAuditEvent({
      userId: actor.id,
      moduleName: 'User',
      actionType: 'UPDATE',
      oldData: existing.toJSON ? existing.toJSON() : existing,
      newData: updatedUser.toJSON ? updatedUser.toJSON() : updatedUser,
      ipAddress,
      transaction
    });

    const changes = [];
    if (existing.firstName !== updatedUser.firstName || existing.lastName !== updatedUser.lastName) {
      changes.push(`Name changed from ${existing.firstName} ${existing.lastName} to ${updatedUser.firstName} ${updatedUser.lastName}`);
    }
    if (existing.email !== updatedUser.email) {
      changes.push(`Email changed from ${existing.email} to ${updatedUser.email}`);
    }
    if (existing.department !== updatedUser.department) {
      changes.push(`Department changed from ${existing.department} to ${updatedUser.department}`);
    }
    if (existing.managerId !== updatedUser.managerId) {
      changes.push(`Manager changed`);
    }
    if (existing.baseSalary !== updatedUser.baseSalary) {
      changes.push(`Salary updated`);
    }
    if (existing.isActive !== updatedUser.isActive) {
      changes.push(`Status changed to ${updatedUser.isActive ? 'Active' : 'Inactive'}`);
    }

    sendNotification(id, {
      type: "USER_UPDATED",
      title: "Profile Updated",
      message: `Your profile has been updated by ${actor.firstName} ${actor.lastName}.`,
      userId: id,
      changes: changes,
      updatedBy: `${actor.firstName} ${actor.lastName}`,
      updatedAt: new Date().toISOString()
    });

    sendNotification(actor.id, {
      type: "USER_UPDATED_SUCCESS",
      title: "User Updated Successfully",
      message: `User ${updatedUser.firstName} ${updatedUser.lastName} has been updated successfully.`,
      userId: id,
      employeeName: `${updatedUser.firstName} ${updatedUser.lastName}`,
      changes: changes
    });

    if (updatedUser.managerId && updatedUser.managerId !== actor.id) {
      sendNotification(updatedUser.managerId, {
        type: "TEAM_MEMBER_UPDATED",
        title: "Team Member Updated",
        message: `${updatedUser.firstName} ${updatedUser.lastName}'s profile has been updated.`,
        userId: id,
        employeeName: `${updatedUser.firstName} ${updatedUser.lastName}`,
        changes: changes
      });
    }

    if (existing.managerId && existing.managerId !== updatedUser.managerId && existing.managerId !== actor.id) {
      sendNotification(existing.managerId, {
        type: "TEAM_MEMBER_REMOVED",
        title: "Team Member Reassigned",
        message: `${updatedUser.firstName} ${updatedUser.lastName} has been moved from your team.`,
        userId: id,
        employeeName: `${updatedUser.firstName} ${updatedUser.lastName}`
      });
    }

    const adminIds = await userRepository.getAdminIds();
    adminIds.forEach(adminId => {
      if (adminId !== actor.id && adminId !== id) {
        sendNotification(adminId, {
          type: "USER_UPDATED_ADMIN",
          title: "User Profile Updated",
          message: `${actor.firstName} ${actor.lastName} updated ${updatedUser.firstName} ${updatedUser.lastName}'s profile.`,
          userId: id,
          employeeName: `${updatedUser.firstName} ${updatedUser.lastName}`,
          changes: changes,
          updatedBy: `${actor.firstName} ${actor.lastName}`
        });
      }
    });

    return updatedUser;
  });
};

const deleteUser = async (id, actor, ipAddress) => {
  const existing = await getUserById(id);
  await userRepository.softDeleteUser(id);

  await logAuditEvent({
    userId: actor.id,
    moduleName: 'User',
    actionType: 'DELETE',
    oldData: existing,
    newData: null,
    ipAddress
  });

  sendNotification(actor.id, {
    type: "USER_DELETED",
    title: "User Deleted",
    message: `User ${existing.firstName} ${existing.lastName} (${existing.email}) has been deleted.`,
    userId: id,
    employeeName: `${existing.firstName} ${existing.lastName}`,
    email: existing.email,
    deletedAt: new Date().toISOString()
  });

  if (existing.managerId && existing.managerId !== actor.id) {
    sendNotification(existing.managerId, {
      type: "TEAM_MEMBER_DELETED",
      title: "Team Member Removed",
      message: `${existing.firstName} ${existing.lastName} has been removed from the system.`,
      userId: id,
      employeeName: `${existing.firstName} ${existing.lastName}`
    });
  }

  const adminIds = await userRepository.getAdminIds();
  adminIds.forEach(adminId => {
    if (adminId !== actor.id) {
      sendNotification(adminId, {
        type: "USER_DELETED_ADMIN",
        title: "User Account Deleted",
        message: `${actor.firstName} ${actor.lastName} deleted user ${existing.firstName} ${existing.lastName}.`,
        userId: id,
        employeeName: `${existing.firstName} ${existing.lastName}`,
        email: existing.email,
        deletedBy: `${actor.firstName} ${actor.lastName}`
      });
    }
  });

  const hrTeamIds = await userRepository.getHRTeamIds();
  hrTeamIds.forEach(hrId => {
    if (hrId !== actor.id && !adminIds.includes(hrId)) {
      sendNotification(hrId, {
        type: "EMPLOYEE_OFFBOARDED",
        title: "Employee Offboarded",
        message: `${existing.firstName} ${existing.lastName} has been removed from the system.`,
        userId: id,
        employeeName: `${existing.firstName} ${existing.lastName}`,
        email: existing.email,
        department: existing.department
      });
    }
  });

  return { success: true };
};

const getDashboardSummary = async ({ year, page = 1, limit = 10 }) => {
  try {
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;
    const offset = (page - 1) * limit;

    const [
      totalUsers,
      leaveStats,
      newLeaves,
      expensesClaimed,
      salaryPaid,
      monthlyLeaves,
      usersData,
      allLeavesList,
      expensesList,
      monthlyExpenses,
      monthlySalary
    ] = await Promise.all([
      User.count(),
      
      LeaveRequest.findAll({
        attributes: [
          'status',
          [fn('COUNT', col('id')), 'count']
        ],
        where: {
          startDate: { [Op.between]: [start, end] }
        },
        group: ['status'],
        raw: true
      }),
      
      LeaveRequest.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      Expense.sum('amount', {
        where: {
          managerApprovalStatus: 'Approved',
          financeApprovalStatus: 'Approved',
          createdAt: { [Op.between]: [start, end] }
        }
      }),
      
      Payroll.sum('net_salary', {
        where: {
          status: { [Op.in]: ['Processed', 'Locked'] },
          processedAt: { [Op.between]: [start, end] }
        }
      }),
      
      LeaveRequest.findAll({
        attributes: [
          [fn('MONTH', col('start_date')), 'month'],
          [fn('COUNT', col('id')), 'count']
        ],
        where: {
          status: 'Approved',
          startDate: { [Op.between]: [start, end] }
        },
        group: [fn('MONTH', col('start_date'))],
        raw: true
      }),
      
      User.findAndCountAll({
        attributes: { exclude: ['passwordHash'] },
        limit: Number(limit),
        offset: Number(offset),
        order: [['createdAt', 'DESC']]
      }),
      
      LeaveRequest.findAndCountAll({
        where: {
          startDate: { [Op.between]: [start, end] }
        },
        include: [
          {
            model: User,
            as: 'employee',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        limit: Number(limit),
        offset: Number(offset),
        order: [['createdAt', 'DESC']]
      }),
      
      Expense.findAndCountAll({
        where: {
          createdAt: { [Op.between]: [start, end] }
        },
        include: [
          {
            model: User,
            as: 'employee',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        limit: Number(limit),
        offset: Number(offset),
        order: [['createdAt', 'DESC']]
      }),
      
      Expense.findAll({
        attributes: [
          [fn('MONTH', col('created_at')), 'month'],
          [fn('SUM', col('amount')), 'total']
        ],
        where: {
          managerApprovalStatus: 'Approved',
          financeApprovalStatus: 'Approved',
          createdAt: { [Op.between]: [start, end] }
        },
        group: [fn('MONTH', col('created_at'))],
        raw: true
      }),
      
      Payroll.findAll({
        attributes: [
          [fn('MONTH', col('processed_at')), 'month'],
          [fn('SUM', col('net_salary')), 'total']
        ],
        where: {
          status: { [Op.in]: ['Processed', 'Locked'] },
          processedAt: { [Op.between]: [start, end] }
        },
        group: [fn('MONTH', col('processed_at'))],
        raw: true
      })
    ]);

    const leaveMap = { Approved: 0, Pending: 0, Rejected: 0 };
    leaveStats.forEach(item => {
      leaveMap[item.status] = Number(item.count);
    });

    const formatMonthly = (data, key = 'count') => {
      const map = {};
      data.forEach(item => {
        map[item.month] = Number(item[key]);
      });

      return Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        value: map[i + 1] || 0
      }));
    };

    const cleanLeaves = allLeavesList.rows.map(leave => ({
      id: leave.id,
      status: leave.status,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
      employeeName: leave.employee
        ? `${leave.employee.firstName} ${leave.employee.lastName}`
        : null,
      employeeEmail: leave.employee?.email || null,
      approverName: leave.approver
        ? `${leave.approver.firstName} ${leave.approver.lastName}`
        : null,
      approverEmail: leave.approver?.email || null
    }));

    const cleanExpenses = expensesList.rows.map(exp => ({
      id: exp.id,
      amount: exp.amount,
      category: exp.category,
      status: `${exp.managerApprovalStatus} / ${exp.financeApprovalStatus}`,
      createdAt: exp.createdAt,
      employeeName: exp.employee
        ? `${exp.employee.firstName} ${exp.employee.lastName}`
        : null,
      employeeEmail: exp.employee?.email || null
    }));

    return {
      summary: {
        totalUsers,
        approvedLeaves: leaveMap.Approved,
        pendingLeaves: leaveMap.Pending,
        rejectedLeaves: leaveMap.Rejected,
        newLeaves,
        expensesClaimed: Number(expensesClaimed || 0),
        salaryPaid: Number(salaryPaid || 0)
      },
      charts: {
        leaves: formatMonthly(monthlyLeaves),
        expenses: formatMonthly(monthlyExpenses, 'total'),
        salary: formatMonthly(monthlySalary, 'total')
      },
      users: {
        data: usersData.rows,
        pagination: {
          total: usersData.count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(usersData.count / limit)
        }
      },
      leaves: {
        pending: cleanLeaves.filter(l => l.status === 'Pending'),
        approved: cleanLeaves.filter(l => l.status === 'Approved'),
        rejected: cleanLeaves.filter(l => l.status === 'Rejected'),
        all: {
          data: cleanLeaves,
          pagination: {
            total: allLeavesList.count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(allLeavesList.count / limit)
          }
        }
      },
      expenses: {
        total: Number(expensesClaimed || 0),
        all: {
          data: cleanExpenses,
          pagination: {
            total: expensesList.count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(expensesList.count / limit)
          }
        }
      },
      salary: {
        total: Number(salaryPaid || 0)
      }
    };
  } catch (error) {
    console.error('Dashboard Error:', error);
    throw error;
  }
};

const getUsersByDepartment = async (department) => {
  if (!department) {
    throw new Error('Department is required');
  }

  const users = await userRepository.getUsersByDepartment(department);

  return users;
};

module.exports = {
  getUsersByDepartment,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getDashboardSummary
};