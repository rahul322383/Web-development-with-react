// notificationApi.js
import axiosInstance from "./axios";

const notificationApi = {
  // 📥 GET NOTIFICATIONS
  getNotifications: async (limit = 20, offset = 0) => {
    const res = await axiosInstance.get("/notifications", {
      params: { limit, offset }
    });
    return res.data;
  },

  // 🔢 UNREAD COUNT
  getUnreadCount: async () => {
    const res = await axiosInstance.get("/notifications/unread-count");
    return res.data;
  },

  // ✅ MARK ONE AS READ
  markNotificationRead: async (id) => {
    const res = await axiosInstance.patch(`/notifications/${id}/read`);
    return res.data;
  },

  // ✅ MARK ALL READ
  markAllNotificationsRead: async () => {
    const res = await axiosInstance.patch("/notifications/read-all");
    return res.data;
  },

  // 🗑 DELETE ONE
  deleteNotification: async (id) => {
    const res = await axiosInstance.delete(`/notifications/${id}`);
    return res.data;
  },

  // 🧹 CLEAR ALL
  clearAllNotifications: async () => {
    const res = await axiosInstance.delete("/notifications");
    return res.data;
  }
};

export default notificationApi;