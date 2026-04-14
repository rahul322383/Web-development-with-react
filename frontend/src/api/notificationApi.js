import axiosInstance from './axios';

const notificationApi = {
  /* =========================
     GET NOTIFICATIONS
  ========================= */
  getMyNotifications: async (limit = 20, offset = 0) => {
    try {
      const res = await axiosInstance.get(`/notifications?limit=${limit}&offset=${offset}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getNotifications: async (limit = 50, offset = 0) => {
    const res = await axiosInstance.get('/notifications', {
      params: { limit, offset }
    });
    return res.data;
  },

  /* =========================
     UNREAD COUNT
  ========================= */
  getUnreadCount: async () => {
    try {
      const res = await axiosInstance.get(`/notifications/unread-count`);
      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /* =========================
     MARK SINGLE AS READ
  ========================= */
  markNotificationRead: async (id) => {
    try {
      const res = await axiosInstance.patch(`/notifications/${id}/read`);
      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /* =========================
     MARK ALL AS READ
  ========================= */
  markAllNotificationsRead: async () => {
    try {
      const res = await axiosInstance.patch(`/notifications/read-all`);
      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /* =========================
     DELETE SINGLE
  ========================= */
  deleteNotification: async (id) => {
    try {
      const res = await axiosInstance.delete(`/notifications/${id}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /* =========================
     CLEAR ALL
  ========================= */
  clearAllNotifications: async () => {
    try {
      const res = await axiosInstance.delete(`/notifications`);
      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};



export default notificationApi;

export const getNotification = async (limit = 20, offset = 0) => {
  try {
    const res = await axiosInstance.get(`/notifications?limit=${limit}&offset=${offset}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};