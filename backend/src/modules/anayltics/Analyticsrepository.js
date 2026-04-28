'use strict';

const { Op, fn, col, literal } = require('sequelize');
const models = require('../../database/initModels');

const { User, Attendance, LeaveRequest, Payroll } = models;

// ─────────────────────────────────────────────────────────────
// COMMON HELPERS
// ─────────────────────────────────────────────────────────────

const validDepartmentFilter = (department) => {
    if (!department) {
        return {
            [Op.and]: [
                { [Op.ne]: null },
                { [Op.ne]: '' },
            ],
        };
    }
    return department;
};

// Fill missing months (important for charts)
const fillMissingMonths = (data, startDate, endDate) => {
    const map = new Map(data.map(d => [`${d.year}-${d.month}`, d]));
    const result = [];

    const current = new Date(startDate);

    while (current <= endDate) {
        const key = `${current.getFullYear()}-${current.getMonth() + 1}`;

        result.push(
            map.get(key) || {
                year: current.getFullYear(),
                month: current.getMonth() + 1,
                monthLabel: current.toLocaleString('default', { month: 'short' }),
                leaveCount: 0,
                totalDays: 0,
            }
        );

        current.setMonth(current.getMonth() + 1);
    }

    return result;
};

// ─────────────────────────────────────────────────────────────
// ATTRITION
// ─────────────────────────────────────────────────────────────

const getAttritionData = async ({ startDate, endDate, department } = {}) => {
    const deptFilter = validDepartmentFilter(department);

    const [employeesAtStart, employeesAtEnd, leftInPeriod] = await Promise.all([

        // employees at start
        User.count({
            where: {
                department: deptFilter,
                createdAt: { [Op.lte]: startDate },
            },
        }),

        // employees at end (active)
        User.count({
            where: {
                department: deptFilter,
                isActive: true,
                createdAt: { [Op.lte]: endDate },
            },
        }),

        // employees who left
        User.count({
            where: {
                department: deptFilter,
                isActive: false,
                updatedAt: { [Op.between]: [startDate, endDate] },
            },
        }),
    ]);

    const avgEmployees = Math.max((employeesAtStart + employeesAtEnd) / 2, 1);
    const attritionRate = parseFloat(((leftInPeriod / avgEmployees) * 100).toFixed(2));

    return {
        employeesAtStart,
        employeesAtEnd,
        leftInPeriod,
        attritionRate,
    };
};

const getAttritionByDepartment = async ({ startDate, endDate } = {}) => {

    const rows = await User.findAll({
        attributes: [
            'department',
            [fn('COUNT', col('id')), 'total'],
            [
                fn('SUM',
                    literal(`CASE 
                        WHEN is_active = 0 AND updated_at BETWEEN :start AND :end 
                        THEN 1 ELSE 0 END`)
                ),
                'leftCount',
            ],
        ],
        where: {
            department: {
                [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }],
            },
            createdAt: { [Op.lte]: endDate },
        },
        group: ['department'],
        raw: true,
        replacements: {
            start: startDate,
            end: endDate,
        },
    });

    return rows.map((r) => {
        const total = Number(r.total);
        const left = Number(r.leftCount);

        return {
            department: r.department,
            total,
            leftCount: left,
            attritionRate: total > 0 ? parseFloat(((left / total) * 100).toFixed(2)) : 0,
        };
    });
};

// ─────────────────────────────────────────────────────────────
// DEPARTMENT PERFORMANCE
// ─────────────────────────────────────────────────────────────

const getDepartmentStats = async ({ startDate, endDate, department } = {}) => {

    const deptFilter = validDepartmentFilter(department);

    // Headcount + salary
    const headCounts = await User.findAll({
        attributes: [
            'department',
            [fn('COUNT', col('User.id')), 'headCount'],
            [fn('AVG', col('User.base_salary')), 'avgBaseSalary'],
        ],
        where: {
            isActive: true,
            department: deptFilter,
        },
        group: ['department'],
        raw: true,
    });

    // Attendance aggregation
    const attendance = await Attendance.findAll({
        attributes: [
            [col('employee.department'), 'department'],
            [fn('SUM', col('worked_minutes')), 'totalMinutes'],
            [fn('COUNT', col('Attendance.id')), 'totalRecords'],
        ],
        where: {
            date: { [Op.between]: [startDate, endDate] },
            status: { [Op.in]: ['present', 'late', 'half_day'] },
        },
        include: [{
            model: User,
            as: 'employee',
            attributes: [],
            where: { department: deptFilter },
            required: true,
        }],
        group: ['employee.department'],
        raw: true,
    });

    // Leave aggregation
    const leave = await LeaveRequest.findAll({
        attributes: [
            [col('employee.department'), 'department'],
            [fn('SUM', col('days_requested')), 'totalLeaveDays'],
        ],
        where: {
            status: 'Approved',
            startDate: { [Op.between]: [startDate, endDate] },
        },
        include: [{
            model: User,
            as: 'employee',
            attributes: [],
            where: { department: deptFilter },
            required: true,
        }],
        group: ['employee.department'],
        raw: true,
    });

    const attendanceMap = Object.fromEntries(
        attendance.map(r => [r.department, r])
    );

    const leaveMap = Object.fromEntries(
        leave.map(r => [r.department, Number(r.totalLeaveDays || 0)])
    );

    return headCounts.map((r) => {
        const att = attendanceMap[r.department] || {};

        const totalMinutes = Number(att.totalMinutes || 0);
        const totalRecords = Number(att.totalRecords || 0);

        return {
            department: r.department,
            headCount: Number(r.headCount),
            avgBaseSalary: parseFloat(Number(r.avgBaseSalary).toFixed(2)),
            avgWorkedMinutes: totalRecords ? totalMinutes / totalRecords : 0,
            totalLeaveDays: leaveMap[r.department] || 0,
        };
    });
};

// ─────────────────────────────────────────────────────────────
// LEAVE TRENDS
// ─────────────────────────────────────────────────────────────

const getLeaveTrends = async ({ startDate, endDate, department } = {}) => {

    const include = department
        ? [{
            model: User,
            as: 'employee',
            attributes: [],
            where: { department },
            required: true,
        }]
        : [];

    const rows = await LeaveRequest.findAll({
        attributes: [
            [fn('YEAR', col('start_date')), 'year'],
            [fn('MONTH', col('start_date')), 'month'],
            [fn('COUNT', col('id')), 'leaveCount'],
            [fn('SUM', col('days_requested')), 'totalDays'],
        ],
        where: {
            status: 'Approved',
            startDate: { [Op.between]: [startDate, endDate] },
        },
        include,
        group: [
            fn('YEAR', col('start_date')),
            fn('MONTH', col('start_date')),
        ],
        order: [
            [fn('YEAR', col('start_date')), 'ASC'],
            [fn('MONTH', col('start_date')), 'ASC'],
        ],
        raw: true,
    });

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const formatted = rows.map((r) => ({
        year: Number(r.year),
        month: Number(r.month),
        monthLabel: MONTHS[Number(r.month) - 1],
        leaveCount: Number(r.leaveCount),
        totalDays: Number(r.totalDays),
    }));

    return fillMissingMonths(formatted, startDate, endDate);
};

const getLeaveStatusBreakdown = async ({ startDate, endDate } = {}) => {

    const rows = await LeaveRequest.findAll({
        attributes: [
            'status',
            [fn('COUNT', col('id')), 'count'],
        ],
        where: {
            startDate: { [Op.between]: [startDate, endDate] },
        },
        group: ['status'],
        raw: true,
    });

    return rows.map((r) => ({
        status: r.status,
        count: Number(r.count),
    }));
};

// ─────────────────────────────────────────────────────────────
// COST
// ─────────────────────────────────────────────────────────────

const getCostOverall = async ({ startDate, endDate, department } = {}) => {

    const include = department
        ? [{
            model: User,
            as: 'employee',
            attributes: [],
            where: { department },
            required: true,
        }]
        : [];

    const row = await Payroll.findOne({
        attributes: [
            [fn('COUNT', literal('DISTINCT employee_id')), 'employeeCount'],
            [fn('SUM', col('net_salary')), 'totalSalary'],
            [fn('AVG', col('net_salary')), 'avgSalary'],
        ],
        where: {
            status: { [Op.in]: ['Processed', 'Locked'] },
            processedAt: { [Op.between]: [startDate, endDate] },
        },
        include,
        raw: true,
    });

    return {
        employeeCount: Number(row?.employeeCount || 0),
        totalSalary: parseFloat(Number(row?.totalSalary || 0).toFixed(2)),
        avgSalary: parseFloat(Number(row?.avgSalary || 0).toFixed(2)),
    };
};

const getCostByDepartment = async ({ startDate, endDate } = {}) => {

    const rows = await Payroll.findAll({
        attributes: [
            [col('employee.department'), 'department'],
            [fn('COUNT', literal('DISTINCT employee_id')), 'employeeCount'],
            [fn('AVG', col('net_salary')), 'avgSalary'],
            [fn('SUM', col('net_salary')), 'totalSalary'],
        ],
        where: {
            status: { [Op.in]: ['Processed', 'Locked'] },
            processedAt: { [Op.between]: [startDate, endDate] },
        },
        include: [{
            model: User,
            as: 'employee',
            attributes: [],
            where: {
                department: {
                    [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }],
                },
            },
            required: true,
        }],
        group: ['employee.department'],
        raw: true,
    });

    return rows.map((r) => ({
        department: r.department,
        employeeCount: Number(r.employeeCount),
        avgSalary: parseFloat(Number(r.avgSalary).toFixed(2)),
        totalSalary: parseFloat(Number(r.totalSalary).toFixed(2)),
    }));
};

// ─────────────────────────────────────────────────────────────

module.exports = {
    getAttritionData,
    getAttritionByDepartment,
    getDepartmentStats,
    getLeaveTrends,
    getLeaveStatusBreakdown,
    getCostOverall,
    getCostByDepartment,
};