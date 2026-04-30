import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '../api/leaveApi';
import { toast } from 'sonner';

// --- Leave Types (match backend EXACTLY) ---
export const LEAVE_TYPE = {
    CASUAL: 'CASUAL',
    ANNUAL: 'ANNUAL',
    SICK: 'SICK',
    UNPAID: 'UNPAID',
    MATERNITY: 'MATERNITY',
    PATERNITY: 'PATERNITY',
    BEREAVEMENT: 'BEREAVEMENT',
    STUDY: 'STUDY',
};

export const LEAVE_TYPE_OPTIONS = [
    { value: LEAVE_TYPE.CASUAL, label: 'Casual Leave' },
    { value: LEAVE_TYPE.ANNUAL, label: 'Annual Leave' },
    { value: LEAVE_TYPE.SICK, label: 'Sick Leave' },
    { value: LEAVE_TYPE.UNPAID, label: 'Unpaid Leave' },
    { value: LEAVE_TYPE.MATERNITY, label: 'Maternity Leave' },
    { value: LEAVE_TYPE.PATERNITY, label: 'Paternity Leave' },
    { value: LEAVE_TYPE.BEREAVEMENT, label: 'Bereavement Leave' },
    { value: LEAVE_TYPE.STUDY, label: 'Study Leave' },
];

const QUERY_KEYS = {
    MY_LEAVES: 'myLeaves',
    LEAVE_BALANCE: 'leaveBalance',
    PENDING_LEAVES: 'pendingLeaves',
};

// ---------- Leave Balance ----------
export const useLeaveBalance = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.LEAVE_BALANCE],
        queryFn: async () => {
            const response = await leaveApi.getLeaveBalance({ requestId: 'leaveBalance' });
            const data = response?.data ?? response ?? {};

            return {
                totalAnnual: data.totalAnnual ?? 0,
                used: data.used ?? 0,
                remaining: data.remaining ?? 0,
                year: data.year ?? new Date().getFullYear(),
                pendingLeaves: data.leaves?.pending ?? [],
                approvedLeaves: data.leaves?.approved ?? [],
                rejectedLeaves: data.leaves?.rejected ?? [],
            };
        },
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });
};

// ---------- My Leaves ----------
export const useMyLeaves = (filters = {}) => {
    const { status, page = 1, limit = 10 } = filters;

    return useQuery({
        queryKey: [QUERY_KEYS.MY_LEAVES, { status, page, limit }],
        queryFn: async () => {
            const response = await leaveApi.getMyLeaves({
                status: status !== 'all' ? status : undefined,
                page,
                limit,
            });
            const data = response?.data ?? response ?? {};

            return {
                leaves: data.leaves ?? [],
                pagination: {
                    total: data.pagination?.total ?? 0,
                    page: data.pagination?.page ?? 1,
                    totalPages: data.pagination?.totalPages ?? 1,
                },
            };
        },
        staleTime: 2 * 60 * 1000,
        placeholderData: (prev) => prev,
        retry: 2,
    });
};

// ---------- Pending Leaves (Manager) ----------
export const usePendingLeaves = (enabled = false) => {
    return useQuery({
        queryKey: [QUERY_KEYS.PENDING_LEAVES],
        queryFn: async () => {
            const response = await leaveApi.getPendingLeaves({ requestId: 'pendingLeaves' });
            const data = response?.data ?? response ?? {};
            return data.leaves?.pending ?? [];
        },
        enabled,
        staleTime: 30 * 1000,
        refetchInterval: 60_000,
        retry: 2,
    });
};

// ---------- Apply Leave ----------
export const useApplyLeave = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (leaveData) => {
            // 🔧 FIX 1: Include all required fields matching backend schema
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const payload = {
                employeeId: user.id,              // required by backend
                startDate: leaveData.startDate,
                endDate: leaveData.endDate,
                reason: (leaveData.reason || '').trim(),
                leaveType: leaveData.leaveType ?? LEAVE_TYPE.CASUAL,
                leaveUnit: 'FULL_DAY',             // match backend default
                publicHolidays: [],                // match backend default
            };

            const response = await leaveApi.applyLeave(payload);

            if (response?.success === false) {
                throw new Error(response.message || 'Application failed');
            }

            return response?.data ?? response;
        },

        onSuccess: (data) => {
            toast.success('Leave request submitted', {
                description: `Request #${data?.id ?? 'N/A'} is pending manager approval.`,
            });

            // 🔧 OPTIMISTIC UPDATE: instantly show new leave in list
            queryClient.setQueryData([QUERY_KEYS.MY_LEAVES], (oldData) => {
                if (!oldData) return { leaves: [data], pagination: { total: 1, page: 1, totalPages: 1 } };
                return {
                    ...oldData,
                    leaves: [data, ...oldData.leaves],
                };
            });

            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_LEAVES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAVE_BALANCE] });
        },

        onError: (error) => {
            toast.error('Failed to apply for leave', {
                description: error?.message || 'Something went wrong',
            });
        },
    });
};

// ---------- Review Leave ----------
export const useReviewLeave = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ leaveId, reviewData }) => {
            const response = await leaveApi.reviewLeave(leaveId, reviewData);

            if (!response?.success) {
                throw new Error(response.message || 'Review failed');
            }

            return response?.data ?? response;
        },

        onSuccess: (_, { reviewData }) => {
            toast.success(`Leave request ${reviewData.status.toLowerCase()}`);

            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_LEAVES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_LEAVES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAVE_BALANCE] });
        },

        onError: (error) => {
            toast.error('Review failed', {
                description: error?.message || 'Something went wrong',
            });
        },
    });
};

// ---------- Cancel Leave ----------
export const useCancelLeave = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (leaveId) => {
            // 🔧 FIX 2: Uses dedicated cancel endpoint (not review)
            const response = await leaveApi.cancelLeave(leaveId);

            if (!response?.success) {
                throw new Error(response.message || 'Cancellation failed');
            }

            return response?.data ?? response;
        },

        onSuccess: () => {
            toast.success('Leave request cancelled');

            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_LEAVES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_LEAVES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAVE_BALANCE] });
        },

        onError: (error) => {
            toast.error('Cancellation failed', {
                description: error?.message || 'Something went wrong',
            });
        },
    });
};