'use strict';

const repo = require('./reports.repository');
const logger = require('../../config/logger');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

// ─── helpers ─────────────────────────────────────────────────────────────────

const defaultRange = () => {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 1);
    return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] };
};

const safe = async (fn, event, extra = {}) => {
    try {
        return { success: true, data: await fn() };
    } catch (error) {
        logger.error({ event, error: error.message, ...extra });
        return { success: false, message: error.message || 'Failed', statusCode: 500 };
    }
};

// ─── EMPLOYEE ────────────────────────────────────────────────────────────────

const getEmployeeReport = async (query) => {
    const { from, to } = query.from && query.to ? query : defaultRange();

    return safe(async () => ({

        // ❌ remove summary completely if you want pure full data
        // summary: (await repo.getEmployeeSummary())[0],

        byDepartment: await repo.getEmployeesByDepartment(),

        byRole: await repo.getEmployeesByRole(),

        newHires: await repo.getNewHires(from, to),

        // 🔥 optional full flat list
        list: await repo.getAllEmployees(),

    }), 'EMPLOYEE_REPORT_FAILED');
};

// ─── PAYROLL ─────────────────────────────────────────────────────────────────

const getPayrollReport = async (query) => {
    const { from, to } = query.from && query.to ? query : defaultRange();
    return safe(async () => ({
        summary: (await repo.getPayrollSummary(from, to))[0],
        byDepartment: await repo.getPayrollByDepartment(from, to),
        trend: await repo.getPayrollTrend(from, to),
    }), 'PAYROLL_REPORT_FAILED');
};

// ─── LEAVE ───────────────────────────────────────────────────────────────────

const getLeaveReport = async (query) => {
    const { from, to } = query.from && query.to ? query : defaultRange();
    return safe(async () => ({
        summary: (await repo.getLeaveSummary(from, to))[0],
        byStatus: await repo.getLeaveByStatus(from, to),   // ✅ fixed
        trend: await repo.getLeaveTrend(from, to),
        topUsers: await repo.getTopLeaveUsers(from, to),
    }), 'LEAVE_REPORT_FAILED');
};

// ─── EXPENSES ────────────────────────────────────────────────────────────────

const getExpenseReport = async (query) => {
    const { from, to } = query.from && query.to ? query : defaultRange();
    return safe(async () => ({
        summary: (await repo.getExpenseSummary(from, to))[0],
        byCategory: await repo.getExpenseByCategory(from, to),
        trend: await repo.getExpenseTrend(from, to),
        topSpenders: await repo.getTopSpenders(from, to),
    }), 'EXPENSE_REPORT_FAILED');
};

// ─── DASHBOARD (all in one) ──────────────────────────────────────────────────

const getDashboard = async (query) => {
    const { from, to } = query.from && query.to ? query : defaultRange();

    return safe(async () => ({
        employees: {
            summary: (await repo.getEmployeeSummary())[0],
            byDepartment: await repo.getEmployeesByDepartment(),
            byRole: await repo.getEmployeesByRole(),
            list: await repo.getAllEmployees(), // 🔥 full data
        },

        payroll: {
            summary: (await repo.getPayrollSummary(from, to))[0],
            trend: await repo.getPayrollTrend(from, to),
            byDepartment: await repo.getPayrollByDepartment(from, to),
            list: await repo.getAllPayrolls(from, to), // 🔥 full data
        },

        leave: {
            summary: (await repo.getLeaveSummary(from, to))[0],
            byStatus: await repo.getLeaveByStatus(from, to),
            trend: await repo.getLeaveTrend(from, to),
            topUsers: await repo.getTopLeaveUsers(from, to),
            list: await repo.getAllLeaves(from, to), // 🔥 full data
        },

        expenses: {
            summary: (await repo.getExpenseSummary(from, to))[0],
            byCategory: await repo.getExpenseByCategory(from, to),
            trend: await repo.getExpenseTrend(from, to),
            topSpenders: await repo.getTopSpenders(from, to),
            list: await repo.getAllExpenses(from, to), // 🔥 full data
        },

    }), 'DASHBOARD_FAILED');
};

// ─── EXPORT CSV ──────────────────────────────────────────────────────────────

const exportCSV = async (module, query) => {
    try {
        const { from, to } = query.from && query.to ? query : defaultRange();

        const dataMap = {
            employees: async () => repo.getEmployeesByDepartment(),
            payroll: async () => repo.getPayrollByDepartment(from, to),
            leave: async () => repo.getLeaveByStatus(from, to),      // ✅ fixed
            expenses: async () => repo.getExpenseByCategory(from, to),
        };

        if (!dataMap[module])
            return { success: false, message: 'Invalid module for export', statusCode: 400 };

        const rows = await dataMap[module]();
        const parser = new Parser();
        const csv = parser.parse(rows);
        return { success: true, csv, filename: `${module}-report-${from}-${to}.csv` };
    } catch (error) {
        logger.error({ event: 'EXPORT_CSV_FAILED', module, error: error.message });
        return { success: false, message: error.message || 'Export failed', statusCode: 500 };
    }
};

// ─── EXPORT PDF ──────────────────────────────────────────────────────────────

const exportPDF = async (module, query) => {
    try {
        const { from, to } = query.from && query.to ? query : defaultRange();

        const reportMap = {
            employees: getEmployeeReport,
            payroll: getPayrollReport,
            leave: getLeaveReport,
            expenses: getExpenseReport,
        };

        if (!reportMap[module])
            return { success: false, message: 'Invalid module for export', statusCode: 400 };

        const result = await reportMap[module](query);
        if (!result.success) return result;

        return new Promise((resolve) => {
            const doc = new PDFDocument({ margin: 40 });
            const buffers = [];

            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve({
                success: true,
                buffer: Buffer.concat(buffers),
                filename: `${module}-report-${from}-${to}.pdf`,
            }));

            doc.fontSize(18).text(`${module.toUpperCase()} REPORT`, { align: 'center' });
            doc.moveDown();
            doc.fontSize(11).text(`Period: ${from} to ${to}`);
            doc.moveDown();

            // Summary section
            const summary = result.data.summary;
            if (summary) {
                doc.fontSize(13).text('Summary', { underline: true });
                doc.moveDown(0.5);
                Object.entries(summary).forEach(([k, v]) => {
                    doc.fontSize(10).text(`${k}: ${v}`);
                });
                doc.moveDown();
            }

            // Breakdown section — ✅ added byStatus for leave
            const breakdown = result.data.byDepartment
                || result.data.byStatus      // ✅ fixed (was byType)
                || result.data.byCategory
                || result.data.byRole;

            if (breakdown?.length) {
                doc.fontSize(13).text('Breakdown', { underline: true });
                doc.moveDown(0.5);
                breakdown.forEach((row) => {
                    doc.fontSize(10).text(JSON.stringify(row));
                });
            }

            doc.end();
        });
    } catch (error) {
        logger.error({ event: 'EXPORT_PDF_FAILED', module, error: error.message });
        return { success: false, message: error.message || 'PDF export failed', statusCode: 500 };
    }
};

module.exports = {
    getEmployeeReport,
    getPayrollReport,
    getLeaveReport,
    getExpenseReport,
    getDashboard,
    exportCSV,
    exportPDF,
};