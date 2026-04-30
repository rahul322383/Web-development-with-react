// 'use strict';

// // ─── node-fetch fallback (safe for Node 16 and below) ────────
// const _fetch = typeof fetch !== 'undefined'
//     ? fetch
//     : (...args) => import('node-fetch').then(m => m.default(...args));

// const logger = require('../../config/logger');
// const { LeaveRequest, LeaveBalance, Payroll, User, Attendance } = require('../../database/initModels');
// const { Op } = require('sequelize');

// // ─────────────────────────────────────────────────────────────
// // GEMINI CONFIG
// // FREE tier: 1,500 req/day — no credit card needed
// // Get key: https://aistudio.google.com/app/apikey
// // ─────────────────────────────────────────────────────────────

// const GEMINI_MODEL = 'gemini-2.0-flash-lite';
// const GEMINI_URL = () =>
//     `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

// // ─────────────────────────────────────────────────────────────
// // SYSTEM PROMPT
// // ─────────────────────────────────────────────────────────────

// const today = new Date().toISOString().slice(0, 10);
// const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

// const SYSTEM_PROMPT = `
// You are an AI HR Assistant embedded inside an HRMS application.
// Understand the employee's message and return a structured JSON intent.

// Available actions:
// - get_leave_balance   → check remaining leave days
// - get_my_leaves       → list user's leave requests
// - apply_leave         → apply for leave (REQUIRES: startDate, endDate, reason — all mandatory)
// - get_payslip         → get latest payslip
// - get_attendance      → get attendance summary (last 30 days)
// - get_team_leaves     → pending team leaves (managers only)
// - general_answer      → answer HR policy question
// - clarify             → ask a follow-up if any required field is missing

// Rules:
// 1. Respond ONLY with valid JSON. No markdown, no code fences, no extra text outside the JSON.
// 2. Today is ${today}. Tomorrow is ${tomorrow}. Resolve relative dates.
// 3. For apply_leave, ALL three fields (startDate, endDate, reason) are required. If ANY is missing → set action to "clarify".
// 4. Dates must be YYYY-MM-DD format.
// 5. For general_answer, write a helpful "reply".

// Response format (always return this exact structure):
// {
//   "action": "<action_name>",
//   "params": {},
//   "reply": "<short message shown while loading>",
//   "question": "<only when action=clarify>"
// }

// Examples:
// User: "leave balance"
// → {"action":"get_leave_balance","params":{},"reply":"Checking your leave balance..."}

// User: "apply leave May 1 to May 3 family function"
// → {"action":"apply_leave","params":{"startDate":"2026-05-01","endDate":"2026-05-03","reason":"family function"},"reply":"Applying your leave request..."}

// User: "apply leave tomorrow"
// → {"action":"clarify","params":{},"question":"How many days do you need, and what is the reason for the leave?"}

// User: "payslip"
// → {"action":"get_payslip","params":{},"reply":"Fetching your latest payslip..."}

// User: "leave policy"
// → {"action":"general_answer","params":{},"reply":"Employees get 21 days of annual paid leave, split across Sick (7), Casual (7), and Paid (14) categories. Apply at least 1 day in advance. Manager approval is required."}
// `.trim();

// // ─────────────────────────────────────────────────────────────
// // PARAM VALIDATION — prevents prompt injection
// // ─────────────────────────────────────────────────────────────

// const validateParams = (action, params = {}) => {
//     if (action !== 'apply_leave') return;

//     const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

//     if (!params.startDate || !dateRegex.test(params.startDate))
//         throw new Error('Invalid or missing start date');
//     if (!params.endDate || !dateRegex.test(params.endDate))
//         throw new Error('Invalid or missing end date');
//     if (!params.reason || typeof params.reason !== 'string' || params.reason.trim().length < 2)
//         throw new Error('Please provide a valid reason for leave');

//     const start = new Date(params.startDate);
//     const end = new Date(params.endDate);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const maxFuture = new Date();
//     maxFuture.setFullYear(maxFuture.getFullYear() + 1);

//     if (start < today) throw new Error('Leave cannot start in the past');
//     if (end < start) throw new Error('End date cannot be before start date');
//     if (end > maxFuture) throw new Error('Leave date cannot be more than 1 year in the future');

//     const diffDays = (end - start) / 86400000 + 1;
//     if (diffDays > 60) throw new Error('Leave duration cannot exceed 60 days');
// };

// // ─────────────────────────────────────────────────────────────
// // WORKING DAYS CALCULATOR — excludes weekends
// // ─────────────────────────────────────────────────────────────

// const calculateWorkingDays = (startDate, endDate) => {
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     let count = 0;
//     const current = new Date(start);

//     while (current <= end) {
//         const day = current.getDay();
//         if (day !== 0 && day !== 6) count++;   // 0=Sun, 6=Sat
//         current.setDate(current.getDate() + 1);
//     }

//     return count;
// };

// // ─────────────────────────────────────────────────────────────
// // CALL GEMINI API
// // ─────────────────────────────────────────────────────────────

// const parseIntent = async (userMessage, conversationHistory = []) => {
//     if (!process.env.GEMINI_API_KEY) {
//         const err = new Error('GEMINI_API_KEY is not configured');
//         err.code = 'CONFIG_ERROR';
//         throw err;
//     }

//     // Build multi-turn contents — Gemini uses "user" / "model" roles
//     const contents = [];

//     for (const msg of conversationHistory.slice(-6)) {
//         contents.push({
//             role: msg.role === 'assistant' ? 'model' : 'user',
//             parts: [{ text: msg.content }],
//         });
//     }

//     contents.push({ role: 'user', parts: [{ text: userMessage }] });

//     // Inject system prompt as first turn
//     const bodyContents = [
//         { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
//         { role: 'model', parts: [{ text: 'Understood. I will respond only with valid JSON.' }] },
//         ...contents,
//     ];

//     const body = {
//         contents: bodyContents,
//         generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
//     };

//     const response = await _fetch(GEMINI_URL(), {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body),
//     });

//     // 429 Rate limit
//     if (response.status === 429) {
//         const errData = await response.json().catch(() => ({}));
//         const retryDelay = errData?.error?.details
//             ?.find(d => d.retryDelay)
//             ?.retryDelay?.replace('s', '') || 60;

//         const err = new Error('RATE_LIMITED');
//         err.code = 'RATE_LIMITED';
//         err.retryAfter = Math.ceil(Number(retryDelay));
//         throw err;
//     }

//     // Other HTTP errors
//     if (!response.ok) {
//         const errText = await response.text();
//         logger.error({ event: 'GEMINI_API_ERROR', status: response.status, body: errText });
//         throw new Error(`Gemini API ${response.status}: ${errText}`);
//     }

//     const data = await response.json();

//     // Empty / blocked response
//     if (!data?.candidates?.length) {
//         const err = new Error('Gemini returned no candidates');
//         err.code = 'SAFETY_BLOCKED';
//         throw err;
//     }

//     const raw = data.candidates[0]?.content?.parts?.[0]?.text;

//     if (!raw?.trim()) throw new Error('Gemini returned an empty response');

//     // Parse JSON
//     try {
//         const cleaned = raw.replace(/```json|```/g, '').trim();
//         return JSON.parse(cleaned);
//     } catch {
//         logger.warn({ event: 'AI_JSON_PARSE_FAILED', raw });
//         return {
//             action: 'general_answer',
//             params: {},
//             reply: "I'm having trouble understanding that. Could you rephrase your question?",
//         };
//     }
// };

// // ─────────────────────────────────────────────────────────────
// // INTENT HANDLERS
// // ─────────────────────────────────────────────────────────────

// const handlers = {

//     // ── Leave balance ───────────────────────────────────────────
//     get_leave_balance: async (user) => {
//         const year = new Date().getFullYear();
//         const balance = await LeaveBalance.findOne({
//             where: { employeeId: user.id, year },
//         });

//         if (!balance) {
//             return { text: `No leave balance record found for ${year}. Please contact HR.` };
//         }

//         // ✅ Show per-type breakdown if columns exist
//         const hasTypes = balance.sickTotal !== undefined;

//         const lines = [
//             `📊 Your leave balance for ${year}:`,
//             `• Total Annual : ${balance.totalAnnual} days`,
//             `• Used         : ${balance.used} days`,
//             `• Remaining    : ${balance.remaining} days`,
//         ];

//         if (hasTypes) {
//             lines.push('');
//             lines.push('Per type:');
//             lines.push(`  🤒 Sick    — ${balance.sickRemaining}/${balance.sickTotal} remaining`);
//             lines.push(`  🏖️  Casual  — ${balance.casualRemaining}/${balance.casualTotal} remaining`);
//             lines.push(`  💼 Paid    — ${balance.paidRemaining}/${balance.paidTotal} remaining`);
//         }

//         return { text: lines.join('\n'), data: balance };
//     },

//     // ── My leaves ───────────────────────────────────────────────
//     get_my_leaves: async (user) => {
//         const leaves = await LeaveRequest.findAll({
//             where: { employeeId: user.id },
//             order: [['createdAt', 'DESC']],
//             limit: 10,
//         });

//         if (!leaves.length) return { text: 'You have no leave requests yet.' };

//         const lines = leaves.map(l =>
//             `• ${l.startDate} → ${l.endDate}  (${l.daysRequested}d)  [${l.status}]  ${l.reason}`
//         );

//         return {
//             text: `📋 Your recent leave requests:\n${lines.join('\n')}`,
//             data: leaves,
//         };
//     },

//     // ── Apply leave ─────────────────────────────────────────────
//     apply_leave: async (user, params) => {
//         const { startDate, endDate, reason } = params;

//         // ✅ FIXED: use working days, not calendar days
//         const daysRequested = calculateWorkingDays(startDate, endDate);

//         if (daysRequested === 0) {
//             return { text: '❌ The selected dates fall entirely on weekends. Please choose working days.' };
//         }

//         // Check leave balance
//         const year = new Date(startDate).getFullYear();
//         const balance = await LeaveBalance.findOne({
//             where: { employeeId: user.id, year },
//         });

//         if (balance && balance.remaining < daysRequested) {
//             return {
//                 text: [
//                     '❌ Insufficient leave balance.',
//                     `• Remaining : ${balance.remaining} days`,
//                     `• Requested : ${daysRequested} working days`,
//                     'Please contact HR to request additional leave.',
//                 ].join('\n'),
//             };
//         }

//         // Check for overlapping leave
//         const overlap = await LeaveRequest.findOne({
//             where: {
//                 employeeId: user.id,
//                 status: { [Op.notIn]: ['Rejected'] },
//                 startDate: { [Op.lte]: endDate },
//                 endDate: { [Op.gte]: startDate },
//             },
//         });

//         if (overlap) {
//             return {
//                 text: [
//                     '❌ You already have a leave request overlapping these dates.',
//                     `• Existing : ${overlap.startDate} → ${overlap.endDate}  [${overlap.status}]`,
//                     'Please choose different dates.',
//                 ].join('\n'),
//             };
//         }

//         // Create leave request
//         const leave = await LeaveRequest.create({
//             employeeId: user.id,
//             managerId: user.managerId || null,
//             startDate,
//             endDate,
//             reason: reason.trim(),
//             daysRequested,
//             status: 'Pending',
//         });

//         return {
//             text: [
//                 '✅ Leave applied successfully!',
//                 `• Dates   : ${startDate} → ${endDate}`,
//                 `• Days    : ${daysRequested} working day(s)`,
//                 `• Reason  : ${reason}`,
//                 '• Status  : Pending (awaiting manager approval)',
//             ].join('\n'),
//             data: leave,
//         };
//     },

//     // ── Payslip ─────────────────────────────────────────────────
//     get_payslip: async (user) => {
//         const payroll = await Payroll.findOne({
//             where: { employeeId: user.id },
//             order: [['createdAt', 'DESC']],
//         });

//         if (!payroll) return { text: 'No payroll records found. Please contact HR.' };

//         const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

//         return {
//             text: [
//                 '💰 Your latest payslip:',
//                 `• Month       : ${payroll.month || 'N/A'}`,
//                 `• Base Salary : ${fmt(payroll.baseSalary)}`,
//                 `• Net Pay     : ${fmt(payroll.netSalary ?? payroll.netPay)}`,  // ✅ handle both field names
//                 `• Status      : ${payroll.status || 'N/A'}`,
//             ].join('\n'),
//             data: payroll,
//         };
//     },

//     // ── Attendance ──────────────────────────────────────────────
//     get_attendance: async (user) => {
//         const thirtyDaysAgo = new Date();
//         thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

//         // ✅ FIXED: filter by `date` column (DATEONLY), not `createdAt`
//         const records = await Attendance.findAll({
//             where: {
//                 employeeId: user.id,
//                 date: { [Op.gte]: thirtyDaysAgo },  // ✅ was createdAt — wrong column
//             },
//             order: [['date', 'DESC']],
//             limit: 31,
//         });

//         if (!records.length) {
//             return { text: 'No attendance records found for the last 30 days.' };
//         }

//         // ✅ FIXED: match exact status values from your ENUM
//         const present = records.filter(r => r.status === 'present').length;
//         const absent = records.filter(r => r.status === 'absent').length;
//         const late = records.filter(r => r.status === 'late').length;
//         const halfDay = records.filter(r => r.status === 'half_day').length;
//         const onLeave = records.filter(r => r.status === 'on_leave').length;

//         const attendancePct = records.length
//             ? ((present + late) / records.length * 100).toFixed(1)
//             : 0;

//         return {
//             text: [
//                 '🕐 Your attendance (last 30 days):',
//                 `• Present      : ${present} days`,
//                 `• Late         : ${late} days`,
//                 `• Half Day     : ${halfDay} days`,
//                 `• On Leave     : ${onLeave} days`,
//                 `• Absent       : ${absent} days`,
//                 `• Total        : ${records.length} records`,
//                 `• Attendance % : ${attendancePct}%`,
//             ].join('\n'),
//             data: { present, late, halfDay, onLeave, absent, total: records.length, attendancePct },
//         };
//     },

//     // ── Team leaves ─────────────────────────────────────────────
//     get_team_leaves: async (user) => {
//         const role = (user.primaryRole || user.role || '').toLowerCase();

//         if (!['manager', 'hr', 'admin'].includes(role)) {
//             return { text: '🚫 You do not have permission to view team leaves.' };
//         }

//         const pending = await LeaveRequest.findAll({
//             where: {
//                 managerId: user.id,
//                 status: 'Pending',
//             },
//             include: [{
//                 model: User,
//                 as: 'employee',
//                 attributes: ['firstName', 'lastName', 'department'],
//             }],
//             order: [['createdAt', 'DESC']],
//         });

//         if (!pending.length) {
//             return { text: '✅ No pending leave requests from your team.' };
//         }

//         const lines = pending.map(l => {
//             const name = l.employee
//                 ? `${l.employee.firstName} ${l.employee.lastName}`
//                 : `Employee #${l.employeeId}`;
//             return `• ${name}  |  ${l.startDate} → ${l.endDate}  (${l.daysRequested}d)  |  ${l.reason}`;
//         });

//         return {
//             text: `👥 Pending team leave requests (${pending.length}):\n${lines.join('\n')}`,
//             data: pending,
//         };
//     },

//     // ── General answer / clarify ────────────────────────────────
//     general_answer: async (_user, _params, intent) => ({
//         text: intent.reply ||
//             'I can help with leave balance, applying leave, payslips, attendance, and team leaves. What would you like to know?',
//     }),

//     clarify: async (_user, _params, intent) => ({
//         text: intent.question || 'Could you provide more details so I can help you better?',
//     }),
// };

// // ─────────────────────────────────────────────────────────────
// // MAIN EXPORT
// // ─────────────────────────────────────────────────────────────

// const chat = async (user, message, history = []) => {
//     try {
//         const intent = await parseIntent(message, history);

//         logger.info({ event: 'AI_INTENT', userId: user.id, action: intent.action });

//         // Validate params before touching the DB
//         try {
//             validateParams(intent.action, intent.params);
//         } catch (validationErr) {
//             return {
//                 success: true,
//                 reply: `⚠️ ${validationErr.message}`,
//                 action: 'validation_error',
//                 data: null,
//             };
//         }

//         const handler = handlers[intent.action];

//         if (!handler) {
//             return {
//                 success: true,
//                 reply: "I'm not sure how to help with that. Try asking about your leave balance, payslip, or attendance.",
//                 action: intent.action,
//                 data: null,
//             };
//         }

//         const result = await handler(user, intent.params || {}, intent);

//         return {
//             success: true,
//             reply: result.text,
//             action: intent.action,
//             data: result.data || null,
//         };

//     } catch (error) {
//         logger.error({ event: 'AI_CHAT_FAILED', userId: user.id, error: error.message });

//         if (error.code === 'RATE_LIMITED' || error.message === 'RATE_LIMITED') {
//             const wait = error.retryAfter || 60;
//             return {
//                 success: true,
//                 reply: `⏳ I'm a bit busy right now. Please try again in ${wait} seconds.`,
//                 action: 'rate_limited',
//                 data: null,
//             };
//         }

//         if (error.code === 'CONFIG_ERROR') {
//             return {
//                 success: false,
//                 reply: '⚙️ AI service is not configured. Please contact your system administrator.',
//                 action: 'config_error',
//                 data: null,
//             };
//         }

//         if (error.code === 'SAFETY_BLOCKED') {
//             return {
//                 success: true,
//                 reply: "I can't help with that request. Try asking about your leave balance, payslip, or attendance.",
//                 action: 'blocked',
//                 data: null,
//             };
//         }

//         return {
//             success: false,
//             reply: '❌ Something went wrong. Please try again in a moment.',
//             action: 'error',
//             data: null,
//         };
//     }
// };

// module.exports = { chat };

// ─────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────
const logger = require('../../config/logger');
const { LeaveRequest, LeaveBalance, Payroll, User, Attendance } = require('../../database/initModels');
const { Op } = require('sequelize');
const { OpenAI } = require('openai');

// ─────────────────────────────────────────────
// GROQ CLIENT
// ─────────────────────────────────────────────
const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

// ─────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const currentYear = new Date().getFullYear();
const currentMonth = new Date().toLocaleString('default', { month: 'long' });

const SYSTEM_PROMPT = `
You are an intelligent HR Assistant embedded inside an HRMS application.
Understand the employee's intent and return a structured JSON response.

━━━ AVAILABLE ACTIONS ━━━

EMPLOYEE ACTIONS:
- get_leave_balance   → check remaining leave days (sick, casual, paid)
- get_my_leaves       → list user's leave requests (recent / by status / by type)
- apply_leave         → apply for leave (REQUIRES: startDate, endDate, leaveType, reason)
- cancel_leave        → cancel a pending leave request (REQUIRES: leaveId)
- get_payslip         → get payslip (optional param: month as YYYY-MM, defaults to latest)
- get_attendance      → get attendance summary (optional: last N days, default 30)
- get_holidays        → list upcoming public holidays for the year
- get_profile         → view own employee profile details
- general_answer      → answer HR policy questions helpfully
- clarify             → ask a follow-up if any required field is missing

MANAGER-ONLY ACTIONS:
- get_team_leaves     → list pending leave requests from team members
- approve_leave       → approve a team member's leave (REQUIRES: leaveId)
- reject_leave        → reject a team member's leave (REQUIRES: leaveId, rejectionReason)

━━━ LEAVE TYPES ━━━
Valid values for leaveType: "Sick", "Casual", "Paid", "Maternity", "Paternity", "Bereavement", "Unpaid"

━━━ HR POLICY KNOWLEDGE ━━━

LEAVE POLICY:
- Annual entitlement: 21 days total — Sick: 7, Casual: 7, Paid: 14
  (Maternity: 90 days, Paternity: 15 days, Bereavement: 5 days)
- Minimum 1 working day advance notice required for Casual/Paid leave
- Sick leave can be applied same day; medical certificate required for 3+ consecutive sick days
- Unpaid leave is auto-approved if balance is zero; affects monthly payroll
- Leaves do not carry over to the next year except Paid leave (max 10 days carry-over)
- Half-day leaves are not supported in this system

WORKING HOURS:
- Standard hours: 9:00 AM – 6:00 PM (Mon–Fri)
- Late arrival: marked as "Late" if check-in after 9:15 AM
- Early departure: marked "Early Leave" if check-out before 5:45 PM
- Half-day absent policy: absent for less than 4 hours counts as half-day
- Overtime is not calculated through this system

PAYROLL:
- Pay cycle: monthly, disbursed on the last working day of each month
- Current month: ${currentMonth} ${currentYear}
- Payslip components: Basic, HRA, Transport Allowance, Medical, Bonus, Deductions (PF, TDS)
- Salary is credited to the registered bank account on file

ATTENDANCE:
- Present, Absent, Late, Early Leave, Work From Home, Holiday are valid statuses
- Weekly off: Saturday & Sunday
- Minimum 70% attendance required per month; below triggers HR review

GENERAL:
- Probation period: 3 months for new employees; limited leave during probation
- Notice period: 30 days for employees, 30–90 days based on grade for managers
- Remote/WFH must be pre-approved by manager via official channel

━━━ RULES ━━━
1. Respond ONLY with valid JSON. No markdown, no code fences, no text outside JSON.
2. Today is ${today}. Tomorrow is ${tomorrow}. Current year: ${currentYear}. Resolve all relative dates.
3. For apply_leave: startDate, endDate, leaveType, reason are ALL mandatory. Missing any → action = "clarify".
4. For cancel_leave: leaveId is mandatory. If user says "cancel my last leave" → ask for confirmation by listing their recent leaves first using get_my_leaves.
5. For reject_leave: rejectionReason is mandatory.
6. Dates must be YYYY-MM-DD. Month params must be YYYY-MM.
7. For general_answer: write a clear, policy-accurate "reply".
8. Detect if the user is asking a status filter: params may include status ("Pending","Approved","Rejected") or leaveType.
9. If user asks about "team" or "my reportees" actions → use manager actions.
10. Be concise, friendly, and professional in all reply/question fields.

━━━ RESPONSE FORMAT (always this exact structure) ━━━
{
  "action": "<action_name>",
  "params": {},
  "reply": "<short loading message OR policy answer>",
  "question": "<only when action=clarify>"
}

━━━ EXAMPLES ━━━

User: "leave balance"
→ {"action":"get_leave_balance","params":{},"reply":"Checking your leave balance..."}

User: "apply sick leave from May 5 to May 7 I have fever"
→ {"action":"apply_leave","params":{"startDate":"2026-05-05","endDate":"2026-05-07","leaveType":"Sick","reason":"fever"},"reply":"Applying your sick leave..."}

User: "apply leave tomorrow"
→ {"action":"clarify","params":{},"question":"Sure! Could you tell me: the end date, leave type (Sick/Casual/Paid), and reason?"}

User: "cancel leave"
→ {"action":"clarify","params":{},"question":"Which leave would you like to cancel? Please share the Leave ID, or I can show your recent leaves."}

User: "cancel leave L-1042"
→ {"action":"cancel_leave","params":{"leaveId":"L-1042"},"reply":"Cancelling leave L-1042..."}

User: "show pending leaves"
→ {"action":"get_my_leaves","params":{"status":"Pending"},"reply":"Fetching your pending leaves..."}

User: "payslip for March"
→ {"action":"get_payslip","params":{"month":"${currentYear}-03"},"reply":"Fetching your March payslip..."}

User: "attendance last 7 days"
→ {"action":"get_attendance","params":{"days":7},"reply":"Fetching your attendance for the last 7 days..."}

User: "holidays this year"
→ {"action":"get_holidays","params":{"year":${currentYear}},"reply":"Fetching public holidays for ${currentYear}..."}

User: "my profile"
→ {"action":"get_profile","params":{},"reply":"Fetching your profile..."}

User: "approve leave for Rahul"
→ {"action":"clarify","params":{},"question":"Please provide the Leave ID to approve. You can check pending team leaves first."}

User: "team pending leaves"
→ {"action":"get_team_leaves","params":{},"reply":"Fetching your team's pending leave requests..."}

User: "reject leave L-2033"
→ {"action":"clarify","params":{},"question":"Please provide a reason for rejecting leave L-2033."}

User: "reject leave L-2033 reason: not enough coverage"
→ {"action":"reject_leave","params":{"leaveId":"L-2033","rejectionReason":"not enough coverage"},"reply":"Rejecting leave L-2033..."}

User: "what is the leave policy"
→ {"action":"general_answer","params":{},"reply":"You get 21 days annually: 7 Sick, 7 Casual, 14 Paid. Casual/Paid needs 1-day advance notice. Sick leave can be same-day. Medical cert required for 3+ consecutive sick days. Unused Paid leaves (max 10) carry over to next year."}

User: "when is salary credited"
→ {"action":"general_answer","params":{},"reply":"Salary is credited on the last working day of every month, directly to your registered bank account."}

User: "can I take half day"
→ {"action":"general_answer","params":{},"reply":"Half-day leaves are not supported in the current system. Minimum leave unit is 1 full working day."}
`.trim();

// ─────────────────────────────────────────────
// GROQ MODEL
// ─────────────────────────────────────────────
const GROQ_MODEL = "llama-3.3-70b-versatile";

// ─────────────────────────────────────────────
// PARSE INTENT
// ─────────────────────────────────────────────
const parseIntent = async (userMessage, conversationHistory = []) => {
    if (!process.env.GROQ_API_KEY) {
        const err = new Error("GROQ_API_KEY is not configured");
        err.code = "CONFIG_ERROR";
        throw err;
    }

    const response = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...conversationHistory.slice(-8).map(m => ({
                role: m.role === "assistant" ? "assistant" : "user",
                content: m.content,
            })),
            { role: "user", content: userMessage },
        ],
        temperature: 0.1,
        max_tokens: 512,
    });

    const raw = response.choices?.[0]?.message?.content;

    if (!raw) {
        const err = new Error("Empty response from Groq");
        err.code = "SAFETY_BLOCKED";
        throw err;
    }

    try {
        const cleaned = raw.replace(/```json|```/g, "").trim();
        return JSON.parse(cleaned);
    } catch (e) {
        return {
            action: "general_answer",
            params: {},
            reply: "Sorry, I couldn't understand that. Could you rephrase?",
        };
    }
};

// ─────────────────────────────────────────────
// WORKING DAYS
// ─────────────────────────────────────────────
const calculateWorkingDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) count++;
        current.setDate(current.getDate() + 1);
    }
    return count;
};

// ─────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────
const validateParams = (action, params = {}) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (action === 'apply_leave') {
        if (!params.startDate || !dateRegex.test(params.startDate))
            throw new Error('Invalid start date');
        if (!params.endDate || !dateRegex.test(params.endDate))
            throw new Error('Invalid end date');
        if (!params.reason || params.reason.trim().length < 2)
            throw new Error('Reason is required');
        if (!params.leaveType)
            throw new Error('Leave type is required');
        const start = new Date(params.startDate);
        const end = new Date(params.endDate);
        if (end < start) throw new Error('End date cannot be before start date');
    }

    if (action === 'cancel_leave') {
        if (!params.leaveId) throw new Error('Leave ID is required to cancel');
    }

    if (action === 'approve_leave') {
        if (!params.leaveId) throw new Error('Leave ID is required to approve');
    }

    if (action === 'reject_leave') {
        if (!params.leaveId) throw new Error('Leave ID is required to reject');
        if (!params.rejectionReason || params.rejectionReason.trim().length < 3)
            throw new Error('Rejection reason is required');
    }
};

// ─────────────────────────────────────────────
// HANDLERS
// ─────────────────────────────────────────────
const handlers = {

    get_leave_balance: async (user) => {
        const balance = await LeaveBalance.findOne({
            where: { employeeId: user.id, year: new Date().getFullYear() },
        });
        if (!balance) return { text: 'No leave balance record found for this year.', data: null };

        const remaining = balance.remaining ?? 0;
        const sick = balance.sickRemaining ?? 0;
        const casual = balance.casualRemaining ?? 0;
        const paid = balance.paidRemaining ?? 0;

        return {
            text: `You have ${remaining} days remaining — Sick: ${sick}, Casual: ${casual}, Paid: ${paid}`,
            data: { type: 'leave_balance', balance },
        };
    },

    get_my_leaves: async (user, params) => {
        const where = { employeeId: user.id };
        if (params.status) where.status = params.status;
        if (params.leaveType) where.leaveType = params.leaveType;

        const leaves = await LeaveRequest.findAll({
            where,
            limit: 10,
            order: [['createdAt', 'DESC']],
        });

        return {
            text: leaves.length
                ? `Found ${leaves.length} leave request(s)`
                : 'No leave requests found',
            data: { type: 'leave_list', leaves },
        };
    },

    apply_leave: async (user, params) => {
        const days = calculateWorkingDays(params.startDate, params.endDate);

        // Check balance
        const balance = await LeaveBalance.findOne({
            where: { employeeId: user.id, year: new Date().getFullYear() },
        });

        const leaveType = params.leaveType || 'Casual';
        const balanceKey = `${leaveType.toLowerCase()}Remaining`;

        if (balance && balance[balanceKey] !== undefined && balance[balanceKey] < days) {
            return {
                text: `Insufficient ${leaveType} leave balance. You have ${balance[balanceKey]} day(s) remaining but requested ${days}.`,
                data: null,
            };
        }

        const leave = await LeaveRequest.create({
            employeeId: user.id,
            managerId: user.managerId || null,
            startDate: params.startDate,
            endDate: params.endDate,
            leaveType,
            reason: params.reason,
            daysRequested: days,
            status: 'Pending',
        });

        return {
            text: `✓ ${leaveType} leave applied for ${days} working day(s). Awaiting manager approval.`,
            data: { type: 'leave_applied', leave },
        };
    },

    cancel_leave: async (user, params) => {
        const leave = await LeaveRequest.findOne({
            where: { id: params.leaveId, employeeId: user.id },
        });

        if (!leave) return { text: `Leave ID ${params.leaveId} not found.`, data: null };
        if (leave.status !== 'Pending') {
            return {
                text: `Cannot cancel leave that is already ${leave.status}.`,
                data: null,
            };
        }

        await leave.update({ status: 'Cancelled' });
        return {
            text: `Leave ${params.leaveId} has been cancelled successfully.`,
            data: { type: 'leave_cancelled', leave },
        };
    },

    get_payslip: async (user, params) => {
        const where = { employeeId: user.id };

        if (params.month) {
            const [year, month] = params.month.split('-');
            where.year = parseInt(year);
            where.month = parseInt(month);
        }

        const payslip = await Payroll.findOne({
            where,
            order: [['year', 'DESC'], ['month', 'DESC']],
        });

        if (!payslip) return { text: 'No payslip found for the requested period.', data: null };

        return {
            text: `Payslip for ${payslip.month}/${payslip.year}: Net Pay ₹${payslip.netSalary?.toLocaleString('en-IN') ?? 'N/A'}`,
            data: { type: 'payslip', payslip },
        };
    },

    get_attendance: async (user, params) => {
        const days = params.days || 30;
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);

        const records = await Attendance.findAll({
            where: {
                employeeId: user.id,
                date: { [Op.gte]: fromDate },
            },
            order: [['date', 'DESC']],
        });

        const present = records.filter(r => r.status === 'Present').length;
        const absent = records.filter(r => r.status === 'Absent').length;
        const late = records.filter(r => r.status === 'Late').length;
        const wfh = records.filter(r => r.status === 'Work From Home').length;
        const total = records.length;
        const pct = total > 0 ? Math.round((present / total) * 100) : 0;

        return {
            text: `Last ${days} days — Present: ${present}, Absent: ${absent}, Late: ${late}, WFH: ${wfh} (${pct}% attendance)`,
            data: { type: 'attendance', summary: { present, absent, late, wfh, total, pct, days }, records },
        };
    },

    get_holidays: async (_user, params) => {
        const year = params.year || new Date().getFullYear();

        // Static public holidays — replace with DB query if you have a Holiday model
        const holidays = [
            { date: `${year}-01-26`, name: 'Republic Day' },
            { date: `${year}-03-17`, name: 'Holi' },
            { date: `${year}-04-14`, name: 'Dr. Ambedkar Jayanti' },
            { date: `${year}-05-01`, name: 'Labour Day' },
            { date: `${year}-08-15`, name: 'Independence Day' },
            { date: `${year}-10-02`, name: 'Gandhi Jayanti' },
            { date: `${year}-10-20`, name: 'Dussehra' },
            { date: `${year}-11-05`, name: 'Diwali' },
            { date: `${year}-12-25`, name: 'Christmas Day' },
        ].filter(h => new Date(h.date) >= new Date());

        return {
            text: `${holidays.length} upcoming public holiday(s) in ${year}`,
            data: { type: 'holidays', holidays },
        };
    },

    get_profile: async (user) => {
        const profile = await User.findOne({
            where: { id: user.id },
            attributes: ['id', 'name', 'email', 'designation', 'department', 'joiningDate', 'employeeCode', 'managerId'],
        });

        if (!profile) return { text: 'Profile not found.', data: null };

        return {
            text: `Profile: ${profile.name} — ${profile.designation}, ${profile.department}`,
            data: { type: 'profile', profile },
        };
    },

    get_team_leaves: async (user, params) => {
        const where = { managerId: user.id, status: params.status || 'Pending' };

        const leaves = await LeaveRequest.findAll({
            where,
            include: [{ model: User, as: 'employee', attributes: ['name', 'designation'] }],
            order: [['createdAt', 'ASC']],
        });

        return {
            text: leaves.length
                ? `${leaves.length} pending leave request(s) from your team`
                : 'No pending team leaves',
            data: { type: 'team_leave_list', leaves },
        };
    },

    approve_leave: async (user, params) => {
        const leave = await LeaveRequest.findOne({
            where: { id: params.leaveId, managerId: user.id },
        });

        if (!leave) return { text: `Leave ${params.leaveId} not found in your team.`, data: null };
        if (leave.status !== 'Pending') {
            return { text: `Leave is already ${leave.status}.`, data: null };
        }

        await leave.update({ status: 'Approved', approvedAt: new Date(), approvedBy: user.id });

        return {
            text: `Leave ${params.leaveId} approved successfully.`,
            data: { type: 'leave_approved', leave },
        };
    },

    reject_leave: async (user, params) => {
        const leave = await LeaveRequest.findOne({
            where: { id: params.leaveId, managerId: user.id },
        });

        if (!leave) return { text: `Leave ${params.leaveId} not found in your team.`, data: null };
        if (leave.status !== 'Pending') {
            return { text: `Leave is already ${leave.status}.`, data: null };
        }

        await leave.update({
            status: 'Rejected',
            rejectedAt: new Date(),
            rejectedBy: user.id,
            rejectionReason: params.rejectionReason,
        });

        return {
            text: `Leave ${params.leaveId} rejected.`,
            data: { type: 'leave_rejected', leave },
        };
    },

    general_answer: async (_u, _p, intent) => ({
        text: intent.reply || 'I can help with HR queries. Ask me about leave, payslip, attendance, or policies.',
        data: null,
    }),

    clarify: async (_u, _p, intent) => ({
        text: intent.question || 'Could you provide more details?',
        data: null,
    }),
};

// ─────────────────────────────────────────────
// MAIN CHAT FUNCTION
// ─────────────────────────────────────────────
const chat = async (user, message, history = []) => {
    const startTime = Date.now();

    try {
        const intent = await parseIntent(message, history);

        logger.info({ event: 'AI_INTENT', userId: user.id, action: intent.action, params: intent.params });

        validateParams(intent.action, intent.params);

        const handler = handlers[intent.action];

        if (!handler) {
            logger.warn({ event: 'AI_HANDLER_NOT_FOUND', userId: user.id, action: intent.action });
            return {
                success: true,
                reply: `I don't know how to handle "${intent.action}" yet. Try asking about leaves, payslip, or attendance.`,
                action: intent.action,
                data: null,
            };
        }

        const result = await handler(user, intent.params || {}, intent);

        logger.info({ event: 'AI_SUCCESS', userId: user.id, action: intent.action, durationMs: Date.now() - startTime });

        return {
            success: true,
            reply: result.text,
            action: intent.action,
            data: result.data || null,
        };

    } catch (error) {
        logger.error({
            event: 'AI_ERROR',
            userId: user?.id,
            message: error.message,
            code: error.code,
            stack: error.stack,
        });

        if (error.code === 'CONFIG_ERROR') {
            return { success: false, reply: 'AI assistant is not configured. Contact your administrator.', action: 'config_error' };
        }

        if (error.message.includes('Invalid') || error.message.includes('required')) {
            return { success: false, reply: `Validation error: ${error.message}`, action: 'validation_error' };
        }

        return { success: false, reply: 'Something went wrong. Please try again.', action: 'error' };
    }
};

module.exports = { chat };