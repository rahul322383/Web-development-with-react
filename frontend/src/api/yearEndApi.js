import axiosInstance from './axios';

export const yearEndApi = {
  // 🔹 Get all year-end summaries
  getSummaries: async () => {
    try {
      const res = await axiosInstance.get('/year-end');
      return res.data.data || res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 🔹 Generate year-end summary
  generateSummary: async (payload) => {
    try {
      const res = await axiosInstance.post('/year-end/generate', payload);
      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};