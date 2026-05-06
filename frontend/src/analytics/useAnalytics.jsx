
import { useQueries} from '@tanstack/react-query';
import { useMemo } from 'react'; 
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

/**
 * All analytics metrics combined – use this for the main dashboard page.
 * Returns an object with:
 *   period, attrition (overall + byDepartment), departmentPerformance (array),
 *   leaveTrends (monthly + statusBreakdown), cost (overall + byDepartment)
 */
export const useDashboard = (filters = {}) => {
    const queries = useQueries({
        queries: [
            {
                queryKey: analyticsKeys.dashboard(filters),
                queryFn: () => fetchDashboard(filters),
                staleTime: 5 * 60 * 1000,
            },
            {
                queryKey: analyticsKeys.attrition(filters),
                queryFn: () => fetchAttrition(filters),
                staleTime: 5 * 60 * 1000,
            },
            {
                queryKey: analyticsKeys.departments(filters),
                queryFn: () => fetchDepartments(filters),
                staleTime: 5 * 60 * 1000,
            },
            {
                queryKey: analyticsKeys.leaves(filters),
                queryFn: () => fetchLeaves(filters),
                staleTime: 5 * 60 * 1000,
            },
            {
                queryKey: analyticsKeys.cost(filters),
                queryFn: () => fetchCost(filters),
                staleTime: 5 * 60 * 1000,
            },
        ],
    });

    const [dashboardQuery, attritionQuery, departmentsQuery, leavesQuery, costQuery] = queries;

    const isLoading = queries.some(q => q.isLoading);
    const isError = queries.some(q => q.isError);
    const errors = queries.filter(q => q.isError).map(q => q.error);

    // Combine all responses into one consistent object
    const data = useMemo(() => {
        if (dashboardQuery.data && attritionQuery.data && departmentsQuery.data && leavesQuery.data && costQuery.data) {
            return {
                period: dashboardQuery.data.period,
                attrition: {
                    overall: attritionQuery.data.overall,             // { value, trend, status, insight, employeesAtStart, employeesAtEnd, leftInPeriod }
                    byDepartment: attritionQuery.data.byDepartment,   // [{ department, total, leftCount, attritionRate }]
                },
                departmentPerformance: departmentsQuery.data.departments, // array of dept objects
                leaveTrends: {
                    monthly: leavesQuery.data.monthly,                // monthly breakdown
                    statusBreakdown: leavesQuery.data.statusBreakdown,// { status, count }[]
                },
                cost: {
                    overall: costQuery.data.overall,                  // { employeeCount, totalSalary, avgSalary, ... }
                    byDepartment: costQuery.data.byDepartment,        // [{ department, employeeCount, avgSalary, totalSalary }]
                },
            };
        }
        return null;
    }, [dashboardQuery.data, attritionQuery.data, departmentsQuery.data, leavesQuery.data, costQuery.data]);

    return { data, isLoading, isError, errors };
};

/**
 * Use these hooks individually if needed (they are still available).
 */
export const useAttrition = (filters = {}) =>
    useQuery({
        queryKey: analyticsKeys.attrition(filters),
        queryFn: () => fetchAttrition(filters),
        staleTime: 5 * 60 * 1000,
    });

export const useDepartmentPerformance = (filters = {}) =>
    useQuery({
        queryKey: analyticsKeys.departments(filters),
        queryFn: () => fetchDepartments(filters),
        staleTime: 5 * 60 * 1000,
    });

export const useLeaveTrends = (filters = {}) =>
    useQuery({
        queryKey: analyticsKeys.leaves(filters),
        queryFn: () => fetchLeaves(filters),
        staleTime: 5 * 60 * 1000,
    });

export const useCostPerEmployee = (filters = {}) =>
    useQuery({
        queryKey: analyticsKeys.cost(filters),
        queryFn: () => fetchCost(filters),
        staleTime: 5 * 60 * 1000,
    });