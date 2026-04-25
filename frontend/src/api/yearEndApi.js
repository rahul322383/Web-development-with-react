import axiosInstance from './axios';

export const yearEndApi = {
  // Generate year-end summary (POST)
  generateYearEndSummary: async (year) => {
    try {
      const response = await axiosInstance.post('/year-end/generate', { year });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get year-end summaries (GET)
  getYearEndSummaries: async (year) => {
    try {
      const response = await axiosInstance.get('/year-end', { params: { year } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};