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

// -----------------------------
module.exports = {
    getSummaryStats,
    getChartData,
    getLeaveData,
    getExpenseData,
    getUserListData
};