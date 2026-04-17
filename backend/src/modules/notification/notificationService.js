const notificationRepository = require('./notificationRepository');


const isValidId = (id) => Number.isInteger(id) && id > 0;

const validateUserId = (userId) => {
  if (!isValidId(userId)) {
    return { success: false, message: "Invalid userId" };
  }
  return null;
};

const validateNotificationId = (notificationId) => {
  if (!isValidId(notificationId)) {
    return { success: false, message: "Invalid notificationId" };
  }
  return null;
};

const sanitizeMetadata = (metadata) => {
  if (typeof metadata !== 'object' || metadata === null) return {};

  const MAX_SIZE = 5000;
  const str = JSON.stringify(metadata);

  if (str.length > MAX_SIZE) return {};

  return metadata;
};

const VALID_TYPES = ['EXPENSE', 'APPROVAL', 'SYSTEM'];


const createNotification = async (userId, type, message, metadata = {}) => {
  const userError = validateUserId(userId);
  if (userError) return userError;

  if (!VALID_TYPES.includes(type)) {
    return { success: false, message: "Invalid notification type" };
  }

  if (!message || typeof message !== 'string') {
    return { success: false, message: "Message is required" };
  }

  const safeMetadata = sanitizeMetadata(metadata);

  try {
    const notification = await notificationRepository.createNotification({
      userId,
      type,
      message,
      metadata: safeMetadata,
      isRead: false,
      title: safeMetadata?.title || ''
    });

    return {
      success: true,
      message: "Notification created",
      data: notification
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create notification"
    };
  }
};


const getMyNotifications = async (userId, limit = 20, offset = 0) => {
  const userError = validateUserId(userId);
  if (userError) return userError;

  limit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  offset = Math.max(Number(offset) || 0, 0);

  try {
    const result = await notificationRepository.listByUser(userId, limit, offset);

    return {
      success: true,
      count: result.count,
      limit,
      offset,
      data: result.rows
    };
  } catch {
    return {
      success: false,
      message: "Failed to fetch notifications"
    };
  }
};


const markNotificationRead = async (notificationId, userId) => {
  const userError = validateUserId(userId);
  if (userError) return userError;

  const idError = validateNotificationId(notificationId);
  if (idError) return idError;

  try {
    const updated = await notificationRepository.markRead(notificationId, userId);

    if (!updated) {
      return { success: false, message: "Notification not found" };
    }

    return {
      success: true,
      message: "Notification marked as read",
      notificationId
    };
  } catch {
    return {
      success: false,
      message: "Failed to update notification"
    };
  }
};


const markAllNotificationsRead = async (userId) => {
  const userError = validateUserId(userId);
  if (userError) return userError;

  try {
    const affected = await notificationRepository.markAllRead(userId);

    return {
      success: true,
      message: "All notifications marked as read",
      affected
    };
  } catch {
    return {
      success: false,
      message: "Failed to update notifications"
    };
  }
};


const deleteNotification = async (notificationId, userId) => {
  const userError = validateUserId(userId);
  if (userError) return userError;

  const idError = validateNotificationId(notificationId);
  if (idError) return idError;

  try {
    const deleted = await notificationRepository.delete(notificationId, userId);

    if (!deleted) {
      return {
        success: false,
        message: "Notification not found or already deleted"
      };
    }

    return {
      success: true,
      message: "Notification deleted successfully",
      notificationId
    };
  } catch {
    return {
      success: false,
      message: "Failed to delete notification"
    };
  }
};


const clearAllNotifications = async (userId) => {
  const userError = validateUserId(userId);
  if (userError) return userError;

  try {
    const affected = await notificationRepository.clearAll(userId);

    return {
      success: true,
      message: "All notifications cleared",
      affected
    };
  } catch {
    return {
      success: false,
      message: "Failed to clear notifications"
    };
  }
};


const getUnreadCount = async (userId) => {
  const userError = validateUserId(userId);
  if (userError) return userError;

  try {
    const count = await notificationRepository.countUnread(userId);

    return {
      success: true,
      unread: count
    };
  } catch {
    return {
      success: false,
      message: "Failed to fetch unread count"
    };
  }
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