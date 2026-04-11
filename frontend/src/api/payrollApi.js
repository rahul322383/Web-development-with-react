import axiosInstance from './axios';

export const payrollApi = {
  // 🔹 Get all payrolls
  getAllPayrolls: async () => {
    try {
      const res = await axiosInstance.get('/payrolls');
      return res.data.data || res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 🔹 Get payroll by employee
  getPayrollByEmployee: async (employeeId) => {
    try {
      const res = await axiosInstance.get(`/payrolls/employee/${employeeId}`);
      return res.data.data || res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 🔹 Create payroll
  createPayroll: async (payload) => {
    try {
      const res = await axiosInstance.post('/payrolls', payload);
      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 🔹 Update payroll
  updatePayroll: async (id, payload) => {
    try {
      const res = await axiosInstance.put(`/payrolls/${id}`, payload);
      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 🔹 Delete payroll
  deletePayroll: async (id) => {
    try {
      const res = await axiosInstance.delete(`/payrolls/${id}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};