const asyncHandler = require('../../utils/asyncHandler');
const notificationService = require('./notificationService');

const listMyNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getMyNotifications(req.user.id);
  res.status(200).json(result);
});

const markRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markNotificationRead(Number(req.params.id), req.user.id);
  res.status(200).json(result);
});

module.exports = {
  listMyNotifications,
  markRead
};