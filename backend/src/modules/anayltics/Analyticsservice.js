'use strict';

const logger = require('../../config/logger');
const analyticsRepository = require('./analyticsRepository');

// ─────────────────────────────────────────────────────────────
// DATE HELPERS
// ─────────────────────────────────────────────────────────────

const parseDateRange = ({ startDate, endDate } = {}) => {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
        ? new Date(startDate)
        : new Date(new Date().setFullYear(end.getFullYear() - 1));

    if (isNaN(start) || isNaN(end)) {
        throw Object.assign(new Error('Invalid date range'), { statusCode: 400 });
    }

    if (start >= end) {
        throw Object.assign(new Error('startDate must be before endDate'), { statusCode: 400 });
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { startDate: start, endDate: end };
};

const getPreviousRange = (start, end) => {
    const diff = end - start;
    return {
        startDate: new Date(start.getTime() - diff),
        endDate: new Date(end.getTime() - diff),
    };
};

// ─────────────────────────────────────────────────────────────
// GENERIC HELPERS
// ─────────────────────────────────────────────────────────────

const safeDivide = (a, b) => {
    if (!b || b === 0) return 0;
    return a / b;
};

const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
};

// ─────────────────────────────────────────────────────────────
// INSIGHT BUILDERS
// ─────────────────────────────────────────────────────────────

const buildTrendInsight = (value, trend) => {
    let status = 'stable';
    let insight = 'No major change detected';

    if (trend > 5) {
        status = 'warning';
        insight = 'Metric increased significantly compared to previous period';
    } else if (trend < -5) {
        status = 'good';
        insight = 'Metric improved compared to previous period';
    }

    return {
        value: Number(value?.toFixed?.(2) ?? value),
        trend: Number(trend.toFixed(2)),
        status,
        insight,
    };
};

// ─────────────────────────────────────────────────────────────
// DEPARTMENT PERFORMANCE  ← THIS IS WHERE productivityScore WAS BROKEN
// ─────────────────────────────────────────────────────────────

const EXPECTED_MINUTES_PER_DAY = 480; // 8h × 60 — matches Company.workingHoursPerDay default
const WORKING_DAYS_PER_MONTH = 22;  // standard working days in a month

const enhanceDepartmentPerformance = (rows = []) => {
    return rows.map((dept) => {
        const avgWorkedMinutes = dept.avgWorkedMinutes || 0;   // ✅ FIXED: was dept.worked_minutes
        const totalLeaveDays = dept.totalLeaveDays || 0;
        const headCount = dept.headCount || 1;

        // Ratio of actual avg daily minutes vs expected 480 min (capped at 1)
        const workedRatio = Math.min(
            safeDivide(avgWorkedMinutes, EXPECTED_MINUTES_PER_DAY),
            1
        );

        // What fraction of total available employee-days were taken as leave
        const leaveDaysRatio = Math.min(
            safeDivide(totalLeaveDays, headCount * WORKING_DAYS_PER_MONTH),
            1
        );

        // ✅ THE FORMULA: 60% attendance effort + 40% leave discipline
        const productivity =
            workedRatio * 0.6 +
            (1 - leaveDaysRatio) * 0.4;

        const score = Math.min(Math.round(productivity * 100), 100);

        // Classify
        let status = 'low';
        if (score > 80) status = 'high';
        else if (score >= 50) status = 'medium';

        // Human-readable insight per department
        let insight;
        if (score > 80) {
            insight = `${dept.department} is performing well with strong attendance and low leave usage`;
        } else if (workedRatio < 0.7 && leaveDaysRatio > 0.2) {
            insight = `${dept.department} shows high leave usage and low hours — possible burnout risk`;
        } else if (workedRatio < 0.7) {
            insight = `${dept.department} average hours are below target (${Math.round(avgWorkedMinutes / 60)}h vs 8h expected)`;
        } else if (leaveDaysRatio > 0.2) {
            insight = `${dept.department} has elevated leave usage this period`;
        } else {
            insight = `${dept.department} productivity is ${status}`;
        }

        return {
            department: dept.department,
            headCount: dept.headCount,
            avgBaseSalary: dept.avgBaseSalary,
            avgWorkedMinutes: Math.round(avgWorkedMinutes),
            avgWorkedHours: parseFloat((avgWorkedMinutes / 60).toFixed(1)),
            totalLeaveDays: totalLeaveDays,
            leaveDaysRatio: parseFloat(leaveDaysRatio.toFixed(2)),
            productivityScore: score,   // ✅ NOW A REAL NUMBER — was always 0 before
            status,
            insight,
        };
    });
};

// ─────────────────────────────────────────────────────────────
// LEAVE ANALYSIS
// ─────────────────────────────────────────────────────────────

const analyzeLeaveTrends = (monthly = []) => {
    if (!monthly.length) return {};

    const max = Math.max(...monthly.map((m) => m.totalDays || 0));
    const peak = monthly.find((m) => (m.totalDays || 0) === max);

    const total = monthly.reduce((s, m) => s + (m.totalDays || 0), 0);
    const avg = parseFloat((total / monthly.length).toFixed(1));

    return {
        peakMonth: peak?.monthLabel || null,
        peakYear: peak?.year || null,
        peakValue: max,
        avgPerMonth: avg,
    };
};

// ─────────────────────────────────────────────────────────────
// COST ANALYSIS
// ─────────────────────────────────────────────────────────────

const analyzeCost = (byDepartment = []) => {
    if (!byDepartment.length) return {};

    const highest = byDepartment.reduce((a, b) =>
        (a.totalSalary || 0) > (b.totalSalary || 0) ? a : b
    );

    const lowest = byDepartment.reduce((a, b) =>
        (a.totalSalary || 0) < (b.totalSalary || 0) ? a : b
    );

    const total = byDepartment.reduce((s, d) => s + (d.totalSalary || 0), 0);

    return {
        highestCostDepartment: highest?.department || null,
        lowestCostDepartment: lowest?.department || null,
        totalPayroll: parseFloat(total.toFixed(2)),
    };
};

// ─────────────────────────────────────────────────────────────
// ATTRITION
// ─────────────────────────────────────────────────────────────

const getAttritionSummary = async (query = {}) => {
    try {
        const { startDate, endDate } = parseDateRange(query);
        const prevRange = getPreviousRange(startDate, endDate);
        const department = query.department || null;

        const [current, previous, byDepartment] = await Promise.all([
            analyticsRepository.getAttritionData({ startDate, endDate, department }),
            analyticsRepository.getAttritionData(prevRange),
            analyticsRepository.getAttritionByDepartment({ startDate, endDate }),
        ]);

        const currentValue = current?.attritionRate || 0;
        const previousValue = previous?.attritionRate || 0;

        const trend = calculateTrend(currentValue, previousValue);
        const insight = buildTrendInsight(currentValue, trend);

        return {
            success: true,
            data: {
                period: { startDate, endDate },
                overall: {
                    ...insight,
                    employeesAtStart: current?.employeesAtStart || 0,
                    employeesAtEnd: current?.employeesAtEnd || 0,
                    leftInPeriod: current?.leftInPeriod || 0,
                },
                byDepartment: byDepartment || [],
            },
        };
    } catch (error) {
        logger.error({ event: 'ATTRITION_FAILED', error: error.message });
        return { success: false, message: error.message, statusCode: 500 };
    }
};

// ─────────────────────────────────────────────────────────────
// DEPARTMENT PERFORMANCE
// ─────────────────────────────────────────────────────────────

const getDepartmentPerformance = async (query = {}) => {
    try {
        const { startDate, endDate } = parseDateRange(query);
        const department = query.department || null;

        const rows = await analyticsRepository.getDepartmentStats({ startDate, endDate, department });
        const enhanced = enhanceDepartmentPerformance(rows);

        // Sort: highest productivity first
        enhanced.sort((a, b) => b.productivityScore - a.productivityScore);

        return {
            success: true,
            data: {
                departments: enhanced,
                topDepartment: enhanced[0] || null,
                worstDepartment: enhanced[enhanced.length - 1] || null,
            },
        };
    } catch (error) {
        logger.error({ event: 'DEPT_FAILED', error: error.message });
        return { success: false, message: error.message, statusCode: 500 };
    }
};

// ─────────────────────────────────────────────────────────────
// LEAVE TRENDS
// ─────────────────────────────────────────────────────────────

const getLeaveTrends = async (query = {}) => {
    try {
        const { startDate, endDate } = parseDateRange(query);
        const prevRange = getPreviousRange(startDate, endDate);
        const department = query.department || null;

        const [current, previous, statusBreakdown] = await Promise.all([
            analyticsRepository.getLeaveTrends({ startDate, endDate, department }),
            analyticsRepository.getLeaveTrends(prevRange),
            analyticsRepository.getLeaveStatusBreakdown({ startDate, endDate }),
        ]);

        const currentTotal = current.reduce((sum, m) => sum + (m.totalDays || 0), 0);
        const prevTotal = previous.reduce((sum, m) => sum + (m.totalDays || 0), 0);

        const trend = calculateTrend(currentTotal, prevTotal);
        const insight = buildTrendInsight(currentTotal, trend);

        return {
            success: true,
            data: {
                overall: insight,
                monthly: current || [],
                statusBreakdown: statusBreakdown || [],
                analysis: analyzeLeaveTrends(current),
            },
        };
    } catch (error) {
        console.error('Error in getLeaveTrends:', error);
        logger.error({ event: 'LEAVE_FAILED', error: error.message });
        return { success: false, message: error.message, statusCode: 500 };
    }
};

// ─────────────────────────────────────────────────────────────
// COST
// ─────────────────────────────────────────────────────────────

const getCostPerEmployee = async (query = {}) => {
    try {
        const { startDate, endDate } = parseDateRange(query);
        const prevRange = getPreviousRange(startDate, endDate);
        const department = query.department || null;

        const [current, previous, byDepartment] = await Promise.all([
            analyticsRepository.getCostOverall({ startDate, endDate, department }),
            analyticsRepository.getCostOverall(prevRange),
            analyticsRepository.getCostByDepartment({ startDate, endDate }),
        ]);

        const trend = calculateTrend(current?.totalSalary, previous?.totalSalary);
        const insight = buildTrendInsight(current?.totalSalary, trend);

        return {
            success: true,
            data: {
                overall: {
                    ...insight,
                    employeeCount: current?.employeeCount || 0,
                    totalSalary: current?.totalSalary || 0,
                    avgSalary: current?.avgSalary || 0,
                    // ✅ cost per employee
                    costPerEmployee: parseFloat(
                        safeDivide(current?.totalSalary || 0, current?.employeeCount || 1).toFixed(2)
                    ),
                },
                byDepartment: byDepartment || [],
                analysis: analyzeCost(byDepartment),
            },
        };
    } catch (error) {
        logger.error({ event: 'COST_FAILED', error: error.message });
        return { success: false, message: error.message, statusCode: 500 };
    }
};

// ─────────────────────────────────────────────────────────────
// DASHBOARD (MASTER API)
// ─────────────────────────────────────────────────────────────

const getDashboard = async (query = {}) => {
    try {
        const { startDate, endDate } = parseDateRange(query);
        const prevRange = getPreviousRange(startDate, endDate);
        const department = query.department || null;

        const [
            attrition,
            prevAttrition,
            dept,
            leaves,
            prevLeaves,
            cost,
            prevCost,
            costDept,
        ] = await Promise.all([
            analyticsRepository.getAttritionData({ startDate, endDate, department }),
            analyticsRepository.getAttritionData(prevRange),
            analyticsRepository.getDepartmentStats({ startDate, endDate, department }),
            analyticsRepository.getLeaveTrends({ startDate, endDate }),
            analyticsRepository.getLeaveTrends(prevRange),
            analyticsRepository.getCostOverall({ startDate, endDate }),
            analyticsRepository.getCostOverall(prevRange),
            analyticsRepository.getCostByDepartment({ startDate, endDate }),
        ]);

        // Attrition
        const attritionValue = attrition?.attritionRate || 0;
        const prevAttritionValue = prevAttrition?.attritionRate || 0;
        const attritionInsight = buildTrendInsight(
            attritionValue,
            calculateTrend(attritionValue, prevAttritionValue)
        );

        // Leaves
        const totalLeaves = leaves.reduce((s, m) => s + (m.totalDays || 0), 0);
        const prevTotalLeaves = prevLeaves.reduce((s, m) => s + (m.totalDays || 0), 0);
        const leaveInsight = buildTrendInsight(
            totalLeaves,
            calculateTrend(totalLeaves, prevTotalLeaves)
        );

        // Cost
        const costValue = cost?.totalSalary || 0;
        const prevCostValue = prevCost?.totalSalary || 0;
        const costInsight = buildTrendInsight(
            costValue,
            calculateTrend(costValue, prevCostValue)
        );

        // Department performance (with fixed productivityScore)
        const enhancedDept = enhanceDepartmentPerformance(dept);
        enhancedDept.sort((a, b) => b.productivityScore - a.productivityScore);

        return {
            success: true,
            data: {
                period: { startDate, endDate },

                attrition: {
                    ...attritionInsight,
                    leftInPeriod: attrition?.leftInPeriod || 0,
                },

                departmentPerformance: {
                    departments: enhancedDept,
                    topDepartment: enhancedDept[0] || null,
                    worstDepartment: enhancedDept[enhancedDept.length - 1] || null,
                },

                leaveTrends: {
                    insight: leaveInsight,
                    monthly: leaves,
                    analysis: analyzeLeaveTrends(leaves),
                },

                cost: {
                    insight: costInsight,
                    totalSalary: costValue,
                    avgSalary: cost?.avgSalary || 0,
                    employeeCount: cost?.employeeCount || 0,
                    costPerEmployee: parseFloat(
                        safeDivide(costValue, cost?.employeeCount || 1).toFixed(2)
                    ),
                    byDepartment: costDept,
                    analysis: analyzeCost(costDept),
                },
            },
        };
    } catch (error) {
        logger.error({ event: 'DASHBOARD_FAILED', error: error.message });
        return { success: false, message: error.message, statusCode: 500 };
    }
};

// ─────────────────────────────────────────────────────────────

module.exports = {
    getAttritionSummary,
    getDepartmentPerformance,
    getLeaveTrends,
    getCostPerEmployee,
    getDashboard,
};