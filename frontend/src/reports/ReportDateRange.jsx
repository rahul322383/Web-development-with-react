// src/components/reports/ReportDateRange.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
    Calendar,
    ChevronDown,
    X,
    Clock,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

const QUICK_RANGES = [
    { label: 'Today', days: 0 },
    { label: 'Yesterday', days: 1 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'This month', days: 'month' },
    { label: 'Last month', days: 'lastMonth' },
    { label: 'This year', days: 'year' },
];

const ReportDateRange = ({ from, to, onChange }) => {
    const [showQuick, setShowQuick] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowQuick(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    const handleQuickRange = (range) => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        if (range.days === 0) {
            // Today
            start = today;
            end = today;
        } else if (range.days === 1) {
            // Yesterday
            start = new Date(today);
            start.setDate(today.getDate() - 1);
            end = new Date(start);
        } else if (range.days === 'month') {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = today;
        } else if (range.days === 'lastMonth') {
            start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            end = new Date(today.getFullYear(), today.getMonth(), 0);
        } else if (range.days === 'year') {
            start = new Date(today.getFullYear(), 0, 1);
            end = today;
        } else {
            start.setDate(today.getDate() - range.days);
            end = today;
        }

        onChange({
            from: formatDate(start),
            to: formatDate(end),
        });
        setShowQuick(false);
    };

    const handleClear = () => {
        onChange({ from: '', to: '' });
    };

    const hasDateRange = from && to;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3" ref={dropdownRef}>
            {/* Quick Range Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setShowQuick(!showQuick)}
                    className={`
            group flex items-center gap-2 px-4 py-2.5 text-sm font-medium
            bg-white dark:bg-gray-800/90 backdrop-blur-sm
            border border-gray-200 dark:border-gray-700
            rounded-xl shadow-sm
            hover:bg-gray-50 dark:hover:bg-gray-700/80
            hover:border-gray-300 dark:hover:border-gray-600
            hover:shadow transition-all duration-200
          `}
                >
                    <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                    <span className="text-gray-700 dark:text-gray-300">Quick Range</span>
                    <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showQuick ? 'rotate-180' : ''
                            }`}
                    />
                </button>

                {showQuick && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden">
                        <div className="py-1 max-h-64 overflow-y-auto">
                            {QUICK_RANGES.map((range) => (
                                <button
                                    key={range.label}
                                    onClick={() => handleQuickRange(range)}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Date Inputs */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                            From
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="date"
                                value={from}
                                onChange={(e) => onChange({ from: e.target.value, to })}
                                className={`
                  pl-10 pr-3 py-2.5 text-sm
                  bg-white dark:bg-gray-800/90
                  border border-gray-200 dark:border-gray-700
                  rounded-xl shadow-sm
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  dark:focus:ring-indigo-400
                  transition-all duration-200
                  w-full sm:w-auto min-w-[150px]
                `}
                            />
                        </div>
                    </div>

                    <span className="text-gray-400 dark:text-gray-500 mt-5">
                        <ChevronRight className="w-4 h-4" />
                    </span>

                    <div className="relative">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                            To
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="date"
                                value={to}
                                onChange={(e) => onChange({ from, to: e.target.value })}
                                className={`
                  pl-10 pr-3 py-2.5 text-sm
                  bg-white dark:bg-gray-800/90
                  border border-gray-200 dark:border-gray-700
                  rounded-xl shadow-sm
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  dark:focus:ring-indigo-400
                  transition-all duration-200
                  w-full sm:w-auto min-w-[150px]
                `}
                            />
                        </div>
                    </div>
                </div>

                {/* Clear Button (only show when dates are selected) */}
                {hasDateRange && (
                    <button
                        onClick={handleClear}
                        className="mt-5 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Clear date range"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Selected Range Indicator (optional) */}
            {hasDateRange && (
                <div className="hidden lg:flex items-center gap-1.5 ml-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                        {from} — {to}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ReportDateRange;