

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { payrollApi } from '../api/payrollApi';
import { MonthlyNetTrend } from './PayrollCharts'; 
import PayslipModal from "./PayslipModal"

// ================================================
// UTILITY: Payroll Data Adapter
// ================================================
const formatMonthlySummary = (data) => ({
    totalGross: data?.totals?.totalGross ?? 0,
    totalNet: data?.totals?.totalNet ?? 0,
    totalTDS: data?.totals?.totalTDS ?? 0,
    totalPF: data?.totals?.totalPF ?? 0,
});

// ================================================
// CUSTOM HOOK: Debounce
// ================================================
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};

// ================================================
// SUBCOMPONENT: Skeleton Loaders
// ================================================
const SkeletonLoader = ({ type, count = 1, rows = 5 }) => {
    if (type === 'cards') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(count)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-5 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }
    if (type === 'table') {
        return (
            <div className="bg-white shadow rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                {[...Array(rows)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
                ))}
            </div>
        );
    }
    return null;
};

// ================================================
// SUBCOMPONENT: Summary Cards
// ================================================
const SummaryCards = ({ totals, count }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-5">
            <p className="text-sm text-gray-500">Employees Processed</p>
            <p className="text-2xl font-semibold">{count}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
            <p className="text-sm text-gray-500">Total Gross</p>
            <p className="text-2xl font-semibold">₹{totals.totalGross.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
            <p className="text-sm text-gray-500">Total Net</p>
            <p className="text-2xl font-semibold text-green-600">₹{totals.totalNet.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
            <p className="text-sm text-gray-500">Total TDS</p>
            <p className="text-2xl font-semibold">₹{totals.totalTDS.toLocaleString('en-IN')}</p>
        </div>
    </div>
);

// ================================================
// SUBCOMPONENT: Process Payroll Card
// ================================================
const ProcessPayrollCard = ({ onProcess, isProcessing }) => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    return (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Process Payroll</h2>
            <div className="flex items-center space-x-4">
                <select
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="border rounded px-3 py-2"
                >
                    {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                    ))}
                </select>
                <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="border rounded px-3 py-2"
                >
                    {[...Array(5)].map((_, i) => {
                        const y = new Date().getFullYear() - 2 + i;
                        return <option key={y} value={y}>{y}</option>;
                    })}
                </select>
                <button
                    onClick={() => onProcess(month, year)}
                    disabled={isProcessing}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {isProcessing ? 'Processing...' : 'Process Payroll'}
                </button>
            </div>
        </div>
    );
};

// ================================================
// SUBCOMPONENT: Employee Lookup Card
// ================================================
const EmployeeLookupCard = ({ onViewPayslip }) => {
    const [input, setInput] = useState('');
    const debouncedId = useDebounce(input, 500);
    const [shouldFetch, setShouldFetch] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['employeePayroll', debouncedId],
        queryFn: () => payrollApi.getPayrollByEmployee(debouncedId),
        enabled: shouldFetch && debouncedId.trim().length > 0,
        onSuccess: () => setShouldFetch(false),
        onError: (err) => toast.error(err.message),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) {
            toast.error('Please enter an employee ID');
            return;
        }
        setShouldFetch(true);
    };

    return (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Employee Payroll Lookup</h2>
            <form onSubmit={handleSubmit} className="flex space-x-4">
                <input
                    type="text"
                    placeholder="Employee ID"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="border rounded px-3 py-2 flex-1"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
                >
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {data?.records?.length > 0 && (
                <div className="mt-4">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {data.records.map((r) => (
                                <tr key={r.id}>
                                    <td className="px-6 py-4">{r.month}/{r.year}</td>
                                    <td className="px-6 py-4">₹{r.netSalary?.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4">{r.status}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => onViewPayslip(r)}
                                            className="text-blue-600 hover:underline"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ================================================
// SUBCOMPONENT: Monthly Payroll Table
// ================================================
const MonthlyPayrollTable = ({
    records,
    currentPage,
    totalPages,
    onPageChange,
    onView,
    onLock,
    lockingId,
    month,
    year,
}) => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium">Monthly Payroll ({month}/{year})</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {records.map((p) => (
                    <tr key={p.id}>
                        <td className="px-6 py-4">{p.employee?.firstName} {p.employee?.lastName}</td>
                        <td className="px-6 py-4">₹{p.items?.grossEarnings?.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4">₹{p.items?.totalDeductions?.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 font-medium">₹{p.netSalary?.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4">
                            <span
                                className={`px-2 py-1 text-xs rounded-full ${p.status === 'Locked'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}
                            >
                                {p.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 space-x-2">
                            <button onClick={() => onView(p)} className="text-blue-600 hover:underline">
                                View
                            </button>
                            {p.status !== 'Locked' && (
                                <button
                                    onClick={() => onLock(p.id)}
                                    disabled={lockingId === p.id}
                                    className="text-red-600 hover:underline disabled:opacity-50"
                                >
                                    {lockingId === p.id ? 'Locking...' : 'Lock'}
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {totalPages > 1 && (
            <div className="px-4 py-3 flex justify-between border-t">
                <button
                    onClick={() => onPageChange((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        )}
    </div>
);

// ================================================
// MAIN COMPONENT: AdminPayroll
// ================================================
const AdminPayroll = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [lockingId, setLockingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // ---------- Data Fetching (React Query) ----------
    const {
        data: monthlySummary,
        isLoading: summaryLoading,
        error: summaryError,
        refetch: refetchSummary,
    } = useQuery({
        queryKey: ['monthlyPayroll'],
        queryFn: payrollApi.getMonthlySummary,
        staleTime: 5 * 60 * 1000, // 5 minutes
        onError: (err) => toast.error(err.message || 'Failed to load summary'),
    });

    const totals = formatMonthlySummary(monthlySummary);

    // ---------- Mutations ----------
    const processMutation = useMutation({
        mutationFn: payrollApi.processPayroll,
        onSuccess: (res) => {
            toast.success(`Payroll processed for ${res.processedCount} employees`);
            queryClient.invalidateQueries(['monthlyPayroll']);
        },
        onError: (err) => toast.error(err.message),
    });

    const lockMutation = useMutation({
        mutationFn: payrollApi.lockPayroll,
        onMutate: async ({ payrollId }) => {
            setLockingId(payrollId);
            // Optimistic update
            await queryClient.cancelQueries(['monthlyPayroll']);
            const previous = queryClient.getQueryData(['monthlyPayroll']);
            queryClient.setQueryData(['monthlyPayroll'], (old) => ({
                ...old,
                records: old.records.map((r) =>
                    r.id === payrollId ? { ...r, status: 'Locked' } : r
                ),
            }));
            return { previous };
        },
        onSuccess: () => {
            toast.success('Payroll locked');
            queryClient.invalidateQueries(['monthlyPayroll']);
        },
        onError: (err, variables, context) => {
            toast.error(err.message);
            queryClient.setQueryData(['monthlyPayroll'], context.previous);
        },
        onSettled: () => setLockingId(null),
    });

    // ---------- Handlers ----------
    const handleProcessPayroll = (month, year) => {
        if (!window.confirm(`Process payroll for ${month}/${year}?`)) return;
        processMutation.mutate({ month, year });
    };

    const handleLockPayroll = (payrollId) => {
        if (!window.confirm('Locking payroll is irreversible. Continue?')) return;
        lockMutation.mutate({ payrollId });
    };

    const openPayslip = (record) => {
        setSelectedRecord(record);
        setModalOpen(true);
    };

    // Pagination logic for monthly records
    const paginatedRecords = useMemo(() => {
        if (!monthlySummary?.records) return [];
        const start = (currentPage - 1) * pageSize;
        return monthlySummary.records.slice(start, start + pageSize);
    }, [monthlySummary, currentPage]);

    // ---------- Error State ----------
    if (summaryError) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <p className="text-red-600 mb-4">Failed to load payroll data</p>
                <button
                    onClick={() => refetchSummary()}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Payroll Administration</h1>

                {/* Monthly Summary Cards with Skeleton */}
                {summaryLoading ? (
                    <SkeletonLoader type="cards" count={4} />
                ) : (
                    <SummaryCards totals={totals} count={monthlySummary?.count || 0} />
                )}

                {/* Net Trend Chart */}
                {monthlySummary?.trend && (
                    <div className="mb-6">
                        <MonthlyNetTrend data={monthlySummary.trend} />
                    </div>
                )}

                {/* Process Payroll Section */}
                <ProcessPayrollCard
                    onProcess={handleProcessPayroll}
                    isProcessing={processMutation.isLoading}
                />

                {/* Employee Lookup */}
                <EmployeeLookupCard onViewPayslip={openPayslip} />

                {/* Monthly Summary Table with Pagination */}
                {summaryLoading ? (
                    <SkeletonLoader type="table" rows={5} />
                ) : monthlySummary?.records?.length > 0 ? (
                    <MonthlyPayrollTable
                        records={paginatedRecords}
                        currentPage={currentPage}
                        totalPages={Math.ceil(monthlySummary.records.length / pageSize)}
                        onPageChange={setCurrentPage}
                        onView={openPayslip}
                        onLock={handleLockPayroll}
                        lockingId={lockingId}
                        month={monthlySummary.month}
                        year={monthlySummary.year}
                    />
                ) : (
                    <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                        No payroll records found for this month.
                    </div>
                )}

            
                {/* <PayslipModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          payrollId={selectedRecord?.id}
          month={selectedRecord?.month}
          year={selectedRecord?.year}
        /> */}

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

export default AdminPayroll;