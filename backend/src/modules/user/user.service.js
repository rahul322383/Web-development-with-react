const bcrypt = require('bcrypt');
const sequelize = require('../../database/sequelize');
const AppError = require('../../utils/AppError');
const userRepository = require('./userRepository');
const { getCache, setCache, clearCacheKeys } = require('../../utils/cache');
const { logAuditEvent } = require('../../utils/auditLogger');
const { Op, fn, col, literal } = require('sequelize');

const {
  User,
  LeaveRequest,
  Expense,
  Payroll
} = require('../../database/initModels');
const { get } = require('./user.routes');


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

    return userRepository.findUserById(createdUser.id);
  });
 


const updateUser = async (id, payload, actor, ipAddress) => {
  return sequelize.transaction(async (transaction) => {

    // 1. Check existing user
    const existing = await getUserById(id, transaction);
    if (!existing) {
      return res .status(404).json({ success: false, message: 'User not found' });
    }

    // 2. Map payload to DB fields (important)
    const mappedPayload = {
      employee_code: payload.employeeCode,
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      manager_id: payload.managerId,
      department: payload.department,
      base_salary: payload.baseSalary,
      is_active: payload.isActive,
      role: payload.role   // ✅ direct update now
    };
    

    // remove undefined values
    Object.keys(mappedPayload).forEach(
      key => mappedPayload[key] === undefined && delete mappedPayload[key]
    );

    // 3. Update user
    await userRepository.updateUserById(id, mappedPayload, transaction);

    // 4. Fetch updated user
    const updatedUser = await userRepository.findUserById(id, transaction);


    // 5. Clear cache
    await clearCacheKeys([
      `dashboard_summary:${id}:${new Date().getFullYear()}`
    ]);

    // 6. Audit log
    await logAuditEvent({
      userId: actor.id,
      moduleName: 'User',
      actionType: 'UPDATE',
      oldData: existing.toJSON ? existing.toJSON() : existing,
      newData: updatedUser.toJSON ? updatedUser.toJSON() : updatedUser,
      ipAddress,
      transaction
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

      // 👥 TOTAL USERS
      User.count(),

      // 📊 LEAVE STATUS COUNTS
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

      // 🆕 NEW LEAVES (LAST 7 DAYS)
      LeaveRequest.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // 💸 TOTAL EXPENSES
      Expense.sum('amount', {
        where: {
          managerApprovalStatus: 'Approved',
          financeApprovalStatus: 'Approved',
          createdAt: { [Op.between]: [start, end] }
        }
      }),

      // 💰 TOTAL SALARY
      Payroll.sum('net_salary', {
        where: {
          status: { [Op.in]: ['Processed', 'Locked'] },
          processedAt: { [Op.between]: [start, end] }
        }
      }),

      // 📊 MONTHLY LEAVES
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

      // 👥 USERS LIST
      User.findAndCountAll({
        attributes: { exclude: ['passwordHash'] },
        limit: Number(limit),
        offset: Number(offset),
        order: [['createdAt', 'DESC']]
      }),

      // 📋 ALL LEAVES
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

      // 📋 ALL EXPENSES (NEW)
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

      // 📊 MONTHLY EXPENSES (NEW)
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

      // 📊 MONTHLY SALARY (NEW)
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

    // 🔥 LEAVE STATUS FORMAT
    const leaveMap = { Approved: 0, Pending: 0, Rejected: 0 };
    leaveStats.forEach(item => {
      leaveMap[item.status] = Number(item.count);
    });

    // 📊 MONTH FORMATTER
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

    // 🧹 CLEAN LEAVES
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

    // 🧹 CLEAN EXPENSES (NEW)
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

      // 💸 EXPENSES (NEW)
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

      // 💰 SALARY (NEW)
      salary: {
        total: Number(salaryPaid || 0)
      }
    };

  } catch (error) {
    console.error('Dashboard Error:', error);
    throw error;
  }
};




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
//       allLeavesList
//     ] = await Promise.all([

//       // 👥 USERS COUNT
//       User.count(),

//       // 🔥 SINGLE QUERY FOR LEAVE COUNTS
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

//       // 🆕 NEW LEAVES (LAST 7 DAYS)
//       LeaveRequest.count({
//         where: {
//           createdAt: {
//             [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
//           }
//         }
//       }),

//       // 💸 EXPENSES
//       Expense.sum('amount', {
//         where: {
//           managerApprovalStatus: 'Approved',
//           financeApprovalStatus: 'Approved',
//           createdAt: { [Op.between]: [start, end] }
//         }
//       }),

//       // 💰 SALARY
//       Payroll.sum('net_salary', {
//         where: {
//           status: { [Op.in]: ['Processed', 'Locked'] },
//           processedAt: { [Op.between]: [start, end] }
//         }
//       }),

//       // 📊 MONTHLY APPROVED LEAVES
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

//       // 👥 USERS LIST
//       User.findAndCountAll({
//         attributes: { exclude: ['passwordHash'] },
//         limit: Number(limit),
//         offset: Number(offset),
//         order: [['createdAt', 'DESC']]
//       }),

//       // 🔥 ALL LEAVES (FIXED ALIAS)
//       LeaveRequest.findAndCountAll({
//         where: {
//           startDate: { [Op.between]: [start, end] }
//         },
//         include: [
//           {
//             model: User,
//             as: 'employee', // ✅ correct
//             attributes: ['id', 'firstName', 'lastName', 'email']
//           },
//           {
//             model: User,
//             as: 'approver', // ✅ FIXED (not 'manager')
//             attributes: ['id', 'firstName', 'lastName', 'email']
//           }
//         ],
//         limit: Number(limit),
//         offset: Number(offset),
//         order: [['createdAt', 'DESC']]
//       })

//     ]);

//     // 🔥 FORMAT LEAVE COUNTS
//     const leaveMap = {
//       Approved: 0,
//       Pending: 0,
//       Rejected: 0
//     };

//     leaveStats.forEach(item => {
//       leaveMap[item.status] = Number(item.count);
//     });

//     // 📊 FORMAT MONTHLY
//     const formatMonthly = (data) => {
//       const map = {};
//       data.forEach(item => {
//         map[item.month] = Number(item.count);
//       });

//       return Array.from({ length: 12 }, (_, i) => ({
//         month: i + 1,
//         value: map[i + 1] || 0
//       }));
//     };

//     // 🔥 CLEAN LEAVE RESPONSE
//     const cleanLeaves = allLeavesList.rows.map(leave => ({
//       id: leave.id,
//       status: leave.status,
//       startDate: leave.startDate,
//       endDate: leave.endDate,
//       reason: leave.reason,

//       // 👤 Employee
//       employeeName: leave.employee
//         ? `${leave.employee.firstName} ${leave.employee.lastName}`
//         : null,

//       employeeEmail: leave.employee?.email || null,

//       // 👨‍💼 Approver
//       approverName: leave.approver
//         ? `${leave.approver.firstName} ${leave.approver.lastName}`
//         : null,

//       approverEmail: leave.approver?.email || null
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
//         leaves: formatMonthly(monthlyLeaves)
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

//       // 🔥 FINAL LEAVES OUTPUT
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
//       }
//     };

//   } catch (error) {
//     console.error('Dashboard Error:', error);
//     throw error;
//   }
// };

//get user by department
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