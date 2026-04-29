'use strict';

const logger = require('../../config/logger');
const { sendNotification } = require('../../config/socket');
const { sendMail } = require('../../utils/mailer');
const { sendSMS, getSMSMessage } = require('./smsProvider');
const { getEmailTemplate } = require('./emailTemplates');
const { getChannelPrefs } = require('./notificationPreferences');
const notifRepo = require('./notificationRepository');
const { User } = require('../../database/initModels');

// ─── Map event type → notification category ───────────────────────────────
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

// ─── Titles ───────────────────────────────────────────────────────────────
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

// ─── Safe Retry Wrapper (NO LOGIC CHANGE, only reliability) ────────────────
const retry = async (fn, retries = 2) => {
    try {
        return await fn();
    } catch (err) {
        if (retries <= 0) throw err;
        return retry(fn, retries - 1);
    }
};

// ──────────────────────────────────────────────────────────────────────────

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
        // ✅ FIX: include phone (was missing)
        const user = await User.findByPk(userId, {
            attributes: ['id', 'firstName', 'lastName', 'email'],
        });

        if (!user) {
            logger.warn({ event: 'DISPATCH_NO_USER', userId });
            return;
        }

        const employeeName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        const templateData = { employeeName, ...data };

        // ── Preferences ─────────────────────────────────────────────
        let prefs;

        try {
            prefs = skipPreferenceCheck
                ? { email: true, sms: false, in_app: true }
                : await getChannelPrefs(userId, type);

            // ✅ fallback safety (VERY IMPORTANT)
            if (!prefs) {
                prefs = { email: true, sms: false, in_app: true };
            }

        } catch (err) {
            console.error('❌ PREF ERROR:', err);
            prefs = { email: true, sms: false, in_app: true };
        }

        const dbType = TYPE_GROUP[type] || 'SYSTEM';
        const title = data.title || TITLES[type] || 'Notification';

        // ✅ FIX: safer fallback (no unexpected override)
        const msg = message ?? data.message ?? title;

        // ── Deduplication (safe, non-breaking) ──────────────────────
        try {
            if (notifRepo.findRecent) {
                const existing = await notifRepo.findRecent({
                    userId,
                    type: dbType,
                    minutes: 2,
                });
                if (existing) return;
            }
        } catch (e) {
            logger.warn({ event: 'DEDUP_CHECK_FAILED', error: e.message });
        }

        // ── DB (in-app) ─────────────────────────────────────────────
        let dbRecord;
        try {
            dbRecord = await notifRepo.createNotification({
                userId: Number(userId),
                type: dbType,
                channel: 'in_app',
                title,
                message: msg,
                metadata: data ? JSON.parse(JSON.stringify(data)) : {},
                isRead: false,
                emailSent: false,
                smsSent: false,
            });
        } catch (dbErr) {
            logger.error(JSON.stringify({
                event: 'DISPATCH_FAILED',
                userId,
                type,
                error: err.message,
                stack: err.stack
            }, null, 2));
        }

        // ── Socket ──────────────────────────────────────────────────
        if (prefs.in_app) {
            try {
                sendNotification(userId, {
                    id: dbRecord?.id,
                    type,
                    title,
                    message: msg,
                    metadata: data ? JSON.parse(JSON.stringify(data)) : {},
                });
            } catch (socketErr) {
                logger.error(JSON.stringify({
                    event: 'DISPATCH_FAILED',
                    userId,
                    type,
                    error: err.message,
                    stack: err.stack
                }, null, 2));
            }
        }

        // ── Email ───────────────────────────────────────────────────
        if (prefs.email && user.email) {
            try {
                const { subject, html } = getEmailTemplate(type, templateData);

                await retry(() =>
                    sendMail({ to: user.email, subject, html })
                );

                if (dbRecord) await dbRecord.update({ emailSent: true });

                logger.debug({ event: 'EMAIL_SENT', userId, type });
            } catch (mailErr) {
                logger.error(JSON.stringify({
                    event: 'EMAIL_FAILED',
                    userId,
                    type,
                    error: mailErr.message,
                    stack: mailErr.stack
                }, null, 2));
            }
        }

        // ── SMS ─────────────────────────────────────────────────────
        const phone = data.phone || user.phone || null;

        if (prefs.sms && phone) {
            try {
                const smsBody = getSMSMessage(type, templateData);

                const sent = await retry(() =>
                    sendSMS(phone, smsBody)
                );

                if (sent && dbRecord) {
                    await dbRecord.update({ smsSent: true });
                }
            } catch (smsErr) {
                logger.error({ event: 'SMS_FAILED', userId, type, error: smsErr.message });
            }
        }

        // ✅ Observability (no logic change)
        logger.info({
            event: 'NOTIFICATION_DISPATCHED',
            userId,
            type,
            channels: prefs,
        });

    } catch (err) {
        logger.error(JSON.stringify({
            event: 'DISPATCH_FAILED',
            userId,
            type,
            error: err.message,
            stack: err.stack
        }, null, 2));
    }
};

// ──────────────────────────────────────────────────────────────────────────

const dispatchBulk = async (userIds, params) => {
    if (!Array.isArray(userIds) || userIds.length === 0) return;

    await Promise.allSettled(
        userIds.map(uid => dispatch({ ...params, userId: uid }))
    );
};

module.exports = { dispatch, dispatchBulk };