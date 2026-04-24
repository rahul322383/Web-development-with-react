
'use strict';

const { Op, fn, col, QueryTypes } = require('sequelize');
const { User, LeaveRequest, Expense, Payroll } = require('../../database/initModels');
const { formatMonthly, buildPagination, cleanLeave, cleanExpense } = require('./userFormatter');
const sequelize = require('../../database/sequelize');


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

const findUsers = async ({ limit, offset, search }) => {
  const where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
  }

  return await User.findAndCountAll({
    attributes: { exclude: ['passwordHash'] },
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });
};

const getUsersByDepartment = (department) => {
  return sequelize.query(`
    SELECT 
      id,
      employee_code,
      role_id,
      first_name,
      last_name,
      email,
      manager_id,
      department,
      base_salary,
      is_active,
      created_at,
      updated_at
    FROM users
    WHERE LOWER(department) = :department
  `, {
    replacements: { department: department.toLowerCase() },
    type: QueryTypes.SELECT
  });
};

module.exports = {
  getUsersByDepartment,
  findUsers,
  getSummaryStats,
  getChartData,
  getLeaveData,
  getExpenseData,
  getUserListData
};