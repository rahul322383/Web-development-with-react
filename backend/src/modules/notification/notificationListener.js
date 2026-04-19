'use strict';

const eventBus = require('../utils/eventBus');
const { sendNotification } = require('../config/socket');
const logger = require('../config/logger');

/**
 * Basic retry wrapper
 */
const sendWithRetry = async (userId, payload, retries = 2) => {
    try {
        await sendNotification(userId, payload);
    } catch (err) {
        if (retries > 0) {
            return sendWithRetry(userId, payload, retries - 1);
        }
        logger.error({
            event: 'NOTIFICATION_FAILED_FINAL',
            userId,
            error: err.message,
        });
    }
};

eventBus.on('SEND_NOTIFICATION', async ({ userId, payload }) => {
    await sendWithRetry(userId, payload);
});