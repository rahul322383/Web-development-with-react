const bcrypt = require('bcrypt');
const sequelize = require('../../database/sequelize');
const AppError = require('../../utils/AppError');
const userRepository = require('./userRepository');
const { getCache, setCache, clearCacheKeys } = require('../../utils/cache');
const { logAuditEvent } = require('../../utils/auditLogger');
const { Op, fn, col, literal } = require('sequelize');

const { User, Leave, Expense, Payroll } = require('../../models');

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
  const existing = await getUserById(id);
  await userRepository.updateUserById(id, payload);

  await clearCacheKeys([`dashboard_summary:${id}:${new Date().getFullYear()}`]);

  await logAuditEvent({
    userId: actor.id,
    moduleName: 'User',
    actionType: 'UPDATE',
    oldData: existing,
    newData: payload,
    ipAddress
  });

  return userRepository.findUserById(id);
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






const getDashboardSummary = async ({ year }) => {
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;

  const [
    totalUsers,
    approvedLeaves,
    expensesClaimed,
    salaryPaid,
    monthlyLeaves,
    monthlyExpenses,
    monthlySalary
  ] = await Promise.all([

    // 👥 USERS
    User.count(),

    // 📅 LEAVES
    Leave.count({
      where: {
        status: 'Approved',
        startDate: { [Op.between]: [start, end] }
      }
    }),

//     // 💸 EXPENSES ✅ FIXED
// Expense.sum('amount', {
//   where: {
//     managerApprovalStatus: 'Approved',
//     financeApprovalStatus: 'Approved',
//     createdAt: { [Op.between]: [start, end] }
//   }
// }),

    // 💰 SALARY
    // Payroll.sum('amount', {
    //   where: {
    //     status: 'Paid',
    //     paymentDate: { [Op.between]: [start, end] }
    //   }
    // }),

    // 📊 MONTHLY LEAVES
    Leave.findAll({
      attributes: [
        [fn('MONTH', col('startDate')), 'month'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        status: 'Approved',
        startDate: { [Op.between]: [start, end] }
      },
      group: [literal('month')],
      raw: true
    }),

//     // 📊 MONTHLY EXPENSES ✅ FIXED
// Expense.findAll({
//   attributes: [
//     [fn('MONTH', col('createdAt')), 'month'],
//     [fn('SUM', col('amount')), 'total']
//   ]
// }),
    // 📊 MONTHLY SALARY
  //   Payroll.findAll({
  //     attributes: [
  //       [fn('MONTH', col('paymentDate')), 'month'],
  //       [fn('SUM', col('amount')), 'total']
  //     ],
  //     where: {
  //       status: 'Paid',
  //       paymentDate: { [Op.between]: [start, end] }
  //     },
  //     group: [literal('month')],
  //     raw: true
  //   })
  ]);
console.log('Dashboard Summary:', {
  totalUsers,
  approvedLeaves,
  expensesClaimed,
  salaryPaid,
  monthlyLeaves,
  monthlyExpenses,
  monthlySalary
});
  return {
    summary: {
      totalUsers,
      approvedLeaves,
      // expensesClaimed: expensesClaimed || 0,
      salaryPaid: salaryPaid || 0
    },
    charts: {
      leaves: monthlyLeaves,
      // expenses: monthlyExpenses,
      salary: monthlySalary
    }
  };
};



module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getDashboardSummary
};