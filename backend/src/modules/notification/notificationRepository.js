const { Notification } = require('../../database/initModels');

/* =========================
   LIST (WITH PAGINATION)
========================= */
const listByUser = async (userId, limit = 20, offset = 0) => {
  return Notification.findAndCountAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};

/* =========================
   MARK SINGLE AS READ
========================= */
const markRead = async (id, userId) => {
  const [updated] = await Notification.update(
    { isRead: true },
    {
      where: { id, userId }
    }
  );

  return updated; // number of rows affected
};

/* =========================
   MARK ALL AS READ
========================= */
const markAllRead = async (userId) => {
  return Notification.update(
    { isRead: true },
    {
      where: { userId, isRead: false }
    }
  );
};

/* =========================
   DELETE SINGLE
========================= */
const deleteNotification = async (id, userId) => {
  return Notification.destroy({
    where: { id, userId }
  });
};

/* =========================
   CLEAR ALL
========================= */
const clearAll = async (userId) => {
  return Notification.destroy({
    where: { userId }
  });
};

/* =========================
   COUNT UNREAD
========================= */
const countUnread = async (userId) => {
  return Notification.count({
    where: { userId, isRead: false }
  });
};

/* =========================
   CREATE (IMPORTANT 🔔)
========================= */
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