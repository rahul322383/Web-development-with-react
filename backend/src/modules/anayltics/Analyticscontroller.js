'use strict';

const analyticsService = require('./analyticsService');

// ─────────────────────────────────────────────────────────────
//  Response helper — mirrors the pattern in your auth routes
// ─────────────────────────────────────────────────────────────

const respond = (res, result) => {
    if (!result.success) {
        return res.status(result.statusCode || 500).json({
            success: false,
            message: result.message || 'Something went wrong',
        });
    }
    return res.status(200).json(result);
};

// ─────────────────────────────────────────────────────────────
//  GET /api/analytics/dashboard
//  Query params: startDate, endDate, department (all optional)
// ─────────────────────────────────────────────────────────────

const getDashboard = async (req, res) => {
    const result = await analyticsService.getDashboard(req.query);
    return respond(res, result);
};

// ─────────────────────────────────────────────────────────────
//  GET /api/analytics/attrition
// ─────────────────────────────────────────────────────────────

const getAttrition = async (req, res) => {
    const result = await analyticsService.getAttritionSummary(req.query);
    return respond(res, result);
};

// ─────────────────────────────────────────────────────────────
//  GET /api/analytics/departments
// ─────────────────────────────────────────────────────────────

const getDepartments = async (req, res) => {
    const result = await analyticsService.getDepartmentPerformance(req.query);
    return respond(res, result);
};

// ─────────────────────────────────────────────────────────────
//  GET /api/analytics/leaves
// ─────────────────────────────────────────────────────────────

const getLeaves = async (req, res) => {
    const result = await analyticsService.getLeaveTrends(req.query);
    return respond(res, result);
};

// ─────────────────────────────────────────────────────────────
//  GET /api/analytics/cost
// ─────────────────────────────────────────────────────────────

const getCost = async (req, res) => {
    const result = await analyticsService.getCostPerEmployee(req.query);
    return respond(res, result);
};

module.exports = {
    getDashboard,
    getAttrition,
    getDepartments,
    getLeaves,
    getCost,
};