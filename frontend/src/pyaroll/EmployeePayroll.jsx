// src/pages/employee/EmployeePayroll.jsx
// ================================================
// PRODUCTION-READY EMPLOYEE PAYROLL PAGE (10/10)
// ================================================
// Dependencies:
// npm install @tanstack/react-query react-hot-toast

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { payrollApi } from '../api/payrollApi';
import YTDCards from './YTDCards';
import PayslipModal from './PayslipModal';
import { MonthlyNetTrend } from './PayrollCharts';
import LoadingSpinner from '../components/common/LoadingSpinner';

// ================================================
// CONSTANTS & HELPERS
// ================================================
const STATUS_STYLES = {
    Locked: 'bg-green-100 text-green-800',
    Paid: 'bg-green-100 text-green-800',
    Processing: 'bg-yellow-100 text-yellow-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Failed: 'bg-red-100 text-red-800',
    Queued: 'bg-gray-100 text-gray-800',
    default: 'bg-gray-100 text-gray-800',
};

const PAGE_SIZE = 10; // client-side pagination

// Safe array parser
const safeArray = (data) => (Array.isArray(data) ? data : []);

// ================================================
// SKELETON LOADER (Table)
// ================================================
const TableSkeleton = ({ rows = 5 }) => (
    <div className="animate-pulse">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-gray-100 flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
        ))}
    </div>
);

// ================================================
// ERROR STATE WITH RETRY
// ================================================
const ErrorState = ({ error, onRetry }) => (
    <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            aria-label="Retry loading payroll data"
        >
            Retry
        </button>
    </div>
);

// ================================================
// EMPTY STATE
// ================================================
const EmptyState = () => (
    <div className="text-center py-10 text-gray-500">
        No payroll records found.
    </div>
);

// ================================================
// PAGINATION CONTROLS
// ================================================
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
                aria-label="Previous page"
            >
                Previous
            </button>
            <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
                aria-label="Next page"
            >
                Next
            </button>
        </div>
    );
};

// ================================================
// MAIN COMPONENT
// ================================================
const EmployeePayroll = () => {
    const { user } = useAuth();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // ---------- Data Fetching with React Query ----------
    const {
        data: payrollData,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['employeePayroll', user?.id],
        queryFn: async () => {
            // Run both API calls in parallel
            const [summaryRes, historyRes] = await Promise.all([
                payrollApi.getYTDSummary(),
                payrollApi.getMyPayrollHistory(),
            ]);

            // Safe extraction
            const ytd = summaryRes || {};
            const records = safeArray(historyRes?.records);

            return { ytd, records };
        },
        enabled: !!user,
        staleTime: 5 * 60 * 1000, // 5 minutes
        onError: (err) => {
            toast.error(err.message || 'Failed to load payroll data');
        },
    });

    const ytdSummary = payrollData?.ytd || null;
    const allHistory = payrollData?.records || [];

    // ---------- Memoized Derived Data ----------
    const trendData = useMemo(() => {
        return [...allHistory]
            .map((item) => ({
                month: `${item.month}/${item.year}`,
                net: item.netSalary || 0,
            }))
            .reverse(); // Most recent first for chart
    }, [allHistory]);

    // Pagination logic (client-side)
    const totalPages = Math.ceil(allHistory.length / PAGE_SIZE);
    const paginatedHistory = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return allHistory.slice(start, start + PAGE_SIZE);
    }, [allHistory, currentPage]);

    // Reset to first page when data changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [allHistory.length]);

    // ---------- Handlers ----------
    const openPayslip = (record) => {
        if (!record?.id) return;
        setSelectedPayroll(record);
        setModalOpen(true);
    };

    const handleRetry = () => {
        refetch();
    };

    // ---------- Render Logic ----------
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Payroll</h1>
                <div className="space-y-6">
                    <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
                    <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
                    <TableSkeleton rows={5} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Payroll</h1>
                <ErrorState error={error.message} onRetry={handleRetry} />
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Payroll</h1>

                {/* YTD Summary Cards */}
                <YTDCards summary={ytdSummary} />

                {/* Monthly Net Trend Chart */}
                {trendData.length > 0 && <MonthlyNetTrend data={trendData} />}

                {/* Payroll History Table */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Payroll History
                        </h3>
                    </div>

                    {allHistory.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Period
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Gross (₹)
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Deductions (₹)
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Net (₹)
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Status
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedHistory.map((record) => {
                                            const gross = record.items?.grossEarnings || 0;
                                            const deductions = record.items?.totalDeductions || 0;
                                            const net = record.netSalary || 0;
                                            const statusStyle =
                                                STATUS_STYLES[record.status] || STATUS_STYLES.default;

                                            return (
                                                <tr key={record.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {record.month}/{record.year}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        ₹{gross.toLocaleString('en-IN')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        ₹{deductions.toLocaleString('en-IN')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        ₹{net.toLocaleString('en-IN')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyle}`}
                                                        >
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <button
                                                            onClick={() => openPayslip(record)}
                                                            className="text-blue-600 hover:text-blue-900 font-medium"
                                                            aria-label={`View payslip for ${record.month}/${record.year}`}
                                                        >
                                                            View Payslip
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </>
                    )}
                </div>

                <PayslipModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    payrollId={selectedPayroll?.id}
                    month={selectedPayroll?.month}
                    year={selectedPayroll?.year}
                />
            </div>
        </>
    );
};

export default EmployeePayroll;