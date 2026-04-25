import axiosInstance from './axios';
import { handleRequest } from '../utils/apiHandler';

export const payrollApi = {
  getMyPayrollHistory: (params) =>
    handleRequest(() =>
      axiosInstance.get('/payroll/my/history', { params })
    ),

  getYTDSummary: () =>
    handleRequest(() =>
      axiosInstance.get('/payroll/ytd')
    ),

  getSalaryBreakdown: (id) =>
    handleRequest(() =>
      axiosInstance.get(`/payroll/${id}/breakdown`)
    ),

  downloadPayslip: async (id) => {
    try {
      const res = await axiosInstance.get(
        `/payroll/${id}/payslip`,
        { responseType: 'blob' }
      );

      let filename = 'payslip.pdf';
      const disposition = res.headers['content-disposition'];

      if (disposition) {
        const match = disposition.match(/filename="?(.+)"?/);
        if (match) filename = match[1];
      }

      return { blob: res.data, filename };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Download failed'
      );
    }
  },

  // Admin
  processPayroll: (payload) =>
    handleRequest(() =>
      axiosInstance.post('/payroll/process', payload)
    ),

  lockPayroll: (payload) =>
    handleRequest(() =>
      axiosInstance.patch('/payroll/lock', payload)
    ),
};