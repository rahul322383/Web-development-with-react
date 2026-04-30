// companyApi.js
import axiosInstance from "./axios";

const companyApi = {
    // ── Companies ────────────────────────────────────────────────────
    list: async (q = {}) => {
        const res = await axiosInstance.get('/companies', { params: q });
        return res.data;
    },
    create: async (body) => {
        const res = await axiosInstance.post('/companies', body);
        return res.data;
    },
    get: async (id) => {
        const res = await axiosInstance.get(`/companies/${id}`);
        return res.data;
    },
    update: async (id, body) => {
        const res = await axiosInstance.patch(`/companies/${id}`, body);
        return res.data;
    },
    deactivate: async (id) => {
        const res = await axiosInstance.delete(`/companies/${id}`);
        return res.data;
    },
    reactivate: async (id) => {
        const res = await axiosInstance.patch(`/companies/${id}/reactivate`);
        return res.data;
    },

    // ── Logo ─────────────────────────────────────────────────────────
    uploadLogo: async (id, formData) => {
        const res = await axiosInstance.post(`/companies/${id}/logo`, formData);
        return res.data;
    },
    deleteLogo: async (id) => {
        const res = await axiosInstance.delete(`/companies/${id}/logo`);
        return res.data;
    },

    // ── Settings ─────────────────────────────────────────────────────
    getSettings: async (id) => {
        const res = await axiosInstance.get(`/companies/${id}/settings`);
        return res.data;
    },
    saveSettings: async (id, body) => {
        const res = await axiosInstance.patch(`/companies/${id}/settings`, body);
        return res.data;
    },

    // ── Stats & Dashboard ────────────────────────────────────────────
    getStats: async (id) => {
        const res = await axiosInstance.get(`/companies/${id}/stats`);
        return res.data;
    },
    getDashboard: async (id, year) => {
        const res = await axiosInstance.get(`/companies/${id}/dashboard`, { params: { year } });
        return res.data;
    },

    // ── Users ────────────────────────────────────────────────────────
    getUsers: async (id, q = {}) => {
        const res = await axiosInstance.get(`/companies/${id}/users`, { params: q });
        return res.data;
    },
    addUser: async (id, userId) => {
        const res = await axiosInstance.post(`/companies/${id}/users`, { userId });
        return res.data;
    },
    removeUser: async (id, userId) => {
        const res = await axiosInstance.delete(`/companies/${id}/users/${userId}`);
        return res.data;
    },
    updateRole: async (id, userId, roleId) => {
        const res = await axiosInstance.patch(`/companies/${id}/users/${userId}`, { roleId });
        return res.data;
    },

    // ── Subscription ─────────────────────────────────────────────────
    getSub: async (id) => {
        const res = await axiosInstance.get(`/companies/${id}/subscription`);
        return res.data;
    },
    updateSub: async (id, body) => {
        const res = await axiosInstance.patch(`/companies/${id}/subscription`, body);
        return res.data;
    },

    // ── Notify ───────────────────────────────────────────────────────
    notify: async (id, body) => {
        const res = await axiosInstance.post(`/companies/${id}/notify`, body);
        return res.data;
    },
};

export default companyApi;