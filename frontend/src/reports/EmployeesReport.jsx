// src/components/reports/EmployeesReport.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Loader2,
    Users,
    UserPlus,
    UserMinus,
    TrendingUp,
    AlertCircle,
    Briefcase,
    Calendar,
    Mail,
    Building2,
} from 'lucide-react';
import reportsAPI from '../api/reports.api';
import ReportDateRange from './ReportDateRange';
import ExportButtons from './ExportButtons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const EmployeesReport = () => {
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
    const [apiData, setApiData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('table');

    const fetchReport = useCallback(async () => {
        const abortController = new AbortController();
        try {
            setLoading(true);
            setError(null);
            const response = await reportsAPI.getEmployees(
                {
                    from: dateRange.from,
                    to: dateRange.to,
                },
                { signal: abortController.signal }
            );
            // Unwrap the data (the API wraps it in { success, data })
            const data = response.data || response;
            setApiData(data);
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.response?.data?.message || 'Failed to load employees report');
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

    // Process the raw API data into a flat employee list and summary statistics
    const { employees, summary } = useMemo(() => {
        if (!apiData) {
            return { employees: [], summary: null };
        }

        // 1. Extract employee list (the API provides "list" array)
        const rawEmployees = apiData.list || [];

        // 2. Build role mapping from byRole.records
        const roleMap = new Map();
        const byRoleRecords = apiData.byRole?.records || [];
        byRoleRecords.forEach((roleGroup) => {
            const roleName = roleGroup.role;
            const roleEmployees = roleGroup.employees || [];
            roleEmployees.forEach((emp) => {
                roleMap.set(emp.id, roleName);
            });
        });

        // 3. Enrich each employee with fullName, role, formatted join date
        const enrichedEmployees = rawEmployees.map((emp) => ({
            id: emp.id,
            first_name: emp.first_name,
            last_name: emp.last_name,
            email: emp.email,
            department: emp.department,
            is_active: emp.is_active === 1,
            created_at: emp.created_at,
            fullName: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unknown',
            role: roleMap.get(emp.id) || 'Employee',
            joinDate: emp.created_at,
        }));

        // 4. Build summary cards using data from the API's summary object (if present)
        //    Fallback to computed values if the summary is missing (backward compatibility)
        const summaryFromApi = apiData.summary;
        let total = enrichedEmployees.length;
        let active = enrichedEmployees.filter((e) => e.is_active).length;
        let inactive = total - active;
        let newHiresCount = 0;

        if (summaryFromApi) {
            // Use API summary values if available (they are more reliable)
            total = summaryFromApi.totalEmployees?.value ?? total;
            active = summaryFromApi.activeEmployees?.value ?? active;
            inactive = summaryFromApi.inactiveEmployees?.value ?? inactive;
            // Count new hires from the newHires.records array
            const newHiresRecords = apiData.newHires?.records || [];
            newHiresCount = newHiresRecords.reduce(
                (sum, dayGroup) => sum + (dayGroup.employees?.length || 0),
                0
            );
        } else {
            // Fallback: count new hires from newHires.records if summary missing
            const newHiresRecords = apiData.newHires?.records || [];
            newHiresCount = newHiresRecords.reduce(
                (sum, dayGroup) => sum + (dayGroup.employees?.length || 0),
                0
            );
        }

        const turnoverRate = total > 0 ? (inactive / total) * 100 : 0;

        const summaryStats = {
            total,
            active,
            inactive,
            newHires: newHiresCount,
            turnoverRate: parseFloat(turnoverRate.toFixed(1)),
        };

        return { employees: enrichedEmployees, summary: summaryStats };
    }, [apiData]);

    // Permission check for export
    const userRoles = user?.roles?.length
        ? user.roles
        : [user?.primaryRole || meta?.role || 'Employee'];
    const canExport = userRoles.some((role) =>
        ['Admin', 'HR', 'Manager', 'Finance'].includes(role)
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
                    <p className="font-medium">Failed to load employees report</p>
                    <p className="text-sm mt-1 opacity-80">{error}</p>
                </div>
            </div>
        );
    }

    const summaryCards = summary
        ? [
            {
                title: 'Total Employees',
                value: summary.total,
                icon: Users,
                href: '/users',
                gradient: 'from-blue-500 to-cyan-500',
                bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
                iconBg: 'bg-blue-100 dark:bg-blue-900/40',
                iconColor: 'text-blue-600 dark:text-blue-400',
            },
            {
                title: 'New Hires',
                value: summary.newHires,
                icon: UserPlus,
                href: '/users',
                gradient: 'from-emerald-500 to-green-500',
                bgGradient: 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30',
                iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
                iconColor: 'text-emerald-600 dark:text-emerald-400',
            },
            {
                title: 'Departures',
                value: summary.inactive,
                icon: UserMinus,
                href: '/department-dashboard',
                gradient: 'from-red-500 to-rose-500',
                bgGradient: 'from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30',
                iconBg: 'bg-red-100 dark:bg-red-900/40',
                iconColor: 'text-red-600 dark:text-red-400',
            },
            {
                title: 'Turnover Rate',
                value: `${summary.turnoverRate}%`,
                icon: TrendingUp,
                href: '/payroll',
                gradient: 'from-purple-500 to-pink-500',
                bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
                iconBg: 'bg-purple-100 dark:bg-purple-900/40',
                iconColor: 'text-purple-600 dark:text-purple-400',
            },
        ]
        : [];

    return (
        <div className="space-y-6">
            {/* Header with controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl">
                        <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Employee Analytics
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Workforce statistics and trends
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
                            module="employees"
                            from={dateRange.from}
                            to={dateRange.to}
                        />
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
                    {summaryCards.map((card) => (
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
                                            {card.value}
                                        </p>
                                    </div>

                                    <div
                                        className={`p-3 rounded-xl ${card.iconBg} transition-transform duration-300 group-hover:scale-110`}
                                    >
                                        <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View toggle for mobile/desktop */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {employees.length} employees found
                    </span>
                </div>
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

            {/* Data Display - Table (default for desktop) */}
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
                                        Department
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Join Date
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
                                {employees.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                                                <p className="text-gray-500 dark:text-gray-400 font-medium">
                                                    No employees found
                                                </p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                                    Try adjusting your date range
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    employees.map((employee) => (
                                        <tr
                                            key={employee.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
                                                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                                            {employee.fullName?.charAt(0) || '?'}
                                                        </span>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                            {employee.fullName}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                                                            <Mail className="w-3 h-3" />
                                                            {employee.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                                    {employee.department}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                                    <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                                    {employee.role}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    {employee.joinDate
                                                        ? new Date(employee.joinDate).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })
                                                        : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${employee.is_active
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                                        }`}
                                                >
                                                    {employee.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className={`${viewMode === 'cards' ? 'block' : 'hidden'} md:hidden space-y-3`}>
                {employees.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/60 p-8 text-center">
                        <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No employees found</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Try adjusting your date range
                        </p>
                    </div>
                ) : (
                    employees.map((employee) => (
                        <div
                            key={employee.id}
                            className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700/60 p-4 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center">
                                    <span className="text-lg font-medium text-indigo-600 dark:text-indigo-400">
                                        {employee.fullName?.charAt(0) || '?'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                                {employee.fullName}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                                <Mail className="w-3 h-3" />
                                                {employee.email}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${employee.is_active
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                                }`}
                                        >
                                            {employee.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="truncate">{employee.department}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="truncate">{employee.role}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 col-span-2">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            Joined{' '}
                                            {employee.joinDate
                                                ? new Date(employee.joinDate).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })
                                                : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EmployeesReport;