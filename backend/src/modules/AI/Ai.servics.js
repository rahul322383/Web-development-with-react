'use strict';

// ─── node-fetch fallback (safe for Node 16 and below) ────────────────────────
const _fetch = typeof fetch !== 'undefined' ? fetch : (...args) =>
    import('node-fetch').then(m => m.default(...args));

const logger = require('../../config/logger');
const { LeaveRequest, LeaveBalance, Payroll, User, Attendance } = require('../../database/initModels');
const { Op } = require('sequelize');

// ─── Gemini config ────────────────────────────────────────────────────────────
// FREE tier: 1,500 requests/day — no credit card needed
// Get key: https://aistudio.google.com/app/apikey
const GEMINI_MODEL = 'gemini-2.0-flash-lite';

const GEMINI_URL = () =>
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

// ─── System prompt ────────────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

const SYSTEM_PROMPT = `
You are an AI HR Assistant embedded inside an HRMS application.
Understand the employee's message and return a structured JSON intent.

Available actions:
- get_leave_balance   → check remaining leave days
- get_my_leaves       → list user's leave requests
- apply_leave         → apply for leave (REQUIRES: startDate, endDate, reason — all mandatory)
- get_payslip         → get latest payslip
- get_attendance      → get attendance summary (last 30 days)
- get_team_leaves     → pending team leaves (managers only)
- general_answer      → answer HR policy question
- clarify             → ask a follow-up if any required field is missing

Rules:
1. Respond ONLY with valid JSON. No markdown, no code fences, no extra text outside the JSON.
2. Today is ${today}. Tomorrow is ${tomorrow}. Resolve relative dates.
3. For apply_leave, ALL three fields (startDate, endDate, reason) are required. If ANY is missing → set action to "clarify".
4. Dates must be YYYY-MM-DD format.
5. For general_answer, write a helpful "reply".

Response format (always return this exact structure):
{
  "action": "<action_name>",
  "params": {},
  "reply": "<short message shown while loading>",
  "question": "<only when action=clarify>"
}

Examples:
User: "leave balance"
→ {"action":"get_leave_balance","params":{},"reply":"Checking your leave balance..."}

User: "apply leave May 1 to May 3 family function"
→ {"action":"apply_leave","params":{"startDate":"2026-05-01","endDate":"2026-05-03","reason":"family function"},"reply":"Applying your leave request..."}

User: "apply leave tomorrow"
→ {"action":"clarify","params":{},"question":"How many days do you need, and what is the reason for the leave?"}

User: "payslip"
→ {"action":"get_payslip","params":{},"reply":"Fetching your latest payslip..."}

User: "leave policy"
→ {"action":"general_answer","params":{},"reply":"Employees get 18 days of annual paid leave. Apply at least 2 days in advance. Manager approval is required. Unused leave does not carry forward."}
`.trim();

// ─── Param validation (security — prevents prompt injection) ─────────────────
const validateParams = (action, params = {}) => {
    if (action === 'apply_leave') {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (!params.startDate || !dateRegex.test(params.startDate))
            throw new Error('Invalid or missing start date');
        if (!params.endDate || !dateRegex.test(params.endDate))
            throw new Error('Invalid or missing end date');
        if (!params.reason || typeof params.reason !== 'string' || params.reason.trim().length < 2)
            throw new Error('Please provide a valid reason for leave');

        const start = new Date(params.startDate);
        const end = new Date(params.endDate);
        const now = new Date();
        const maxFuture = new Date();
        maxFuture.setFullYear(maxFuture.getFullYear() + 1);

        if (start < new Date(now.getFullYear(), now.getMonth(), now.getDate()))
            throw new Error('Leave cannot start in the past');
        if (end < start)
            throw new Error('End date cannot be before start date');
        if (end > maxFuture)
            throw new Error('Leave date cannot be more than 1 year in the future');
        if ((end - start) / 86400000 > 60)
            throw new Error('Leave duration cannot exceed 60 days');
    }
};

// ─── Call Gemini API ──────────────────────────────────────────────────────────
const parseIntent = async (userMessage, conversationHistory = []) => {
    if (!process.env.GEMINI_API_KEY) {
        const err = new Error('GEMINI_API_KEY is not configured');
        err.code = 'CONFIG_ERROR';
        throw err;
    }

    // Build multi-turn contents — Gemini uses "user" / "model" roles
    const contents = [];

    for (const msg of conversationHistory.slice(-6)) {
        contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        });
    }

    contents.push({ role: 'user', parts: [{ text: userMessage }] });

    // Inject system prompt as first turn
    const bodyContents = [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: 'Understood. I will respond only with valid JSON.' }] },
        ...contents,
    ];

    const body = {
        contents: bodyContents,
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 512,
        },
    };

    const response = await _fetch(GEMINI_URL(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    // ── 429 Rate limit ───────────────────────────────────────────────────────
    if (response.status === 429) {
        const errData = await response.json().catch(() => ({}));
        const retryDelay = errData?.error?.details
            ?.find(d => d.retryDelay)
            ?.retryDelay?.replace('s', '') || 60;

        const err = new Error('RATE_LIMITED');
        err.code = 'RATE_LIMITED';
        err.retryAfter = Math.ceil(Number(retryDelay));
        throw err;
    }

    // ── Other HTTP errors ────────────────────────────────────────────────────
    if (!response.ok) {
        const errText = await response.text();
        logger.error({ event: 'GEMINI_API_ERROR', status: response.status, body: errText });
        throw new Error(`Gemini API ${response.status}: ${errText}`);
    }

    const data = await response.json();

    // ── Empty / blocked response ─────────────────────────────────────────────
    if (!data?.candidates?.length) {
        const err = new Error('Gemini returned no candidates');
        err.code = 'SAFETY_BLOCKED';
        throw err;
    }

    const raw = data.candidates[0]?.content?.parts?.[0]?.text;

    if (!raw || !raw.trim()) {
        throw new Error('Gemini returned an empty response');
    }

    // ── Parse JSON ───────────────────────────────────────────────────────────
    try {
        const cleaned = raw.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
    } catch {
        logger.warn({ event: 'AI_JSON_PARSE_FAILED', raw });
        return {
            action: 'general_answer',
            params: {},
            reply: "I'm having trouble understanding that. Could you rephrase your question?",
        };
    }
};

// ─── Intent Handlers ──────────────────────────────────────────────────────────
const handlers = {

    get_leave_balance: async (user) => {
        const year = new Date().getFullYear();
        const balance = await LeaveBalance.findOne({ where: { employeeId: user.id, year } });

        if (!balance) {
            return { text: `No leave balance record found for ${year}. Please contact HR.` };
        }

        return {
            text: [
                `📊 Your leave balance for ${year}:`,
                `• Total Annual : ${balance.totalAnnual} days`,
                `• Used         : ${balance.used} days`,
                `• Remaining    : ${balance.remaining} days`,
            ].join('\n'),
            data: balance,
        };
    },

    get_my_leaves: async (user) => {
        const leaves = await LeaveRequest.findAll({
            where: { employeeId: user.id },
            order: [['createdAt', 'DESC']],
            limit: 10,
        });

        if (!leaves.length) return { text: 'You have no leave requests yet.' };

        const lines = leaves.map(l =>
            `• ${l.startDate} → ${l.endDate}  (${l.daysRequested}d)  [${l.status}]  ${l.reason}`
        );

        return {
            text: `📋 Your recent leave requests:\n${lines.join('\n')}`,
            data: leaves,
        };
    },

    apply_leave: async (user, params) => {
        const { startDate, endDate, reason } = params;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysRequested = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // Check leave balance
        const year = start.getFullYear();
        const balance = await LeaveBalance.findOne({ where: { employeeId: user.id, year } });

        if (balance && balance.remaining < daysRequested) {
            return {
                text: [
                    '❌ Insufficient leave balance.',
                    `• Remaining : ${balance.remaining} days`,
                    `• Requested : ${daysRequested} days`,
                    'Please contact HR to request additional leave.',
                ].join('\n'),
            };
        }

        // Check for overlapping leave
        const overlap = await LeaveRequest.findOne({
            where: {
                employeeId: user.id,
                status: { [Op.notIn]: ['Rejected', 'Cancelled'] },
                startDate: { [Op.lte]: endDate },
                endDate: { [Op.gte]: startDate },
            },
        });

        if (overlap) {
            return {
                text: [
                    '❌ You already have a leave request overlapping these dates.',
                    `• Existing : ${overlap.startDate} → ${overlap.endDate}  [${overlap.status}]`,
                    'Please choose different dates.',
                ].join('\n'),
            };
        }

        // Create leave request
        const leave = await LeaveRequest.create({
            employeeId: user.id,
            managerId: user.managerId || null,
            startDate,
            endDate,
            reason: reason.trim(),
            daysRequested,
            status: 'Pending',
        });

        return {
            text: [
                '✅ Leave applied successfully!',
                `• Dates  : ${startDate} → ${endDate}`,
                `• Days   : ${daysRequested}`,
                `• Reason : ${reason}`,
                '• Status : Pending (awaiting manager approval)',
            ].join('\n'),
            data: leave,
        };
    },

    get_payslip: async (user) => {
        const payroll = await Payroll.findOne({
            where: { employeeId: user.id },
            order: [['createdAt', 'DESC']],
        });

        if (!payroll) return { text: 'No payroll records found. Please contact HR.' };

        const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

        return {
            text: [
                '💰 Your latest payslip:',
                `• Month       : ${payroll.month || 'N/A'}`,
                `• Base Salary : ${fmt(payroll.baseSalary)}`,
                `• Net Pay     : ${fmt(payroll.netPay)}`,
                `• Status      : ${payroll.status || 'N/A'}`,
            ].join('\n'),
            data: payroll,
        };
    },

    get_attendance: async (user) => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const records = await Attendance.findAll({
            where: {
                employeeId: user.id,
                createdAt: { [Op.gte]: thirtyDaysAgo },
            },
            order: [['createdAt', 'DESC']],
            limit: 31,
        });

        if (!records.length) {
            return { text: 'No attendance records found for the last 30 days.' };
        }

        const present = records.filter(r => r.status === 'Present').length;
        const absent = records.filter(r => r.status === 'Absent').length;
        const late = records.filter(r => r.status === 'Late').length;

        return {
            text: [
                '🕐 Your attendance (last 30 days):',
                `• Present : ${present} days`,
                `• Absent  : ${absent} days`,
                `• Late    : ${late} days`,
                `• Total   : ${records.length} records`,
            ].join('\n'),
            data: { present, absent, late, total: records.length },
        };
    },

    get_team_leaves: async (user) => {
        const role = user.primaryRole?.toLowerCase();

        if (!['manager', 'hr', 'admin'].includes(role)) {
            return { text: '🚫 You do not have permission to view team leaves.' };
        }

        const pending = await LeaveRequest.findAll({
            where: { managerId: user.id, status: 'Pending' },
            include: [{
                model: User,
                as: 'employee',
                attributes: ['firstName', 'lastName', 'department'],
            }],
            order: [['createdAt', 'DESC']],
        });

        if (!pending.length) {
            return { text: '✅ No pending leave requests from your team.' };
        }

        const lines = pending.map(l => {
            const name = l.employee
                ? `${l.employee.firstName} ${l.employee.lastName}`
                : `Employee #${l.employeeId}`;
            return `• ${name}  |  ${l.startDate} → ${l.endDate}  (${l.daysRequested}d)  |  ${l.reason}`;
        });

        return {
            text: `👥 Pending team leave requests (${pending.length}):\n${lines.join('\n')}`,
            data: pending,
        };
    },

    general_answer: async (_user, _params, intent) => ({
        text: intent.reply ||
            'I can help with leave balance, applying leave, payslips, attendance, and team leaves. What would you like to know?',
    }),

    clarify: async (_user, _params, intent) => ({
        text: intent.question || 'Could you provide more details so I can help you better?',
    }),
};

// ─── Main exported function ───────────────────────────────────────────────────
const chat = async (user, message, history = []) => {
    try {
        const intent = await parseIntent(message, history);
        console.log(intent)
        logger.info({ event: 'AI_INTENT', userId: user.id, action: intent.action });

        // Validate params before touching the DB
        try {
            validateParams(intent.action, intent.params);
        } catch (validationErr) {
            return {
                success: true,
                reply: `⚠️ ${validationErr.message}`,
                action: 'validation_error',
                data: null,
            };
        }

        const handler = handlers[intent.action];

        if (!handler) {
            return {
                success: true,
                reply: "I'm not sure how to help with that. Try asking about your leave balance, payslip, or attendance.",
                action: intent.action,
                data: null,
            };
        }

        const result = await handler(user, intent.params || {}, intent);
        console.log(result)

        return {
            success: true,
            reply: result.text,
            action: intent.action,
            data: result.data || null,
        };

    } catch (error) {
        logger.error({ event: 'AI_CHAT_FAILED', userId: user.id, error: error.message });
        console.log(error)

        // ── Rate limited ─────────────────────────────────────────────────────
        if (error.code === 'RATE_LIMITED' || error.message === 'RATE_LIMITED') {
            const wait = error.retryAfter || 60;
            return {
                success: true,
                reply: `⏳ I'm a bit busy right now. Please try again in ${wait} seconds.`,
                action: 'rate_limited',
                data: null,
            };
        }

        // ── API key not configured ───────────────────────────────────────────
        if (error.code === 'CONFIG_ERROR' || error.message?.includes('GEMINI_API_KEY')) {
            return {
                success: false,
                reply: '⚙️ AI service is not configured. Please contact your system administrator.',
                action: 'config_error',
                data: null,
            };
        }

        // ── Safety filter blocked ────────────────────────────────────────────
        if (error.code === 'SAFETY_BLOCKED' || error.message?.includes('safety filters')) {
            return {
                success: true,
                reply: "I can't help with that request. Try asking about your leave balance, payslip, or attendance.",
                action: 'blocked',
                data: null,
            };
        }

        // ── Generic fallback ─────────────────────────────────────────────────
        return {
            success: false,
            reply: '❌ Something went wrong. Please try again in a moment.',
            action: 'error',
            data: null,
        };
    }
};

module.exports = { chat };