const asyncHandler = require('../../utils/asyncHandler');
const notificationService = require('./notificationService');

/* =========================
   GET MY NOTIFICATIONS
========================= */
const listMyNotifications = asyncHandler(async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  const result = await notificationService.getMyNotifications(
    req.user.id,
    Number(limit),
    Number(offset)
  );

  res.status(200).json(result);
});

/* =========================
   MARK SINGLE AS READ
========================= */
const markRead = asyncHandler(async (req, res) => {
  const notificationId = Number(req.params.id);

  if (!notificationId) {
    return res.status(400).json({
      success: false,
      message: "Invalid notification id"
    });
  }

  const result = await notificationService.markNotificationRead(
    notificationId,
    req.user.id
  );

  res.status(200).json(result);
});

/* =========================
   MARK ALL AS READ
========================= */
const markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllNotificationsRead(req.user.id);

  res.status(200).json(result);
});

/* =========================
   DELETE SINGLE NOTIFICATION
========================= */
const deleteNotification = asyncHandler(async (req, res) => {
  const notificationId = Number(req.params.id);

  if (!notificationId) {
    return res.status(400).json({
      success: false,
      message: "Invalid notification id"
    });
  }

  const result = await notificationService.deleteNotification(
    notificationId,
    req.user.id
  );

  res.status(200).json(result);
});

/* =========================
   CLEAR ALL NOTIFICATIONS
========================= */
const clearAllNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.clearAllNotifications(req.user.id);

  res.status(200).json(result);
});

/* =========================
   GET UNREAD COUNT
========================= */
const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user.id);

  res.status(200).json(result);
});

module.exports = {
  listMyNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount
};