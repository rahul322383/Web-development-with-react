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
    let insight = 'No major change';

    if (trend > 5) {
        status = 'warning';
        insight = 'Metric increased significantly';
    } else if (trend < -5) {
        status = 'good';
        insight = 'Metric improved';
    }

    return {
        value: Number(value?.toFixed?.(2) || value),
        trend: Number(trend.toFixed(2)),
        status,
        insight,
    };
};

// ─────────────────────────────────────────────────────────────
// DEPARTMENT PERFORMANCE ENHANCEMENT
// ─────────────────────────────────────────────────────────────

const enhanceDepartmentPerformance = (rows = []) => {
    return rows.map((dept) => {
        const productivity =
            safeDivide(dept.worked_minutes, dept.expected_minutes) * 0.6 +
            (dept.attendance_rate || 0) * 0.4;

        let status = 'low';
        if (productivity > 0.8) status = 'high';
        else if (productivity > 0.6) status = 'medium';

        return {
            ...dept,
            productivityScore: Number(productivity.toFixed(2)),
            status,
        };
    });
};

// ─────────────────────────────────────────────────────────────
// LEAVE ANALYSIS
// ─────────────────────────────────────────────────────────────

const analyzeLeaveTrends = (monthly = []) => {
    if (!monthly.length) return {};

    const max = Math.max(...monthly.map((m) => m.total || 0));
    const peak = monthly.find((m) => m.total === max);

    return {
        peakMonth: peak?.month || null,
        peakValue: max,
    };
};

// ─────────────────────────────────────────────────────────────
// COST ANALYSIS
// ─────────────────────────────────────────────────────────────

const analyzeCost = (byDepartment = []) => {
    if (!byDepartment.length) return {};

    const highest = byDepartment.reduce((a, b) =>
        (a.cost || 0) > (b.cost || 0) ? a : b
    );

    return {
        highestCostDepartment: highest?.department || null,
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

        const trend = calculateTrend(current?.rate, previous?.rate);
        const insight = buildTrendInsight(current?.rate, trend);

        return {
            success: true,
            data: {
                period: {
                    startDate,
                    endDate,
                },
                overall: insight,
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

        const rows = await analyticsRepository.getDepartmentStats({
            startDate,
            endDate,
            department,
        });

        const enhanced = enhanceDepartmentPerformance(rows);

        return { success: true, data: enhanced };
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

        const currentTotal = current.reduce((sum, m) => sum + (m.total || 0), 0);
        const prevTotal = previous.reduce((sum, m) => sum + (m.total || 0), 0);

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

        const trend = calculateTrend(current?.cost, previous?.cost);
        const insight = buildTrendInsight(current?.cost, trend);

        return {
            success: true,
            data: {
                overall: insight,
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

        const attritionInsight = buildTrendInsight(
            attrition?.rate,
            calculateTrend(attrition?.rate, prevAttrition?.rate)
        );

        const leaveInsight = buildTrendInsight(
            leaves.reduce((s, m) => s + (m.total || 0), 0),
            calculateTrend(
                leaves.reduce((s, m) => s + (m.total || 0), 0),
                prevLeaves.reduce((s, m) => s + (m.total || 0), 0)
            )
        );

        const costInsight = buildTrendInsight(
            cost?.cost,
            calculateTrend(cost?.cost, prevCost?.cost)
        );

        return {
            success: true,
            data: {
                attrition: attritionInsight,
                departmentPerformance: enhanceDepartmentPerformance(dept),
                leaveTrends: {
                    insight: leaveInsight,
                    monthly: leaves,
                    analysis: analyzeLeaveTrends(leaves),
                },
                cost: {
                    insight: costInsight,
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