'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const notificationService = require('./notificationService');

// FIX: removed validateUser helper — authenticate middleware already guarantees
// req.user exists before any controller runs. A second check here is redundant
// and the original implementation had a control-flow bug where asyncHandler
// would continue executing after validateUser returned false.

const listMyNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getMyNotifications(
    req.user.id,
    req.query,           // FIX: pass query object, not pre-parsed limit/offset
    req.user             // FIX: pass actor
  );
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const markRead = asyncHandler(async (req, res) => {
  const notificationId = Number(req.params.id);
  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid notification id', data: null });
  }

  const result = await notificationService.markNotificationRead(
    notificationId,
    req.user.id,
    req.user             // FIX: pass actor
  );
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllNotificationsRead(
    req.user.id,
    req.user             // FIX: pass actor
  );
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notificationId = Number(req.params.id);
  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid notification id', data: null });
  }

  const result = await notificationService.deleteNotification(
    notificationId,
    req.user.id,
    req.user             // FIX: pass actor
  );
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const clearAllNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.clearAllNotifications(
    req.user.id,
    req.user             // FIX: pass actor
  );
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(
    req.user.id,
    req.user             // FIX: pass actor
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
};