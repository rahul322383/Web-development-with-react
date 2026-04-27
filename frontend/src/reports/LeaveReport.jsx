// src/components/reports/LeaveReport.jsx
import React, { useState, useEffect } from 'react';
import {
    Loader2,
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    User,
    Tag,
    CalendarDays,
    Umbrella,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';
import reportsAPI from '../api/reports.api';
import ReportDateRange from './ReportDateRange';
import ExportButtons from './ExportButtons';
import { useAuth } from '../context/AuthContext';

const LeaveReport = () => {
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

    const fetchReport = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await reportsAPI.getLeave({
                from: dateRange.from,
                to: dateRange.to,
            });
            setData(response.data?.leaves || response.leaves || []);
            setSummary(response.data?.summary || response.summary || null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load leave report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    // Permission check for export
    const userRoles = user?.roles?.length
        ? user.roles
        : [user?.primaryRole || meta?.role || 'Employee'];
    const canExport = userRoles.some((role) =>
        ['Admin', 'HR', 'Manager'].includes(role)
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
                    <p className="font-medium">Failed to load leave report</p>
                    <p className="text-sm mt-1 opacity-80">{error}</p>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        const config = {
            approved: {
                icon: CheckCircle,
                bg: 'bg-green-100 dark:bg-green-900/40',
                text: 'text-green-800 dark:text-green-300',
                label: 'Approved',
            },
            pending: {
                icon: Clock,
                bg: 'bg-yellow-100 dark:bg-yellow-900/40',
                text: 'text-yellow-800 dark:text-yellow-300',
                label: 'Pending',
            },
            rejected: {
                icon: XCircle,
                bg: 'bg-red-100 dark:bg-red-900/40',
                text: 'text-red-800 dark:text-red-300',
                label: 'Rejected',
            },
        };
        return config[status?.toLowerCase()] || config.pending;
    };

    const summaryCards = [
        {
            title: 'Total Requests',
            value: summary?.total || 0,
            icon: Calendar,
            gradient: 'from-blue-500 to-cyan-500',
            bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
            iconBg: 'bg-blue-100 dark:bg-blue-900/40',
            iconColor: 'text-blue-600 dark:text-blue-400',
            change: summary?.totalChange,
        },
        {
            title: 'Approved',
            value: summary?.approved || 0,
            icon: CheckCircle,
            gradient: 'from-emerald-500 to-green-500',
            bgGradient: 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            change: summary?.approvedChange,
        },
        {
            title: 'Pending',
            value: summary?.pending || 0,
            icon: Clock,
            gradient: 'from-amber-500 to-yellow-500',
            bgGradient: 'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30',
            iconBg: 'bg-amber-100 dark:bg-amber-900/40',
            iconColor: 'text-amber-600 dark:text-amber-400',
            change: summary?.pendingChange,
        },
        {
            title: 'Rejected',
            value: summary?.rejected || 0,
            icon: XCircle,
            gradient: 'from-red-500 to-rose-500',
            bgGradient: 'from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30',
            iconBg: 'bg-red-100 dark:bg-red-900/40',
            iconColor: 'text-red-600 dark:text-red-400',
            change: summary?.rejectedChange,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
                        <Umbrella className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Leave Analytics
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Track employee leave requests and trends
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
                        <ExportButtons module="leave" from={dateRange.from} to={dateRange.to} />
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {summaryCards.map((card) => {
                        const changeValue = card.change;
                        const isPositive = changeValue >= 0;
                        const changeFormatted =
                            changeValue !== undefined ? Math.abs(changeValue).toFixed(1) : null;

                        return (
                            <div
                                key={card.title}
                                className={`group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${card.bgGradient} backdrop-blur-sm`}
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
                                                {card.value}
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
                    {data.length} leave request{data.length !== 1 ? 's' : ''} found
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
                                        Leave Type
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Start Date
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        End Date
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Days
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                                                <p className="text-gray-500 dark:text-gray-400 font-medium">
                                                    No leave requests found
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
                                                        {item.leaveType}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center gap-1.5">
                                                        <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                                                        {new Date(item.startDate).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center gap-1.5">
                                                        <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                                                        {new Date(item.endDate).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {item.days} day{item.days !== 1 ? 's' : ''}
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
                        <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No leave requests found</p>
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
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Leave Type</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                            <Tag className="w-3.5 h-3.5 text-gray-400" />
                                            {item.leaveType}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Start Date</span>
                                        <span className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                                            <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                                            {new Date(item.startDate).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">End Date</span>
                                        <span className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                                            <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                                            {new Date(item.endDate).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Duration</span>
                                        <span className="text-base font-semibold text-gray-900 dark:text-white">
                                            {item.days} day{item.days !== 1 ? 's' : ''}
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

export default LeaveReport;