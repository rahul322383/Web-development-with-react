// src/components/reports/ExpenseReport.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Loader2,
    Receipt,
    IndianRupee,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    User,
    Tag,
    Calendar,
} from 'lucide-react';
import reportsAPI from '../api/reports.api';
import ReportDateRange from './ReportDateRange';
import ExportButtons from './ExportButtons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Indian currency formatter
const formatIndianCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
};

const ExpenseReport = () => {
    const navigate = useNavigate();
    const { user, meta } = useAuth();
    const [dateRange, setDateRange] = useState(() => {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return {
            from: thirtyDaysAgo.toISOString().split('T')[0],
            to: today.toISOString().split('T')[0],
        };
    });
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('table');

    // Transform the API response into the shape the component expects
    const transformResponse = (response) => {
        // Response structure: { success, data: { summary, byCategory, trend, topSpenders } }
        const responseData = response.data || response;
        const summaryData = responseData.summary || {};

        // 1. Extract all expense records from totalExpenses.records
        const allExpenses = summaryData.totalExpenses?.records || [];

        // 2. Build the flat expenses array for the table/cards
        const expenseList = allExpenses.map(exp => ({
            id: exp.id,
            employeeId: exp.employee_id,
            // Employee name not provided in this response; display ID as fallback
            employeeName: `Employee ${exp.employee_id}`,
            category: exp.category,
            date: exp.created_at,
            amount: parseFloat(exp.amount),
            status: exp.manager_approval_status?.toLowerCase() || 'pending',
            // keep other fields if needed
            managerStatus: exp.manager_approval_status,
            financeStatus: exp.finance_approval_status,
            paymentStatus: exp.payment_status,
        }));

        // 3. Build summary object for the cards
        const totalAmount = summaryData.totalAmount?.amount ? parseFloat(summaryData.totalAmount.amount) : 0;
        const pendingAmount = summaryData.managerPending?.amount ? parseFloat(summaryData.managerPending.amount) : 0;
        const averageAmount = summaryData.averageAmount?.amount ? parseFloat(summaryData.averageAmount.amount) : 0;

        // 4. Optional: unique employee count for average per employee (if needed)
        const uniqueEmployeeIds = new Set(expenseList.map(e => e.employeeId));
        const avgPerEmployee = uniqueEmployeeIds.size > 0 ? totalAmount / uniqueEmployeeIds.size : 0;

        // 5. Compute changes? Not provided in the given JSON – set to undefined
        //    The UI will conditionally hide the change indicators.

        const transformedSummary = {
            totalAmount,
            pendingAmount,
            averagePerEmployee: avgPerEmployee,   // could also use averageAmount if preferred
            totalChange: undefined,
            pendingChange: undefined,
            averageChange: undefined,
        };

        return { expenseList, transformedSummary };
    };

    const fetchReport = useCallback(async () => {
        const abortController = new AbortController();
        try {
            setLoading(true);
            setError(null);
            const response = await reportsAPI.getExpenses({
                from: dateRange.from,
                to: dateRange.to,
            }, { signal: abortController.signal });

            // The response is expected to follow the provided JSON structure
            const { expenseList, transformedSummary } = transformResponse(response);

            setData(expenseList);
            setSummary(transformedSummary);
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.response?.data?.message || 'Failed to load expense report');
            }
        } finally {
            setLoading(false);
        }
        return () => abortController.abort();
    }, [dateRange]);

    useEffect(() => {
        const cleanup = fetchReport();
        return () => {
            if (cleanup && typeof cleanup === 'function') cleanup();
        };
    }, [fetchReport]);

    const userRoles = user?.roles?.length
        ? user.roles
        : [user?.primaryRole || meta?.role || 'Employee'];
    const canExport = userRoles.some((role) =>
        ['Admin', 'Finance', 'Manager'].includes(role)
    );

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
                    <p className="font-medium">Failed to load expense report</p>
                    <p className="text-sm mt-1 opacity-80">{error}</p>
                </div>
            </div>
        );
    }

    const summaryCards = [
        {
            title: 'Total Expenses',
            value: summary?.totalAmount || 0,
            icon: IndianRupee,
            href: '/expenses',
            gradient: 'from-amber-500 to-orange-500',
            bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
            iconBg: 'bg-amber-100 dark:bg-amber-900/40',
            iconColor: 'text-amber-600 dark:text-amber-400',
            change: summary?.totalChange,
            format: formatIndianCurrency,
        },
        {
            title: 'Pending Approval',
            value: summary?.pendingAmount || 0,
            icon: Clock,
            href: '/expenses?status=pending',
            gradient: 'from-yellow-500 to-amber-500',
            bgGradient: 'from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30',
            iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',
            iconColor: 'text-yellow-600 dark:text-yellow-400',
            change: summary?.pendingChange,
            format: formatIndianCurrency,
        },
        {
            title: 'Average per Employee',
            value: summary?.averagePerEmployee || 0,
            icon: TrendingUp,
            href: '/expenses',
            gradient: 'from-emerald-500 to-green-500',
            bgGradient: 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            change: summary?.averageChange,
            format: formatIndianCurrency,
        },
    ];

    const getStatusBadge = (status) => {
        const config = {
            approved: {
                icon: CheckCircle,
                href: '/expenses',
                bg: 'bg-green-100 dark:bg-green-900/40',
                text: 'text-green-800 dark:text-green-300',
                label: 'Approved',
            },
            pending: {
                href: '/expenses',
                icon: Clock,
                bg: 'bg-yellow-100 dark:bg-yellow-900/40',
                text: 'text-yellow-800 dark:text-yellow-300',
                label: 'Pending',
            },
            rejected: {
                href: '/expenses',
                icon: XCircle,
                bg: 'bg-red-100 dark:bg-red-900/40',
                text: 'text-red-800 dark:text-red-300',
                label: 'Rejected',
            },
        };
        return config[status?.toLowerCase()] || config.pending;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                        <Receipt className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Expense Analytics
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Track and manage company expenses
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <ReportDateRange
                        from={dateRange.from}
                        to={dateRange.to}
                        onChange={setDateRange}
                    />
                    {canExport && (
                        <ExportButtons
                            module="expenses"
                            from={dateRange.from}
                            to={dateRange.to}
                        />
                    )}
                </div>
            </div>

            {/* Summary Cards (show only if summary exists) */}
            {summary && (
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4">
                    {summaryCards.map((card) => {
                        const formattedValue = card.format(card.value);
                        const changeValue = card.change;
                        const isPositive = changeValue >= 0;
                        const changeFormatted =
                            changeValue !== undefined ? Math.abs(changeValue).toFixed(1) : null;

                        return (
                            <div
                                key={card.title}
                                onClick={() => card.href && navigate(card.href)}
                                className={`group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${card.bgGradient} backdrop-blur-sm cursor-pointer`}
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                                ></div>

                                <div className="relative p-5 md:p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                {card.title}
                                            </p>
                                            <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                                {formattedValue}
                                            </p>

                                            {changeFormatted && (
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <span
                                                        className={`inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${isPositive
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                                                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                                            }`}
                                                    >
                                                        {isPositive ? (
                                                            <TrendingUp className="w-3 h-3" />
                                                        ) : (
                                                            <TrendingDown className="w-3 h-3" />
                                                        )}
                                                        {changeFormatted}%
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        vs previous
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            className={`p-3 rounded-xl ${card.iconBg} transition-transform duration-300 group-hover:scale-110`}
                                        >
                                            <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* View Toggle & Count */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {data.length} expense{data.length !== 1 ? 's' : ''} found
                </span>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'table'
                                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Table
                    </button>
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors md:hidden ${viewMode === 'cards'
                                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Cards
                    </button>
                </div>
            </div>

            {/* Table View */}
            <div className={`${viewMode === 'cards' ? 'hidden md:block' : 'block'}`}>
                <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Employee
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <Receipt className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                                                <p className="text-gray-500 dark:text-gray-400 font-medium">
                                                    No expenses found
                                                </p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                                    Try adjusting your date range
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((item) => {
                                        const statusConfig = getStatusBadge(item.status);
                                        const StatusIcon = statusConfig.icon;
                                        return (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                        </div>
                                                        <span className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                            {item.employeeName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                                        <Tag className="w-3.5 h-3.5 text-gray-400" />
                                                        {item.category}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                        {new Date(item.date).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {formatIndianCurrency(item.amount)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                                                    >
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusConfig.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className={`${viewMode === 'cards' ? 'block' : 'hidden'} md:hidden space-y-3`}>
                {data.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/60 p-8 text-center">
                        <Receipt className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No expenses found</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Try adjusting your date range
                        </p>
                    </div>
                ) : (
                    data.map((item) => {
                        const statusConfig = getStatusBadge(item.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700/60 p-4 shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {item.employeeName}
                                        </span>
                                    </div>
                                    <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                                    >
                                        <StatusIcon className="w-3 h-3" />
                                        {statusConfig.label}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Category</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                            <Tag className="w-3.5 h-3.5 text-gray-400" />
                                            {item.category}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Date</span>
                                        <span className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            {new Date(item.date).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                            {formatIndianCurrency(item.amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ExpenseReport;