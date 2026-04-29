// src/company/useCompany.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    fetchCompany,
    fetchCompanyStats,
    updateCompany,
    updateCompanySettings,
    uploadCompanyLogo,
    deleteCompanyLogo,
    deactivateCompany,
    listCompanies,
} from '../api/companyApi';

// ─── query key factory ───────────────────────────────────────
export const companyKeys = {
    all: () => ['company'],
    detail: (id) => ['company', id],
    stats: (id) => ['company', id, 'stats'],
    list: (params) => ['company', 'list', params],
};

// ─────────────────────────────────────────────────────────────
//  QUERIES
// ─────────────────────────────────────────────────────────────

/**
 * Fetch full company profile.
 * data → { id, name, slug, email, phone, website, industry, size,
 *   addressLine1, addressLine2, city, state, country, postalCode,
 *   logoUrl, logoPublicId, workingHoursPerDay, workingDaysPerWeek,
 *   annualLeaveQuota, timezone, currency, fiscalYearStart,
 *   isActive, isVerified, subscriptionPlan, subscriptionExpiresAt }
 */
export const useCompany = (id) =>
    useQuery({
        queryKey: companyKeys.detail(id),
        queryFn: () => fetchCompany(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });

/**
 * Fetch company KPI stats.
 * data → { company: { id, name, logoUrl, subscriptionPlan, isVerified },
 *           stats:   { totalEmployees, activeEmployees, totalPayroll } }
 */
export const useCompanyStats = (id) =>
    useQuery({
        queryKey: companyKeys.stats(id),
        queryFn: () => fetchCompanyStats(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });

/**
 * List all companies (admin only).
 * data → { total, page, limit, companies: [...] }
 */
export const useCompanyList = (params = {}) =>
    useQuery({
        queryKey: companyKeys.list(params),
        queryFn: () => listCompanies(params),
        staleTime: 2 * 60 * 1000,
    });

// ─────────────────────────────────────────────────────────────
//  MUTATIONS
// ─────────────────────────────────────────────────────────────

/** Update company profile fields */
export const useUpdateCompany = (id) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload) => updateCompany(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: companyKeys.detail(id) });
            toast.success('Company profile updated');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
    });
};

/** Update HR / payroll settings */
export const useUpdateCompanySettings = (id) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload) => updateCompanySettings(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: companyKeys.detail(id) });
            toast.success('Settings saved');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Settings update failed'),
    });
};

/**
 * Upload / replace company logo.
 * Pass a File object — hook handles FormData internally via companyApi.
 * On success, invalidates detail + stats so logo refreshes everywhere.
 */
export const useUploadCompanyLogo = (id) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (file) => uploadCompanyLogo(id, file),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: companyKeys.detail(id) });
            qc.invalidateQueries({ queryKey: companyKeys.stats(id) });
            toast.success('Logo uploaded successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Logo upload failed'),
    });
};

/** Delete company logo */
export const useDeleteCompanyLogo = (id) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => deleteCompanyLogo(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: companyKeys.detail(id) });
            qc.invalidateQueries({ queryKey: companyKeys.stats(id) });
            toast.success('Logo removed');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to remove logo'),
    });
};

/** Soft-delete company + lock all users */
export const useDeactivateCompany = (id) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => deactivateCompany(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: companyKeys.all() });
            toast.success('Company deactivated');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Deactivation failed'),
    });
};