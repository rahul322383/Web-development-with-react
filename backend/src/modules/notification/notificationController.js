const asyncHandler = require('../../utils/asyncHandler');
const notificationService = require('./notificationService');

const validateUser = (req, res) => {
  if (!req.user?.id) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return false;
  }
  return true;
};

const parseId = (id) => {
  const num = Number(id);
  return Number.isInteger(num) && num > 0 ? num : null;
};

const listMyNotifications = asyncHandler(async (req, res) => {
  if (!validateUser(req, res)) return;

  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  const result = await notificationService.getMyNotifications(
    req.user.id,
    limit,
    offset
  );

  res.status(200).json(result);
});

const markRead = asyncHandler(async (req, res) => {
  if (!validateUser(req, res)) return;

  const notificationId = parseId(req.params.id);
  if (!notificationId) {
    return res.status(400).json({ success: false, message: "Invalid notification id" });
  }

  const result = await notificationService.markNotificationRead(
    notificationId,
    req.user.id
  );

  res.status(200).json(result);
});

const markAllRead = asyncHandler(async (req, res) => {
  if (!validateUser(req, res)) return;

  const result = await notificationService.markAllNotificationsRead(req.user.id);

  res.status(200).json(result);
});

const deleteNotification = asyncHandler(async (req, res) => {
  if (!validateUser(req, res)) return;

  const notificationId = parseId(req.params.id);
  if (!notificationId) {
    return res.status(400).json({ success: false, message: "Invalid notification id" });
  }

  const result = await notificationService.deleteNotification(
    notificationId,
    req.user.id
  );

  res.status(200).json(result);
});

const clearAllNotifications = asyncHandler(async (req, res) => {
  if (!validateUser(req, res)) return;

  const result = await notificationService.clearAllNotifications(req.user.id);

  res.status(200).json(result);
});

const getUnreadCount = asyncHandler(async (req, res) => {
  if (!validateUser(req, res)) return;

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