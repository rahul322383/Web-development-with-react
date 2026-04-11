

import axiosInstance from './axios';

export const userApi = {
  // ✅ Get all users (with optional filters)
  getUsers: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/users', { params });
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ✅ Get single user
  getUserById: async (id) => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ✅ Create user
  createUser: async (userData) => {
    try {
      const response = await axiosInstance.post('/users', userData);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ✅ Update user
  updateUser: async (id, userData) => {
    try {
      const response = await axiosInstance.patch(`/users/${id}`, userData);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ✅ Delete user
  deleteUser: async (id) => {
    try {
      const response = await axiosInstance.delete(`/users/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },


  getDashboardSummary: async () => {
    try {
      const response = await axiosInstance.get('/users/dashboard/summary');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },


 // userApi.js
  getUsersByDepartment : async (department) => {
  const response = await axiosInstance.get(`/users/department/${department}`);
  return response.data.data;
 }


};

