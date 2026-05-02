'use strict';


const { Op } = require('sequelize');
const { Notification } = require('../../database/initModels');



const listByUser = (userId, limit = 20, offset = 0, filters = {}) => {
  const where = { userId };
  if (filters.type) where.type = filters.type;
  if (filters.isRead !== undefined) where.isRead = filters.isRead;

  return Notification.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: Number(limit),
    offset: Number(offset),
  });
};

const markRead = async (id, userId) => {
  const [updated] = await Notification.update(
    { isRead: true },
    { where: { id, userId } },
  );
  return updated;
};

const markAllRead = async (userId) => {
  const [affected] = await Notification.update(
    { isRead: true },
    { where: { userId, isRead: false } },
  );
  return affected;
};

const deleteNotification = (id, userId) =>
  Notification.destroy({ where: { id, userId } });

const clearAll = (userId) =>
  Notification.destroy({ where: { userId } });

const countUnread = (userId) =>
  Notification.count({ where: { userId, isRead: false } });

const createNotification = (data) =>
  Notification.create(data);

const listByDateRange = (userId, startDate, endDate) =>
  Notification.findAll({
    where: {
      userId,
      createdAt: { [Op.between]: [startDate, endDate] },
    },
    order: [['createdAt', 'DESC']],
  });


const countByType = async (userId) => {
  const rows = await Notification.findAll({
    where: { userId, isRead: false },
    attributes: ['type', [Notification.sequelize.fn('COUNT', Notification.sequelize.col('id')), 'count']],
    group: ['type'],
    raw: true,
  });

  return rows.reduce((acc, r) => {
    acc[r.type] = Number(r.count);
    return acc;
  }, {});
};

module.exports = {
  listByUser,
  markRead,
  markAllRead,
  deleteNotification,
  clearAll,
  countUnread,
  createNotification,
  listByDateRange,
  countByType,
};