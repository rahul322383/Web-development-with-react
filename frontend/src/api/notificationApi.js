// notificationApi.js
import axiosInstance from "./axios";

const notificationApi = {
  getNotifications: async (limit = 20, offset = 0) => {
    const res = await axiosInstance.get("/notifications", {
      params: { limit, offset },
    });
    return res.data;
  },

  getUnreadCount: async () => {
    const res = await axiosInstance.get("/notifications/unread-count");
    return res.data;
  },

  // ✅ UPDATED: was markNotificationRead
  markAsRead: async (id) => {
    const res = await axiosInstance.patch(`/notifications/${id}/read`);
    return res.data;
  },

  // ✅ UPDATED: was markAllNotificationsRead
  markAllAsRead: async () => {
    const res = await axiosInstance.patch("/notifications/read-all");
    return res.data;
  },

  deleteNotification: async (id) => {
    const res = await axiosInstance.delete(`/notifications/${id}`);
    return res.data;
  },

  clearAllNotifications: async () => {
    const res = await axiosInstance.delete("/notifications");
    return res.data;
  },
};

export default notificationApi;