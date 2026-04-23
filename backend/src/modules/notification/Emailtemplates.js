'use strict';

/**
 * src/modules/notification/emailTemplates.js
 *
 * One HTML template per notification type.
 * All templates share the same wrapper for consistent branding.
 */

const COMPANY = process.env.COMPANY_NAME || 'YourHRMS';
const COLOR = process.env.BRAND_COLOR || '#1e3a5f';

// ─── Base wrapper ─────────────────────────────────────────────────────────────
const wrap = (title, bodyHTML) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${title}</title>
<style>
  body{margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#1a1a1a}
  .wrap{max-width:580px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #dde3eb}
  .hdr{background:${COLOR};padding:24px 32px}
  .hdr-title{color:#fff;font-size:20px;font-weight:700;margin:0}
  .hdr-sub{color:rgba(255,255,255,.7);font-size:13px;margin:4px 0 0}
  .body{padding:28px 32px}
  .body h2{font-size:16px;font-weight:600;margin:0 0 12px;color:#1a1a1a}
  .body p{margin:0 0 12px;line-height:1.6;color:#444}
  .card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px 20px;margin:16px 0}
  .card-row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #edf0f3;font-size:13px}
  .card-row:last-child{border-bottom:none}
  .card-label{color:#666}
  .card-val{font-weight:600;color:#1a1a1a}
  .badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600}
  .badge-green{background:#d4edda;color:#155724}
  .badge-amber{background:#fff3cd;color:#856404}
  .badge-red{background:#f8d7da;color:#721c24}
  .badge-blue{background:#d1ecf1;color:#0c5460}
  .btn{display:inline-block;margin-top:16px;padding:10px 24px;background:${COLOR};color:#fff;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600}
  .ftr{background:#f8fafc;padding:16px 32px;text-align:center;font-size:11px;color:#888;border-top:1px solid #e2e8f0}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <div class="hdr-title">${COMPANY}</div>
    <div class="hdr-sub">${title}</div>
  </div>
  <div class="body">${bodyHTML}</div>
  <div class="ftr">
    This email was sent by ${COMPANY} HRMS &nbsp;·&nbsp; Do not reply to this email.<br/>
    &copy; ${new Date().getFullYear()} ${COMPANY}. All rights reserved.
  </div>
</div>
</body>
</html>`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(n) || 0);

const monthName = (m) =>
    ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'][Number(m) - 1] || m;

// ─── Templates ────────────────────────────────────────────────────────────────

const TEMPLATES = {

    // ── Payroll ────────────────────────────────────────────────────────────────
    PAYROLL_PROCESSED: ({ employeeName, month, year, netSalary, payrollId }) =>
        wrap('Salary Processed', `
      <h2>Your salary has been processed</h2>
      <p>Hi ${employeeName || 'there'},</p>
      <p>Your salary for <strong>${monthName(month)} ${year}</strong> has been processed successfully.</p>
      <div class="card">
        <div class="card-row"><span class="card-label">Period</span><span class="card-val">${monthName(month)} ${year}</span></div>
        <div class="card-row"><span class="card-label">Net Salary</span><span class="card-val">${fmt(netSalary)}</span></div>
        <div class="card-row"><span class="card-label">Status</span><span class="card-val"><span class="badge badge-amber">Processed</span></span></div>
        <div class="card-row"><span class="card-label">Reference</span><span class="card-val">#${payrollId}</span></div>
      </div>
      <p>Your payslip is now available in the HRMS portal.</p>
    `),

    PAYROLL_LOCKED: ({ employeeName, month, year, netSalary }) =>
        wrap('Payroll Finalised', `
      <h2>Your payroll has been finalised</h2>
      <p>Hi ${employeeName || 'there'},</p>
      <p>Your salary for <strong>${monthName(month)} ${year}</strong> has been locked and finalised.</p>
      <div class="card">
        <div class="card-row"><span class="card-label">Period</span><span class="card-val">${monthName(month)} ${year}</span></div>
        <div class="card-row"><span class="card-label">Net Salary</span><span class="card-val">${fmt(netSalary)}</span></div>
        <div class="card-row"><span class="card-label">Status</span><span class="card-val"><span class="badge badge-green">Locked</span></span></div>
      </div>
      <p>Your payslip PDF can be downloaded from the portal.</p>
    `),

    // ── Leave ─────────────────────────────────────────────────────────────────
    LEAVE_REQUESTED: ({ employeeName, leaveType, startDate, endDate, days }) =>
        wrap('Leave Request Submitted', `
      <h2>Leave request received</h2>
      <p>Hi ${employeeName || 'there'},</p>
      <p>Your leave request has been submitted and is pending manager approval.</p>
      <div class="card">
        <div class="card-row"><span class="card-label">Leave Type</span><span class="card-val">${leaveType || '—'}</span></div>
        <div class="card-row"><span class="card-label">From</span><span class="card-val">${startDate}</span></div>
        <div class="card-row"><span class="card-label">To</span><span class="card-val">${endDate}</span></div>
        <div class="card-row"><span class="card-label">Days</span><span class="card-val">${days}</span></div>
        <div class="card-row"><span class="card-label">Status</span><span class="card-val"><span class="badge badge-amber">Pending</span></span></div>
      </div>
    `),

    LEAVE_APPROVED: ({ employeeName, leaveType, startDate, endDate, days, approverName }) =>
        wrap('Leave Approved', `
      <h2>Your leave has been approved</h2>
      <p>Hi ${employeeName || 'there'},</p>
      <p>Great news — your leave request has been approved by <strong>${approverName || 'your manager'}</strong>.</p>
      <div class="card">
        <div class="card-row"><span class="card-label">Leave Type</span><span class="card-val">${leaveType || '—'}</span></div>
        <div class="card-row"><span class="card-label">From</span><span class="card-val">${startDate}</span></div>
        <div class="card-row"><span class="card-label">To</span><span class="card-val">${endDate}</span></div>
        <div class="card-row"><span class="card-label">Days</span><span class="card-val">${days}</span></div>
        <div class="card-row"><span class="card-label">Status</span><span class="card-val"><span class="badge badge-green">Approved</span></span></div>
      </div>
    `),

    LEAVE_REJECTED: ({ employeeName, leaveType, startDate, endDate, reason }) =>
        wrap('Leave Rejected', `
      <h2>Your leave request was not approved</h2>
      <p>Hi ${employeeName || 'there'},</p>
      <p>Unfortunately your leave request has been rejected.</p>
      <div class="card">
        <div class="card-row"><span class="card-label">Leave Type</span><span class="card-val">${leaveType || '—'}</span></div>
        <div class="card-row"><span class="card-label">From</span><span class="card-val">${startDate}</span></div>
        <div class="card-row"><span class="card-label">To</span><span class="card-val">${endDate}</span></div>
        <div class="card-row"><span class="card-label">Reason</span><span class="card-val">${reason || '—'}</span></div>
        <div class="card-row"><span class="card-label">Status</span><span class="card-val"><span class="badge badge-red">Rejected</span></span></div>
      </div>
      <p>Please contact HR if you have questions.</p>
    `),

    LEAVE_PENDING_APPROVAL: ({ managerName, employeeName, leaveType, startDate, endDate, days }) =>
        wrap('Leave Request Needs Your Approval', `
      <h2>Action required: leave approval</h2>
      <p>Hi ${managerName || 'there'},</p>
      <p><strong>${employeeName}</strong> has submitted a leave request that requires your approval.</p>
      <div class="card">
        <div class="card-row"><span class="card-label">Employee</span><span class="card-val">${employeeName}</span></div>
        <div class="card-row"><span class="card-label">Leave Type</span><span class="card-val">${leaveType || '—'}</span></div>
        <div class="card-row"><span class="card-label">From</span><span class="card-val">${startDate}</span></div>
        <div class="card-row"><span class="card-label">To</span><span class="card-val">${endDate}</span></div>
        <div class="card-row"><span class="card-label">Days</span><span class="card-val">${days}</span></div>
      </div>
      <p>Please log in to the HRMS portal to approve or reject this request.</p>
    `),

    // ── Attendance ─────────────────────────────────────────────────────────────
    ATTENDANCE_LATE: ({ employeeName, date, lateMinutes }) =>
        wrap('Late Arrival Recorded', `
      <h2>Late check-in recorded</h2>
      <p>Hi ${employeeName || 'there'},</p>
      <p>Your check-in for <strong>${date}</strong> has been recorded as <strong>late</strong>.</p>
      <div class="card">
        <div class="card-row"><span class="card-label">Date</span><span class="card-val">${date}</span></div>
        <div class="card-row"><span class="card-label">Late By</span><span class="card-val"><span class="badge badge-amber">${lateMinutes} minutes</span></span></div>
      </div>
      <p>Repeated late arrivals may affect your attendance record.</p>
    `),

    ATTENDANCE_ABSENT: ({ employeeName, date }) =>
        wrap('Absence Recorded', `
      <h2>Absence recorded for ${date}</h2>
      <p>Hi ${employeeName || 'there'},</p>
      <p>No attendance was recorded for you on <strong>${date}</strong>. If this is incorrect, please contact HR.</p>
    `),

    // ── Expense ────────────────────────────────────────────────────────────────
    EXPENSE_SUBMITTED: ({ employeeName, amount, category, expenseId }) =>
        wrap('Expense Submitted', `
      <h2>Expense claim received</h2>
      <p>Hi ${employeeName || 'there'},</p>
      <p>Your expense claim has been submitted for approval.</p>
      <div class="card">
        <div class="card-row"><span class="card-label">Reference</span><span class="card-val">#${expenseId}</span></div>
        <div class="card-row"><span class="card-label">Category</span><span class="card-val">${category || '—'}</span></div>
        <div class="card-row"><span class="card-label">Amount</span><span class="card-val">${fmt(amount)}</span></div>
        <div class="card-row"><span class="card-label">Status</span><span class="card-val"><span class="badge badge-amber">Pending</span></span></div>
      </div>
    `),

    EXPENSE_APPROVED: ({ employeeName, amount, expenseId }) =>
        wrap('Expense Approved', `
      <h2>Your expense has been approved</h2>
      <p>Hi ${employeeName || 'there'},</p>
      <p>Your expense claim <strong>#${expenseId}</strong> of <strong>${fmt(amount)}</strong> has been approved.</p>
    `),

    EXPENSE_REJECTED: ({ employeeName, amount, expenseId, reason }) =>
        wrap('Expense Rejected', `
      <h2>Your expense was not approved</h2>
      <p>Hi ${employeeName || 'there'},</p>
      <p>Your expense claim <strong>#${expenseId}</strong> of <strong>${fmt(amount)}</strong> was rejected.</p>
      ${reason ? `<div class="card"><div class="card-row"><span class="card-label">Reason</span><span class="card-val">${reason}</span></div></div>` : ''}
    `),

    // ── Security ───────────────────────────────────────────────────────────────
    SECURITY_LOGIN: ({ employeeName, ip, device, time }) =>
        wrap('New Login Detected', `
      <h2>New login to your account</h2>
      <p>Hi ${employeeName || 'there'},</p>
      <p>A new login was detected on your HRMS account.</p>
      <div class="card">
        <div class="card-row"><span class="card-label">Time</span><span class="card-val">${time}</span></div>
        <div class="card-row"><span class="card-label">IP Address</span><span class="card-val">${ip || '—'}</span></div>
        <div class="card-row"><span class="card-label">Device</span><span class="card-val">${device || '—'}</span></div>
      </div>
      <p>If this wasn't you, please change your password immediately and contact your admin.</p>
    `),

    PASSWORD_RESET: ({ employeeName, resetLink }) =>
        wrap('Password Reset Request', `
      <h2>Reset your password</h2>
      <p>Hi ${employeeName || 'there'},</p>
      <p>We received a request to reset your HRMS password. Click the button below to set a new password.</p>
      <p>This link expires in <strong>15 minutes</strong>.</p>
      <a class="btn" href="${resetLink}">Reset Password</a>
      <p style="margin-top:16px;font-size:12px;color:#888">If you didn't request this, you can safely ignore this email.</p>
    `),

    // ── System / Announcement ──────────────────────────────────────────────────
    SYSTEM: ({ title, message }) =>
        wrap(title || 'System Notification', `
      <h2>${title || 'System Notification'}</h2>
      <p>${message}</p>
    `),

    ANNOUNCEMENT: ({ title, message, from }) =>
        wrap(title || 'Announcement', `
      <h2>${title || 'Announcement'}</h2>
      ${from ? `<p><em>From: ${from}</em></p>` : ''}
      <p>${message}</p>
    `),
};

/**
 * getEmailTemplate
 * @param {string} type       — PAYROLL_PROCESSED | LEAVE_APPROVED | etc.
 * @param {object} data       — template variables
 * @returns {{ subject, html }}
 */
const SUBJECTS = {
    PAYROLL_PROCESSED: `Your salary for has been processed`,
    PAYROLL_LOCKED: `Payroll finalised`,
    LEAVE_REQUESTED: `Leave request submitted`,
    LEAVE_APPROVED: `Leave approved`,
    LEAVE_REJECTED: `Leave request rejected`,
    LEAVE_PENDING_APPROVAL: `Action required: leave approval`,
    ATTENDANCE_LATE: `Late arrival recorded`,
    ATTENDANCE_ABSENT: `Absence recorded`,
    EXPENSE_SUBMITTED: `Expense claim submitted`,
    EXPENSE_APPROVED: `Expense claim approved`,
    EXPENSE_REJECTED: `Expense claim rejected`,
    SECURITY_LOGIN: `New login detected on your account`,
    PASSWORD_RESET: `Reset your HRMS password`,
    SYSTEM: `HRMS notification`,
    ANNOUNCEMENT: `Announcement from ${COMPANY}`,
};

const getEmailTemplate = (type, data) => {
    const builder = TEMPLATES[type] || TEMPLATES.SYSTEM;
    const html = builder(data);
    const subject = SUBJECTS[type] || `Notification from ${COMPANY}`;
    return { subject, html };
};

module.exports = { getEmailTemplate, TEMPLATES, SUBJECTS };