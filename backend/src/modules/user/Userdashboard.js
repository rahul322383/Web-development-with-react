'use strict';

const { Op, fn, col, literal } = require('sequelize');
const { User, LeaveRequest, Expense, Payroll } = require('../../database/initModels');
const { formatMonthly, buildPagination, cleanLeave, cleanExpense } = require('./userFormatter');



const buildDateRange = (yearInput) => {
    const year = Number(
        typeof yearInput === 'object' ? yearInput.year : yearInput
    );

    if (!Number.isInteger(year)) {
        throw new Error(`Invalid year received: ${year}`);
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

        const results = await Promise.all(queries);

        const [totalUsers, leaveStats, newLeaves, expensesClaimed, salaryPaid] = results;

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
        throw new Error(`Dashboard summary failed: ${error.message}`);
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
        throw new Error(`Chart data failed: ${error.message}`);
    }
};

// -----------------------------
// Leave Data (Paginated)
// -----------------------------
const getLeaveData = async (year, page = 1, limit = 10) => {
    const { start, end } = buildDateRange(year);
    const offset = (page - 1) * limit;

    try {
        const result = await LeaveRequest.findAndCountAll({
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
        });

        const rows = result.rows.map(cleanLeave);

        return {
            segmented: {
                pending: rows.filter(l => l.status === 'Pending'),
                approved: rows.filter(l => l.status === 'Approved'),
                rejected: rows.filter(l => l.status === 'Rejected')
            },
            all: {
                data: rows,
                pagination: buildPagination(result.count, page, limit)
            }
        };

    } catch (error) {
        throw new Error(`Leave data fetch failed: ${error.message}`);
    }
};

// -----------------------------
// Expense Data (Optimized Filtering)
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
        throw new Error(`Expense data fetch failed: ${error.message}`);
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
        throw new Error(`User list fetch failed: ${error.message}`);
    }
};





// 'use strict';

// const { Op, fn, col, literal } = require('sequelize');
// const sequelize = require('../../database/sequelize');

// // ─── lazy-load to avoid circular imports (same pattern as authRepository) ───
// const getModels = () => require('../../database/initModels');

// // ────────────────────────────────────────────────────────────────────────────
// //  ATTRITION
// // ────────────────────────────────────────────────────────────────────────────

// /**
//  * Returns active + inactive counts for the given date window.
//  * "Left" = isActive:false AND updatedAt falls inside the window.
//  */
// const getAttritionData = async ({ startDate, endDate, department } = {}) => {
//     const { User } = getModels();

//     const baseWhere = {};
//     if (department) baseWhere.department = department;

//     const [totalActive, leftInPeriod, totalAtPeriodStart] = await Promise.all([
//         // currently active
//         User.count({ where: { ...baseWhere, isActive: true } }),

//         // left (became inactive) within the window
//         User.count({
//             where: {
//                 ...baseWhere,
//                 isActive: false,
//                 updatedAt: { [Op.between]: [startDate, endDate] },
//             },
//         }),

//         // everyone who existed at period start (active + left)
//         User.count({
//             where: {
//                 ...baseWhere,
//                 createdAt: { [Op.lte]: endDate },
//             },
//         }),
//     ]);

//     const avgEmployees = totalAtPeriodStart - leftInPeriod / 2;
//     const attritionRate =
//         avgEmployees > 0
//             ? parseFloat(((leftInPeriod / avgEmployees) * 100).toFixed(2))
//             : 0;

//     return { totalActive, leftInPeriod, totalAtPeriodStart, attritionRate };
// };

// /**
//  * Attrition broken down by department.
//  */
// const getAttritionByDepartment = async ({ startDate, endDate } = {}) => {
//     const { User } = getModels();

//     const rows = await User.findAll({
//         attributes: [
//             'department',
//             [fn('COUNT', col('id')), 'total'],
//             [
//                 fn(
//                     'SUM',
//                     literal(
//                         `CASE WHEN is_active = 0 AND updated_at BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}' THEN 1 ELSE 0 END`
//                     )
//                 ),
//                 'left_count',
//             ],
//         ],
//         where: {
//             department: { [Op.ne]: null },
//             createdAt: { [Op.lte]: endDate },
//         },
//         group: ['department'],
//         raw: true,
//     });

//     return rows.map((r) => ({
//         department: r.department,
//         total: Number(r.total),
//         leftCount: Number(r.left_count),
//         attritionRate:
//             r.total > 0
//                 ? parseFloat(((r.left_count / r.total) * 100).toFixed(2))
//                 : 0,
//     }));
// };

// // ────────────────────────────────────────────────────────────────────────────
// //  DEPARTMENT PERFORMANCE  (avg baseSalary used as proxy if no rating table)
// // ────────────────────────────────────────────────────────────────────────────

// /**
//  * Head-count + avg base salary per department.
//  * Swap the AVG column to a real rating field once you add it.
//  */
// const getDepartmentPerformance = async ({ department } = {}) => {
//     const { User } = getModels();

//     const where = { isActive: true, department: { [Op.ne]: null } };
//     if (department) where.department = department;

//     const rows = await User.findAll({
//         attributes: [
//             'department',
//             [fn('COUNT', col('id')), 'headCount'],
//             [fn('AVG', col('base_salary')), 'avgSalary'],
//         ],
//         where,
//         group: ['department'],
//         raw: true,
//     });

//     return rows.map((r) => ({
//         department: r.department,
//         headCount: Number(r.headCount),
//         avgSalary: parseFloat(Number(r.avgSalary).toFixed(2)),
//     }));
// };

// // ────────────────────────────────────────────────────────────────────────────
// //  LEAVE TRENDS
// // ────────────────────────────────────────────────────────────────────────────

// /**
//  * Monthly leave counts (approved only) within the date window.
//  */
// const getLeaveTrends = async ({ startDate, endDate, department } = {}) => {
//     const { LeaveRequest, User } = getModels();

//     const include = department
//         ? [{ model: User, as: 'employee', attributes: [], where: { department }, required: true }]
//         : [];

//     const rows = await LeaveRequest.findAll({
//         attributes: [
//             [fn('YEAR', col('LeaveRequest.start_date')), 'year'],
//             [fn('MONTH', col('LeaveRequest.start_date')), 'month'],
//             [fn('COUNT', col('LeaveRequest.id')), 'leaveCount'],
//             [fn('SUM', col('LeaveRequest.days_requested')), 'totalDays'],
//         ],
//         where: {
//             status: 'Approved',
//             startDate: { [Op.between]: [startDate, endDate] },
//         },
//         include,
//         group: [
//             fn('YEAR', col('LeaveRequest.start_date')),
//             fn('MONTH', col('LeaveRequest.start_date')),
//         ],
//         order: [
//             [fn('YEAR', col('LeaveRequest.start_date')), 'ASC'],
//             [fn('MONTH', col('LeaveRequest.start_date')), 'ASC'],
//         ],
//         raw: true,
//     });

//     const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

//     return rows.map((r) => ({
//         year: Number(r.year),
//         month: Number(r.month),
//         monthLabel: monthNames[Number(r.month) - 1],
//         leaveCount: Number(r.leaveCount),
//         totalDays: Number(r.totalDays),
//     }));
// };

// /**
//  * Leave status breakdown (Pending / Approved / Rejected).
//  */
// const getLeaveStatusBreakdown = async ({ startDate, endDate } = {}) => {
//     const { LeaveRequest } = getModels();

//     const rows = await LeaveRequest.findAll({
//         attributes: [
//             'status',
//             [fn('COUNT', col('id')), 'count'],
//         ],
//         where: { startDate: { [Op.between]: [startDate, endDate] } },
//         group: ['status'],
//         raw: true,
//     });

//     return rows.map((r) => ({ status: r.status, count: Number(r.count) }));
// };

// // ────────────────────────────────────────────────────────────────────────────
// //  COST PER EMPLOYEE
// // ────────────────────────────────────────────────────────────────────────────

// /**
//  * Average net salary per employee from payrolls in the given month/year window.
//  */
// const getCostPerEmployee = async ({ startDate, endDate, department } = {}) => {
//     const { Payroll, User } = getModels();

//     const startYear = startDate.getFullYear();
//     const startMonth = startDate.getMonth() + 1;
//     const endYear = endDate.getFullYear();
//     const endMonth = endDate.getMonth() + 1;

//     const payrollWhere = {
//         status: 'Processed',
//         [Op.or]: [
//             {
//                 year: startYear,
//                 month: { [Op.gte]: startMonth },
//             },
//             {
//                 year: { [Op.gt]: startYear, [Op.lt]: endYear },
//             },
//             {
//                 year: endYear,
//                 month: { [Op.lte]: endMonth },
//             },
//         ],
//     };

//     const include = department
//         ? [{ model: User, as: 'employee', attributes: [], where: { department }, required: true }]
//         : [];

//     const rows = await Payroll.findAll({
//         attributes: [
//             [fn('COUNT', literal('DISTINCT employee_id')), 'employeeCount'],
//             [fn('SUM', col('net_salary')), 'totalSalary'],
//             [fn('AVG', col('net_salary')), 'avgSalary'],
//         ],
//         where: payrollWhere,
//         include,
//         raw: true,
//     });

//     const r = rows[0] || {};
//     return {
//         employeeCount: Number(r.employeeCount || 0),
//         totalSalary: parseFloat(Number(r.totalSalary || 0).toFixed(2)),
//         avgSalary: parseFloat(Number(r.avgSalary || 0).toFixed(2)),
//     };
// };

// /**
//  * Cost per employee broken down by department.
//  */
// const getCostByDepartment = async ({ startDate, endDate } = {}) => {
//     const { Payroll, User } = getModels();

//     const startYear = startDate.getFullYear();
//     const endYear = endDate.getFullYear();
//     const startMonth = startDate.getMonth() + 1;
//     const endMonth = endDate.getMonth() + 1;

//     const rows = await Payroll.findAll({
//         attributes: [
//             [col('employee.department'), 'department'],
//             [fn('COUNT', literal('DISTINCT payrolls.employee_id')), 'employeeCount'],
//             [fn('AVG', col('payrolls.net_salary')), 'avgSalary'],
//             [fn('SUM', col('payrolls.net_salary')), 'totalSalary'],
//         ],
//         where: {
//             status: 'Processed',
//             [Op.or]: [
//                 { year: startYear, month: { [Op.gte]: startMonth } },
//                 { year: { [Op.gt]: startYear, [Op.lt]: endYear } },
//                 { year: endYear, month: { [Op.lte]: endMonth } },
//             ],
//         },
//         include: [
//             {
//                 model: User,
//                 as: 'employee',
//                 attributes: [],
//                 where: { department: { [Op.ne]: null } },
//                 required: true,
//             },
//         ],
//         group: ['employee.department'],
//         raw: true,
//     });

//     return rows.map((r) => ({
//         department: r.department,
//         employeeCount: Number(r.employeeCount),
//         avgSalary: parseFloat(Number(r.avgSalary).toFixed(2)),
//         totalSalary: parseFloat(Number(r.totalSalary).toFixed(2)),
//     }));
// };

// module.exports = {
//     getAttritionData,
//     getAttritionByDepartment,
//     getDepartmentPerformance,
//     getLeaveTrends,
//     getLeaveStatusBreakdown,
//     getCostPerEmployee,
//     getCostByDepartment,
// };

// -----------------------------
module.exports = {
    getSummaryStats,
    getChartData,
    getLeaveData,
    getExpenseData,
    getUserListData
};