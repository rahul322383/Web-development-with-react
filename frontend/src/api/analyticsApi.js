// src/analytics/analyticsApi.js
import axiosInstance from "./axios";

const BASE = "/analytics";

/**
 * GET /api/v1/analytics/dashboard
 */
export const fetchDashboard = async (params = {}) => {
    const response = await axiosInstance.get(`${BASE}/dashboard`, { params });
    return response.data?.data || response.data;
};

/**
 * GET /api/v1/analytics/attrition
 */
export const fetchAttrition = async (params = {}) => {
    const response = await axiosInstance.get(`${BASE}/attrition`, { params });
    return response.data?.data || response.data;
};

/**
 * GET /api/v1/analytics/departments
 */
export const fetchDepartments = async (params = {}) => {
    const response = await axiosInstance.get(`${BASE}/departments`, { params });
    return response.data?.data || response.data;
};

/**
 * GET /api/v1/analytics/leaves
 */
export const fetchLeaves = async (params = {}) => {
    const response = await axiosInstance.get(`${BASE}/leaves`, { params });
    return response.data?.data || response.data;
};

/**
 * GET /api/v1/analytics/cost
 */
export const fetchCost = async (params = {}) => {
    const response = await axiosInstance.get(`${BASE}/cost`, { params });
    return response.data?.data || response.data;
};