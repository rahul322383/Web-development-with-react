'use strict';

const express = require('express');
const router = express.Router();

const  authenticate  = require('../../middleware/auth.middleware'); // same middleware you use elsewhere
const {
    getDashboard,
    getAttrition,
    getDepartments,
    getLeaves,
    getCost,
} = require('./analyticsController');

// All analytics routes require a valid JWT
router.use(authenticate);

/**
 * GET /api/analytics/dashboard
 * Returns all 4 metrics in one shot — use this for the React dashboard page.
 *
 * Query params (all optional):
 *   startDate  — ISO date string  e.g. 2024-01-01  (default: 12 months ago)
 *   endDate    — ISO date string  e.g. 2024-12-31  (default: today)
 *   department — string           e.g. Engineering  (default: all)
 */
router.get('/dashboard', getDashboard);

/**
 * GET /api/analytics/attrition
 * { overall: { attritionRate, totalActive, leftInPeriod }, byDepartment: [...] }
 */
router.get('/attrition', getAttrition);

/**
 * GET /api/analytics/departments
 * [{ department, headCount, avgBaseSalary, avgHoursWorked, totalLeaveDays }]
 */
router.get('/departments', getDepartments);

/**
 * GET /api/analytics/leaves
 * { monthly: [...], statusBreakdown: [...] }
 */
router.get('/leaves', getLeaves);

/**
 * GET /api/analytics/cost
 * { overall: { employeeCount, totalSalary, avgSalary }, byDepartment: [...] }
 */
router.get('/cost', getCost);

module.exports = router;