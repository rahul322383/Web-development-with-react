// src/analytics/useAnalytics.js
import { useQuery } from '@tanstack/react-query';
import {
    fetchDashboard,
    fetchAttrition,
    fetchDepartments,
    fetchLeaves,
    fetchCost,
} from '../api/analyticsApi';

// ─── query key factory ───────────────────────────────────────
export const analyticsKeys = {
    all: () => ['analytics'],
    dashboard: (filters) => ['analytics', 'dashboard', filters],
    attrition: (filters) => ['analytics', 'attrition', filters],
    departments: (filters) => ['analytics', 'departments', filters],
    leaves: (filters) => ['analytics', 'leaves', filters],
    cost: (filters) => ['analytics', 'cost', filters],
};

// ─── hooks ───────────────────────────────────────────────────

/**
 * All 4 metrics in one fetch — use this for the main dashboard page.
 *
 * @param {{ startDate?: string, endDate?: string, department?: string }} filters
 *
 * data.attrition.overall        → { attritionRate, totalActive, leftInPeriod, totalAtPeriodStart }
 * data.attrition.byDepartment   → [{ department, total, leftCount, attritionRate }]
 * data.departmentPerformance    → [{ department, headCount, avgBaseSalary, avgHoursWorked, totalLeaveDays }]
 * data.leaveTrends.monthly      → [{ year, month, monthLabel, leaveCount, totalDays }]
 * data.leaveTrends.statusBreakdown → [{ status:'Approved'|'Pending'|'Rejected', count }]
 * data.costPerEmployee.overall  → { employeeCount, totalSalary, avgSalary }
 * data.costPerEmployee.byDepartment → [{ department, employeeCount, avgSalary, totalSalary }]
 */
export const useDashboard = (filters = {}) =>
    useQuery({
        queryKey: analyticsKeys.dashboard(filters),
        queryFn: () => fetchDashboard(filters),
        staleTime: 5 * 60 * 1000, // 5 min — analytics don't need real-time updates
    });

/**
 * Attrition only — use when you need a focused attrition view.
 *
 * data.overall      → { attritionRate, totalActive, leftInPeriod, totalAtPeriodStart }
 * data.byDepartment → [{ department, total, leftCount, attritionRate }]
 */
export const useAttrition = (filters = {}) =>
    useQuery({
        queryKey: analyticsKeys.attrition(filters),
        queryFn: () => fetchAttrition(filters),
        staleTime: 5 * 60 * 1000,
    });

/**
 * Department performance only.
 *
 * data → [{ department, headCount, avgBaseSalary, avgHoursWorked, totalLeaveDays }]
 */
export const useDepartmentPerformance = (filters = {}) =>
    useQuery({
        queryKey: analyticsKeys.departments(filters),
        queryFn: () => fetchDepartments(filters),
        staleTime: 5 * 60 * 1000,
    });

/**
 * Leave trends only.
 *
 * data.monthly         → [{ year, month, monthLabel, leaveCount, totalDays }]
 * data.statusBreakdown → [{ status, count }]
 */
export const useLeaveTrends = (filters = {}) =>
    useQuery({
        queryKey: analyticsKeys.leaves(filters),
        queryFn: () => fetchLeaves(filters),
        staleTime: 5 * 60 * 1000,
    });

/**
 * Cost per employee only.
 *
 * data.overall      → { employeeCount, totalSalary, avgSalary }
 * data.byDepartment → [{ department, employeeCount, avgSalary, totalSalary }]
 */
export const useCostPerEmployee = (filters = {}) =>
    useQuery({
        queryKey: analyticsKeys.cost(filters),
        queryFn: () => fetchCost(filters),
        staleTime: 5 * 60 * 1000,
    });