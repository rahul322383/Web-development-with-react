
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


// 'use strict';

// const logger = require('../../config/logger');
// const analyticsRepository = require('./analyticsRepository');

// // ─── helpers ────────────────────────────────────────────────────────────────

// /**
//  * Parse and validate the ?startDate / ?endDate query params.
//  * Defaults: last 12 months → today.
//  */
// const parseDateRange = ({ startDate, endDate } = {}) => {
//   const end = endDate ? new Date(endDate) : new Date();
//   const start = startDate ? new Date(startDate) : new Date(new Date().setFullYear(end.getFullYear() - 1));

//   if (isNaN(start) || isNaN(end)) {
//     throw Object.assign(new Error('Invalid date range supplied'), { statusCode: 400 });
//   }

//   if (start >= end) {
//     throw Object.assign(new Error('startDate must be before endDate'), { statusCode: 400 });
//   }

//   // normalize: start = 00:00:00, end = 23:59:59
//   start.setHours(0, 0, 0, 0);
//   end.setHours(23, 59, 59, 999);

//   return { startDate: start, endDate: end };
// };

// // ────────────────────────────────────────────────────────────────────────────
// //  ATTRITION
// // ────────────────────────────────────────────────────────────────────────────

// const getAttritionSummary = async (query = {}) => {
//   try {
//     const { startDate, endDate } = parseDateRange(query);
//     const department = query.department || null;

//     const [overall, byDepartment] = await Promise.all([
//       analyticsRepository.getAttritionData({ startDate, endDate, department }),
//       analyticsRepository.getAttritionByDepartment({ startDate, endDate }),
//     ]);

//     return {
//       success: true,
//       data: {
//         period: {
//           startDate: startDate.toISOString().split('T')[0],
//           endDate: endDate.toISOString().split('T')[0],
//         },
//         overall,
//         byDepartment,
//       },
//     };
//   } catch (error) {
//     logger.error({ event: 'ANALYTICS_ATTRITION_FAILED', error: error.message, stack: error.stack });
//     return {
//       success: false,
//       message: error.message || 'Failed to fetch attrition data',
//       statusCode: error.statusCode || 500,
//     };
//   }
// };

// // ────────────────────────────────────────────────────────────────────────────
// //  DEPARTMENT PERFORMANCE
// // ────────────────────────────────────────────────────────────────────────────

// const getDepartmentPerformance = async (query = {}) => {
//   try {
//     const department = query.department || null;
//     const rows = await analyticsRepository.getDepartmentPerformance({ department });

//     return { success: true, data: rows };
//   } catch (error) {
//     logger.error({ event: 'ANALYTICS_DEPT_PERF_FAILED', error: error.message, stack: error.stack });
//     return {
//       success: false,
//       message: error.message || 'Failed to fetch department performance',
//       statusCode: error.statusCode || 500,
//     };
//   }
// };

// // ────────────────────────────────────────────────────────────────────────────
// //  LEAVE TRENDS
// // ────────────────────────────────────────────────────────────────────────────

// const getLeaveTrends = async (query = {}) => {
//   try {
//     const { startDate, endDate } = parseDateRange(query);
//     const department = query.department || null;

//     const [monthly, statusBreakdown] = await Promise.all([
//       analyticsRepository.getLeaveTrends({ startDate, endDate, department }),
//       analyticsRepository.getLeaveStatusBreakdown({ startDate, endDate }),
//     ]);

//     return {
//       success: true,
//       data: {
//         period: {
//           startDate: startDate.toISOString().split('T')[0],
//           endDate: endDate.toISOString().split('T')[0],
//         },
//         monthly,
//         statusBreakdown,
//       },
//     };
//   } catch (error) {
//     logger.error({ event: 'ANALYTICS_LEAVES_FAILED', error: error.message, stack: error.stack });
//     return {
//       success: false,
//       message: error.message || 'Failed to fetch leave trends',
//       statusCode: error.statusCode || 500,
//     };
//   }
// };

// // ────────────────────────────────────────────────────────────────────────────
// //  COST PER EMPLOYEE
// // ────────────────────────────────────────────────────────────────────────────

// const getCostPerEmployee = async (query = {}) => {
//   try {
//     const { startDate, endDate } = parseDateRange(query);
//     const department = query.department || null;

//     const [overall, byDepartment] = await Promise.all([
//       analyticsRepository.getCostPerEmployee({ startDate, endDate, department }),
//       analyticsRepository.getCostByDepartment({ startDate, endDate }),
//     ]);

//     return {
//       success: true,
//       data: {
//         period: {
//           startDate: startDate.toISOString().split('T')[0],
//           endDate: endDate.toISOString().split('T')[0],
//         },
//         overall,
//         byDepartment,
//       },
//     };
//   } catch (error) {
//     logger.error({ event: 'ANALYTICS_COST_FAILED', error: error.message, stack: error.stack });
//     return {
//       success: false,
//       message: error.message || 'Failed to fetch cost data',
//       statusCode: error.statusCode || 500,
//     };
//   }
// };

// // ────────────────────────────────────────────────────────────────────────────
// //  COMBINED DASHBOARD  (single API call → all metrics)
// // ────────────────────────────────────────────────────────────────────────────

// const getDashboard = async (query = {}) => {
//   try {
//     const { startDate, endDate } = parseDateRange(query);
//     const department = query.department || null;

//     const [
//       attritionOverall,
//       attritionByDept,
//       deptPerformance,
//       leaveMonthly,
//       leaveStatus,
//       costOverall,
//       costByDept,
//     ] = await Promise.all([
//       analyticsRepository.getAttritionData({ startDate, endDate, department }),
//       analyticsRepository.getAttritionByDepartment({ startDate, endDate }),
//       analyticsRepository.getDepartmentPerformance({ department }),
//       analyticsRepository.getLeaveTrends({ startDate, endDate, department }),
//       analyticsRepository.getLeaveStatusBreakdown({ startDate, endDate }),
//       analyticsRepository.getCostPerEmployee({ startDate, endDate, department }),
//       analyticsRepository.getCostByDepartment({ startDate, endDate }),
//     ]);

//     return {
//       success: true,
//       data: {
//         period: {
//           startDate: startDate.toISOString().split('T')[0],
//           endDate: endDate.toISOString().split('T')[0],
//         },
//         attrition: {
//           overall: attritionOverall,
//           byDepartment: attritionByDept,
//         },
//         departmentPerformance: deptPerformance,
//         leaveTrends: {
//           monthly: leaveMonthly,
//           statusBreakdown: leaveStatus,
//         },
//         costPerEmployee: {
//           overall: costOverall,
//           byDepartment: costByDept,
//         },
//       },
//     };
//   } catch (error) {
//     logger.error({ event: 'ANALYTICS_DASHBOARD_FAILED', error: error.message, stack: error.stack });
//     return {
//       success: false,
//       message: error.message || 'Failed to fetch dashboard data',
//       statusCode: error.statusCode || 500,
//     };
//   }
// };

// module.exports = {
//   getAttritionSummary,
//   getDepartmentPerformance,
//   getLeaveTrends,
//   getCostPerEmployee,
//   getDashboard,
// };

module.exports = {
  getUsersByDepartment,
  findUsers,
  getSummaryStats,
  getChartData,
  getLeaveData,
  getExpenseData,
  getUserListData
};