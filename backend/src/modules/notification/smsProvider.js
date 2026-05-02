'use strict';

let twilioClient = null;


const getTwilioClient = () => {
    if (twilioClient) return twilioClient;

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;

    if (!sid || !token) {
        return null;
    }

    try {
        const twilio = require('twilio');
        twilioClient = twilio(sid, token);
        return twilioClient;
    } catch {
        return null;
    }
};

const sendSMS = async (to, body) => {
    if (process.env.SMS_ENABLED !== 'true') return false;
    if (!to) return false;

    const client = getTwilioClient();
    if (!client) return false;

    const text = String(body).slice(0, 160);

    try {
        await client.messages.create({
            from: process.env.TWILIO_FROM_NUMBER,
            to,
            body: text,
        });
        return true;
    } catch {
        return false;
    }
};


const SMS_MESSAGES = {
    PAYROLL_PROCESSED: ({ netSalary, month, year }) =>
        `Salary ₹${Number(netSalary).toLocaleString('en-IN')} for ${month}/${year} processed.`,

    PAYROLL_LOCKED: ({ month, year }) =>
        `Payroll for ${month}/${year} finalised.`,

    LEAVE_APPROVED: ({ leaveType, startDate, endDate }) =>
        `${leaveType || 'Leave'} approved: ${startDate} to ${endDate}`,

    LEAVE_REJECTED: ({ leaveType, startDate }) =>
        `${leaveType || 'Leave'} rejected: ${startDate}`,

    ATTENDANCE_LATE: ({ date, lateMinutes }) =>
        `Late check-in ${date} (${lateMinutes} min late)`,

    EXPENSE_APPROVED: ({ amount, expenseId }) =>
        `Expense #${expenseId} ₹${Number(amount).toLocaleString('en-IN')} approved.`,

    SECURITY_LOGIN: ({ ip, time }) =>
        `Login detected from ${ip || 'unknown'} at ${time}`,

    SYSTEM: ({ message }) => String(message).slice(0, 160),
};


const getSMSMessage = (type, data) => {
    const builder = SMS_MESSAGES[type] || SMS_MESSAGES.SYSTEM;
    return builder(data);
};

module.exports = { sendSMS, getSMSMessage };