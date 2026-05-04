'use strict';

const nodemailer = require('nodemailer');
const env = require('../../config/env');
const logger = require('../../config/logger');
const { sendNotification } = require('../../config/socket');

const transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: env.MAIL_PORT === 465,
    auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS,
    },
});

/**
 * Send email + in-app socket notification together.
 * Either channel failing won't crash the other.
 */
const notify = async ({ userId, email, subject, html, socketPayload }) => {
    // 1. In-app socket notification
    if (userId && socketPayload) {
        try {
            sendNotification(userId, socketPayload);
        } catch (err) {
            logger.warn({ event: 'SOCKET_NOTIFY_FAILED', userId, error: err.message });
        }
    }

    // 2. Email notification
    if (email && subject && html) {
        try {
            await transporter.sendMail({
                from: `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM_ADDRESS}>`,
                to: email,
                subject,
                html,
            });
        } catch (err) {
            logger.warn({ event: 'EMAIL_SEND_FAILED', email, subject, error: err.message });
        }
    }
};

// ── Email templates ──────────────────────────────────────────────────────────

const templates = {
    lateLogin: ({ name, time, lateMinutes }) => ({
        subject: `⚠️ Late Check-In Alert — ${name}`,
        html: `
      <h2>Late Check-In Recorded</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>You checked in at <strong>${time}</strong>, which is 
         <strong>${lateMinutes} minutes</strong> late.</p>
      <p>If this was unavoidable, please inform your manager.</p>
    `,
    }),

    leaveApproved: ({ name, startDate, endDate, leaveType }) => ({
        subject: `✅ Leave Approved — ${startDate} to ${endDate}`,
        html: `
      <h2>Leave Approved</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your <strong>${leaveType}</strong> leave from 
         <strong>${startDate}</strong> to <strong>${endDate}</strong> 
         has been approved.</p>
    `,
    }),

    leaveRejected: ({ name, startDate, endDate, decisionNote }) => ({
        subject: `❌ Leave Rejected — ${startDate} to ${endDate}`,
        html: `
      <h2>Leave Rejected</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your leave from <strong>${startDate}</strong> to 
         <strong>${endDate}</strong> was rejected.</p>
      ${decisionNote ? `<p>Reason: <em>${decisionNote}</em></p>` : ''}
    `,
    }),

    salarySlip: ({ name, month, year, netSalary }) => ({
        subject: `💰 Salary Slip — ${month}/${year}`,
        html: `
      <h2>Your Salary Slip is Ready</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your net salary for <strong>${month}/${year}</strong> is 
         <strong>₹${Number(netSalary).toLocaleString('en-IN')}</strong>.</p>
      <p>Login to the portal to download your full payslip.</p>
    `,
    }),

    absentAlert: ({ name, date }) => ({
        subject: `🔴 Absent Alert — ${date}`,
        html: `
      <h2>No Check-In Recorded</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>No attendance was recorded for you on <strong>${date}</strong>. 
         If you were present, please contact HR to rectify.</p>
    `,
    }),

    payrollGenerated: ({ month, year, totalEmployees, totalAmount }) => ({
        subject: `📊 Payroll Auto-Generated — ${month}/${year}`,
        html: `
      <h2>Payroll Generated</h2>
      <p>Payroll for <strong>${month}/${year}</strong> has been auto-generated.</p>
      <ul>
        <li>Employees processed: <strong>${totalEmployees}</strong></li>
        <li>Total payout: <strong>₹${Number(totalAmount).toLocaleString('en-IN')}</strong></li>
      </ul>
      <p>Please review and lock payroll from the admin panel.</p>
    `,
    }),
};

module.exports = { notify, templates };