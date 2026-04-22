'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const reportsService = require('./reports.service');

const dashboard = asyncHandler(async (req, res) => {
    const result = await reportsService.getDashboard(req.query);
    return res.status(result.success ? 200 : result.statusCode).json(result);
});

const employees = asyncHandler(async (req, res) => {
    const result = await reportsService.getEmployeeReport(req.query);
    return res.status(result.success ? 200 : result.statusCode).json(result);
});

const payroll = asyncHandler(async (req, res) => {
    const result = await reportsService.getPayrollReport(req.query);
    return res.status(result.success ? 200 : result.statusCode).json(result);
});

const leave = asyncHandler(async (req, res) => {
    const result = await reportsService.getLeaveReport(req.query);
    return res.status(result.success ? 200 : result.statusCode).json(result);
});

const expenses = asyncHandler(async (req, res) => {
    const result = await reportsService.getExpenseReport(req.query);
    return res.status(result.success ? 200 : result.statusCode).json(result);
});

const exportCSV = asyncHandler(async (req, res) => {
    const result = await reportsService.exportCSV(req.params.module, req.query);
    if (!result.success) return res.status(result.statusCode).json(result);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.send(result.csv);
});

const exportPDF = asyncHandler(async (req, res) => {
    const result = await reportsService.exportPDF(req.params.module, req.query);
    if (!result.success) return res.status(result.statusCode).json(result);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.send(result.buffer);
});

module.exports = { dashboard, employees, payroll, leave, expenses, exportCSV, exportPDF };