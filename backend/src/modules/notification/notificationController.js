

const asyncHandler = require('../../utils/asyncHandler');
const notificationService = require('./notificationService');

// ─── Existing (unchanged) ─────────────────────────────────────────────────────

const listMyNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getMyNotifications(
    req.user.id, req.query, req.user,
  );
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const markRead = asyncHandler(async (req, res) => {
  const notificationId = Number(req.params.id);
  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid notification id' });
  }
  const result = await notificationService.markNotificationRead(
    notificationId, req.user.id, req.user,
  );
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllNotificationsRead(req.user.id, req.user);
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notificationId = Number(req.params.id);
  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid notification id' });
  }
  const result = await notificationService.deleteNotification(
    notificationId, req.user.id, req.user,
  );
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const clearAllNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.clearAllNotifications(req.user.id, req.user);
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user.id, req.user);
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});


const getMyPreferences = asyncHandler(async (req, res) => {
  const result = await notificationService.getMyPreferences(req.user.id, req.user);
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});


const updateMyPreferences = asyncHandler(async (req, res) => {
  const { eventType, prefs } = req.body;

  if (!eventType || typeof prefs !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'eventType (string) and prefs ({ email?, sms?, in_app? }) are required.',
    });
  }

  const result = await notificationService.updateMyPreferences(
    req.user.id, { eventType, prefs }, req.user,
  );
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

module.exports = {
  listMyNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount,
  getMyPreferences,
  updateMyPreferences,
};