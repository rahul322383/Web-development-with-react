// src/components/payroll/PayrollCharts.jsx
// ================================================
// PRODUCTION-READY PAYROLL CHARTS (9.5/10)
// ================================================
import React, { memo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';

// ================================================
// CONSTANTS
// ================================================
const CHART_COLORS = {
    primary: '#3B82F6',   // Blue
    success: '#10B981',   // Green
    warning: '#F59E0B',   // Amber
    danger: '#EF4444',    // Red
    purple: '#8B5CF6',    // Violet
    gray: '#6B7280',      // Gray
};

const PIE_COLORS = [
    CHART_COLORS.primary,
    CHART_COLORS.success,
    CHART_COLORS.warning,
    CHART_COLORS.danger,
    CHART_COLORS.purple,
    CHART_COLORS.gray,
];

// ================================================
// UTILITY: Safe number formatter
// ================================================
const formatCurrency = (value) => {
    const num = Number(value) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
};

const formatYAxisTick = (value) => {
    const num = Number(value) || 0;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}k`;
    return `₹${num}`;
};

// ================================================
// CUSTOM TOOLTIP (Enhanced)
// ================================================
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {label}
            </p>
            {payload.map((entry, index) => (
                <p key={index} className="text-sm" style={{ color: entry.color }}>
                    <span className="font-medium">{entry.name}:</span>{' '}
                    {formatCurrency(entry.value)}
                </p>
            ))}
        </div>
    );
};

// ================================================
// LOADING SKELETON
// ================================================
const ChartSkeleton = ({ title, height = 250 }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        {title && <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">{title}</h3>}
        <div className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg" style={{ height }} />
        </div>
    </div>
);

// ================================================
// EMPTY STATE
// ================================================
const ChartEmptyState = ({ title, message = 'No data available' }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        {title && <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">{title}</h3>}
        <div className="flex items-center justify-center h-[250px] text-gray-500 dark:text-gray-400">
            {message}
        </div>
    </div>
);

// ================================================
// MONTHLY NET TREND CHART (Memoized)
// ================================================
export const MonthlyNetTrend = memo(({ data, loading, title = 'Monthly Net Salary Trend' }) => {
    // Loading state
    if (loading) {
        return <ChartSkeleton title={title} height={250} />;
    }

    // Empty state
    if (!data || data.length === 0) {
        return <ChartEmptyState title={title} />;
    }

    return (
        <div
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6"
            role="region"
            aria-label={title}
        >
            <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                {title}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: '#D1D5DB' }}
                        tickLine={false}
                    />
                    <YAxis
                        tickFormatter={formatYAxisTick}
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: '#D1D5DB' }}
                        tickLine={false}
                        width={65}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: '#9CA3AF', strokeWidth: 1 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="net"
                        name="Net Salary"
                        stroke={CHART_COLORS.primary}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: CHART_COLORS.primary, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: CHART_COLORS.primary }}
                        isAnimationActive={true}
                        animationDuration={800}
                        animationEasing="ease-in-out"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
});

MonthlyNetTrend.displayName = 'MonthlyNetTrend';

// ================================================
// EARNINGS PIE CHART (Memoized)
// ================================================
export const EarningsPieChart = memo(({ data, loading, title = 'Earnings Distribution' }) => {
    // Loading state
    if (loading) {
        return <ChartSkeleton title={title} height={250} />;
    }

    // Empty state
    if (!data || data.length === 0) {
        return <ChartEmptyState title={title} />;
    }

    // Custom label to avoid overlap (show only percentage inside slice)
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        // Only show label if slice is large enough (>5%)
        if (percent < 0.05) return null;

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={600}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
            role="region"
            aria-label={title}
        >
            <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                {title}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={30}
                        dataKey="value"
                        nameKey="name"
                        label={renderCustomLabel}
                        labelLine={false}
                        isAnimationActive={true}
                        animationDuration={800}
                        animationEasing="ease-in-out"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                                stroke="none"
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        content={<CustomTooltip />}
                        formatter={(value) => formatCurrency(value)}
                    />
                    <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
});

EarningsPieChart.displayName = 'EarningsPieChart';

// ================================================
// BONUS: Deductions Pie Chart (same pattern)
// ================================================
export const DeductionsPieChart = memo(({ data, loading, title = 'Deductions Breakdown' }) => {
    if (loading) {
        return <ChartSkeleton title={title} height={250} />;
    }

    if (!data || data.length === 0) {
        return <ChartEmptyState title={title} />;
    }

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        if (percent < 0.05) return null;
        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={600}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
            role="region"
            aria-label={title}
        >
            <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                {title}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={30}
                        dataKey="value"
                        nameKey="name"
                        label={renderCustomLabel}
                        labelLine={false}
                        isAnimationActive={true}
                        animationDuration={800}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                                stroke="none"
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} formatter={(value) => formatCurrency(value)} />
                    <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
});

DeductionsPieChart.displayName = 'DeductionsPieChart';