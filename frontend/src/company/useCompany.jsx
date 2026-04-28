// src/company/useCompany.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    fetchCompany,
    fetchCompanyStats,
    createCompany,
    updateCompany,
    uploadCompanyLogo,
    deleteCompanyLogo,
    updateCompanySettings,
    deactivateCompany,
    listCompanies,
} from '../api/companyApi';

// ── query key factory ────────────────────────────────────────
export const companyKeys = {
    all: () => ['company'],
    detail: (id) => ['company', id],
    stats: (id) => ['company', id, 'stats'],
    list: (params) => ['company', 'list', params],
};

// ── GET company profile ──────────────────────────────────────
export const useCompany = (id) =>
    useQuery({
        queryKey: companyKeys.detail(id),
        queryFn: () => fetchCompany(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });

// ── GET company stats (KPIs) ─────────────────────────────────
export const useCompanyStats = (id) =>
    useQuery({
        queryKey: companyKeys.stats(id),
        queryFn: () => fetchCompanyStats(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
    });

// ── GET list (admin) ─────────────────────────────────────────
export const useCompanyList = (params = {}) =>
    useQuery({
        queryKey: companyKeys.list(params),
        queryFn: () => listCompanies(params),
        staleTime: 2 * 60 * 1000,
    });

// ── CREATE ───────────────────────────────────────────────────
export const useCreateCompany = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createCompany,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: companyKeys.all() });
            toast.success('Company created successfully');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create company'),
    });
};

// ── UPDATE PROFILE ───────────────────────────────────────────
export const useUpdateCompany = (id) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload) => updateCompany(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: companyKeys.detail(id) });
            toast.success('Company profile updated');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Update failed'),
    });
};

// ── UPLOAD LOGO ──────────────────────────────────────────────
export const useUploadLogo = (id) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (file) => uploadCompanyLogo(id, file),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: companyKeys.detail(id) });
            toast.success('Logo uploaded successfully');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Logo upload failed'),
    });
};

// ── DELETE LOGO ──────────────────────────────────────────────
export const useDeleteLogo = (id) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => deleteCompanyLogo(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: companyKeys.detail(id) });
            toast.success('Logo removed');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Failed to remove logo'),
    });
};

// ── UPDATE SETTINGS ──────────────────────────────────────────
export const useUpdateCompanySettings = (id) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (settings) => updateCompanySettings(id, settings),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: companyKeys.detail(id) });
            toast.success('Settings saved');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Failed to save settings'),
    });
};

// ── DEACTIVATE ───────────────────────────────────────────────
export const useDeactivateCompany = (id) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => deactivateCompany(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: companyKeys.all() });
            toast.success('Company deactivated');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Deactivation failed'),
    });
};