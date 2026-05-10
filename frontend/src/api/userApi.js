import axiosInstance from './axios';

const handleApiError = (error) => {
 

  return Promise.reject({
    success: false,
    message:
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong',
    errors: error?.response?.data?.errors || null,
    status: error?.response?.status || 500,
  });
};

export const userApi = {
  // ✅ Get all users
  getUsers: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/users', { params });
      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ✅ Get single user
  getUserById: async (id) => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ✅ Create user
  createUser: async (userData) => {
    try {
      const response = await axiosInstance.post('/users', userData);
      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ✅ Update user
  updateUser: async (id, userData) => {
    try {
      const response = await axiosInstance.patch(`/users/${id}`, userData);
      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ✅ Delete user
  deleteUser: async (id) => {
    try {
      const response = await axiosInstance.delete(`/users/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ✅ Dashboard summary
  getDashboardSummary: async () => {
    try {
      const response = await axiosInstance.get('/users/dashboard/summary');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ✅ Department users
  getUsersByDepartment: async (department) => {
    try {
      const response = await axiosInstance.get(
        `/users/department/${department}`
      );

      return response.data.data || [];
    } catch (error) {
      return handleApiError(error);
    }
  },
};