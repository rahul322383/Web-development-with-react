
import axiosInstance from './axios';

const unwrap = (res) => res.data.data; 

export const authApi = {
  register: async (userData) => {
    const res = await axiosInstance.post('/auth/register', userData);
    return unwrap(res);
  },

  login: async (credentials) => {
    const res = await axiosInstance.post('/auth/login', credentials);
    return unwrap(res);
  },

  logout: async () => {
    const res = await axiosInstance.post('/auth/logout');
    return res.data; 
  },

  getMe: async () => {
    const res = await axiosInstance.get('/auth/me');
    return unwrap(res);
  },

  refreshToken: async (refreshToken) => {
    const res = await axiosInstance.post('/auth/refresh-token', { refreshToken });
    return unwrap(res);
  }
};