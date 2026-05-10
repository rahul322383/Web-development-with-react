// src/api/settings.api.js

import axiosInstance from './axios';

const settingsAPI = {

    // -------------------------------------------------------------------------
    // 📄 Get all settings
    // -------------------------------------------------------------------------

    getAll: async (params = {}) => {

        const res = await axiosInstance.get(
            '/settings',
            {
                params,
            }
        );

        return res.data;
    },

    // -------------------------------------------------------------------------
    // 🔍 Get one setting
    // -------------------------------------------------------------------------

    getOne: async (
        category,
        settingKey,
        params = {}
    ) => {

        const res = await axiosInstance.get(
            `/settings/${category}/${settingKey}`,
            {
                params,
            }
        );

        return res.data;
    },

    // -------------------------------------------------------------------------
    // ✏️ Update single setting
    // -------------------------------------------------------------------------

    updateOne: async (payload) => {

        const res = await axiosInstance.put(
            '/settings',
            payload
        );

        return res.data;
    },

    // -------------------------------------------------------------------------
    // 🔄 Update multiple settings
    // -------------------------------------------------------------------------

    updateMany: async (payload) => {

        const res = await axiosInstance.put(
            '/settings/bulk/update',
            payload
        );

        return res.data;
    },

    // -------------------------------------------------------------------------
    // ❌ Delete setting
    // -------------------------------------------------------------------------

    remove: async (
        category,
        settingKey,
        params = {}
    ) => {

        const res = await axiosInstance.delete(
            `/settings/${category}/${settingKey}`,
            {
                params,
            }
        );

        return res.data;
    }

};

export default settingsAPI;