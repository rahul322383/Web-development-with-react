// 'use strict';

// const notificationRepository = require('./notificationRepository');
// const logger = require('../../config/logger');
// const { assertPermission } = require('../../utils/permissions');
// const {
//   createNotificationSchema,
//   notificationQuerySchema,
//   validate,
// } = require('./notificationValidators');

// const METADATA_MAX_SIZE = 5_000;

// const fail = (message, statusCode = 400) => ({ success: false, message, statusCode, data: null });

// const isValidId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

// const sanitizeMetadata = (metadata) => {
//   if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) return {};
//   try {
//     const str = JSON.stringify(metadata);
//     return str.length > METADATA_MAX_SIZE ? {} : metadata;
//   } catch {
//     return {};
//   }
// };

// // FIX: single consistent permission check
// const checkPermission = (actor, permission) => {
//   const perm = assertPermission(actor, permission);
//   const granted = perm.success ?? perm.allowed ?? false;
//   if (!granted) return fail(perm.message || 'Forbidden', perm.statusCode || 403);
//   return null;
// };

// const buildPagination = (query) => {
//   const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
//   const offset = Math.max(Number(query.offset) || 0, 0);
//   return { limit, offset };
// };

// // ---------------------------------------------------------------------------
// // createNotification
// // ---------------------------------------------------------------------------

// const createNotification = async (userId, type, message, metadata = {}, actor) => {
//   const denied = checkPermission(actor, 'SEND_NOTIFICATION'); // FIX: correct permission name
//   if (denied) return denied;

//   if (!isValidId(userId)) return fail('Invalid userId');

//   const validation = validate(createNotificationSchema, { userId, type, message, metadata });
//   if (!validation.valid) return fail(validation.message);

//   const safeMetadata = sanitizeMetadata(metadata);

//   try {
//     const notification = await notificationRepository.createNotification({
//       userId: Number(userId),
//       type,
//       message,
//       metadata: safeMetadata,
//       isRead: false,
//       title: safeMetadata?.title || '',
//     });

//     return { success: true, message: 'Notification created', statusCode: 201, data: notification };
//   } catch (error) {
//     logger.error({ event: 'CREATE_NOTIFICATION_FAILED', userId, error: error.message, stack: error.stack });
//     return fail('Failed to create notification', 500);
//   }
// };

// // ---------------------------------------------------------------------------
// // getMyNotifications
// // ---------------------------------------------------------------------------

// const getMyNotifications = async (userId, query = {}, actor) => {
//   const denied = checkPermission(actor, 'VIEW_NOTIFICATIONS');
//   if (denied) return denied;

//   if (!isValidId(userId)) return fail('Invalid userId');

//   const validation = validate(notificationQuerySchema, query);
//   if (!validation.valid) return fail(validation.message);

//   const { limit, offset } = buildPagination(validation.value);

//   try {
//     const result = await notificationRepository.listByUser(Number(userId), limit, offset);
//     return {
//       success: true,
//       statusCode: 200,
//       count: result.count,
//       limit,
//       offset,
//       data: result.rows,
//     };
//   } catch (error) {
//     logger.error({ event: 'GET_NOTIFICATIONS_FAILED', userId, error: error.message });
//     return fail('Failed to fetch notifications', 500);
//   }
// };

// // ---------------------------------------------------------------------------
// // markNotificationRead
// // ---------------------------------------------------------------------------

// const markNotificationRead = async (notificationId, userId, actor) => {
//   const denied = checkPermission(actor, 'VIEW_NOTIFICATIONS');
//   if (denied) return denied;

//   if (!isValidId(userId)) return fail('Invalid userId');
//   if (!isValidId(notificationId)) return fail('Invalid notificationId');

//   try {
//     const updated = await notificationRepository.markRead(Number(notificationId), Number(userId));
//     if (!updated) return fail('Notification not found', 404);

//     return { success: true, message: 'Notification marked as read', statusCode: 200, notificationId };
//   } catch (error) {
//     logger.error({ event: 'MARK_READ_FAILED', notificationId, userId, error: error.message });
//     return fail('Failed to update notification', 500);
//   }
// };

// // ---------------------------------------------------------------------------
// // markAllNotificationsRead
// // ---------------------------------------------------------------------------

// const markAllNotificationsRead = async (userId, actor) => {
//   const denied = checkPermission(actor, 'VIEW_NOTIFICATIONS');
//   if (denied) return denied;

//   if (!isValidId(userId)) return fail('Invalid userId');

//   try {
//     const affected = await notificationRepository.markAllRead(Number(userId));
//     return { success: true, message: 'All notifications marked as read', statusCode: 200, affected };
//   } catch (error) {
//     logger.error({ event: 'MARK_ALL_READ_FAILED', userId, error: error.message });
//     return fail('Failed to update notifications', 500);
//   }
// };

// // ---------------------------------------------------------------------------
// // deleteNotification
// // ---------------------------------------------------------------------------

// const deleteNotification = async (notificationId, userId, actor) => {
//   const denied = checkPermission(actor, 'VIEW_NOTIFICATIONS');
//   if (denied) return denied;

//   if (!isValidId(userId)) return fail('Invalid userId');
//   if (!isValidId(notificationId)) return fail('Invalid notificationId');

//   try {
//     const deleted = await notificationRepository.deleteNotification(Number(notificationId), Number(userId));
//     if (!deleted) return fail('Notification not found or already deleted', 404);

//     return { success: true, message: 'Notification deleted successfully', statusCode: 200, notificationId };
//   } catch (error) {
//     logger.error({ event: 'DELETE_NOTIFICATION_FAILED', notificationId, userId, error: error.message });
//     return fail('Failed to delete notification', 500);
//   }
// };

// // ---------------------------------------------------------------------------
// // clearAllNotifications
// // ---------------------------------------------------------------------------

// const clearAllNotifications = async (userId, actor) => {
//   const denied = checkPermission(actor, 'VIEW_NOTIFICATIONS');
//   if (denied) return denied;

//   if (!isValidId(userId)) return fail('Invalid userId');

//   try {
//     const affected = await notificationRepository.clearAll(Number(userId));
//     return { success: true, message: 'All notifications cleared', statusCode: 200, affected };
//   } catch (error) {
//     logger.error({ event: 'CLEAR_NOTIFICATIONS_FAILED', userId, error: error.message });
//     return fail('Failed to clear notifications', 500);
//   }
// };

// // ---------------------------------------------------------------------------
// // getUnreadCount
// // ---------------------------------------------------------------------------

// const getUnreadCount = async (userId, actor) => {
//   const denied = checkPermission(actor, 'VIEW_NOTIFICATIONS');
//   if (denied) return denied;

//   if (!isValidId(userId)) return fail('Invalid userId');

//   try {
//     const count = await notificationRepository.countUnread(Number(userId));
//     return { success: true, statusCode: 200, unread: count };
//   } catch (error) {
//     logger.error({ event: 'GET_UNREAD_COUNT_FAILED', userId, error: error.message });
//     return fail('Failed to fetch unread count', 500);
//   }
// };

// module.exports = {
//   createNotification,
//   getMyNotifications,
//   markNotificationRead,
//   markAllNotificationsRead,
//   deleteNotification,
//   clearAllNotifications,
//   getUnreadCount,
// };

'use strict';

/**
 * src/modules/notification/notificationService.js
 */

const notificationRepository = require('./notificationRepository');
const { dispatch } = require('./notificationDispatcher');
const { getPreferences, setPreferences, setAllPreferences } = require('./notificationPreferences');
const logger = require('../../config/logger');
const { assertPermission } = require('../../utils/Permissions');
const {
  createNotificationSchema,
  notificationQuerySchema,
  validate,
} = require('./notificationValidators');

const METADATA_MAX_SIZE = 5_000;

const fail = (message, statusCode = 400) => ({ success: false, message, statusCode, data: null });

const isValidId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

const sanitizeMetadata = (metadata) => {
  if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) return {};
  try {
    const str = JSON.stringify(metadata);
    return str.length > METADATA_MAX_SIZE ? {} : metadata;
  } catch { return {}; }
};

const checkPermission = (actor, permission) => {
  const perm = assertPermission(actor, permission);
  const granted = perm.success ?? perm.allowed ?? false;
  if (!granted) return fail(perm.message || 'Forbidden', perm.statusCode || 403);
  return null;
};

const buildPagination = (query) => ({
  limit: Math.min(Math.max(Number(query.limit) || 20, 1), 100),
  offset: Math.max(Number(query.offset) || 0, 0),
});

// ─── createNotification ───────────────────────────────────────────────────────
const createNotification = async (userId, type, message, metadata = {}, actor) => {
  const denied = checkPermission(actor, 'SEND_NOTIFICATION');
  if (denied) return denied;

  if (!isValidId(userId)) return fail('Invalid userId');

  const validation = validate(createNotificationSchema, { userId, type, message, metadata });
  if (!validation.valid) return fail(validation.message);

  const safeMetadata = sanitizeMetadata(metadata);

  try {
    // Use dispatcher so email + SMS also fire based on user prefs
    await dispatch({
      userId,
      type,
      message,
      data: { ...safeMetadata, title: safeMetadata?.title || message },
    });

    return { success: true, message: 'Notification sent', statusCode: 201 };
  } catch (error) {
    logger.error({ event: 'CREATE_NOTIFICATION_FAILED', userId, error: error.message });
    return fail('Failed to send notification', 500);
  }
};

// ─── getMyNotifications ───────────────────────────────────────────────────────
const getMyNotifications = async (userId, query = {}, actor) => {
  const denied = checkPermission(actor, 'VIEW_NOTIFICATIONS');
  if (denied) return denied;

  if (!isValidId(userId)) return fail('Invalid userId');

  const validation = validate(notificationQuerySchema, query);
  if (!validation.valid) return fail(validation.message);

  const { limit, offset } = buildPagination(validation.value);

  // Optional filters from query
  const filters = {};
  if (query.type) filters.type = query.type;
  if (query.isRead !== undefined) filters.isRead = query.isRead === 'true';

  try {
    const result = await notificationRepository.listByUser(Number(userId), limit, offset, filters);
    return {
      success: true,
      statusCode: 200,
      count: result.count,
      limit,
      offset,
      data: result.rows,
    };
  } catch (error) {
    logger.error({ event: 'GET_NOTIFICATIONS_FAILED', userId, error: error.message });
    return fail('Failed to fetch notifications', 500);
  }
};

// ─── markNotificationRead ─────────────────────────────────────────────────────
const markNotificationRead = async (notificationId, userId, actor) => {
  const denied = checkPermission(actor, 'VIEW_NOTIFICATIONS');
  if (denied) return denied;

  if (!isValidId(userId) || !isValidId(notificationId)) return fail('Invalid id');

  try {
    const updated = await notificationRepository.markRead(Number(notificationId), Number(userId));
    if (!updated) return fail('Notification not found', 404);
    return { success: true, message: 'Notification marked as read', statusCode: 200, notificationId };
  } catch (error) {
    logger.error({ event: 'MARK_READ_FAILED', notificationId, userId, error: error.message });
    return fail('Failed to update notification', 500);
  }
};

// ─── markAllNotificationsRead ─────────────────────────────────────────────────
const markAllNotificationsRead = async (userId, actor) => {
  const denied = checkPermission(actor, 'VIEW_NOTIFICATIONS');
  if (denied) return denied;

  if (!isValidId(userId)) return fail('Invalid userId');

  try {
    const affected = await notificationRepository.markAllRead(Number(userId));
    return { success: true, message: 'All notifications marked as read', statusCode: 200, affected };
  } catch (error) {
    logger.error({ event: 'MARK_ALL_READ_FAILED', userId, error: error.message });
    return fail('Failed to update notifications', 500);
  }
};

// ─── deleteNotification ───────────────────────────────────────────────────────
const deleteNotification = async (notificationId, userId, actor) => {
  const denied = checkPermission(actor, 'VIEW_NOTIFICATIONS');
  if (denied) return denied;

  if (!isValidId(userId) || !isValidId(notificationId)) return fail('Invalid id');

  try {
    const deleted = await notificationRepository.deleteNotification(Number(notificationId), Number(userId));
    if (!deleted) return fail('Notification not found or already deleted', 404);
    return { success: true, message: 'Notification deleted', statusCode: 200, notificationId };
  } catch (error) {
    logger.error({ event: 'DELETE_NOTIFICATION_FAILED', notificationId, userId, error: error.message });
    return fail('Failed to delete notification', 500);
  }
};

// ─── clearAllNotifications ────────────────────────────────────────────────────
const clearAllNotifications = async (userId, actor) => {
  const denied = checkPermission(actor, 'VIEW_NOTIFICATIONS');
  if (denied) return denied;

  if (!isValidId(userId)) return fail('Invalid userId');

  try {
    const affected = await notificationRepository.clearAll(Number(userId));
    return { success: true, message: 'All notifications cleared', statusCode: 200, affected };
  } catch (error) {
    logger.error({ event: 'CLEAR_NOTIFICATIONS_FAILED', userId, error: error.message });
    return fail('Failed to clear notifications', 500);
  }
};

// ─── getUnreadCount ───────────────────────────────────────────────────────────
const getUnreadCount = async (userId, actor) => {
  const denied = checkPermission(actor, 'VIEW_NOTIFICATIONS');
  if (denied) return denied;

  if (!isValidId(userId)) return fail('Invalid userId');

  try {
    const count = await notificationRepository.countUnread(Number(userId));
    const byType = await notificationRepository.countByType(Number(userId));
    return { success: true, statusCode: 200, unread: count, byType };
  } catch (error) {
    logger.error({ event: 'GET_UNREAD_COUNT_FAILED', userId, error: error.message });
    return fail('Failed to fetch unread count', 500);
  }
};

// ─── NEW: getMyPreferences ────────────────────────────────────────────────────
const getMyPreferences = async (userId, actor) => {
  const denied = checkPermission(actor, 'VIEW_NOTIFICATIONS');
  if (denied) return denied;

  try {
    const data = await getPreferences(Number(userId));
    return { success: true, statusCode: 200, data };
  } catch (error) {
    logger.error({ event: 'GET_PREFS_FAILED', userId, error: error.message });
    return fail('Failed to fetch preferences', 500);
  }
};

// ─── NEW: updateMyPreferences ─────────────────────────────────────────────────
const updateMyPreferences = async (userId, { eventType, prefs }, actor) => {
  const denied = checkPermission(actor, 'VIEW_NOTIFICATIONS');
  if (denied) return denied;

  try {
    if (eventType === 'ALL') {
      await setAllPreferences(Number(userId), prefs);
    } else {
      await setPreferences(Number(userId), eventType, prefs);
    }
    const data = await getPreferences(Number(userId));
    return { success: true, statusCode: 200, message: 'Preferences updated', data };
  } catch (error) {
    logger.error({ event: 'UPDATE_PREFS_FAILED', userId, error: error.message });
    return fail('Failed to update preferences', 500);
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount,
  getMyPreferences,
  updateMyPreferences,
};