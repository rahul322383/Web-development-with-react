'use strict';

const { Op, fn, col, literal } = require('sequelize');

const getModels = () => require('../../database/initModels');

const {
    formatMonthly,
    buildPagination,
    cleanLeave,
    cleanExpense
} = require('./userFormatter');

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const buildDateRange = (yearInput) => {
    const currentYear = new Date().getFullYear();

    const rawYear =
        typeof yearInput === 'object'
            ? yearInput?.year
            : yearInput;

    const year = Number(rawYear);

    const validYear =
        Number.isInteger(year) &&
            year >= 2000 &&
            year <= 2100
            ? year
            : currentYear;

    return {
        start: new Date(Date.UTC(validYear, 0, 1)),
        end: new Date(Date.UTC(validYear, 11, 31, 23, 59, 59, 999))
    };
};

const getLast7DaysRange = () => ({
    last7Days: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
});

// ─────────────────────────────────────────────
// SUMMARY STATS
// ─────────────────────────────────────────────

const getSummaryStats = async (year, canViewFinance) => {
    const { start, end } = buildDateRange(year);
    const { last7Days } = getLast7DaysRange();

    const { User, LeaveRequest, Expense, Payroll } = getModels();

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
                        [Op.gte]: last7Days,
                        [Op.between]: [start, end]
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

        const [
            totalUsers,
            leaveStats,
            newLeaves,
            expensesClaimed,
            salaryPaid
        ] = await Promise.all(queries);

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
        return {
            success: false,
            message: `Dashboard summary failed: ${error.message}`
        };
    }
};

// ─────────────────────────────────────────────
// CHART DATA
// ─────────────────────────────────────────────

const getChartData = async (year, canViewFinance = false) => {
    try {
        const { start, end } = buildDateRange(year);
        const { LeaveRequest, Expense, Payroll } = getModels();

        const queries = [
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
                order: [[fn('MONTH', col('start_date')), 'ASC']],
                raw: true
            })
        ];

        if (canViewFinance) {
            queries.push(
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
                    order: [[fn('MONTH', col('created_at')), 'ASC']],
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
                    order: [[fn('MONTH', col('processed_at')), 'ASC']],
                    raw: true
                })
            );
        }

        const [leaves, expenses = [], salary = []] = await Promise.all(queries);

        return {
            success: true,
            year: start.getUTCFullYear(),
            leaves: formatMonthly(leaves, 'count'),
            expenses: canViewFinance ? formatMonthly(expenses, 'total') : [],
            salary: canViewFinance ? formatMonthly(salary, 'total') : []
        };
    } catch (error) {
       
        return {
            success: false,
            message: 'Failed to load chart data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        };
    }
};

// ─────────────────────────────────────────────
// LEAVE DATA
// ─────────────────────────────────────────────

const getLeaveData = async (year, page = 1, limit = 10) => {
    const { start, end } = buildDateRange(year);
    const offset = (page - 1) * limit;
    const { LeaveRequest, User } = getModels();

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
            success: true,
            segmented: {
                pending: rows.filter((l) => l.status === 'Pending'),
                approved: rows.filter((l) => l.status === 'Approved'),
                rejected: rows.filter((l) => l.status === 'Rejected')
            },
            all: {
                data: rows,
                pagination: buildPagination(result.count, page, limit)
            }
        };
    } catch (error) {
        return {
            success: false,
            message: `Leave data fetch failed: ${error.message}`
        };
    }
};

// ─────────────────────────────────────────────
// EXPENSE DATA
// ─────────────────────────────────────────────

const getExpenseData = async (year, page = 1, limit = 10, role) => {
    const { start, end } = buildDateRange(year);
    const offset = (page - 1) * limit;
    const { Expense, User } = getModels();

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
            success: true,
            data: result.rows.map(cleanExpense),
            pagination: buildPagination(result.count, page, limit)
        };
    } catch (error) {
        return {
            success: false,
            message: `Expense data fetch failed: ${error.message}`
        };
    }
};

// ─────────────────────────────────────────────
// USER LIST DATA
// ─────────────────────────────────────────────

const getUserListData = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const { User } = getModels();

    try {
        const result = await User.findAndCountAll({
            attributes: { exclude: ['passwordHash'] },
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        return {
            success: true,
            data: result.rows,
            pagination: buildPagination(result.count, page, limit)
        };
    } catch (error) {
        return {
            success: false,
            message: `User list fetch failed: ${error.message}`
        };
    }
};

// ─────────────────────────────────────────────
// ATTRITION DATA
// ─────────────────────────────────────────────

const getAttritionData = async ({ startDate, endDate, department } = {}) => {
    const { User } = getModels();

    const baseWhere = {};
    if (department) baseWhere.department = department;

    try {
        const [totalActive, leftInPeriod, totalAtPeriodStart] = await Promise.all([
            User.count({
                where: { ...baseWhere, isActive: true }
            }),

            User.count({
                where: {
                    ...baseWhere,
                    isActive: false,
                    updatedAt: { [Op.between]: [startDate, endDate] }
                }
            }),

            User.count({
                where: {
                    ...baseWhere,
                    createdAt: { [Op.lte]: endDate }
                }
            })
        ]);

        const avgEmployees = totalAtPeriodStart - leftInPeriod / 2;

        const attritionRate =
            avgEmployees > 0
                ? parseFloat(((leftInPeriod / avgEmployees) * 100).toFixed(2))
                : 0;

        return {
            success: true,
            totalActive,
            leftInPeriod,
            totalAtPeriodStart,
            attritionRate
        };
    } catch (error) {
        return {
            success: false,
            message: `Attrition calculation failed: ${error.message}`
        };
    }
};

// ─────────────────────────────────────────────
// ATTRITION BY DEPARTMENT
// ─────────────────────────────────────────────

const getAttritionByDepartment = async ({ startDate, endDate } = {}) => {
    const { User } = getModels();

    try {
        const rows = await User.findAll({
            attributes: [
                'department',
                [fn('COUNT', col('id')), 'total'],
                [
                    fn(
                        'SUM',
                        literal(`
                            CASE
                                WHEN is_active = 0
                                AND updated_at BETWEEN '${new Date(startDate).toISOString()}'
                                AND '${new Date(endDate).toISOString()}'
                                THEN 1
                                ELSE 0
                            END
                        `)
                    ),
                    'left_count'
                ]
            ],
            where: {
                department: { [Op.ne]: null },
                createdAt: { [Op.lte]: endDate }
            },
            group: ['department'],
            raw: true
        });

        const data = rows.map((r) => ({
            department: r.department,
            total: Number(r.total),
            leftCount: Number(r.left_count),
            attritionRate:
                r.total > 0
                    ? parseFloat(((r.left_count / r.total) * 100).toFixed(2))
                    : 0
        }));

        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            message: `Dept attrition fetch failed: ${error.message}`
        };
    }
};

// ─────────────────────────────────────────────
// DEPARTMENT PERFORMANCE
// ─────────────────────────────────────────────

const getDepartmentPerformance = async ({ department } = {}) => {
    const { User } = getModels();

    const where = {
        isActive: true,
        department: { [Op.ne]: null }
    };

    if (department) where.department = department;

    try {
        const rows = await User.findAll({
            attributes: [
                'department',
                [fn('COUNT', col('id')), 'headCount'],
                [fn('AVG', col('base_salary')), 'avgSalary']
            ],
            where,
            group: ['department'],
            raw: true
        });

        const data = rows.map((r) => ({
            department: r.department,
            headCount: Number(r.headCount),
            avgSalary: parseFloat(Number(r.avgSalary).toFixed(2))
        }));

        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            message: `Dept performance fetch failed: ${error.message}`
        };
    }
};

// ─────────────────────────────────────────────
// LEAVE TRENDS
// ─────────────────────────────────────────────

const getLeaveTrends = async ({ startDate, endDate, department } = {}) => {
    const { LeaveRequest, User } = getModels();

    const include = department
        ? [
            {
                model: User,
                as: 'employee',
                attributes: [],
                where: { department },
                required: true
            }
        ]
        : [];

    try {
        const rows = await LeaveRequest.findAll({
            attributes: [
                [fn('YEAR', col('LeaveRequest.start_date')), 'year'],
                [fn('MONTH', col('LeaveRequest.start_date')), 'month'],
                [fn('COUNT', col('LeaveRequest.id')), 'leaveCount'],
                [fn('SUM', col('LeaveRequest.days_requested')), 'totalDays']
            ],
            where: {
                status: 'Approved',
                startDate: { [Op.between]: [startDate, endDate] }
            },
            include,
            group: [
                fn('YEAR', col('LeaveRequest.start_date')),
                fn('MONTH', col('LeaveRequest.start_date'))
            ],
            order: [
                [fn('YEAR', col('LeaveRequest.start_date')), 'ASC'],
                [fn('MONTH', col('LeaveRequest.start_date')), 'ASC']
            ],
            raw: true
        });

        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        const data = rows.map((r) => ({
            year: Number(r.year),
            month: Number(r.month),
            monthLabel: monthNames[Number(r.month) - 1],
            leaveCount: Number(r.leaveCount),
            totalDays: Number(r.totalDays)
        }));

        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            message: `Leave trends fetch failed: ${error.message}`
        };
    }
};

// ─────────────────────────────────────────────
// LEAVE STATUS BREAKDOWN
// ─────────────────────────────────────────────

const getLeaveStatusBreakdown = async ({ startDate, endDate } = {}) => {
    const { LeaveRequest } = getModels();

    try {
        const rows = await LeaveRequest.findAll({
            attributes: [
                'status',
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                startDate: { [Op.between]: [startDate, endDate] }
            },
            group: ['status'],
            raw: true
        });

        const data = rows.map((r) => ({
            status: r.status,
            count: Number(r.count)
        }));

        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            message: `Status breakdown fetch failed: ${error.message}`
        };
    }
};

// ─────────────────────────────────────────────
// COST PER EMPLOYEE  ← was missing, referenced in routes
// ─────────────────────────────────────────────

const getCostPerEmployee = async ({ startDate, endDate, department } = {}) => {
    const { User, Payroll, Expense } = getModels();

    const userWhere = {
        isActive: true
    };

    if (department) {
        userWhere.department = department;
    }

    try {

        const users = await User.findAll({
            attributes: [
                'id',
                'firstName',
                'lastName',
                'email',
                'department',
                'baseSalary'
            ],
            where: userWhere,
            raw: true
        });

        if (!users.length) {
            return {
                success: true,
                data: []
            };
        }

        const userIds = users.map((u) => u.id);

        const [payrollRows, expenseRows] = await Promise.all([

            Payroll.findAll({
                attributes: [
                    'employeeId',
                    [fn('SUM', col('net_salary')), 'totalSalary']
                ],
                where: {
                    employeeId: {
                        [Op.in]: userIds
                    },
                    status: {
                        [Op.in]: ['Processed', 'Locked']
                    },
                    processedAt: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                group: ['employeeId'],
                raw: true
            }),

            Expense.findAll({
                attributes: [
                    'employeeId',
                    [fn('SUM', col('amount')), 'totalExpense']
                ],
                where: {
                    employeeId: {
                        [Op.in]: userIds
                    },
                    managerApprovalStatus: 'Approved',
                    financeApprovalStatus: 'Approved',
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                group: ['employeeId'],
                raw: true
            })

        ]);

        const salaryMap = {};

        payrollRows.forEach((r) => {
            salaryMap[r.employeeId] = Number(r.totalSalary || 0);
        });

        const expenseMap = {};

        expenseRows.forEach((r) => {
            expenseMap[r.employeeId] = Number(r.totalExpense || 0);
        });

        const data = users.map((u) => {

            const salary = salaryMap[u.id] || 0;
            const expenses = expenseMap[u.id] || 0;

            return {
                userId: u.id,
                name: `${u.firstName} ${u.lastName}`.trim(),
                email: u.email,
                department: u.department,
                totalSalary: salary,
                totalExpenses: expenses,
                totalCost: parseFloat(
                    (salary + expenses).toFixed(2)
                )
            };
        });

        return {
            success: true,
            data
        };

    } catch (error) {

       

        return {
            success: false,
            message: `Cost per employee fetch failed: ${error.message}`
        };
    }
};


const getCostByDepartment = async ({ startDate, endDate } = {}) => {
    const { User, Payroll, Expense } = getModels();

    try {
        const [payrollRows, expenseRows, deptRows] = await Promise.all([
            Payroll.findAll({
                attributes: [
                    [col('user.department'), 'department'],
                    [fn('SUM', col('Payroll.net_salary')), 'totalSalary']
                ],
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: [],
                        where: { department: { [Op.ne]: null } }
                    }
                ],
                where: {
                    status: { [Op.in]: ['Processed', 'Locked'] },
                    processedAt: { [Op.between]: [startDate, endDate] }
                },
                group: ['user.department'],
                raw: true
            }),

            Expense.findAll({
                attributes: [
                    [col('employee.department'), 'department'],
                    [fn('SUM', col('Expense.amount')), 'totalExpense']
                ],
                include: [
                    {
                        model: User,
                        as: 'employee',
                        attributes: [],
                        where: { department: { [Op.ne]: null } }
                    }
                ],
                where: {
                    managerApprovalStatus: 'Approved',
                    financeApprovalStatus: 'Approved',
                    createdAt: { [Op.between]: [startDate, endDate] }
                },
                group: ['employee.department'],
                raw: true
            }),

            // headcount per department
            User.findAll({
                attributes: [
                    'department',
                    [fn('COUNT', col('id')), 'headCount']
                ],
                where: {
                    isActive: true,
                    department: { [Op.ne]: null }
                },
                group: ['department'],
                raw: true
            })
        ]);

        const salaryMap = {};
        payrollRows.forEach((r) => {
            salaryMap[r.department] = Number(r.totalSalary || 0);
        });

        const expenseMap = {};
        expenseRows.forEach((r) => {
            expenseMap[r.department] = Number(r.totalExpense || 0);
        });

        const data = deptRows.map((r) => {
            const salary = salaryMap[r.department] || 0;
            const expenses = expenseMap[r.department] || 0;
            const headCount = Number(r.headCount);
            const totalCost = salary + expenses;

            return {
                department: r.department,
                headCount,
                totalSalary: salary,
                totalExpenses: expenses,
                totalCost: parseFloat(totalCost.toFixed(2)),
                costPerHead: headCount > 0
                    ? parseFloat((totalCost / headCount).toFixed(2))
                    : 0
            };
        });

        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            message: `Cost by department fetch failed: ${error.message}`
        };
    }
};

// ─────────────────────────────────────────────

module.exports = {
    getSummaryStats,
    getChartData,
    getLeaveData,
    getExpenseData,
    getUserListData,
    getAttritionData,
    getAttritionByDepartment,
    getDepartmentPerformance,
    getLeaveTrends,
    getLeaveStatusBreakdown,
    getCostPerEmployee,
    getCostByDepartment
};