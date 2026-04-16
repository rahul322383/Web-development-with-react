const notificationRepository = require('./notificationRepository');

const createNotification = async (userId, type, message, metadata = {}) => {
  if (!userId) throw new Error("userId is required");

  return notificationRepository.createNotification({
    userId,
    type,
    message,
    metadata,
    isRead: false,
    title: metadata?.title || ''
  });
};


const getMyNotifications = async (userId, limit = 20, offset = 0) => {
  const result = await notificationRepository.listByUser(userId, limit, offset);

  return {
    success: true,
    count: result.count,
    data: result.rows
  };
};

const markNotificationRead = async (notificationId, userId) => {
  const updated = await notificationRepository.markRead(notificationId, userId);

  if (!updated) {
    return { success: false, message: "Notification not found" };
  }

  return { success: true, message: "Notification marked as read" };
};

const markAllNotificationsRead = async (userId) => {
  await notificationRepository.markAllRead(userId);
  return { success: true, message: "All notifications marked as read" };
};

const deleteNotification = async (notificationId, userId) => {
  const deleted = await notificationRepository.delete(notificationId, userId);

  if (!deleted) {
    return { success: false, message: "Notification not found or already deleted" };
  }

  return { success: true, message: "Notification deleted successfully" };
};

const clearAllNotifications = async (userId) => {
  await notificationRepository.clearAll(userId);
  return { success: true, message: "All notifications cleared" };
};

const getUnreadCount = async (userId) => {
  const count = await notificationRepository.countUnread(userId);
  return { success: true, unread: count };
};

module.exports = {
  createNotification,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount
};