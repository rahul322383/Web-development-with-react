'use strict';

const { Notification } = require('../../database/initModels');

const listByUser = (userId, limit = 20, offset = 0) =>
  Notification.findAndCountAll({
    where: { userId },   // FIX: removed deletedAt: null — only add if model has paranoid: true
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

const markRead = async (id, userId) => {
  const [updated] = await Notification.update(
    { isRead: true },
    { where: { id, userId } },
  );
  return updated;  // returns affected row count — truthy if found
};

const markAllRead = async (userId) => {
  const [affected] = await Notification.update(  // FIX: destructure to get count directly
    { isRead: true },
    { where: { userId, isRead: false } },
  );
  return affected;
};

// FIX: renamed from deleteNotification to delete in original — now consistently
// named deleteNotification to match the service call
const deleteNotification = (id, userId) =>
  Notification.destroy({ where: { id, userId } });

const clearAll = (userId) =>
  Notification.destroy({ where: { userId } });

const countUnread = (userId) =>
  Notification.count({ where: { userId, isRead: false } });

const createNotification = (data) =>
  Notification.create(data);

module.exports = {
  listByUser,
  markRead,
  markAllRead,
  deleteNotification,
  clearAll,
  countUnread,
  createNotification,
};