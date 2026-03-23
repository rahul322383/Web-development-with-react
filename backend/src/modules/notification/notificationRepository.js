const { Notification } = require('../../database/initModels');

const listByUser = async (userId) =>
  Notification.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']]
  });

const markRead = async (id, userId) =>
  Notification.update(
    { isRead: true },
    {
      where: {
        id,
        userId
      }
    }
  );

module.exports = {
  listByUser,
  markRead
};