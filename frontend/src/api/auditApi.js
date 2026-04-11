import axiosInstance from './axios';

export const auditApi = {
  getAuditLogs: async () => {
    try {
      const res = await axiosInstance.get("/audit");
      return res.data.data || res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};