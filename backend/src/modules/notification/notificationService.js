const notificationRepository = require('./notificationRepository');

/* =========================
   GET MY NOTIFICATIONS (with pagination)
========================= */
const getMyNotifications = async (userId, limit = 20, offset = 0) => {
  const result = await notificationRepository.listByUser(userId, limit, offset);

  return {
    success: true,
    count: result.count,
    data: result.rows
  };
};

/* =========================
   MARK SINGLE AS READ
========================= */
const markNotificationRead = async (notificationId, userId) => {
  const updated = await notificationRepository.markRead(notificationId, userId);

  if (!updated) {
    return {
      success: false,
      message: "Notification not found"
    };
  }

  return { success: true, message: "Notification marked as read" };
};

/* =========================
   MARK ALL AS READ
========================= */
const markAllNotificationsRead = async (userId) => {
  await notificationRepository.markAllRead(userId);

  return {
    success: true,
    message: "All notifications marked as read"
  };
};

/* =========================
   DELETE SINGLE NOTIFICATION
========================= */
const deleteNotification = async (notificationId, userId) => {
  const deleted = await notificationRepository.delete(notificationId, userId);

  if (!deleted) {
    return {
      success: false,
      message: "Notification not found or already deleted"
    };
  }

  return {
    success: true,
    message: "Notification deleted successfully"
  };
};

/* =========================
   CLEAR ALL NOTIFICATIONS
========================= */
const clearAllNotifications = async (userId) => {
  await notificationRepository.clearAll(userId);

  return {
    success: true,
    message: "All notifications cleared"
  };
};

/* =========================
   GET UNREAD COUNT
========================= */
const getUnreadCount = async (userId) => {
  const count = await notificationRepository.countUnread(userId);

  return {
    success: true,
    unread: count
  };
};

module.exports = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount
};