// const { Op, fn, col } = require('sequelize');

// const {
//   User,
//   Role,
//   UserRole,
//   LeaveRequest,
//   Expense,
//   Payroll,
//   YearEndSummary
// } = require('../../database/initModels');
// const sequelize = require('../../database/sequelize');


// const findUsers = async ({ limit, offset, search }) => {
//   const where = search
//     ? {
//         [Op.or]: [
//           { firstName: { [Op.like]: `%${search}%` } },
//           { lastName: { [Op.like]: `%${search}%` } },
//           { email: { [Op.like]: `%${search}%` } }
//         ]
//       }
//     : {};

//   return User.findAndCountAll({
//     where,
//     attributes: { exclude: ['passwordHash'] },
//     include: [{ model: Role, attributes: ['name'] }],
//     limit,
//     offset,
//     order: [['createdAt', 'DESC']]
//   });
// };

// const findUserById = async (id) =>
//   User.findByPk(id, {
//     attributes: { exclude: ['passwordHash'] }
//   });

// const createUser = async (payload, transaction) => User.create(payload, { transaction });

// const updateUserById = async (id, payload) => User.update(payload, { where: { id } });

// const softDeleteUser = async (id) => User.destroy({ where: { id } });

// const findOrCreateRole = async (name, transaction) =>
//   Role.findOrCreate({ where: { name }, defaults: { name }, transaction });

// const mapRoleToUser = async (userId, roleId, transaction) =>
//   UserRole.findOrCreate({ where: { userId, roleId }, defaults: { userId, roleId }, transaction });

// const countApprovedLeaves = async (employeeId) =>
//   LeaveRequest.count({ where: { employeeId, status: 'Approved' } });

// const sumApprovedExpenses = async (employeeId) => {
//   const result = await Expense.findOne({
//     where: { employeeId, financeApprovalStatus: 'Approved' },
//     attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'total']]
//   });

//   return Number(result?.get('total') || 0);
// };

// const sumSalaryByYear = async (employeeId, year) => {
//   const result = await Payroll.findOne({
//     where: { employeeId, year, status: { [Op.in]: ['Processed', 'Locked'] } },
//     attributes: [[fn('COALESCE', fn('SUM', col('net_salary')), 0), 'total']]
//   });

//   return Number(result?.get('total') || 0);
// };

// const findYearEndSummary = async (employeeId, year) =>
//   YearEndSummary.findOne({ where: { employeeId, year } });



// const findUserByEmail = async (email) => 
//   User.findOne({ where: { email } });

// const getUsersByDepartment = (department) =>
//   User.findAll({
//     where: { department },
//     attributes: {
//       exclude: ['passwordHash', 'deletedAt']
//     },
//     order: [['createdAt', 'DESC']]
//   });

//   const getAdminIds = async () => {
//   try {
//     const admins = await User.findAll({
//       where: {
//         role: { [Op.in]: ['ADMIN'] }
//       },
//       attributes: ['id'],
//       raw: true
//     });
//     return admins.map(admin => admin.id);
//   } catch (error) {
//     console.error('Error fetching admin IDs:', error);
//     return [];
//   }
// };

// const getHRTeamIds = async () => {
//   try {
//     const hrUsers = await User.findAll({
//       where: {
//         role: { [Op.in]: ['HR', 'HR_MANAGER'] }
//       },
//       attributes: ['id'],
//       raw: true
//     });
//     return hrUsers.map(user => user.id);
//   } catch (error) {
//     console.error('Error fetching HR team IDs:', error);
//     return [];
//   }
// };



// module.exports = {
//   getAdminIds,
//   getHRTeamIds,
//   getUsersByDepartment,
//   findUsers,
//   findUserById,
//   createUser,
//   findUserByEmail,
//   updateUserById,
//   softDeleteUser,
//   findOrCreateRole,
//   mapRoleToUser,
//   countApprovedLeaves,
//   sumApprovedExpenses,
//   sumSalaryByYear,
//   findYearEndSummary
// };

'use strict';

const { Op, fn, col } = require('sequelize');
const { User, LeaveRequest, Expense, Payroll } = require('../../database/initModels');
const { formatMonthly, buildPagination, cleanLeave, cleanExpense } = require('./userFormatter');

const buildDateRange = (year) => {
  if (!Number.isInteger(year)) {
    throw new Error(`Invalid year: ${year}`);
  }

  return {
    start: new Date(Date.UTC(year, 0, 1)),
    end: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))
  };
};

const getLast7DaysRange = () => ({
  last7Days: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
});

// -----------------------------
// Summary Stats
// -----------------------------
const getSummaryStats = async (year, canViewFinance) => {
  const { start, end } = buildDateRange(year);
  const { last7Days } = getLast7DaysRange();

  try {
    const queries = [
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
            [Op.and]: [
              { [Op.gte]: last7Days },
              { [Op.between]: [start, end] }
            ]
          }
        }
      })
    ];

    if (canViewFinance) {
      queries.push(
        Expense.sum('amount', {
          where: {
            managerApprovalStatus: 'Approved',
            financeApprovalStatus: 'Approved',
            createdAt: { [Op.between]: [start, end] }
          }
        }),

        Payroll.sum('netSalary', {
          where: {
            status: { [Op.in]: ['Processed', 'Locked'] },
            processedAt: { [Op.between]: [start, end] }
          }
        })
      );
    }

    const [totalUsers, leaveStats, newLeaves, expensesClaimed, salaryPaid] = await Promise.all(queries);

    const leaveMap = {};
    leaveStats.forEach(({ status, count }) => {
      leaveMap[status] = Number(count);
    });

    return {
      totalUsers,
      leaves: {
        approved: leaveMap.Approved || 0,
        pending: leaveMap.Pending || 0,
        rejected: leaveMap.Rejected || 0
      },
      newLeaves,
      finance: canViewFinance
        ? {
          expensesClaimed: Number(expensesClaimed || 0),
          salaryPaid: Number(salaryPaid || 0)
        }
        : null
    };
  } catch (error) {
    throw new Error('Dashboard summary failed', { cause: error });
  }
};

// -----------------------------
// Chart Data
// -----------------------------
const getChartData = async (year, canViewFinance) => {
  const { start, end } = buildDateRange(year);

  try {
    const queries = [
      LeaveRequest.findAll({
        attributes: [
          [fn('MONTH', col('startDate')), 'month'],
          [fn('COUNT', col('id')), 'count']
        ],
        where: {
          status: 'Approved',
          startDate: { [Op.between]: [start, end] }
        },
        group: [fn('MONTH', col('startDate'))],
        raw: true
      })
    ];

    if (canViewFinance) {
      queries.push(
        Expense.findAll({
          attributes: [
            [fn('MONTH', col('createdAt')), 'month'],
            [fn('SUM', col('amount')), 'total']
          ],
          where: {
            managerApprovalStatus: 'Approved',
            financeApprovalStatus: 'Approved',
            createdAt: { [Op.between]: [start, end] }
          },
          group: [fn('MONTH', col('createdAt'))],
          raw: true
        }),

        Payroll.findAll({
          attributes: [
            [fn('MONTH', col('processedAt')), 'month'],
            [fn('SUM', col('netSalary')), 'total']
          ],
          where: {
            status: { [Op.in]: ['Processed', 'Locked'] },
            processedAt: { [Op.between]: [start, end] }
          },
          group: [fn('MONTH', col('processedAt'))],
          raw: true
        })
      );
    }

    const [leaves, expenses = [], salary = []] = await Promise.all(queries);

    return {
      leaves: formatMonthly(leaves),
      expenses: canViewFinance ? formatMonthly(expenses, 'total') : null,
      salary: canViewFinance ? formatMonthly(salary, 'total') : null
    };
  } catch (error) {
    throw new Error('Chart data failed', { cause: error });
  }
};

// -----------------------------
// Leave Data (Paginated)
// -----------------------------
const getLeaveData = async (year, page = 1, limit = 10) => {
  const { start, end } = buildDateRange(year);
  const offset = (page - 1) * limit;

  try {
    const [result, statusCounts] = await Promise.all([
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
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      }),

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
      })
    ]);

    const countMap = {};
    statusCounts.forEach(({ status, count }) => {
      countMap[status] = Number(count);
    });

    return {
      segmented: {
        pending: countMap.Pending || 0,
        approved: countMap.Approved || 0,
        rejected: countMap.Rejected || 0
      },
      all: {
        data: result.rows.map(cleanLeave),
        pagination: buildPagination(result.count, page, limit)
      }
    };
  } catch (error) {
    throw new Error('Leave data fetch failed', { cause: error });
  }
};

// -----------------------------
// Expense Data
// -----------------------------
const getExpenseData = async (year, page = 1, limit = 10, role) => {
  const { start, end } = buildDateRange(year);
  const offset = (page - 1) * limit;

  try {
    const where = {
      createdAt: { [Op.between]: [start, end] }
    };

    if (role === 'Manager') {
      where.managerApprovalStatus = 'Pending';
    }

    if (role === 'Finance') {
      where.financeApprovalStatus = 'Pending';
    }

    const result = await Expense.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      data: result.rows.map(cleanExpense),
      pagination: buildPagination(result.count, page, limit)
    };
  } catch (error) {
    throw new Error('Expense data fetch failed', { cause: error });
  }
};

// -----------------------------
// User List
// -----------------------------
const getUserListData = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  try {
    const result = await User.findAndCountAll({
      attributes: { exclude: ['passwordHash'] },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      data: result.rows,
      pagination: buildPagination(result.count, page, limit)
    };
  } catch (error) {
    throw new Error('User list fetch failed', { cause: error });
  }
};

module.exports = {
  getSummaryStats,
  getChartData,
  getLeaveData,
  getExpenseData,
  getUserListData
};