'use strict';

/**
 * src/modules/notification/smsProvider.js
 *
 * Twilio SMS integration.
 *
 * Install: npm install twilio
 *
 * Add to your .env:
 *   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *   TWILIO_AUTH_TOKEN=your_auth_token
 *   TWILIO_FROM_NUMBER=+1234567890
 *   SMS_ENABLED=true
 */

const logger = require('../../config/logger');

// Lazy-load Twilio so the app doesn't crash if it's not installed / SMS disabled
let twilioClient = null;

const getTwilioClient = () => {
    if (twilioClient) return twilioClient;

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;

    if (!sid || !token) {
        logger.warn('Twilio credentials not set — SMS will be skipped');
        return null;
    }

    try {
        const twilio = require('twilio');   // npm install twilio
        twilioClient = twilio(sid, token);
        return twilioClient;
    } catch {
        logger.warn('twilio package not installed — run: npm install twilio');
        return null;
    }
};

/**
 * sendSMS
 * @param {string} to       — E.164 format, e.g. "+919876543210"
 * @param {string} body     — plain text message (max 160 chars recommended)
 * @returns {boolean}       — true if sent, false if skipped/failed
 */
const sendSMS = async (to, body) => {
    if (process.env.SMS_ENABLED !== 'true') return false;
    if (!to) return false;

    const client = getTwilioClient();
    if (!client) return false;

    // Truncate to 160 chars to stay within one SMS segment
    const text = String(body).slice(0, 160);

    try {
        await client.messages.create({
            from: process.env.TWILIO_FROM_NUMBER,
            to,
            body: text,
        });
        logger.debug({ event: 'SMS_SENT', to });
        return true;
    } catch (err) {
        logger.error({ event: 'SMS_FAILED', to, error: err.message });
        return false;
    }
};

// ─── SMS message builders (keep short) ───────────────────────────────────────
const SMS_MESSAGES = {
    PAYROLL_PROCESSED: ({ netSalary, month, year }) =>
        `Your salary of ₹${Number(netSalary).toLocaleString('en-IN')} for ${month}/${year} has been processed. Check HRMS for details.`,

    PAYROLL_LOCKED: ({ month, year }) =>
        `Your payroll for ${month}/${year} has been finalised. Download your payslip from HRMS.`,

    LEAVE_APPROVED: ({ leaveType, startDate, endDate }) =>
        `Your ${leaveType || 'leave'} from ${startDate} to ${endDate} has been approved.`,

    LEAVE_REJECTED: ({ leaveType, startDate }) =>
        `Your ${leaveType || 'leave'} request starting ${startDate} was rejected. Check HRMS for details.`,

    ATTENDANCE_LATE: ({ date, lateMinutes }) =>
        `Late check-in recorded for ${date} (${lateMinutes} mins late). Check HRMS.`,

    EXPENSE_APPROVED: ({ amount, expenseId }) =>
        `Your expense #${expenseId} of ₹${Number(amount).toLocaleString('en-IN')} has been approved.`,

    SECURITY_LOGIN: ({ ip, time }) =>
        `New HRMS login from ${ip || 'unknown IP'} at ${time}. Not you? Change your password now.`,

    SYSTEM: ({ message }) => String(message).slice(0, 160),
};

const getSMSMessage = (type, data) => {
    const builder = SMS_MESSAGES[type] || SMS_MESSAGES.SYSTEM;
    return builder(data);
};

module.exports = { sendSMS, getSMSMessage };