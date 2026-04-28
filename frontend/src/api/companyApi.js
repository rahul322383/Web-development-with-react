import axiosInstance from "./axios";

const BASE = '/company';

// ── GET /company/:id ─────────────────────────────────────────
export const fetchCompany = async (id) => {
    const { data } = await api.get(`${BASE}/${id}`);
    return data.data.company;
};

// ── GET /company/:id/stats ───────────────────────────────────
export const fetchCompanyStats = async (id) => {
    const { data } = await api.get(`${BASE}/${id}/stats`);
    return data.data; // { company, stats: { totalEmployees, activeEmployees, totalPayroll } }
};

// ── POST /company ────────────────────────────────────────────
export const createCompany = async (payload) => {
    const { data } = await api.post(BASE, payload);
    return data.data.company;
};

// ── PATCH /company/:id ───────────────────────────────────────
export const updateCompany = async (id, payload) => {
    const { data } = await api.patch(`${BASE}/${id}`, payload);
    return data.data.company;
};

// ── POST /company/:id/logo  (multipart) ──────────────────────
// logoFile = File object from <input type="file">
export const uploadCompanyLogo = async (id, logoFile) => {
    const form = new FormData();
    form.append('logo', logoFile);
    const { data } = await api.post(`${BASE}/${id}/logo`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data; // { logoUrl, logoPublicId, width, height, format, bytes }
};

// ── DELETE /company/:id/logo ─────────────────────────────────
export const deleteCompanyLogo = async (id) => {
    const { data } = await api.delete(`${BASE}/${id}/logo`);
    return data;
};

// ── PATCH /company/:id/settings ──────────────────────────────
export const updateCompanySettings = async (id, settings) => {
    const { data } = await api.patch(`${BASE}/${id}/settings`, settings);
    return data.data.settings;
};

// ── DELETE /company/:id ──────────────────────────────────────
export const deactivateCompany = async (id) => {
    const { data } = await api.delete(`${BASE}/${id}`);
    return data;
};

// ── GET /company  (admin only) ───────────────────────────────
export const listCompanies = async (params = {}) => {
    const { data } = await api.get(BASE, { params });
    return data.data; // { total, page, limit, companies: [] }
};