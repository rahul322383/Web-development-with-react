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
const { Sequelize } = require('sequelize');

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
- who_on_leave_tomorrow → list team members on leave tomorrow
- get_late_employees  → list team members who were late this week (params: days optional, default 7)
- get_burnout_report  → analyze team burnout risk based on overtime, late logins, leave patterns
- get_leave_predictions → predict which team members are likely to take leave soon

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

BURNOUT SIGNALS (for analysis):
- High risk: 3+ late logins in a week, consecutive sick leaves, attendance < 70%, sudden spike in leave requests
- Medium risk: 2 late logins in a week, WFH > 60% of days, declining attendance trend
- Low risk: normal patterns, stable attendance above 80%

LEAVE PREDICTION SIGNALS:
- Employee has low leave balance remaining (< 3 days) → likely to take Unpaid/Sick
- History of leaves around specific months → pattern-based prediction
- Multiple sick leaves recently → likely upcoming sick leave
- High stress indicators (late, absent spikes) → leave likely in next 2 weeks

━━━ RULES ━━━
1. Respond ONLY with valid JSON. No markdown, no code fences, no text outside JSON.
2. Today is ${today}. Tomorrow is ${tomorrow}. Current year: ${currentYear}. Resolve all relative dates.
3. For apply_leave: startDate, endDate, leaveType, reason are ALL mandatory. Missing any → action = "clarify".
4. For cancel_leave: leaveId is mandatory. If user says "cancel my last leave" → ask for confirmation.
5. For reject_leave: rejectionReason is mandatory.
6. Dates must be YYYY-MM-DD. Month params must be YYYY-MM.
7. For general_answer: write a clear, policy-accurate "reply".
8. Detect if the user is asking a status filter: params may include status or leaveType.
9. If user asks about "team" or "my reportees" actions → use manager actions.
10. "who is on leave tomorrow" / "tomorrow's leaves" → who_on_leave_tomorrow
11. "late employees" / "who came late" → get_late_employees
12. "burnout" / "stress report" / "team health" → get_burnout_report
13. "leave prediction" / "who might take leave" / "predict leaves" → get_leave_predictions
14. Be concise, friendly, and professional in all reply/question fields.

━━━ RESPONSE FORMAT ━━━
{
  "action": "<action_name>",
  "params": {},
  "reply": "<short loading message OR policy answer>",
  "question": "<only when action=clarify>"
}

━━━ EXAMPLES ━━━

User: "who is on leave tomorrow"
→ {"action":"who_on_leave_tomorrow","params":{},"reply":"Checking who's on leave tomorrow..."}

User: "show late employees this week"
→ {"action":"get_late_employees","params":{"days":7},"reply":"Fetching late arrivals this week..."}

User: "burnout report for my team"
→ {"action":"get_burnout_report","params":{},"reply":"Analyzing team burnout risk..."}

User: "who might take leave soon"
→ {"action":"get_leave_predictions","params":{},"reply":"Running leave prediction analysis..."}

User: "leave balance"
→ {"action":"get_leave_balance","params":{},"reply":"Checking your leave balance..."}

User: "apply sick leave from May 5 to May 7 I have fever"
→ {"action":"apply_leave","params":{"startDate":"${currentYear}-05-05","endDate":"${currentYear}-05-07","leaveType":"Sick","reason":"fever"},"reply":"Applying your sick leave..."}

User: "apply leave tomorrow"
→ {"action":"clarify","params":{},"question":"Sure! Could you tell me: the end date, leave type (Sick/Casual/Paid), and reason?"}

User: "show pending leaves"
→ {"action":"get_my_leaves","params":{"status":"Pending"},"reply":"Fetching your pending leaves..."}

User: "payslip for March"
→ {"action":"get_payslip","params":{"month":"${currentYear}-03"},"reply":"Fetching your March payslip..."}

User: "attendance last 7 days"
→ {"action":"get_attendance","params":{"days":7},"reply":"Fetching your attendance for the last 7 days..."}

User: "what is the notice period"
→ {"action":"general_answer","params":{},"reply":"Notice period is 30 days for employees. For managers, it ranges from 30 to 90 days depending on grade."}

User: "can I work from home"
→ {"action":"general_answer","params":{},"reply":"Yes! WFH is allowed but must be pre-approved by your manager through the official channel."}

User: "what happens if attendance is low"
→ {"action":"general_answer","params":{},"reply":"If your attendance falls below 70% in a month, it triggers an HR review. Try to maintain at least 70% monthly attendance."}

User: "when is salary credited"
→ {"action":"general_answer","params":{},"reply":"Salary is credited on the last working day of every month, directly to your registered bank account."}
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
    } catch {
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
// BURNOUT SCORE CALCULATOR
// ─────────────────────────────────────────────
const calcBurnoutScore = (attendance, leaveHistory) => {
    let score = 0;
    const flags = [];

    const lateCount = attendance.filter(a => a.status === 'Late').length;
    const absentCount = attendance.filter(a => a.status === 'Absent').length;
    const total = attendance.length || 1;
    const attendancePct = Math.round(((total - absentCount) / total) * 100);

    if (lateCount >= 3) { score += 35; flags.push(`${lateCount} late arrivals`); }
    else if (lateCount === 2) { score += 15; flags.push(`${lateCount} late arrivals`); }

    if (attendancePct < 70) { score += 30; flags.push(`${attendancePct}% attendance`); }
    else if (attendancePct < 80) { score += 15; flags.push(`${attendancePct}% attendance`); }

    const recentSickLeaves = leaveHistory.filter(l =>
        l.leaveType === 'Sick' && l.status === 'Approved' &&
        new Date(l.startDate) > new Date(Date.now() - 30 * 86400000)
    ).length;

    if (recentSickLeaves >= 2) { score += 25; flags.push(`${recentSickLeaves} sick leaves (30d)`); }
    else if (recentSickLeaves === 1) { score += 10; flags.push(`${recentSickLeaves} sick leave (30d)`); }

    const totalLeaveRequests = leaveHistory.filter(l =>
        new Date(l.createdAt) > new Date(Date.now() - 30 * 86400000)
    ).length;
    if (totalLeaveRequests >= 3) { score += 10; flags.push(`${totalLeaveRequests} leave requests (30d)`); }

    score = Math.min(score, 100);

    let risk = 'Low';
    if (score >= 60) risk = 'High';
    else if (score >= 30) risk = 'Medium';

    return { score, risk, flags, attendancePct, lateCount };
};

// ─────────────────────────────────────────────
// LEAVE PREDICTION SCORE
// ─────────────────────────────────────────────
const calcLeavePrediction = (employee, balance, leaveHistory, attendance) => {
    let score = 0;
    const reasons = [];

    // Low balance → likely to exhaust soon or take unpaid
    const remaining = balance?.remaining ?? 21;
    if (remaining <= 2) { score += 40; reasons.push('Very low leave balance'); }
    else if (remaining <= 5) { score += 20; reasons.push('Low leave balance'); }

    // Recent sick leaves → health issue pattern
    const recentSick = leaveHistory.filter(l =>
        l.leaveType === 'Sick' &&
        new Date(l.startDate) > new Date(Date.now() - 14 * 86400000)
    ).length;
    if (recentSick >= 1) { score += 30; reasons.push('Recent sick leave pattern'); }

    // High absenteeism
    const absentCount = attendance.filter(a => a.status === 'Absent').length;
    if (absentCount >= 3) { score += 20; reasons.push('Frequent absences'); }

    // Historical pattern — same month last year
    const thisMonth = new Date().getMonth() + 1;
    const sameMonthLastYear = leaveHistory.filter(l =>
        new Date(l.startDate).getMonth() + 1 === thisMonth &&
        new Date(l.startDate).getFullYear() < new Date().getFullYear()
    ).length;
    if (sameMonthLastYear >= 1) { score += 15; reasons.push('Historical leave in this month'); }

    // Burnout signals
    const lateCount = attendance.filter(a => a.status === 'Late').length;
    if (lateCount >= 3) { score += 10; reasons.push('High stress indicators'); }

    score = Math.min(score, 100);

    let likelihood = 'Low';
    if (score >= 60) likelihood = 'High';
    else if (score >= 30) likelihood = 'Medium';

    return { score, likelihood, reasons };
};

// ─────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────
const validateParams = (action, params = {}) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (action === 'apply_leave') {
        if (!params.startDate || !dateRegex.test(params.startDate)) {
            return { success: false, message: 'Invalid start date' };
        }

        if (!params.endDate || !dateRegex.test(params.endDate)) {
            return { success: false, message: 'Invalid end date' };
        }

        if (!params.reason || params.reason.trim().length < 2) {
            return { success: false, message: 'Reason is required' };
        }

        if (!params.leaveType) {
            return { success: false, message: 'Leave type is required' };
        }

        const start = new Date(params.startDate);
        const end = new Date(params.endDate);

        if (end < start) {
            return { success: false, message: 'End date cannot be before start date' };
        }
    }

    if (action === 'cancel_leave') {
        if (!params.leaveId) {
            return { success: false, message: 'Leave ID is required to cancel' };
        }
    }

    if (action === 'approve_leave') {
        if (!params.leaveId) {
            return { success: false, message: 'Leave ID is required to approve' };
        }
    }

    if (action === 'reject_leave') {
        if (!params.leaveId) {
            return { success: false, message: 'Leave ID is required to reject' };
        }

        if (!params.rejectionReason || params.rejectionReason.trim().length < 3) {
            return { success: false, message: 'Rejection reason is required' };
        }
    }

    return { success: true };
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

        // 🔥 IMPORTANT FIX
        if (!user.managerId) {
            return {
                text: 'You are not assigned to any manager. Please contact HR.',
                data: null,
            };
        }

        const leave = await LeaveRequest.create({
            companyId: user.company_id, // ✅ FIXED
            employeeId: user.id,
            managerId: user.managerId,  // ✅ FIXED (no null)
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
            return { text: `Cannot cancel leave that is already ${leave.status}.`, data: null };
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
            where: { employeeId: user.id, date: { [Op.gte]: fromDate } },
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
        if (leave.status !== 'Pending') return { text: `Leave is already ${leave.status}.`, data: null };

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
        if (leave.status !== 'Pending') return { text: `Leave is already ${leave.status}.`, data: null };

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

    // ─────────────────────────────────────────────
    // NEW: WHO IS ON LEAVE TOMORROW
    // ─────────────────────────────────────────────
    who_on_leave_tomorrow: async (user) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const leaves = await LeaveRequest.findAll({
            where: {
                managerId: user.id,
                status: 'Approved',
                startDate: { [Op.lte]: tomorrow },
                endDate: { [Op.gte]: tomorrow },
            },
            include: [
                {
                    model: User,
                    as: 'employee',
                    attributes: ['first_name','last_name', 'designation', 'department'],
                },
            ],
        });

        return {
            text: leaves.length
                ? `${leaves.length} team member(s) on leave tomorrow`
                : `No one from your team is on leave tomorrow`,
            data: { type: 'on_leave_tomorrow', leaves, date: tomorrow },
        };
    },

    // ─────────────────────────────────────────────
    // NEW: GET LATE EMPLOYEES
    // ─────────────────────────────────────────────
    get_late_employees: async (user, params) => {
        const days = params.days || 7;
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);

        // Get all team members
        const teamMembers = await User.findAll({
            where: { managerId: user.id },
            attributes: ['id', 'first_name', 'last_name', 'designation'],
        });

        if (!teamMembers.length) {
            return { text: 'No team members found under your supervision.', data: null };
        }

        const teamIds = teamMembers.map(m => m.id);

        const lateRecords = await Attendance.findAll({
            where: {
                employeeId: { [Op.in]: teamIds },
                status: 'Late',
                date: { [Op.gte]: fromDate },
            },
            include: [{ model: User, as: 'employee', attributes: ['first_name', 'last_name', 'designation'] }],
            order: [['date', 'DESC']],
        });

        // Group by employee
        const grouped = lateRecords.reduce((acc, rec) => {
            const id = rec.employeeId;
            if (!acc[id]) {
                acc[id] = {
                    employee: rec.employee,
                    count: 0,
                    dates: [],
                };
            }
            acc[id].count++;
            acc[id].dates.push(rec.date);
            return acc;
        }, {});

        const summary = Object.values(grouped).sort((a, b) => b.count - a.count);

        return {
            text: summary.length
                ? `${summary.length} team member(s) had late arrivals in the last ${days} days`
                : `No late arrivals recorded in your team in the last ${days} days`,
            data: { type: 'late_employees', employees: summary, days },
        };
    },

    // ─────────────────────────────────────────────
    // NEW: BURNOUT DETECTION
    // ─────────────────────────────────────────────
    get_burnout_report: async (user) => {
        const teamMembers = await User.findAll({
            where: { manager_id: user.id }, 
            attributes: [
                'id',
                'designation',
                'department',
                ['first_name', 'firstName'],
                ['last_name', 'lastName'],
            ],
        });
        if (!teamMembers.length) {
            return { text: 'No team members found under your supervision.', data: null };
        }

        const teamIds = teamMembers.map(m => m.id);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

        // Fetch attendance & leave history for all team members
        const [allAttendance, allLeaves] = await Promise.all([
            Attendance.findAll({
                where: { employeeId: { [Op.in]: teamIds }, date: { [Op.gte]: thirtyDaysAgo } },
            }),
            LeaveRequest.findAll({
                where: { employeeId: { [Op.in]: teamIds }, createdAt: { [Op.gte]: thirtyDaysAgo } },
            }),
        ]);

        const results = teamMembers.map(member => {
            const attendance = allAttendance.filter(a => a.employeeId === member.id);
            const leaveHistory = allLeaves.filter(l => l.employeeId === member.id);
            const { score, risk, flags, attendancePct, lateCount } = calcBurnoutScore(attendance, leaveHistory);

            return {
                employee: { id: member.id, name: member.name, designation: member.designation },
                score,
                risk,
                flags,
                attendancePct,
                lateCount,
            };
        }).sort((a, b) => b.score - a.score);

        const highRisk = results.filter(r => r.risk === 'High').length;
        const mediumRisk = results.filter(r => r.risk === 'Medium').length;

        return {
            text: `Team burnout report: ${highRisk} high risk, ${mediumRisk} medium risk out of ${results.length} members`,
            data: { type: 'burnout_report', employees: results, summary: { highRisk, mediumRisk, total: results.length } },
        };
    },

 
    get_leave_predictions: async (user) => {
        const teamMembers = await User.findAll({
            where: { manager_id: user.id }, // ✅ fixed
            attributes: [
                'id',
                'designation',
                'department',
                [Sequelize.literal("CONCAT(first_name, ' ', last_name)"), 'name'] // ✅ fixed
            ],
        });

        if (!teamMembers.length) {
            return { text: 'No team members found under your supervision.', data: null };
        }

        const teamIds = teamMembers.map(m => m.id);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

        const [allAttendance, allLeaves, allBalances] = await Promise.all([
            Attendance.findAll({
                where: { employeeId: { [Op.in]: teamIds }, date: { [Op.gte]: thirtyDaysAgo } },
            }),
            LeaveRequest.findAll({
                where: { employeeId: { [Op.in]: teamIds } },
            }),
            LeaveBalance.findAll({
                where: { employeeId: { [Op.in]: teamIds }, year: new Date().getFullYear() },
            }),
        ]);

        const results = teamMembers.map(member => {
            const attendance = allAttendance.filter(a => a.employeeId === member.id);
            const leaveHistory = allLeaves.filter(l => l.employeeId === member.id);
            const balance = allBalances.find(b => b.employeeId === member.id);

            const { score, likelihood, reasons } =
                calcLeavePrediction(member, balance, leaveHistory, attendance);

            return {
                employee: {
                    id: member.id,
                    name: member.get('name'), // ✅ important for literal
                    designation: member.designation
                },
                score,
                likelihood,
                reasons,
                remainingDays: balance?.remaining ?? 'N/A',
            };
        }).sort((a, b) => b.score - a.score);

        const highLikelihood = results.filter(r => r.likelihood === 'High').length;

        return {
            text: `Leave predictions: ${highLikelihood} team member(s) likely to take leave soon`,
            data: { type: 'leave_predictions', employees: results },
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
        console.error("🔥 FULL ERROR OBJECT:", error);

        console.error("🔥 MESSAGE:", error.message);
        console.error("🔥 SQL:", error.sql);
        console.error("🔥 PARAMETERS:", error.parameters);

        if (error.parent) {
            console.error("🔥 DB ERROR:", error.parent.sqlMessage);
            console.error("🔥 DB CODE:", error.parent.code);
        }

        throw error;
    

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