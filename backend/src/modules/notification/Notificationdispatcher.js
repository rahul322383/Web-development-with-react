'use strict';

/**
 * src/modules/notification/notificationDispatcher.js
 *
 * Central dispatch function.
 * Given a userId + event type + data, it:
 *  1. Checks user preferences
 *  2. Saves to DB (in-app)
 *  3. Sends real-time socket event
 *  4. Sends email (if opted in)
 *  5. Sends SMS (if opted in + phone exists)
 *
 * Usage anywhere in the codebase:
 *   const { dispatch } = require('./notificationDispatcher');
 *   await dispatch({ userId: 5, type: 'PAYROLL_PROCESSED', data: { ... } });
 */

const logger = require('../../config/logger');
const { sendNotification } = require('../../config/socket');
const { sendMail } = require('../../utils/mailer');
const { sendSMS, getSMSMessage } = require('./smsProvider');
const { getEmailTemplate } = require('./emailTemplates');
const { getChannelPrefs } = require('./notificationPreferences');
const notifRepo = require('./notificationRepository');
const { User } = require('../../database/initModels');

// ─── Map event type → notification category (for DB `type` ENUM) ─────────────
const TYPE_GROUP = {
    PAYROLL_PROCESSED: 'PAYROLL',
    PAYROLL_LOCKED: 'PAYROLL',
    PAYROLL_COMPLETED: 'PAYROLL',
    LEAVE_REQUESTED: 'LEAVE',
    LEAVE_APPROVED: 'LEAVE',
    LEAVE_REJECTED: 'LEAVE',
    LEAVE_PENDING_APPROVAL: 'LEAVE',
    ATTENDANCE_LATE: 'ATTENDANCE',
    ATTENDANCE_ABSENT: 'ATTENDANCE',
    EXPENSE_SUBMITTED: 'EXPENSE',
    EXPENSE_APPROVED: 'EXPENSE',
    EXPENSE_REJECTED: 'EXPENSE',
    SECURITY_LOGIN: 'SECURITY',
    PASSWORD_RESET: 'SECURITY',
    SYSTEM: 'SYSTEM',
    ANNOUNCEMENT: 'ANNOUNCEMENT',
};

// ─── Default titles per event ─────────────────────────────────────────────────
const TITLES = {
    PAYROLL_PROCESSED: 'Salary Processed',
    PAYROLL_LOCKED: 'Payroll Finalised',
    PAYROLL_COMPLETED: 'Payroll Complete',
    LEAVE_REQUESTED: 'Leave Request Submitted',
    LEAVE_APPROVED: 'Leave Approved',
    LEAVE_REJECTED: 'Leave Rejected',
    LEAVE_PENDING_APPROVAL: 'Leave Approval Required',
    ATTENDANCE_LATE: 'Late Arrival Recorded',
    ATTENDANCE_ABSENT: 'Absence Recorded',
    EXPENSE_SUBMITTED: 'Expense Submitted',
    EXPENSE_APPROVED: 'Expense Approved',
    EXPENSE_REJECTED: 'Expense Rejected',
    SECURITY_LOGIN: 'New Login Detected',
    PASSWORD_RESET: 'Password Reset',
    SYSTEM: 'System Notification',
    ANNOUNCEMENT: 'Announcement',
};

/**
 * dispatch
 *
 * @param {object} params
 * @param {number}  params.userId     — recipient user ID
 * @param {string}  params.type       — event type key (e.g. 'PAYROLL_PROCESSED')
 * @param {string}  [params.message]  — override message (otherwise built from data)
 * @param {object}  [params.data]     — template variables
 * @param {boolean} [params.skipPreferenceCheck] — force-send regardless of user prefs (e.g. security alerts)
 */
const dispatch = async ({
    userId,
    type,
    message,
    data = {},
    skipPreferenceCheck = false,
}) => {
    if (!userId || !type) {
        logger.warn({ event: 'DISPATCH_SKIPPED', reason: 'missing userId or type', userId, type });
        return;
    }

    try {
        // ── 1. Resolve user (for email + phone) ──────────────────────────────────
        const user = await User.findByPk(userId, {
            attributes: ['id', 'firstName', 'lastName', 'email'],
        });

        if (!user) {
            logger.warn({ event: 'DISPATCH_NO_USER', userId });
            return;
        }

        const employeeName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        const templateData = { employeeName, ...data };

        // ── 2. Get channel preferences ───────────────────────────────────────────
        const prefs = skipPreferenceCheck
            ? { email: true, sms: false, in_app: true }
            : await getChannelPrefs(userId, type);

        const dbType = TYPE_GROUP[type] || 'SYSTEM';
        const title = data.title || TITLES[type] || 'Notification';
        const msg = message || data.message || title;

        // ── 3. In-app — always save to DB, conditionally send socket ────────────
        let dbRecord;
        try {
            dbRecord = await notifRepo.createNotification({
                userId: Number(userId),
                type: dbType,
                channel: 'in_app',
                title,
                message: msg,
                metadata: data,
                isRead: false,
                emailSent: false,
                smsSent: false,
            });
        } catch (dbErr) {
            logger.error({ event: 'NOTIFICATION_DB_FAILED', userId, type, error: dbErr.message });
        }

        if (prefs.in_app) {
            sendNotification(userId, {
                id: dbRecord?.id,
                type,
                title,
                message: msg,
                metadata: data,
            });
        }

        // ── 4. Email ─────────────────────────────────────────────────────────────
        if (prefs.email && user.email) {
            try {
                const { subject, html } = getEmailTemplate(type, templateData);
                await sendMail({ to: user.email, subject, html });

                if (dbRecord) {
                    await dbRecord.update({ emailSent: true });
                }

                logger.debug({ event: 'EMAIL_SENT', userId, type, to: user.email });
            } catch (mailErr) {
                logger.error({ event: 'EMAIL_FAILED', userId, type, error: mailErr.message });
            }
        }

        // ── 5. SMS ───────────────────────────────────────────────────────────────
        // Phone number stored in metadata or user profile
        const phone = data.phone || user.phone || null;

        if (prefs.sms && phone) {
            try {
                const smsBody = getSMSMessage(type, templateData);
                const sent = await sendSMS(phone, smsBody);

                if (sent && dbRecord) {
                    await dbRecord.update({ smsSent: true });
                }
            } catch (smsErr) {
                logger.error({ event: 'SMS_FAILED', userId, type, error: smsErr.message });
            }
        }

    } catch (err) {
        // Never crash the caller — notifications are non-critical
        logger.error({ event: 'DISPATCH_FAILED', userId, type, error: err.message, stack: err.stack });
    }
};

/**
 * dispatchBulk
 * Send the same notification to multiple users.
 */
const dispatchBulk = async (userIds, params) => {
    await Promise.allSettled(
        userIds.map(uid => dispatch({ ...params, userId: uid })),
    );
};

module.exports = { dispatch, dispatchBulk };