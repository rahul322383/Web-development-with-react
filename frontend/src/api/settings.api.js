// src/api/settings.api.js

import axiosInstance from './axios';

const settingsAPI = {

    // 📄 Get all settings
    getAll: async () => {
        const res = await axiosInstance.get('/settings');
        return res.data;
    },

    // 🔍 Get one setting by key
    getOne: async (key) => {
        const res = await axiosInstance.get(`/settings/${key}`);
        return res.data;
    },

    // ✏️ Update single setting
    updateOne: async (key, payload) => {
        const res = await axiosInstance.put(`/settings/${key}`, payload);
        return res.data;
    },

    // 🔄 Update multiple settings
    updateMany: async (payload) => {
        const res = await axiosInstance.put('/settings', payload);
        return res.data;
    },

    // ❌ Delete setting
    remove: async (key) => {
        const res = await axiosInstance.delete(`/settings/${key}`);
        return res.data;
    }

};

export default settingsAPI;