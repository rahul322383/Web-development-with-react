const { Notification } = require('../../database/initModels');

const listByUser = async (userId, limit = 20, offset = 0) => {
  return Notification.findAndCountAll({
    where: {
      userId,
      deletedAt: null
    },
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};

const markRead = async (id, userId) => {
  const [updated] = await Notification.update(
    { isRead: true },
    {
      where: { id, userId }
    }
  );

  return updated;
};

const markAllRead = async (userId) => {
  return Notification.update(
    { isRead: true },
    {
      where: { userId, isRead: false }
    }
  );
};

const deleteNotification = async (id, userId) => {
  return Notification.destroy({
    where: { id, userId }
  });
};

const clearAll = async (userId) => {
  return Notification.destroy({
    where: { userId }
  });
};

const countUnread = async (userId) => {
  return Notification.count({
    where: {
      userId,
      isRead: false
    }
  });
};

const createNotification = async (data) => {
  return Notification.create(data);
};

module.exports = {
  listByUser,
  markRead,
  markAllRead,
  deleteNotification,
  clearAll,
  countUnread,
  createNotification
};