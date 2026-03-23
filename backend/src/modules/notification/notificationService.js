const notificationRepository = require('./notificationRepository');

const getMyNotifications = async (userId) => notificationRepository.listByUser(userId);

const markNotificationRead = async (notificationId, userId) => {
  await notificationRepository.markRead(notificationId, userId);
  return { success: true };
};

module.exports = {
  getMyNotifications,
  markNotificationRead
};