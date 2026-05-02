// src/components/reports/DashboardReport.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Users,
    IndianRupee,
    Calendar,
    Receipt,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    AlertCircle,
    Activity,
    Building2,
    Clock,
    CheckCircle,
} from 'lucide-react';
import reportsAPI from '../api/reports.api';
import ReportDateRange from './ReportDateRange';
import ExportButtons from './ExportButtons';
import { useNavigate } from 'react-router-dom';

// Indian currency formatter
const formatIndianCurrency = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
};

// Format percentage change
const formatChange = (change) => {
    if (change === undefined || change === null) return null;
    return Math.abs(change).toFixed(1);
};

const DashboardReport = () => {
    const navigate = useNavigate();
    const [dateRange, setDateRange] = useState(() => {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return {
            from: thirtyDaysAgo.toISOString().split('T')[0],
            to: today.toISOString().split('T')[0],
        };
    });
    const [apiResponse, setApiResponse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboard = useCallback(async () => {
        const abortController = new AbortController();
        try {
            setLoading(true);
            setError(null);
            const response = await reportsAPI.getDashboard({
                from: dateRange.from,
                to: dateRange.to,
            }, { signal: abortController.signal });
            const data = response.data || response;
            setApiResponse(data);
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.response?.data?.message || 'Failed to load dashboard');
            }
        } finally {
            setLoading(false);
        }
        return () => abortController.abort();
    }, [dateRange]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Transform API response into dashboard metrics
    const dashboardData = useMemo(() => {
        if (!apiResponse) return null;

        const employees = apiResponse.employees || {};
        const payroll = apiResponse.payroll || {};
        const leave = apiResponse.leave || {};
        const expenses = apiResponse.expenses || {};

        // Employee summary (nested inside .data)
        const empSummary = employees.summary?.data || {};
        const totalEmployees = empSummary.total || 0;
        const activeEmployees = parseInt(empSummary.active, 10) || 0;
        const inactiveEmployees = parseInt(empSummary.inactive, 10) || 0;
        const totalDepartments = empSummary.totalDepartments || 0;

        // Payroll summary (nested inside .data)
        const payrollSummary = payroll.summary?.data || {};
        const totalPayroll = parseFloat(payrollSummary.totalNetSalary) || 0;
        const avgNetSalary = parseFloat(payrollSummary.avgNetSalary) || 0;
        const payrollCount = parseInt(payrollSummary.totalPayrolls, 10) || 0;
        const processedPayrolls = parseInt(payrollSummary.processed, 10) || 0;

        // Leave summary (nested inside .data)
        const leaveSummary = leave.summary?.data || {};
        const leaveRequests = parseInt(leaveSummary.total, 10) || 0;
        const pendingLeaves = parseInt(leaveSummary.pending, 10) || 0;
        const approvedLeaves = parseInt(leaveSummary.approved, 10) || 0;
        const rejectedLeaves = parseInt(leaveSummary.rejected, 10) || 0;
        const totalApprovedDays = parseFloat(leaveSummary.totalApprovedDays) || 0;

        // Expense summary (nested inside .data)
        const expenseSummary = expenses.summary?.data || {};
        const totalExpenses = parseFloat(expenseSummary.totalAmount) || 0;
        const expenseCount = expenseSummary.total || 0;
        const managerPendingAmount = parseFloat(expenseSummary.managerPendingAmount) || 0;
        const financePendingAmount = parseFloat(expenseSummary.financePendingAmount) || 0;
        const totalPaidOut = parseFloat(expenseSummary.totalPaidOut) || 0;
        const totalUnpaid = parseFloat(expenseSummary.totalUnpaid) || 0;

        // Recent activity feed using the .list arrays
        const recentActivity = [];

        if (Array.isArray(employees.list)) {
            employees.list.slice(0, 3).forEach(emp => {
                recentActivity.push({
                    type: 'employee',
                    description: `${emp.first_name} ${emp.last_name} joined (${emp.department})`,
                    timestamp: emp.created_at,
                });
            });
        }

        if (Array.isArray(expenses.list)) {
            expenses.list.slice(0, 3).forEach(exp => {
                const status = exp.manager_approval_status === 'Approved' ? 'approved' : 'submitted';
                recentActivity.push({
                    type: 'expense',
                    description: `Expense ${status}: ${formatIndianCurrency(exp.amount)} for ${exp.category}`,
                    timestamp: exp.created_at,
                });
            });
        }

        if (Array.isArray(leave.list)) {
            leave.list.slice(0, 2).forEach(l => {
                recentActivity.push({
                    type: 'leave',
                    description: `Leave request ${l.status?.toLowerCase()} for ${l.days_requested} day(s)`,
                    timestamp: l.created_at,
                });
            });
        }

        recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const topRecent = recentActivity.slice(0, 5);

        return {
            totalEmployees,
            activeEmployees,
            inactiveEmployees,
            totalDepartments,
            totalPayroll,
            avgNetSalary,
            payrollCount,
            processedPayrolls,
            leaveRequests,
            pendingLeaves,
            approvedLeaves,
            rejectedLeaves,
            totalApprovedDays,
            totalExpenses,
            expenseCount,
            managerPendingAmount,
            financePendingAmount,
            totalPaidOut,
            totalUnpaid,
            recentActivity: topRecent,
        };
    }, [apiResponse]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400 relative z-10" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 p-5 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                    <p className="font-medium">Failed to load dashboard</p>
                    <p className="text-sm mt-1 opacity-80">{error}</p>
                </div>
            </div>
        );
    }

    if (!dashboardData) return null;

    const stats = [
        {
            title: 'Total Employees',
            value: dashboardData.totalEmployees,
            icon: Users,
            href: '/users',
            gradient: 'from-blue-500 to-cyan-500',
            bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
            iconBg: 'bg-blue-100 dark:bg-blue-900/40',
            iconColor: 'text-blue-600 dark:text-blue-400',
            format: (val) => val.toLocaleString('en-IN'),
        },
        {
            title: 'Payroll Cost',
            value: dashboardData.totalPayroll,
            icon: IndianRupee,
            href: '/payroll',
            gradient: 'from-emerald-500 to-green-500',
            bgGradient: 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            format: formatIndianCurrency,
        },
        {
            title: 'Leave Requests',
            value: dashboardData.leaveRequests,
            icon: Calendar,
            href: '/pending-leave',
            gradient: 'from-purple-500 to-pink-500',
            bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
            iconBg: 'bg-purple-100 dark:bg-purple-900/40',
            iconColor: 'text-purple-600 dark:text-purple-400',
            format: (val) => val.toLocaleString('en-IN'),
        },
        {
            title: 'Total Expenses',
            value: dashboardData.totalExpenses,
            icon: Receipt,
            href: '/expenses',
            gradient: 'from-amber-500 to-orange-500',
            bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
            iconBg: 'bg-amber-100 dark:bg-amber-900/40',
            iconColor: 'text-amber-600 dark:text-amber-400',
            format: formatIndianCurrency,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header with date range and export */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl">
                        <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard Overview</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Key metrics and insights for {new Date(dateRange.from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(dateRange.to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <ReportDateRange
                        from={dateRange.from}
                        to={dateRange.to}
                        onChange={setDateRange}
                    />
                    <ExportButtons module="dashboard" from={dateRange.from} to={dateRange.to} />
                </div>
            </div>

            {/* Primary Stats Cards */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const formattedValue = stat.format(stat.value);
                    return (
                        <div
                            key={stat.title}
                            onClick={() => stat.href && navigate(stat.href)}
                            className={`group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${stat.bgGradient} backdrop-blur-sm cursor-pointer`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                            <div className="relative p-5 md:p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            {stat.title}
                                        </p>
                                        <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                            {formattedValue}
                                        </p>
                                    </div>

                                    <div className={`p-3 rounded-xl ${stat.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                                        <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Secondary Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/60 p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-500" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Active Employees</p>
                    </div>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{dashboardData.activeEmployees}</p>
                    <p className="text-xs text-gray-400 mt-1">{dashboardData.inactiveEmployees} inactive</p>
                </div>
                <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/60 p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-emerald-500" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Departments</p>
                    </div>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{dashboardData.totalDepartments}</p>
                </div>
                <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/60 p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Pending Approvals</p>
                    </div>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatIndianCurrency(dashboardData.managerPendingAmount)}</p>
                    <p className="text-xs text-gray-400 mt-1">Expense claims</p>
                </div>
                <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/60 p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-purple-500" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Leave Status</p>
                    </div>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{dashboardData.pendingLeaves} pending</p>
                    <p className="text-xs text-gray-400 mt-1">{dashboardData.approvedLeaves} approved</p>
                </div>
            </div>

            {/* Financial Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/60 p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Average Salary</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatIndianCurrency(dashboardData.avgNetSalary)}</p>
                    <p className="text-xs text-gray-400 mt-1">Across {dashboardData.payrollCount} payrolls</p>
                </div>
                <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/60 p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Unpaid Expenses</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatIndianCurrency(dashboardData.totalUnpaid)}</p>
                    <p className="text-xs text-gray-400 mt-1">{dashboardData.expenseCount} total claims</p>
                </div>
                <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/60 p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Paid Out</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatIndianCurrency(dashboardData.totalPaidOut)}</p>
                    <p className="text-xs text-gray-400 mt-1">Settled expenses</p>
                </div>
            </div>

            {/* Recent Activity Section */}
            {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
                <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden backdrop-blur-sm">
                    <div className="px-5 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700/60">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                                <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200 dark:divide-gray-700/60">
                        {dashboardData.recentActivity.map((activity, idx) => (
                            <div
                                key={`${activity.timestamp}-${idx}`}
                                className="flex flex-col sm:flex-row sm:items-center justify-between px-5 md:px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                    <div className={`w-2 h-2 rounded-full ${activity.type === 'employee' ? 'bg-blue-500' :
                                        activity.type === 'expense' ? 'bg-amber-500' :
                                            activity.type === 'leave' ? 'bg-purple-500' : 'bg-gray-500'
                                        }`}></div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {activity.description}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2.5 py-1 rounded-full">
                                    {new Date(activity.timestamp).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/60 p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center">
                        <Activity className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-gray-900 dark:text-white font-medium mb-1">No recent activity</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Activity will appear here as it happens
                    </p>
                </div>
            )}
        </div>
    );
};

export default DashboardReport;