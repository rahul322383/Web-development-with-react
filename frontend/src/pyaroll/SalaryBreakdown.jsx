import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const formatCurrency = (value, currency = 'INR') => {
    const num = typeof value === 'number' && !isNaN(value) ? value : 0;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
};

const EARNINGS_CONFIG = {
    baseSalary: { label: 'Basic Salary', icon: null },
    hra: { label: 'HRA', icon: null },
    specialAllowance: { label: 'Special Allowance', icon: null },
    bonus: { label: 'Bonus', icon: TrendingUp },
    overtimePay: { label: 'Overtime Pay', icon: null },
    conveyance: { label: 'Conveyance', icon: null },
    medicalAllowance: { label: 'Medical Allowance', icon: null },
    lta: { label: 'LTA', icon: null },
    otherEarnings: { label: 'Other Earnings', icon: null },
};

const DEDUCTIONS_CONFIG = {
    pfEmployee: { label: 'PF (Employee)', icon: null },
    professionalTax: { label: 'Professional Tax', icon: null },
    tds: { label: 'TDS', icon: null },
    esi: { label: 'ESI', icon: null },
    labourWelfare: { label: 'Labour Welfare', icon: null },
    otherDeductions: { label: 'Other Deductions', icon: TrendingDown },
};

const SectionHeader = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-5 h-5 text-gray-500" />}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
    </div>
);

const TableRow = ({ label, value, isTotal = false, icon: Icon }) => (
    <tr className={isTotal ? 'bg-gray-50 dark:bg-gray-800/50 font-semibold' : ''}>
        <td className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                {label}
            </div>
        </td>
        <td className="px-4 py-2.5 text-sm text-right font-medium text-gray-900 dark:text-white">
            {formatCurrency(value)}
        </td>
    </tr>
);

const EmptyRow = ({ colSpan = 2, message = 'No data available' }) => (
    <tr>
        <td colSpan={colSpan} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
            {message}
        </td>
    </tr>
);

const SalaryBreakdown = React.memo(({ breakdown }) => {
    if (!breakdown || typeof breakdown !== 'object') {
        return (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Salary breakdown not available
            </div>
        );
    }

    const items = breakdown.items || {};

    const earnings = useMemo(() => {
        return Object.entries(EARNINGS_CONFIG)
            .map(([key, config]) => ({
                label: config.label,
                value: items[key],
                icon: config.icon,
            }))
            .filter((item) => typeof item.value === 'number' && item.value > 0);
    }, [items]);

    const deductions = useMemo(() => {
        return Object.entries(DEDUCTIONS_CONFIG)
            .map(([key, config]) => ({
                label: config.label,
                value: items[key],
                icon: config.icon,
            }))
            .filter((item) => typeof item.value === 'number' && item.value > 0);
    }, [items]);

    if (process.env.NODE_ENV === 'development') {
        const calculatedGross = earnings.reduce((sum, e) => sum + e.value, 0);
        const apiGross = items.grossEarnings || 0;
        if (Math.abs(calculatedGross - apiGross) > 0.01) {
            console.warn(
                `[SalaryBreakdown] Gross earnings mismatch: calculated=${calculatedGross}, API=${apiGross}`
            );
        }

        const calculatedDeductions = deductions.reduce((sum, d) => sum + d.value, 0);
        const apiDeductions = items.totalDeductions || 0;
        if (Math.abs(calculatedDeductions - apiDeductions) > 0.01) {
            console.warn(
                `[SalaryBreakdown] Deductions mismatch: calculated=${calculatedDeductions}, API=${apiDeductions}`
            );
        }
    }

    const grossEarnings = items.grossEarnings ?? earnings.reduce((sum, e) => sum + e.value, 0);
    const totalDeductions = items.totalDeductions ?? deductions.reduce((sum, d) => sum + d.value, 0);
    const netSalary = breakdown.netSalary ?? grossEarnings - totalDeductions;

    return (
        <div className="space-y-6" role="region" aria-label="Salary breakdown">
            <div>
                <SectionHeader title="Earnings" icon={TrendingUp} />
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="sr-only">
                            <tr>
                                <th>Earning Type</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {earnings.length === 0 ? (
                                <EmptyRow message="No earnings data" />
                            ) : (
                                earnings.map((item, idx) => (
                                    <TableRow key={idx} label={item.label} value={item.value} icon={item.icon} />
                                ))
                            )}
                            <TableRow label="Gross Earnings" value={grossEarnings} isTotal />
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <SectionHeader title="Deductions" icon={TrendingDown} />
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="sr-only">
                            <tr>
                                <th>Deduction Type</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {deductions.length === 0 ? (
                                <EmptyRow message="No deductions data" />
                            ) : (
                                deductions.map((item, idx) => (
                                    <TableRow key={idx} label={item.label} value={item.value} icon={item.icon} />
                                ))
                            )}
                            <TableRow label="Total Deductions" value={totalDeductions} isTotal />
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                            <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                Net Pay (Take Home)
                            </p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                {formatCurrency(netSalary)}
                            </p>
                        </div>
                    </div>
                    {grossEarnings > 0 && (
                        <div className="text-right text-sm text-blue-700 dark:text-blue-400">
                            {((netSalary / grossEarnings) * 100).toFixed(1)}% of gross
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

SalaryBreakdown.displayName = 'SalaryBreakdown';

export default SalaryBreakdown;