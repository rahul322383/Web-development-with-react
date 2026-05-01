'use strict';

const repo = require('./reports.repository');
const logger = require('../../config/logger');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

// ─── helpers ─────────────────────────────────────────────────────────────────


const getMonthKey = (date) =>
    new Date(date).toISOString().slice(0, 7);


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

    return safe(async () => {
        const byDepartment = await repo.getEmployeesByDepartment();
        const byRole = await repo.getEmployeesByRole();
        const newHires = await repo.getNewHires(from, to);
        const allEmployees = await repo.getAllEmployees();

        // helpers
        const filterByDepartment = (dept) =>
            allEmployees.filter(e => e.department === dept);

        const filterByRole = (role) =>
            allEmployees.filter(e => e.role === role || e.role_name === role);

        const isNewHire = (emp) =>
            new Date(emp.created_at) >= new Date(from) &&
            new Date(emp.created_at) <= new Date(to);

        return {
            summary: {
                label: "Employee Overview",

                totalEmployees: {
                    label: "Total Employees",
                    value: allEmployees.length,
                    records: allEmployees,
                },

                activeEmployees: {
                    label: "Active Employees",
                    value: allEmployees.filter(e => e.is_active === 1).length,
                    records: allEmployees.filter(e => e.is_active === 1),
                },

                inactiveEmployees: {
                    label: "Inactive Employees",
                    value: allEmployees.filter(e => e.is_active === 0).length,
                    records: allEmployees.filter(e => e.is_active === 0),
                },

                departmentsCount: {
                    label: "Total Departments",
                    value: [...new Set(allEmployees.map(e => e.department))].length,
                },
            },

            byDepartment: {
                label: "Department-wise Employees",
                records: byDepartment.map(d => ({
                    department: d.department,
                    employees: d.employees,
                    total: d.employees?.length || 0,
                    fullList: filterByDepartment(d.department),
                })),
            },

            byRole: {
                label: "Role-wise Employees",
                records: byRole.map(r => ({
                    role: r.role,
                    employees: r.employees,
                    total: r.employees?.length || 0,
                    fullList: filterByRole(r.role),
                })),
            },

            newHires: {
                label: "New Joiners",
                period: { from, to },
                records: newHires,
            },

            timeline: {
                label: "Employee Activity Timeline",
                records: allEmployees.map(e => ({
                    employee: `${e.first_name} ${e.last_name}`,
                    department: e.department,
                    joinedAt: e.created_at,
                    isNewHire: isNewHire(e),
                })),
            },

            list: allEmployees, 
        };

    }, 'EMPLOYEE_REPORT_FAILED');
};

// ─── PAYROLL ─────────────────────────────────────────────────────────────────

const getPayrollReport = async (query) => {
    const { from, to } = query.from && query.to ? query : defaultRange();

    return safe(async () => {
        const [summary] = await repo.getPayrollSummary(from, to);
        const byDepartment = await repo.getPayrollByDepartment(from, to);
        const trend = await repo.getPayrollTrend(from, to);
        const allPayrolls = await repo.getAllPayrolls(from, to);

        // helpers
        const filterByDepartment = (dept) =>
            allPayrolls.filter(p => p.department === dept);

        const filterByMonth = (month) =>
            allPayrolls.filter(p =>
                new Date(`01-${p.month}-${p.year}`)
                    .toISOString()
                    .slice(0, 7) === month
            );

        return {
            summary: {
                label: "Payroll Overview",

                totalPayrolls: {
                    label: "Total Payrolls",
                    value: summary.totalPayrolls,
                    records: allPayrolls,
                },

                totalNetSalary: {
                    label: "Total Net Salary Paid",
                    value: summary.totalNetSalary,
                    records: allPayrolls,
                },

                averageNetSalary: {
                    label: "Average Net Salary",
                    value: summary.avgNetSalary,
                },

                maxNetSalary: {
                    label: "Highest Salary",
                    value: summary.maxNetSalary,
                },

                minNetSalary: {
                    label: "Lowest Salary",
                    value: summary.minNetSalary,
                },

                statusBreakdown: {
                    processed: {
                        label: "Processed Payrolls",
                        value: summary.processed,
                    },
                    draft: {
                        label: "Draft Payrolls",
                        value: summary.draft,
                    },
                    locked: {
                        label: "Locked Payrolls",
                        value: summary.locked,
                    },
                },
            },

            byDepartment: {
                label: "Department-wise Payroll",
                records: byDepartment.map(d => ({
                    department: d.department,
                    totalSalary: d.totalNetSalary,
                    count: d.count,
                    payrolls: filterByDepartment(d.department),
                })),
            },

            trend: {
                label: "Payroll Trend",
                records: trend.map(t => ({
                    month: t.month,
                    totalSalary: t.total,
                    payrolls: filterByMonth(t.month),
                })),
            },

            allPayrolls, // 🔥 full drill-down data
        };

    }, 'PAYROLL_REPORT_FAILED');
};

// ─── LEAVE ───────────────────────────────────────────────────────────────────

const getLeaveReport = async (query) => {
    const { from, to } = query.from && query.to ? query : defaultRange();

    return safe(async () => {
        const [summary] = await repo.getLeaveSummary(from, to);
        const byStatus = await repo.getLeaveByStatus(from, to);
        const trend = await repo.getLeaveTrend(from, to);
        const topUsers = await repo.getTopLeaveUsers(from, to);
        const allLeaves = await repo.getAllLeaves(from, to);

        // helper: filter full records
        const filterLeaves = (status) =>
            allLeaves.filter(l => l.status === status);

        return {
            summary: {
                label: "Leave Summary Overview",
                description: "Complete leave dataset with full records",

                totalRequests: {
                    label: "All Leave Requests",
                    count: summary.total,
                    records: allLeaves
                },

                approvedRequests: {
                    label: "Approved Leaves",
                    count: summary.approved,
                    records: filterLeaves("Approved")
                },

                pendingRequests: {
                    label: "Pending Leaves",
                    count: summary.pending,
                    records: filterLeaves("Pending")
                },

                rejectedRequests: {
                    label: "Rejected Leaves",
                    count: summary.rejected,
                    records: filterLeaves("Rejected")
                },

                totalApprovedDays: {
                    label: "Approved Leave Days",
                    count: summary.totalApprovedDays,
                    records: filterLeaves("Approved")
                }
            },

            byStatus: {
                label: "Leave Status Breakdown",
                records: byStatus.map(status => ({
                    status: status.status,
                    totalRequests: status.total,
                    totalDays: status.totalDays,
                    fullRecords: filterLeaves(status.status)
                }))
            },

            trend: {
                label: "Leave Trend Timeline",
                records: trend.map(t => ({
                    month: t.month,
                    totalRequests: t.total,
                    totalDays: t.totalDays,
                    records: allLeaves.filter(l =>
                        getMonthKey(l.start_date) === t.month
                    )
                }))
            },

            topUsers: {
                label: "Top Leave Users",
                records: topUsers.map(user => ({
                    name: `${user.first_name} ${user.last_name}`,
                    department: user.department,
                    requests: user.requests,
                    totalDays: user.totalDays,
                    leaveHistory: allLeaves.filter(l =>
                        l.employee_id === user.id
                    )
                }))
            }
        };
    }, 'LEAVE_REPORT_FAILED');
};


const getExpenseReport = async (query) => {
    const { from, to } = query.from && query.to ? query : defaultRange();

    return safe(async () => {
        const [summary] = await repo.getExpenseSummary(from, to);
        const byCategory = await repo.getExpenseByCategory(from, to);
        const trend = await repo.getExpenseTrend(from, to);
        const topSpenders = await repo.getTopSpenders(from, to);
        const allExpenses = await repo.getAllExpenses(from, to);

        // helpers
        const filterByCategory = (category) =>
            allExpenses.filter(e => e.category === category);

        const filterByMonth = (month) =>
            allExpenses.filter(e =>
                getMonthKey(e.created_at) === month
            );

        const filterByUser = (userId) =>
            allExpenses.filter(e => e.employee_id === userId);

        return {
            summary: {
                label: "Expense Overview",
                description: "Complete expense analytics with full drill-down data",

                totalExpenses: {
                    label: "Total Expense Requests",
                    count: summary.total,
                    records: allExpenses,
                },

                totalAmount: {
                    label: "Total Spent Amount",
                    amount: summary.totalAmount,
                    records: allExpenses,
                },

                averageAmount: {
                    label: "Average Expense",
                    amount: summary.avgAmount,
                },

                managerApproved: {
                    label: "Manager Approved Expenses",
                    amount: summary.managerApprovedAmount,
                    records: allExpenses.filter(e => e.manager_approval_status === "Approved"),
                },

                managerPending: {
                    label: "Manager Pending Expenses",
                    amount: summary.managerPendingAmount,
                    records: allExpenses.filter(e => e.manager_approval_status === "Pending"),
                },

                managerRejected: {
                    label: "Manager Rejected Expenses",
                    amount: summary.managerRejectedAmount,
                    records: allExpenses.filter(e => e.manager_approval_status === "Rejected"),
                },

                financeApproved: {
                    label: "Finance Approved Expenses",
                    amount: summary.financeApprovedAmount,
                    records: allExpenses.filter(e => e.finance_approval_status === "Approved"),
                },

                paidOut: {
                    label: "Paid Expenses",
                    amount: summary.totalPaidOut,
                    records: allExpenses.filter(e => e.payment_status === "Paid"),
                },

                unpaid: {
                    label: "Unpaid Expenses",
                    amount: summary.totalUnpaid,
                    records: allExpenses.filter(e => e.payment_status === "Unpaid"),
                },
            },

            byCategory: {
                label: "Category Breakdown",
                records: byCategory.map(cat => ({
                    category: cat.category,
                    totalCount: cat.count,
                    totalAmount: cat.total,
                    records: filterByCategory(cat.category),
                })),
            },

            trend: {
                label: "Expense Trend",
                records: trend.map(t => ({
                    month: t.month,
                    totalAmount: t.total,
                    records: filterByMonth(t.month),
                })),
            },

            topSpenders: {
                label: "Top Spending Employees",
                records: topSpenders.map(user => ({
                    name: `${user.first_name} ${user.last_name}`,
                    department: user.department,
                    totalClaims: user.claims,
                    totalSpent: user.totalSpent,
                    expenseHistory: filterByUser(user.id),
                })),
            },
        };
    }, 'EXPENSE_REPORT_FAILED');
};

// ─── DASHBOARD (all in one) ──────────────────────────────────────────────────

const getDashboard = async (query) => {
    const { from, to } = query.from && query.to ? query : defaultRange();

    return safe(async () => {
        const [
            employeeSummary,
            payrollSummary,
            leaveSummary,
            expenseSummary
        ] = await Promise.all([
            repo.getEmployeeSummary(),
            repo.getPayrollSummary(from, to),
            repo.getLeaveSummary(from, to),
            repo.getExpenseSummary(from, to),
        ]);

        const employees = await repo.getAllEmployees();
        const payrolls = await repo.getAllPayrolls(from, to);
        const leaves = await repo.getAllLeaves(from, to);
        const expenses = await repo.getAllExpenses(from, to);

        return {
            employees: {
                summary: {
                    label: "Employee Overview",
                    data: employeeSummary[0],
                },

                byDepartment: {
                    label: "Department Distribution",
                    records: await repo.getEmployeesByDepartment(),
                },

                byRole: {
                    label: "Role Distribution",
                    records: await repo.getEmployeesByRole(),
                },

                list: employees,
            },

            payroll: {
                summary: {
                    label: "Payroll Overview",
                    data: payrollSummary[0],
                },

                trend: {
                    label: "Payroll Trend",
                    records: await repo.getPayrollTrend(from, to),
                },

                byDepartment: {
                    label: "Payroll by Department",
                    records: await repo.getPayrollByDepartment(from, to),
                },

                list: payrolls,
            },

            leave: {
                summary: {
                    label: "Leave Overview",
                    data: leaveSummary[0],
                },

                byStatus: {
                    label: "Leave Status Breakdown",
                    records: await repo.getLeaveByStatus(from, to),
                },

                trend: {
                    label: "Leave Trend",
                    records: await repo.getLeaveTrend(from, to),
                },

                topUsers: {
                    label: "Top Leave Users",
                    records: await repo.getTopLeaveUsers(from, to),
                },

                list: leaves,
            },

            expenses: {
                summary: {
                    label: "Expense Overview",
                    data: expenseSummary[0],
                },

                byCategory: {
                    label: "Expense Categories",
                    records: await repo.getExpenseByCategory(from, to),
                },

                trend: {
                    label: "Expense Trend",
                    records: await repo.getExpenseTrend(from, to),
                },

                topSpenders: {
                    label: "Top Spenders",
                    records: await repo.getTopSpenders(from, to),
                },

                list: expenses,
            },
        };

    }, 'DASHBOARD_FAILED');
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