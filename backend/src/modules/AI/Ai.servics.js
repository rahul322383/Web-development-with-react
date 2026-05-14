'use strict';

/**
 * HRMS AI Chat Service — Full Edition
 * Modules: Leaves · Payroll · Attendance · Analytics · Audit · Automation
 *          Company Expenses · Notifications · Recruitment · Reports
 *          Shift Management · Year-End · Settings
 */

const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');
dayjs.extend(isBetween);

const { OpenAI } = require('openai');
const { Op, Sequelize } = require('sequelize');

const {
    LeaveRequest,
    LeaveBalance,
    Payroll,
    User,
    Attendance,
    AuditLog,
    JobPosting,
    Candidate,
    Expense,
    Notification,
    Shift,
    ShiftAssignment,
    Report,
    CompanySetting,
} = require('../../database/initModels');

// ─── AI CLIENT ───────────────────────────────────────────────────────────────

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

const GROQ_MODEL = 'llama-3.3-70b-versatile';

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────

const today = () => dayjs().format('YYYY-MM-DD');
const tomorrow = () => dayjs().add(1, 'day').format('YYYY-MM-DD');
const nDaysAgo = (n) => dayjs().subtract(n, 'day').toDate();
const currentYear = () => dayjs().year();
const currentMonth = () => dayjs().format('MMMM');
const currentMonthNum = () => dayjs().month() + 1;

// ─── LEAVE BALANCE FIELD MAP ──────────────────────────────────────────────────

const LEAVE_BALANCE_MAP = {
    Sick: 'sickRemaining',
    Casual: 'casualRemaining',
    Paid: 'paidRemaining',
    Maternity: 'maternityRemaining',
    Paternity: 'paternityRemaining',
    Bereavement: 'bereavementRemaining',
    Unpaid: null,
};

/**
 * FIX #6 — compute total remaining from individual fields
 * instead of relying on a non-existent `remaining` column.
 */
const totalRemaining = (balance) => {
    if (!balance) return 0;
    return (
        (balance.sickRemaining ?? 0) +
        (balance.casualRemaining ?? 0) +
        (balance.paidRemaining ?? 0) +
        (balance.maternityRemaining ?? 0) +
        (balance.paternityRemaining ?? 0) +
        (balance.bereavementRemaining ?? 0)
    );
};

// ─── ALLOWED ACTIONS ──────────────────────────────────────────────────────────

const ALLOWED_ACTIONS = new Set([
    // Employee
    'get_leave_balance', 'get_my_leaves', 'apply_leave', 'cancel_leave',
    'get_payslip', 'get_attendance', 'get_holidays', 'get_profile',
    'get_monthly_summary', 'policy_search', 'general_answer', 'clarify',
    // Expenses
    'submit_expense', 'get_my_expenses', 'get_expense_summary',
    // Notifications
    'get_notifications', 'mark_notification_read',
    // Shift
    'get_my_shift', 'get_team_shifts',
    // Manager
    'get_team_leaves', 'approve_leave', 'reject_leave',
    'who_on_leave_tomorrow', 'get_late_employees',
    'get_burnout_report', 'get_leave_predictions',
    'get_attrition_predictions', 'get_performance_insights',
    'approve_expense', 'reject_expense', 'get_team_expenses',
    'assign_shift', 'get_shift_coverage',
    // HR / Admin
    'screen_resume', 'rank_candidates', 'generate_jd', 'get_open_positions',
    'get_recruitment_summary',
    // Reports
    'generate_report', 'get_report_history',
    // Year-End
    'get_year_end_summary', 'carry_forward_leaves', 'reset_leave_balances',
    // Settings
    'get_company_settings', 'update_company_setting',
    // Audit
    'get_audit_logs',
]);

const MANAGER_ACTIONS = new Set([
    'get_team_leaves', 'approve_leave', 'reject_leave',
    'who_on_leave_tomorrow', 'get_late_employees',
    'get_burnout_report', 'get_leave_predictions',
    'get_attrition_predictions', 'get_performance_insights',
    'approve_expense', 'reject_expense', 'get_team_expenses',
    'assign_shift', 'get_shift_coverage', 'get_team_shifts',
]);

const HR_ADMIN_ACTIONS = new Set([
    'screen_resume', 'rank_candidates', 'generate_jd',
    'get_open_positions', 'get_recruitment_summary',
    'generate_report', 'get_report_history',
    'get_year_end_summary', 'carry_forward_leaves', 'reset_leave_balances',
    'get_company_settings', 'update_company_setting',
    'get_audit_logs',
]);

const isAuthorised = (user, action) => {
    if (HR_ADMIN_ACTIONS.has(action)) return ['Admin', 'HR'].includes(user.role);
    if (MANAGER_ACTIONS.has(action)) return ['Manager', 'Admin', 'HR'].includes(user.role);
    return true;
};

// ─── WORKING DAY CALCULATOR ───────────────────────────────────────────────────

const calculateWorkingDays = (startDate, endDate) => {
    let count = 0;
    let current = dayjs(startDate);
    const end = dayjs(endDate);
    while (current.isBefore(end) || current.isSame(end, 'day')) {
        const dow = current.day();
        if (dow !== 0 && dow !== 6) count++;
        current = current.add(1, 'day');
    }
    return count;
};

// ─── ANALYTICS HELPERS ────────────────────────────────────────────────────────

const calcBurnoutScore = (attendance, leaveHistory) => {
    let score = 0;
    const flags = [];

    const lateCount = attendance.filter(a => a.status === 'Late').length;
    const absentCount = attendance.filter(a => a.status === 'Absent').length;
    const total = attendance.length || 1;
    const workingDays = attendance.filter(a => a.status !== 'Holiday').length || 1;
    const attendancePct = Math.round(((workingDays - absentCount) / workingDays) * 100);

    if (lateCount >= 3) { score += 35; flags.push(`${lateCount} late arrivals`); }
    else if (lateCount === 2) { score += 15; flags.push(`${lateCount} late arrivals`); }

    if (attendancePct < 70) { score += 30; flags.push(`${attendancePct}% attendance`); }
    else if (attendancePct < 80) { score += 15; flags.push(`${attendancePct}% attendance`); }

    const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate();
    const recentSick = leaveHistory.filter(l =>
        l.leaveType === 'Sick' && l.status === 'Approved' &&
        new Date(l.startDate) > thirtyDaysAgo
    ).length;
    if (recentSick >= 2) { score += 25; flags.push(`${recentSick} sick leaves (30d)`); }
    else if (recentSick === 1) { score += 10; flags.push(`${recentSick} sick leave (30d)`); }

    const totalLeaveRequests = leaveHistory.filter(l =>
        new Date(l.createdAt) > thirtyDaysAgo
    ).length;
    if (totalLeaveRequests >= 3) { score += 10; flags.push(`${totalLeaveRequests} leave requests (30d)`); }

    score = Math.min(score, 100);
    const risk = score >= 60 ? 'High' : score >= 30 ? 'Medium' : 'Low';
    return { score, risk, flags, attendancePct, lateCount };
};

const calcLeavePrediction = (member, balance, leaveHistory, attendance) => {
    let score = 0;
    const reasons = [];

    // FIX #6 — use computed totalRemaining
    const remaining = totalRemaining(balance);
    if (remaining <= 2) { score += 40; reasons.push('Very low leave balance'); }
    else if (remaining <= 5) { score += 20; reasons.push('Low leave balance'); }

    const recentSick = leaveHistory.filter(l =>
        l.leaveType === 'Sick' &&
        new Date(l.startDate) > dayjs().subtract(14, 'day').toDate()
    ).length;
    if (recentSick >= 1) { score += 30; reasons.push('Recent sick leave pattern'); }

    const absentCount = attendance.filter(a => a.status === 'Absent').length;
    if (absentCount >= 3) { score += 20; reasons.push('Frequent absences'); }

    const thisMonth = dayjs().month() + 1;
    const sameMonthLastYear = leaveHistory.filter(l =>
        dayjs(l.startDate).month() + 1 === thisMonth &&
        dayjs(l.startDate).year() < dayjs().year()
    ).length;
    if (sameMonthLastYear >= 1) { score += 15; reasons.push('Historical leave in this month'); }

    const lateCount = attendance.filter(a => a.status === 'Late').length;
    if (lateCount >= 3) { score += 10; reasons.push('High stress indicators'); }

    score = Math.min(score, 100);
    const likelihood = score >= 60 ? 'High' : score >= 30 ? 'Medium' : 'Low';
    return { score, likelihood, reasons };
};

const calcAttritionScore = (member, burnout, leaveHistory, balance) => {
    let score = 0;
    const reasons = [];

    if (burnout.score >= 60) { score += 35; reasons.push('High burnout score'); }
    else if (burnout.score >= 30) { score += 15; reasons.push('Medium burnout score'); }

    const joiningDate = member.joiningDate ? dayjs(member.joiningDate) : null;
    const tenureMonths = joiningDate ? dayjs().diff(joiningDate, 'month') : 99;
    if (tenureMonths < 6 && burnout.score >= 30) {
        score += 20; reasons.push('Short tenure with stress signals');
    }

    // FIX #6
    const remaining = totalRemaining(balance);
    if (remaining === 0) { score += 15; reasons.push('Zero leave balance'); }

    const rejectedLeaves = leaveHistory.filter(l => l.status === 'Rejected').length;
    if (rejectedLeaves >= 2) { score += 20; reasons.push(`${rejectedLeaves} rejected leave requests`); }

    score = Math.min(score, 100);
    const risk = score >= 60 ? 'High' : score >= 35 ? 'Medium' : 'Low';
    return { score, risk, reasons };
};

// ─── RECRUITMENT HELPERS ──────────────────────────────────────────────────────

const TECH_KEYWORDS = [
    'node', 'react', 'python', 'java', 'aws', 'sql', 'mongodb', 'docker',
    'kubernetes', 'typescript', 'graphql', 'rest', 'api', 'redis', 'git',
    'ci/cd', 'agile', 'scrum', 'html', 'css', 'express', 'django', 'spring',
    'machine learning', 'tensorflow', 'pytorch', 'data analysis', 'tableau',
    'angular', 'vue', 'flutter', 'swift', 'kotlin', 'golang', 'rust',
    'elasticsearch', 'kafka', 'rabbitmq', 'microservices', 'devops',
];

const extractSkillsFromText = (text = '') => {
    const lower = text.toLowerCase();
    return TECH_KEYWORDS.filter(k => lower.includes(k));
};

const scoreResumeAgainstJD = (resumeText = '', jdText = '') => {
    const resumeSkills = extractSkillsFromText(resumeText);
    const jdSkills = extractSkillsFromText(jdText);
    if (!jdSkills.length) return { score: 50, matched: [], missing: [] };
    const matched = resumeSkills.filter(s => jdSkills.includes(s));
    const missing = jdSkills.filter(s => !resumeSkills.includes(s));
    const score = Math.round((matched.length / jdSkills.length) * 100);
    return { score, matched, missing };
};

// ─── HR POLICY CHUNKS ────────────────────────────────────────────────────────

const HR_POLICY_CHUNKS = [
    {
        topic: 'leave policy',
        content: 'Annual entitlement: Sick 7d, Casual 7d, Paid 14d. Maternity 90d, Paternity 15d, Bereavement 5d. Casual/Paid need 1 working-day advance notice. Sick: same-day, medical cert required for 3+ consecutive days. Only Paid leave carries over (max 10 days). Unused Paid leave encashed at year-end if >10 days.',
    },
    {
        topic: 'working hours shift',
        content: 'General shift 9:00 AM–6:00 PM Mon–Fri. Late if check-in after 9:15 AM. Early leave if check-out before 5:45 PM. Half-day absent if present < 4 hours. Night shift: 10 PM–7 AM with shift allowance. Overtime paid above 9 hours with manager approval.',
    },
    {
        topic: 'payroll salary',
        content: 'Monthly cycle. Disbursed last working day. Components: Basic, HRA, Transport, Medical, Bonus, Deductions (PF 12%, TDS as applicable). CTC breakdown available in payslip portal. Salary revision annually in April.',
    },
    {
        topic: 'attendance',
        content: 'Minimum 70% attendance per month. Below 70% triggers HR review and may affect variable pay. Weekend: Saturday & Sunday off. Statuses: Present, Absent, Late, Early Leave, WFH, Holiday. WFH requires manager approval.',
    },
    {
        topic: 'remote work wfh',
        content: 'WFH pre-approved by manager via HRMS. Max 8 WFH days/month for general staff. Managers can override. WFH days count as present for attendance but flagged separately.',
    },
    {
        topic: 'expense reimbursement',
        content: 'Travel reimbursements require manager approval + original bills within 30 days. Medical reimbursements processed monthly with payroll. Meal allowance: ₹150/day on official travel. Accommodation cap: ₹3000/night. Submit via Expenses module.',
    },
    {
        topic: 'recruitment hiring',
        content: 'Vacancies posted internally first for 7 days. External candidates screened by HR. Referral bonus ₹10,000 on successful hire after 3 months. Interview process: screening → technical → HR → offer. Offer validity: 7 days.',
    },
    {
        topic: 'probation notice period',
        content: 'Probation: 3 months. Limited to 3 casual leaves during probation. Notice period: 30 days for employees, 60 days for managers, 90 days for VP+.',
    },
    {
        topic: 'year end settlement',
        content: 'Year-end: December 31. Leave carry-forward processed 1st Jan. Max 10 paid days carry forward. Excess encashed at basic/22 per day. F&F settlement within 45 days of separation.',
    },
    {
        topic: 'shift allowance night differential',
        content: 'Night shift (10 PM–7 AM): ₹2000/month allowance. Rotational shift employees get 2 additional paid leaves/year. Shift roster released monthly by manager.',
    },
];

const searchPolicy = (query) => {
    const q = query.toLowerCase();
    const scored = HR_POLICY_CHUNKS.map(chunk => {
        const words = q.split(/\s+/);
        const hits = words.filter(w => chunk.topic.includes(w) || chunk.content.toLowerCase().includes(w));
        return { chunk, score: hits.length };
    }).filter(r => r.score > 0).sort((a, b) => b.score - a.score);
    return scored.slice(0, 3).map(r => r.chunk.content).join('\n\n');
};

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────

const buildSystemPrompt = (user) => `
You are an intelligent HR Assistant embedded inside an HRMS application.
Understand the employee's intent and return a structured JSON response.

━━━ EMPLOYEE CONTEXT ━━━
Name        : ${user.name || 'Employee'}
Department  : ${user.department || 'N/A'}
Designation : ${user.designation || 'N/A'}
Role        : ${user.role || 'Employee'}

━━━ AVAILABLE ACTIONS ━━━

EMPLOYEE:
- get_leave_balance       → remaining leave days
- get_my_leaves           → my leave history (optional: status, leaveType)
- apply_leave             → REQUIRES: startDate, endDate, leaveType, reason
- cancel_leave            → REQUIRES: leaveId
- get_payslip             → REQUIRES: month (YYYY-MM), optional current month
- get_attendance          → optional: days (default 30)
- get_holidays            → upcoming holidays (optional: year)
- get_profile             → own profile
- get_monthly_summary     → monthly attendance + leave + payslip summary
- policy_search           → REQUIRES: query
- general_answer          → HR FAQ answer in reply field
- clarify                 → ask follow-up if field missing
- submit_expense          → REQUIRES: amount, category, description, date (YYYY-MM-DD)
- get_my_expenses         → my expense claims (optional: status)
- get_notifications       → my unread notifications
- mark_notification_read  → REQUIRES: notificationId
- get_my_shift            → my current shift schedule

MANAGER (Manager/Admin/HR):
- get_team_leaves         → pending team leaves (optional: status)
- approve_leave           → REQUIRES: leaveId
- reject_leave            → REQUIRES: leaveId, rejectionReason
- who_on_leave_tomorrow   → team members absent tomorrow
- get_late_employees      → late arrivals (optional: days)
- get_burnout_report      → team burnout analysis
- get_leave_predictions   → predict team leave likelihood
- get_attrition_predictions → attrition risk
- get_performance_insights  → performance risk signals
- approve_expense         → REQUIRES: expenseId
- reject_expense          → REQUIRES: expenseId, rejectionReason
- get_team_expenses       → team expense claims (optional: status)
- assign_shift            → REQUIRES: employeeId, shiftId, startDate
- get_shift_coverage      → team shift coverage report
- get_team_shifts         → team shift schedule

HR/ADMIN (Admin/HR):
- screen_resume           → REQUIRES: candidateId, jobId
- rank_candidates         → REQUIRES: jobId
- generate_jd             → REQUIRES: role, department, optional: requirements[]
- get_open_positions      → all open job postings
- get_recruitment_summary → hiring funnel summary
- generate_report         → REQUIRES: reportType (leave|attendance|payroll|expense|recruitment)
- get_report_history      → recent generated reports
- get_year_end_summary    → year-end statistics
- carry_forward_leaves    → process carry-forward for all employees
- reset_leave_balances    → reset balances for new year (REQUIRES: year)
- get_company_settings    → company configuration
- update_company_setting  → REQUIRES: key, value
- get_audit_logs          → REQUIRES: optional module, userId, days

━━━ LEAVE TYPES ━━━
Sick | Casual | Paid | Maternity | Paternity | Bereavement | Unpaid

━━━ EXPENSE CATEGORIES ━━━
Travel | Meals | Accommodation | Equipment | Training | Medical | Other

━━━ REPORT TYPES ━━━
leave | attendance | payroll | expense | recruitment | shift | year_end

━━━ RESPONSE FORMAT ━━━
Respond ONLY with valid JSON. No markdown, no code fences.
{
  "action": "<action_name>",
  "params": {},
  "reply": "<short message OR policy answer>",
  "question": "<only when action=clarify>"
}

━━━ KEY RULES ━━━
1. Today: ${today()}. Tomorrow: ${tomorrow()}. Year: ${currentYear()}. Month: ${currentMonth()}.
2. Resolve relative dates (today, tomorrow, next Monday) to YYYY-MM-DD.
3. apply_leave: ALL of startDate, endDate, leaveType, reason required → clarify if any missing.
4. reject_leave / reject_expense: rejectionReason mandatory.
5. submit_expense: amount must be a positive number. date defaults to today if not specified.
6. general_answer: write a clear, policy-accurate "reply".
7. policy_search: extract concise query from user's question.
8. Be concise, friendly, professional.
`.trim();

// ─── INTENT PARSER ────────────────────────────────────────────────────────────

const parseIntent = async (user, userMessage, conversationHistory = []) => {
    if (!process.env.GROQ_API_KEY) {
        const err = new Error('GROQ_API_KEY is not configured');
        err.code = 'CONFIG_ERROR';
        throw err;
    }

    const response = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
            { role: 'system', content: buildSystemPrompt(user) },
            // FIX #3 — explicit role mapping, keep last 10 messages
            ...conversationHistory.slice(-10).map(m => ({
                role: ['assistant', 'user'].includes(m.role) ? m.role : 'user',
                content: String(m.content || ''),
            })),
            { role: 'user', content: userMessage },
        ],
        temperature: 0.1,
        max_tokens: 512,
    });

    const raw = response.choices?.[0]?.message?.content;

    if (!raw) {
        const err = new Error('Empty response from Groq');
        err.code = 'SAFETY_BLOCKED';
        throw err;
    }

    try {
        const cleaned = raw.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
    } catch {
        return {
            action: 'general_answer',
            params: {},
            reply: "Sorry, I couldn't understand that. Could you rephrase?",
        };
    }
};

// ─── PARAM VALIDATION ─────────────────────────────────────────────────────────

const validateParams = (action, params = {}) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const monthRegex = /^\d{4}-\d{2}$/;

    if (action === 'apply_leave') {
        if (!params.startDate || !dateRegex.test(params.startDate))
            return { success: false, message: 'Invalid or missing start date (YYYY-MM-DD)' };
        if (!params.endDate || !dateRegex.test(params.endDate))
            return { success: false, message: 'Invalid or missing end date (YYYY-MM-DD)' };
        if (!params.reason || params.reason.trim().length < 2)
            return { success: false, message: 'Reason is required' };
        if (!params.leaveType || !LEAVE_BALANCE_MAP.hasOwnProperty(params.leaveType))
            return { success: false, message: `Invalid leave type. Valid: ${Object.keys(LEAVE_BALANCE_MAP).join(', ')}` };
        if (dayjs(params.endDate).isBefore(dayjs(params.startDate)))
            return { success: false, message: 'End date cannot be before start date' };
    }

    if (action === 'cancel_leave' && !params.leaveId)
        return { success: false, message: 'leaveId is required' };

    if (action === 'approve_leave' && !params.leaveId)
        return { success: false, message: 'leaveId is required' };

    if (action === 'reject_leave') {
        if (!params.leaveId) return { success: false, message: 'leaveId is required' };
        if (!params.rejectionReason?.trim()) return { success: false, message: 'rejectionReason is required' };
    }

    // FIX #4 — month validation for get_payslip
    if (action === 'get_payslip' && params.month && !monthRegex.test(params.month))
        return { success: false, message: 'month must be in YYYY-MM format' };

    if (action === 'submit_expense') {
        if (!params.amount || isNaN(Number(params.amount)) || Number(params.amount) <= 0)
            return { success: false, message: 'Valid positive amount is required' };
        if (!params.category) return { success: false, message: 'expense category is required' };
        if (!params.description?.trim()) return { success: false, message: 'description is required' };
        if (params.date && !dateRegex.test(params.date))
            return { success: false, message: 'date must be YYYY-MM-DD' };
    }

    if (action === 'approve_expense' && !params.expenseId)
        return { success: false, message: 'expenseId is required' };

    if (action === 'reject_expense') {
        if (!params.expenseId) return { success: false, message: 'expenseId is required' };
        if (!params.rejectionReason?.trim()) return { success: false, message: 'rejectionReason is required' };
    }

    if (action === 'mark_notification_read' && !params.notificationId)
        return { success: false, message: 'notificationId is required' };

    if (action === 'assign_shift') {
        if (!params.employeeId) return { success: false, message: 'employeeId is required' };
        if (!params.shiftId) return { success: false, message: 'shiftId is required' };
        if (!params.startDate || !dateRegex.test(params.startDate))
            return { success: false, message: 'startDate (YYYY-MM-DD) is required' };
    }

    if (action === 'screen_resume') {
        if (!params.candidateId) return { success: false, message: 'candidateId is required' };
        if (!params.jobId) return { success: false, message: 'jobId is required' };
    }

    if (action === 'rank_candidates' && !params.jobId)
        return { success: false, message: 'jobId is required' };

    if (action === 'generate_jd') {
        if (!params.role) return { success: false, message: 'role is required' };
        if (!params.department) return { success: false, message: 'department is required' };
    }

    if (action === 'generate_report' && !params.reportType)
        return { success: false, message: 'reportType is required (leave|attendance|payroll|expense|recruitment|shift|year_end)' };

    if (action === 'reset_leave_balances' && !params.year)
        return { success: false, message: 'year is required' };

    if (action === 'update_company_setting') {
        if (!params.key) return { success: false, message: 'setting key is required' };
        if (params.value === undefined) return { success: false, message: 'setting value is required' };
    }

    if (action === 'policy_search' && !params.query)
        return { success: false, message: 'query is required' };

    return { success: true };
};

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────

const ACTION_AUDIT_MAP = {
    get_profile: 'PROFILE_VIEW',
    apply_leave: 'LEAVE_APPLY',
    cancel_leave: 'LEAVE_CANCEL',
    approve_leave: 'LEAVE_APPROVE',
    reject_leave: 'LEAVE_REJECT',
    submit_expense: 'EXPENSE_SUBMIT',
    approve_expense: 'EXPENSE_APPROVE',
    reject_expense: 'EXPENSE_REJECT',
    assign_shift: 'SHIFT_ASSIGN',
    carry_forward_leaves: 'YEAR_END_CARRY_FORWARD',
    reset_leave_balances: 'YEAR_END_RESET',
    update_company_setting: 'SETTINGS_UPDATE',
    policy_search: 'POLICY_SEARCH',
    generate_report: 'REPORT_GENERATE',
};

const writeAuditLog = async (userId, action, params, result) => {
    try {
        await AuditLog.create({
            userId,
            moduleName: 'AI',
            actionType: ACTION_AUDIT_MAP[action] || 'CHAT',
            newData: { action, params, reply: result?.text },
            timestamp: new Date(),
            createdAt: new Date(),
        });
    } catch {
        // silent — never crash the main flow
    }
};

// ─── NOTIFICATION HELPER ──────────────────────────────────────────────────────

const createNotification = async (userId, message, type = 'INFO') => {
    try {
        if (!Notification) return;
        await Notification.create({ userId, message, type, isRead: false, createdAt: new Date() });
    } catch {
        // silent
    }
};

// ─── HANDLERS ────────────────────────────────────────────────────────────────

const handlers = {

    // ── LEAVE ─────────────────────────────────────────────────────────────────

    get_leave_balance: async (user) => {
        const balance = await LeaveBalance.findOne({
            where: { employeeId: user.id, year: currentYear() },
        });
        if (!balance) return { text: 'No leave balance record found for this year.', data: null };

        // FIX #6 — compute totalRemaining from individual fields
        const remaining = totalRemaining(balance);

        return {
            text: `Leave balance — Total remaining: ${remaining} days | Sick: ${balance.sickRemaining ?? 0}, Casual: ${balance.casualRemaining ?? 0}, Paid: ${balance.paidRemaining ?? 0}, Maternity: ${balance.maternityRemaining ?? 0}, Paternity: ${balance.paternityRemaining ?? 0}, Bereavement: ${balance.bereavementRemaining ?? 0}`,
            data: {
                type: 'leave_balance',
                balance: {
                    ...balance.toJSON(),
                    totalRemaining: remaining,
                },
            },
        };
    },

    get_my_leaves: async (user, params) => {
        const where = { employeeId: user.id };
        if (params.status) where.status = params.status;
        if (params.leaveType) where.leaveType = params.leaveType;
        if (params.year) where[Op.and] = [Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('startDate')), params.year)];

        const leaves = await LeaveRequest.findAll({
            where,
            limit: 15,
            order: [['createdAt', 'DESC']],
        });

        return {
            text: leaves.length ? `Found ${leaves.length} leave request(s)` : 'No leave requests found',
            data: { type: 'leave_list', leaves },
        };
    },

    apply_leave: async (user, params) => {
        const days = calculateWorkingDays(params.startDate, params.endDate);
        const leaveType = params.leaveType || 'Casual';
        const balanceField = LEAVE_BALANCE_MAP[leaveType];

        if (balanceField !== null) {
            const balance = await LeaveBalance.findOne({
                where: { employeeId: user.id, year: currentYear() },
            });
            if (balance && balance[balanceField] !== undefined && balance[balanceField] < days) {
                return {
                    text: `Insufficient ${leaveType} balance. You have ${balance[balanceField]} day(s) but requested ${days}.`,
                    data: null,
                };
            }
        }

        if (!user.managerId) {
            return { text: 'You are not assigned to any manager. Please contact HR.', data: null };
        }

        const leave = await LeaveRequest.create({
            companyId: user.company_id,
            employeeId: user.id,
            managerId: user.managerId,
            startDate: params.startDate,
            endDate: params.endDate,
            leaveType,
            reason: params.reason,
            daysRequested: days,
            status: 'Pending',
        });

        // Notify manager
        await createNotification(
            user.managerId,
            `${user.name} applied for ${leaveType} leave (${params.startDate} to ${params.endDate}). Please review.`,
            'LEAVE_REQUEST'
        );

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
        if (leave.status !== 'Pending')
            return { text: `Cannot cancel a leave that is already ${leave.status}.`, data: null };

        await leave.update({ status: 'Cancelled' });
        return {
            text: `Leave ${params.leaveId} cancelled successfully.`,
            data: { type: 'leave_cancelled', leave },
        };
    },

    get_team_leaves: async (user, params) => {
        const status = params.status || 'Pending';
        const leaves = await LeaveRequest.findAll({
            where: { managerId: user.id, status },
            include: [{
                model: User,
                as: 'employee',
                attributes: ['designation', ['first_name', 'firstName'], ['last_name', 'lastName']],
            }],
            order: [['createdAt', 'ASC']],
        });

        return {
            text: leaves.length ? `${leaves.length} ${status.toLowerCase()} leave request(s) from your team` : `No ${status.toLowerCase()} team leaves`,
            data: { type: 'team_leave_list', leaves },
        };
    },

    approve_leave: async (user, params) => {
        const leave = await LeaveRequest.findOne({ where: { id: params.leaveId, managerId: user.id } });
        if (!leave) return { text: `Leave ${params.leaveId} not found in your team.`, data: null };
        if (leave.status !== 'Pending') return { text: `Leave is already ${leave.status}.`, data: null };

        await leave.update({ status: 'Approved', approvedAt: new Date(), approvedBy: user.id });

        // Notify employee
        await createNotification(
            leave.employeeId,
            `Your ${leave.leaveType} leave (${leave.startDate} to ${leave.endDate}) has been approved.`,
            'LEAVE_APPROVED'
        );

        return {
            text: `Leave ${params.leaveId} approved successfully.`,
            data: { type: 'leave_approved', leave },
        };
    },

    reject_leave: async (user, params) => {
        const leave = await LeaveRequest.findOne({ where: { id: params.leaveId, managerId: user.id } });
        if (!leave) return { text: `Leave ${params.leaveId} not found in your team.`, data: null };
        if (leave.status !== 'Pending') return { text: `Leave is already ${leave.status}.`, data: null };

        await leave.update({
            status: 'Rejected',
            rejectedAt: new Date(),
            rejectedBy: user.id,
            rejectionReason: params.rejectionReason,
        });

        await createNotification(
            leave.employeeId,
            `Your ${leave.leaveType} leave (${leave.startDate} to ${leave.endDate}) was rejected. Reason: ${params.rejectionReason}`,
            'LEAVE_REJECTED'
        );

        return {
            text: `Leave ${params.leaveId} rejected.`,
            data: { type: 'leave_rejected', leave },
        };
    },

    who_on_leave_tomorrow: async (user) => {
        const tmr = dayjs().add(1, 'day').startOf('day').toDate();
        const leaves = await LeaveRequest.findAll({
            where: {
                managerId: user.id,
                status: 'Approved',
                startDate: { [Op.lte]: tmr },
                endDate: { [Op.gte]: tmr },
            },
            include: [{
                model: User,
                as: 'employee',
                attributes: ['first_name', 'last_name', 'designation', 'department'],
            }],
        });

        return {
            text: leaves.length
                ? `${leaves.length} team member(s) on leave tomorrow`
                : 'No one from your team is on leave tomorrow',
            data: { type: 'on_leave_tomorrow', leaves, date: tomorrow() },
        };
    },

    // ── PAYROLL ───────────────────────────────────────────────────────────────

    get_payslip: async (user, params) => {
        const where = { employeeId: user.id };

        if (params.month) {
            // FIX #4 — parse month correctly, stored as integers in DB
            const [yr, mo] = params.month.split('-').map(Number);
            where.year = yr;
            where.month = mo;
        }

        const payslip = await Payroll.findOne({
            where,
            order: [['year', 'DESC'], ['month', 'DESC']],
        });

        if (!payslip) return { text: 'No payslip found for the requested period.', data: null };

        const gross = (payslip.basicSalary ?? 0) + (payslip.hra ?? 0) + (payslip.transportAllowance ?? 0) + (payslip.medicalAllowance ?? 0) + (payslip.bonus ?? 0);
        const deduction = (payslip.pfDeduction ?? 0) + (payslip.tdsDeduction ?? 0) + (payslip.otherDeductions ?? 0);

        return {
            text: `Payslip ${payslip.month}/${payslip.year}: Gross ₹${gross.toLocaleString('en-IN')} | Deductions ₹${deduction.toLocaleString('en-IN')} | Net ₹${(payslip.netSalary ?? 0).toLocaleString('en-IN')}`,
            data: {
                type: 'payslip',
                payslip: {
                    ...payslip.toJSON(),
                    grossSalary: gross,
                    totalDeductions: deduction,
                },
            },
        };
    },

    // ── ATTENDANCE ────────────────────────────────────────────────────────────

    get_attendance: async (user, params) => {
        const days = Math.min(Number(params.days) || 30, 365);

        const [records, summary] = await Promise.all([
            Attendance.findAll({
                where: { employeeId: user.id, date: { [Op.gte]: nDaysAgo(days) } },
                order: [['date', 'DESC']],
            }),
            Attendance.findAll({
                attributes: [
                    'status',
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
                ],
                where: { employeeId: user.id, date: { [Op.gte]: nDaysAgo(days) } },
                group: ['status'],
                raw: true,
            }),
        ]);

        const countMap = summary.reduce((acc, r) => {
            acc[r.status] = parseInt(r.count);
            return acc;
        }, {});

        const present = countMap['Present'] || 0;
        const absent = countMap['Absent'] || 0;
        const late = countMap['Late'] || 0;
        // FIX #1 — match actual DB status string for WFH
        const wfh = countMap['WFH'] || countMap['Work From Home'] || 0;
        const earlyLeave = countMap['Early Leave'] || 0;
        const holiday = countMap['Holiday'] || 0;
        const total = records.length;

        // FIX #2 — exclude holidays from denominator
        const workingTotal = total - holiday;
        const pct = workingTotal > 0 ? Math.round((present / workingTotal) * 100) : 0;

        return {
            text: `Last ${days} days — Present: ${present}, Absent: ${absent}, Late: ${late}, WFH: ${wfh}, Early Leave: ${earlyLeave} | Attendance: ${pct}%`,
            data: {
                type: 'attendance',
                summary: { present, absent, late, wfh, earlyLeave, holiday, total, pct, days },
                records,
            },
        };
    },

    get_late_employees: async (user, params) => {
        const days = Number(params.days) || 7;
        const teamMembers = await User.findAll({
            where: { managerId: user.id },
            attributes: ['id', 'first_name', 'last_name', 'designation'],
        });
        if (!teamMembers.length) return { text: 'No team members found.', data: null };

        const teamIds = teamMembers.map(m => m.id);
        const lateCounts = await Attendance.findAll({
            attributes: [
                'employeeId',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'lateCount'],
            ],
            where: {
                employeeId: { [Op.in]: teamIds },
                status: 'Late',
                date: { [Op.gte]: nDaysAgo(days) },
            },
            group: ['employeeId'],
            raw: true,
        });

        const countById = lateCounts.reduce((acc, r) => {
            acc[r.employeeId] = parseInt(r.lateCount);
            return acc;
        }, {});

        const summary = teamMembers
            .filter(m => countById[m.id])
            .map(m => ({
                employee: { id: m.id, name: `${m.first_name} ${m.last_name}`, designation: m.designation },
                count: countById[m.id],
            }))
            .sort((a, b) => b.count - a.count);

        return {
            text: summary.length
                ? `${summary.length} team member(s) had late arrivals in the last ${days} days`
                : `No late arrivals in your team in the last ${days} days`,
            data: { type: 'late_employees', employees: summary, days },
        };
    },

    get_holidays: async (_user, params) => {
        const year = params.year || currentYear();
        const all = [
            { date: `${year}-01-26`, name: 'Republic Day' },
            { date: `${year}-03-17`, name: 'Holi' },
            { date: `${year}-04-14`, name: 'Dr. Ambedkar Jayanti' },
            { date: `${year}-05-01`, name: 'Labour Day' },
            { date: `${year}-08-15`, name: 'Independence Day' },
            { date: `${year}-10-02`, name: 'Gandhi Jayanti' },
            { date: `${year}-10-20`, name: 'Dussehra' },
            { date: `${year}-11-05`, name: 'Diwali' },
            { date: `${year}-12-25`, name: 'Christmas Day' },
        ].filter(h => dayjs(h.date).isAfter(dayjs()) || dayjs(h.date).isSame(dayjs(), 'day'));

        return {
            text: `${all.length} upcoming public holiday(s) in ${year}`,
            data: { type: 'holidays', holidays: all },
        };
    },

    // ── PROFILE ───────────────────────────────────────────────────────────────

    get_profile: async (user) => {
        const profile = await User.findOne({
            where: { id: user.id },
            attributes: [
                'id', 'email', 'designation', 'department',
                ['employee_code', 'employeeCode'],
                ['manager_id', 'managerId'],
                ['first_name', 'firstName'],
                ['last_name', 'lastName'],
                ['joining_date', 'joiningDate'],
                ['role_id', 'roleId'],
            ],
        });
        if (!profile) return { text: 'Profile not found.', data: null };

        return {
            text: `Profile: ${profile.firstName} ${profile.lastName} — ${profile.designation || 'Employee'
                }, ${profile.department || 'N/A'} (Employee Code: ${profile.employeeCode
                }) | Joined: ${profile.joiningDate
                    ? dayjs(profile.joiningDate).format('MMM D, YYYY')
                    : 'N/A'
                }`,

            data: {
                type: 'profile',
                profile,
            },
        };
    },

    // ── MONTHLY SUMMARY ───────────────────────────────────────────────────────

    get_monthly_summary: async (user) => {

        const startOfMonth = dayjs()
            .startOf('month')
            .format('YYYY-MM-DD');

        const endOfMonth = dayjs()
            .endOf('month')
            .format('YYYY-MM-DD');

        const [attendanceSummary, leaveHistory, payslip, balance] =
            await Promise.all([

                Attendance.findAll({
                    attributes: [
                        'status',
                        [
                            Sequelize.fn(
                                'COUNT',
                                Sequelize.col('id')
                            ),
                            'count',
                        ],
                    ],

                    where: {
                        employeeId: user.id,

                        date: {
                            [Op.between]: [
                                startOfMonth,
                                endOfMonth,
                            ],
                        },
                    },

                    group: ['status'],
                    raw: true,
                }),

                LeaveRequest.findAll({
                    where: {
                        employeeId: user.id,

                        startDate: {
                            [Op.between]: [
                                startOfMonth,
                                endOfMonth,
                            ],
                        },
                    },
                }),

                Payroll.findOne({
                    where: {
                        employeeId: user.id,
                        year: currentYear(),
                        month: currentMonthNum(),
                    },
                }),

                LeaveBalance.findOne({
                    where: {
                        employeeId: user.id,
                        year: currentYear(),
                    },
                }),
            ]);

        const countMap = attendanceSummary.reduce((acc, r) => {
            acc[r.status] = Number(r.count);
            return acc;
        }, {});

        const present = countMap.Present || 0;
        const absent = countMap.Absent || 0;
        const late = countMap.Late || 0;
        const holiday = countMap.Holiday || 0;

        const total = Object.values(countMap)
            .reduce((s, v) => s + v, 0);

        const working = total - holiday;

        const attended = present + late;

        const pct =
            working > 0
                ? Math.round((attended / working) * 100)
                : 0;

        const remaining = balance
            ? totalRemaining(balance)
            : 0;

        const approvedLeaves = leaveHistory.filter(
            (l) => l.status === 'Approved'
        ).length;

        const actualAbsent = Math.max(
            absent - approvedLeaves,
            0
        );

        const suggestions = [];

        if (pct < 70) {
            suggestions.push(
                '⚠ Attendance below 70% — HR review may be triggered.'
            );
        }

        if (late >= 3) {
            suggestions.push(
                `⚠ ${late} late arrivals this month.`
            );
        }

        if (remaining <= 3) {
            suggestions.push(
                `⚠ Only ${remaining} leave day(s) remaining.`
            );
        }

        if (
            remaining >= 10 &&
            dayjs().month() >= 9
        ) {
            suggestions.push(
                `💡 ${remaining} unused leave days remain.`
            );
        }

        if (actualAbsent === 0) {
            suggestions.push(
                '✓ Perfect attendance this month.'
            );
        }

        if (!suggestions.length) {
            suggestions.push(
                '✓ Everything looks healthy this month.'
            );
        }

        return {
            text:
                `Monthly summary for ` +
                `${currentMonth()} ${currentYear()}: ` +
                `${pct}% attendance, ` +
                `${leaveHistory.length} leave request(s), ` +
                `${remaining} leave days remaining.`,

            data: {
                type: 'monthly_summary',

                attendance: {
                    present,
                    absent: actualAbsent,
                    late,
                    holiday,
                    total: working,
                    attended,
                    pct,
                },

                leaves: leaveHistory.length,

                payslip: payslip
                    ? {
                        net: payslip.netSalary,
                        month: payslip.month,
                        year: payslip.year,
                    }
                    : null,

                balance: balance
                    ? {
                        remaining,
                        sick: balance.sickRemaining,
                        casual: balance.casualRemaining,
                        paid: balance.paidRemaining,
                        maternity: balance.maternityRemaining,
                        paternity: balance.paternityRemaining,
                        bereavement:
                            balance.bereavementRemaining,
                    }
                    : null,

                suggestions,
            },
        };
    },

    // ── ANALYTICS ─────────────────────────────────────────────────────────────

    get_burnout_report: async (user) => {
        const teamMembers = await User.findAll({
            where: { managerId: user.id },
            attributes: ['id', 'designation', 'department',
                [Sequelize.literal("CONCAT(first_name, ' ', last_name)"), 'name']],
        });
        if (!teamMembers.length) return { text: 'No team members found.', data: null };

        const teamIds = teamMembers.map(m => m.id);
        const thirtyAgo = nDaysAgo(30);

        const [allAttendance, allLeaves] = await Promise.all([
            Attendance.findAll({ where: { employeeId: { [Op.in]: teamIds }, date: { [Op.gte]: thirtyAgo } } }),
            LeaveRequest.findAll({ where: { employeeId: { [Op.in]: teamIds }, createdAt: { [Op.gte]: thirtyAgo } } }),
        ]);

        const results = teamMembers.map(member => {
            const att = allAttendance.filter(a => a.employeeId === member.id);
            const leaves = allLeaves.filter(l => l.employeeId === member.id);
            const { score, risk, flags, attendancePct, lateCount } = calcBurnoutScore(att, leaves);
            return {
                employee: { id: member.id, name: member.get('name'), designation: member.designation },
                score, risk, flags, attendancePct, lateCount,
            };
        }).sort((a, b) => b.score - a.score);

        const highRisk = results.filter(r => r.risk === 'High').length;
        const mediumRisk = results.filter(r => r.risk === 'Medium').length;

        return {
            text: `Burnout report: ${highRisk} high risk, ${mediumRisk} medium risk out of ${results.length} members`,
            data: { type: 'burnout_report', employees: results, summary: { highRisk, mediumRisk, total: results.length } },
        };
    },

    get_leave_predictions: async (user) => {
        const teamMembers = await User.findAll({
            where: { managerId: user.id },
            attributes: ['id', 'designation', 'department', 'joiningDate',
                [Sequelize.literal("CONCAT(first_name, ' ', last_name)"), 'name']],
        });
        if (!teamMembers.length) return { text: 'No team members found.', data: null };

        const teamIds = teamMembers.map(m => m.id);
        const [allAttendance, allLeaves, allBalances] = await Promise.all([
            Attendance.findAll({ where: { employeeId: { [Op.in]: teamIds }, date: { [Op.gte]: nDaysAgo(30) } } }),
            LeaveRequest.findAll({ where: { employeeId: { [Op.in]: teamIds } } }),
            LeaveBalance.findAll({ where: { employeeId: { [Op.in]: teamIds }, year: currentYear() } }),
        ]);

        const results = teamMembers.map(member => {
            const att = allAttendance.filter(a => a.employeeId === member.id);
            const leaves = allLeaves.filter(l => l.employeeId === member.id);
            const balance = allBalances.find(b => b.employeeId === member.id);
            const { score, likelihood, reasons } = calcLeavePrediction(member, balance, leaves, att);
            return {
                employee: { id: member.id, name: member.get('name'), designation: member.designation },
                score, likelihood, reasons,
                remainingDays: totalRemaining(balance),  // FIX #6
            };
        }).sort((a, b) => b.score - a.score);

        const high = results.filter(r => r.likelihood === 'High').length;
        return {
            text: `Leave predictions: ${high} team member(s) likely to take leave soon`,
            data: { type: 'leave_predictions', employees: results },
        };
    },

    get_attrition_predictions: async (user) => {
        const teamMembers = await User.findAll({
            where: { managerId: user.id },
            attributes: ['id', 'designation', 'department', 'joiningDate',
                [Sequelize.literal("CONCAT(first_name, ' ', last_name)"), 'name']],
        });
        if (!teamMembers.length) return { text: 'No team members found.', data: null };

        const teamIds = teamMembers.map(m => m.id);
        const [allAttendance, allLeaves, allBalances] = await Promise.all([
            Attendance.findAll({ where: { employeeId: { [Op.in]: teamIds }, date: { [Op.gte]: nDaysAgo(30) } } }),
            LeaveRequest.findAll({ where: { employeeId: { [Op.in]: teamIds } } }),
            LeaveBalance.findAll({ where: { employeeId: { [Op.in]: teamIds }, year: currentYear() } }),
        ]);

        const results = teamMembers.map(member => {
            const att = allAttendance.filter(a => a.employeeId === member.id);
            const leaves = allLeaves.filter(l => l.employeeId === member.id);
            const balance = allBalances.find(b => b.employeeId === member.id);
            const burnout = calcBurnoutScore(att, leaves);
            const { score, risk, reasons } = calcAttritionScore(member, burnout, leaves, balance);
            return {
                employee: { id: member.id, name: member.get('name'), designation: member.designation },
                score, risk, reasons, burnoutScore: burnout.score,
            };
        }).sort((a, b) => b.score - a.score);

        const highRisk = results.filter(r => r.risk === 'High').length;
        return {
            text: `Attrition risk: ${highRisk} team member(s) at high risk of leaving`,
            data: { type: 'attrition_predictions', employees: results },
        };
    },

    get_performance_insights: async (user) => {
        const teamMembers = await User.findAll({
            where: { managerId: user.id },
            attributes: ['id', 'designation', 'department',
                [Sequelize.literal("CONCAT(first_name, ' ', last_name)"), 'name']],
        });
        if (!teamMembers.length) return { text: 'No team members found.', data: null };

        const teamIds = teamMembers.map(m => m.id);
        const attendanceStats = await Attendance.findAll({
            attributes: [
                'employeeId', 'status',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
            ],
            where: { employeeId: { [Op.in]: teamIds }, date: { [Op.gte]: nDaysAgo(30) } },
            group: ['employeeId', 'status'],
            raw: true,
        });

        const statMap = {};
        for (const row of attendanceStats) {
            if (!statMap[row.employeeId]) statMap[row.employeeId] = {};
            statMap[row.employeeId][row.status] = parseInt(row.count);
        }

        const results = teamMembers.map(member => {
            const stats = statMap[member.id] || {};
            const present = stats['Present'] || 0;
            const absent = stats['Absent'] || 0;
            const late = stats['Late'] || 0;
            const holiday = stats['Holiday'] || 0;
            const total = Object.values(stats).reduce((s, v) => s + v, 0) || 1;
            const working = total - holiday || 1;
            const pct = Math.round((present / working) * 100);

            let performanceRisk = 'Low';
            const flags = [];
            if (pct < 70) { performanceRisk = 'High'; flags.push(`${pct}% attendance`); }
            else if (pct < 80) { performanceRisk = 'Medium'; flags.push(`${pct}% attendance`); }
            if (late >= 3) flags.push(`${late} late arrivals`);
            if (absent >= 5) { performanceRisk = 'High'; flags.push(`${absent} absences`); }

            return {
                employee: { id: member.id, name: member.get('name'), designation: member.designation },
                attendancePct: pct, lateCount: late, absentCount: absent,
                performanceRisk, flags,
            };
        }).sort((a, b) => a.attendancePct - b.attendancePct);

        const highRisk = results.filter(r => r.performanceRisk === 'High').length;
        return {
            text: `Performance insights: ${highRisk} team member(s) at performance risk`,
            data: { type: 'performance_insights', employees: results },
        };
    },

    // ── EXPENSES ──────────────────────────────────────────────────────────────

    submit_expense: async (user, params) => {
        if (!Expense) return { text: 'Expense module not available.', data: null };

        const expense = await Expense.create({
            companyId: user.company_id,
            employeeId: user.id,
            managerId: user.managerId,
            amount: Number(params.amount),
            category: params.category,
            description: params.description,
            expenseDate: params.date || today(),
            status: 'Pending',
            receiptUrl: params.receiptUrl || null,
        });

        if (user.managerId) {
            await createNotification(
                user.managerId,
                `${user.name} submitted a ₹${params.amount} ${params.category} expense claim. Review required.`,
                'EXPENSE_REQUEST'
            );
        }

        return {
            text: `✓ Expense of ₹${params.amount} (${params.category}) submitted. Awaiting manager approval.`,
            data: { type: 'expense_submitted', expense },
        };
    },

    get_my_expenses: async (user, params) => {
        if (!Expense) return { text: 'Expense module not available.', data: null };

        const where = { employeeId: user.id };
        if (params.status) where.status = params.status;
        if (params.category) where.category = params.category;

        const expenses = await Expense.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: 20,
        });

        const total = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

        return {
            text: expenses.length
                ? `${expenses.length} expense claim(s) — Total: ₹${total.toLocaleString('en-IN')}`
                : 'No expense claims found',
            data: { type: 'expense_list', expenses, total },
        };
    },

    get_expense_summary: async (user) => {
        if (!Expense) return { text: 'Expense module not available.', data: null };

        const summary = await Expense.findAll({
            attributes: [
                'category',
                'status',
                [Sequelize.fn('SUM', Sequelize.col('amount')), 'total'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
            ],
            where: {
                employeeId: user.id,
                createdAt: { [Op.gte]: nDaysAgo(365) },
            },
            group: ['category', 'status'],
            raw: true,
        });

        return {
            text: `Expense summary for the past year (${summary.length} category/status combinations)`,
            data: { type: 'expense_summary', summary },
        };
    },

    get_team_expenses: async (user, params) => {
        if (!Expense) return { text: 'Expense module not available.', data: null };

        const where = { managerId: user.id };
        if (params.status) where.status = params.status;

        const expenses = await Expense.findAll({
            where,
            include: [{
                model: User,
                as: 'employee',
                attributes: ['first_name', 'last_name', 'designation'],
            }],
            order: [['createdAt', 'DESC']],
        });

        const total = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

        return {
            text: expenses.length
                ? `${expenses.length} team expense claim(s) — Total: ₹${total.toLocaleString('en-IN')}`
                : 'No team expense claims found',
            data: { type: 'team_expense_list', expenses, total },
        };
    },

    approve_expense: async (user, params) => {
        if (!Expense) return { text: 'Expense module not available.', data: null };

        const expense = await Expense.findOne({ where: { id: params.expenseId, managerId: user.id } });
        if (!expense) return { text: `Expense ${params.expenseId} not found.`, data: null };
        if (expense.status !== 'Pending') return { text: `Expense is already ${expense.status}.`, data: null };

        await expense.update({ status: 'Approved', approvedAt: new Date(), approvedBy: user.id });

        await createNotification(
            expense.employeeId,
            `Your ₹${expense.amount} ${expense.category} expense claim has been approved.`,
            'EXPENSE_APPROVED'
        );

        return {
            text: `Expense ${params.expenseId} approved.`,
            data: { type: 'expense_approved', expense },
        };
    },

    reject_expense: async (user, params) => {
        if (!Expense) return { text: 'Expense module not available.', data: null };

        const expense = await Expense.findOne({ where: { id: params.expenseId, managerId: user.id } });
        if (!expense) return { text: `Expense ${params.expenseId} not found.`, data: null };
        if (expense.status !== 'Pending') return { text: `Expense is already ${expense.status}.`, data: null };

        await expense.update({
            status: 'Rejected',
            rejectedAt: new Date(),
            rejectedBy: user.id,
            rejectionReason: params.rejectionReason,
        });

        await createNotification(
            expense.employeeId,
            `Your ₹${expense.amount} ${expense.category} expense claim was rejected. Reason: ${params.rejectionReason}`,
            'EXPENSE_REJECTED'
        );

        return {
            text: `Expense ${params.expenseId} rejected.`,
            data: { type: 'expense_rejected', expense },
        };
    },

    // ── NOTIFICATIONS ─────────────────────────────────────────────────────────

    get_notifications: async (user, params) => {
        if (!Notification) return { text: 'Notification module not available.', data: null };

        const where = { userId: user.id };
        if (!params.all) where.isRead = false;

        const notifications = await Notification.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: 20,
        });

        return {
            text: notifications.length
                ? `${notifications.length} notification(s)${params.all ? '' : ' unread'}`
                : 'No unread notifications',
            data: { type: 'notifications', notifications },
        };
    },

    mark_notification_read: async (user, params) => {
        if (!Notification) return { text: 'Notification module not available.', data: null };

        const notif = await Notification.findOne({ where: { id: params.notificationId, userId: user.id } });
        if (!notif) return { text: `Notification ${params.notificationId} not found.`, data: null };

        await notif.update({ isRead: true, readAt: new Date() });
        return {
            text: 'Notification marked as read.',
            data: { type: 'notification_read', notif },
        };
    },

    // ── SHIFTS ────────────────────────────────────────────────────────────────

    get_my_shift: async (user) => {
        if (!ShiftAssignment) {
            return {
                text: 'Shift module not available.',
                data: null,
            };
        }

        const currentDate = today();

        const assignment = await ShiftAssignment.findOne({
            where: {
                employeeId: user.id,
                isActive: true,

                effectiveFrom: {
                    [Op.lte]: currentDate,
                },

                [Op.or]: [
                    { effectiveTo: null },
                    {
                        effectiveTo: {
                            [Op.gte]: currentDate,
                        },
                    },
                ],
            },

            include: [
                {
                    model: Shift,
                    as: 'shift',
                },
            ],

            order: [['effectiveFrom', 'DESC']],
        });

        if (!assignment) {
            return {
                text: 'No active shift assignment found.',
                data: null,
            };
        }

        const s = assignment.shift;

        return {
            text: `Current shift: ${s?.name || 'N/A'} | ${s?.startTime || '?'} – ${s?.endTime || '?'}`,
            data: {
                type: 'my_shift',
                assignment,
                shift: s,
            },
        };
    },

    get_team_shifts: async (user) => {
        if (!ShiftAssignment) {
            return {
                text: 'Shift module not available.',
                data: null,
            };
        }

        const currentDate = today();

        const teamMembers = await User.findAll({
            where: {
                managerId: user.id,
            },

            attributes: [
                'id',
                'first_name',
                'last_name',
                'designation',
            ],
        });

        if (!teamMembers.length) {
            return {
                text: 'No team members found.',
                data: null,
            };
        }

        const teamIds = teamMembers.map((m) => m.id);

        const assignments = await ShiftAssignment.findAll({
            where: {
                employeeId: {
                    [Op.in]: teamIds,
                },

                isActive: true,

                effectiveFrom: {
                    [Op.lte]: currentDate,
                },

                [Op.or]: [
                    { effectiveTo: null },
                    {
                        effectiveTo: {
                            [Op.gte]: currentDate,
                        },
                    },
                ],
            },

            include: [
                {
                    model: Shift,
                    as: 'shift',
                },
                {
                    model: User,
                    as: 'employee',
                    attributes: [
                        'first_name',
                        'last_name',
                        'designation',
                    ],
                },
            ],

            order: [['effectiveFrom', 'DESC']],
        });

        return {
            text: `${assignments.length} active shift assignment(s) in your team`,
            data: {
                type: 'team_shifts',
                assignments,
            },
        };
    },

    assign_shift: async (user, params) => {
        if (!ShiftAssignment) {
            return {
                text: 'Shift module not available.',
                data: null,
            };
        }

        const [employee, shift] = await Promise.all([
            User.findOne({
                where: {
                    id: params.employeeId,
                    managerId: user.id,
                },
            }),

            Shift?.findByPk(params.shiftId),
        ]);

        if (!employee) {
            return {
                text: `Employee ${params.employeeId} not found in your team.`,
                data: null,
            };
        }

        if (!shift) {
            return {
                text: `Shift ${params.shiftId} not found.`,
                data: null,
            };
        }

        // Check existing active assignment
        const existingAssignment = await ShiftAssignment.findOne({
            where: {
                employeeId: params.employeeId,
                isActive: true,

                [Op.or]: [
                    { effectiveTo: null },
                    {
                        effectiveTo: {
                            [Op.gte]: params.effectiveFrom,
                        },
                    },
                ],
            },
        });

        if (existingAssignment) {
            return {
                text: 'Employee already has an active shift assignment.',
                data: null,
            };
        }

        const assignment = await ShiftAssignment.create({
            companyId: user.companyId,
            employeeId: params.employeeId,
            shiftId: params.shiftId,

            effectiveFrom: params.effectiveFrom,
            effectiveTo: params.effectiveTo || null,

            assignedBy: user.id,
            isActive: true,
        });

        await createNotification(
            params.employeeId,
            `You have been assigned to ${shift.name} shift starting ${params.effectiveFrom}.`,
            'SHIFT_ASSIGNED'
        );

        return {
            text: `✓ ${employee.first_name} ${employee.last_name} assigned to ${shift.name} shift from ${params.effectiveFrom}.`,
            data: {
                type: 'shift_assigned',
                assignment,
            },
        };
    },

    get_shift_coverage: async (user) => {
        if (!ShiftAssignment) {
            return {
                text: 'Shift module not available.',
                data: null,
            };
        }

        const currentDate = today();

        const teamMembers = await User.findAll({
            where: {
                managerId: user.id,
            },

            attributes: [
                'id',
                'first_name',
                'last_name',
            ],
        });

        if (!teamMembers.length) {
            return {
                text: 'No team members found.',
                data: null,
            };
        }

        const teamIds = teamMembers.map((m) => m.id);

        const assignments = await ShiftAssignment.findAll({
            where: {
                employeeId: {
                    [Op.in]: teamIds,
                },

                isActive: true,

                effectiveFrom: {
                    [Op.lte]: currentDate,
                },

                [Op.or]: [
                    { effectiveTo: null },
                    {
                        effectiveTo: {
                            [Op.gte]: currentDate,
                        },
                    },
                ],
            },

            include: [
                {
                    model: Shift,
                    as: 'shift',
                },
            ],
        });

        const assignedIds = new Set(
            assignments.map((a) => a.employeeId)
        );

        const unassigned = teamMembers.filter(
            (m) => !assignedIds.has(m.id)
        );

        return {
            text: `Shift coverage: ${assignments.length}/${teamMembers.length} assigned, ${unassigned.length} unassigned`,

            data: {
                type: 'shift_coverage',

                totalTeam: teamMembers.length,

                assigned: assignments.length,

                unassigned: unassigned.map((m) => ({
                    id: m.id,
                    name: `${m.first_name} ${m.last_name}`,
                })),

                assignments,
            },
        };
    },

    // ── RECRUITMENT ───────────────────────────────────────────────────────────

    screen_resume: async (_user, params) => {
        const [candidate, job] = await Promise.all([
            Candidate.findByPk(params.candidateId),
            JobPosting.findByPk(params.jobId),
        ]);

        if (!candidate) return { text: `Candidate ${params.candidateId} not found.`, data: null };
        if (!job) return { text: `Job posting ${params.jobId} not found.`, data: null };

        const { score, matched, missing } = scoreResumeAgainstJD(
            candidate.resumeText || '',
            job.description || '',
        );

        await candidate.update({ fitScore: score, screenedAt: new Date(), screenedForJob: params.jobId });

        const verdict = score >= 70 ? 'Strong fit' : score >= 45 ? 'Moderate fit' : 'Weak fit';

        return {
            text: `${candidate.name}: ${verdict} (${score}/100). Matched: ${matched.join(', ') || 'none'}. Missing: ${missing.join(', ') || 'none'}.`,
            data: { type: 'resume_screening', candidate: candidate.name, job: job.title, score, matched, missing, verdict },
        };
    },

    rank_candidates: async (_user, params) => {
        const job = await JobPosting.findByPk(params.jobId);
        if (!job) return { text: `Job posting ${params.jobId} not found.`, data: null };

        const candidates = await Candidate.findAll({
            where: { screenedForJob: params.jobId },
            order: [['fitScore', 'DESC']],
        });

        if (!candidates.length) {
            return { text: 'No screened candidates for this job. Run screen_resume first.', data: null };
        }

        const ranked = candidates.map((c, i) => ({
            rank: i + 1,
            name: c.name,
            email: c.email,
            score: c.fitScore,
            verdict: c.fitScore >= 70 ? 'Strong' : c.fitScore >= 45 ? 'Moderate' : 'Weak',
        }));

        return {
            text: `${ranked.length} candidate(s) ranked for ${job.title}. Top: ${ranked[0].name} (${ranked[0].score}/100)`,
            data: { type: 'candidate_ranking', job: job.title, candidates: ranked },
        };
    },

    generate_jd: async (_user, params) => {
        const requirements = Array.isArray(params.requirements)
            ? params.requirements.join(', ')
            : params.requirements || 'standard requirements for this role';

        const response = await groq.chat.completions.create({
            model: GROQ_MODEL,
            messages: [{
                role: 'user',
                content: `Write a professional job description for a ${params.role} in the ${params.department} department.\nRequirements: ${requirements}.\nInclude: Role summary, Key responsibilities (5 bullets), Required qualifications (4 bullets), Nice-to-have (3 bullets), About-company paragraph.\nUnder 400 words. Plain text only.`,
            }],
            temperature: 0.7,
            max_tokens: 600,
        });

        const jdText = response.choices?.[0]?.message?.content || 'Could not generate JD. Please try again.';

        return {
            text: `Job description generated for ${params.role} (${params.department}).`,
            data: { type: 'generated_jd', role: params.role, department: params.department, jd: jdText },
        };
    },

    get_open_positions: async () => {
        const jobs = await JobPosting.findAll({
            where: { status: 'Open' },
            attributes: ['id', 'title', 'department', 'location', 'createdAt'],
            order: [['createdAt', 'DESC']],
        });
        return {
            text: jobs.length ? `${jobs.length} open position(s)` : 'No open positions currently.',
            data: { type: 'open_positions', jobs },
        };
    },

    get_recruitment_summary: async () => {
        const [open, candidates] = await Promise.all([
            JobPosting.count({ where: { status: 'Open' } }),
            Candidate.findAll({
                attributes: [
                    'status',
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
                ],
                group: ['status'],
                raw: true,
            }),
        ]);

        const countMap = candidates.reduce((acc, r) => {
            acc[r.status || 'Unscreened'] = parseInt(r.count);
            return acc;
        }, {});

        return {
            text: `Recruitment: ${open} open job(s). Candidates: ${JSON.stringify(countMap)}`,
            data: { type: 'recruitment_summary', openJobs: open, candidatesByStatus: countMap },
        };
    },

    // ── REPORTS ───────────────────────────────────────────────────────────────

    generate_report: async (user, params) => {
        const reportType = params.reportType;
        const year = params.year || currentYear();
        const month = params.month || currentMonthNum();
        let data, summary;

        switch (reportType) {
            case 'leave': {
                const rows = await LeaveRequest.findAll({
                    where: {
                        companyId: user.company_id,
                        [Op.and]: [Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('startDate')), year)],
                    },
                    attributes: [
                        'leaveType', 'status',
                        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
                        [Sequelize.fn('SUM', Sequelize.col('daysRequested')), 'totalDays'],
                    ],
                    group: ['leaveType', 'status'],
                    raw: true,
                });
                summary = `Leave report ${year}: ${rows.length} type/status combinations`;
                data = rows;
                break;
            }
            case 'attendance': {
                const rows = await Attendance.findAll({
                    attributes: [
                        'status',
                        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
                    ],
                    where: {
                        date: {
                            [Op.gte]: dayjs(`${year}-${String(month).padStart(2, '0')}-01`).toDate(),
                            [Op.lte]: dayjs(`${year}-${String(month).padStart(2, '0')}-01`).endOf('month').toDate(),
                        },
                    },
                    group: ['status'],
                    raw: true,
                });
                summary = `Attendance report ${month}/${year}`;
                data = rows;
                break;
            }
            case 'payroll': {
                const rows = await Payroll.findAll({
                    attributes: [
                        [Sequelize.fn('SUM', Sequelize.col('netSalary')), 'totalNet'],
                        [Sequelize.fn('SUM', Sequelize.col('pfDeduction')), 'totalPF'],
                        [Sequelize.fn('SUM', Sequelize.col('tdsDeduction')), 'totalTDS'],
                        [Sequelize.fn('COUNT', Sequelize.col('id')), 'employees'],
                    ],
                    where: { year, month },
                    raw: true,
                });
                summary = `Payroll report ${month}/${year}`;
                data = rows[0] || {};
                break;
            }
            case 'expense': {
                const rows = await (Expense ? Expense.findAll({
                    attributes: [
                        'category', 'status',
                        [Sequelize.fn('SUM', Sequelize.col('amount')), 'total'],
                        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
                    ],
                    where: {
                        createdAt: {
                            [Op.gte]: dayjs(`${year}-01-01`).toDate(),
                            [Op.lte]: dayjs(`${year}-12-31`).toDate(),
                        },
                    },
                    group: ['category', 'status'],
                    raw: true,
                }) : Promise.resolve([]));
                summary = `Expense report ${year}`;
                data = rows;
                break;
            }
            case 'recruitment': {
                const rows = await Candidate.findAll({
                    attributes: [
                        'status',
                        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
                    ],
                    group: ['status'],
                    raw: true,
                });
                summary = `Recruitment report ${year}`;
                data = rows;
                break;
            }
            default:
                return { text: `Unknown report type: ${reportType}`, data: null };
        }

        // Save report record if model exists
        if (Report) {
            await Report.create({
                companyId: user.company_id,
                generatedBy: user.id,
                reportType,
                year,
                month,
                payload: JSON.stringify(data),
                createdAt: new Date(),
            });
        }

        return {
            text: summary,
            data: { type: 'report', reportType, year, month, rows: data },
        };
    },

    get_report_history: async (user) => {
        if (!Report) return { text: 'Report module not available.', data: null };

        const reports = await Report.findAll({
            where: { companyId: user.company_id },
            order: [['createdAt', 'DESC']],
            limit: 10,
            attributes: ['id', 'reportType', 'year', 'month', 'createdAt', 'generatedBy'],
        });

        return {
            text: `${reports.length} recent report(s)`,
            data: { type: 'report_history', reports },
        };
    },

    // ── YEAR-END ──────────────────────────────────────────────────────────────

    get_year_end_summary: async (user) => {
        const year = currentYear();

        const [leaveSummary, attendanceSummary, payrollSummary] = await Promise.all([
            LeaveRequest.findAll({
                attributes: [
                    'leaveType',
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
                    [Sequelize.fn('SUM', Sequelize.col('daysRequested')), 'totalDays'],
                ],
                where: {
                    companyId: user.company_id,
                    [Op.and]: [Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('startDate')), year)],
                },
                group: ['leaveType'],
                raw: true,
            }),
            Attendance.findAll({
                attributes: [
                    'status',
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
                ],
                where: { date: { [Op.gte]: dayjs(`${year}-01-01`).toDate() } },
                group: ['status'],
                raw: true,
            }),
            Payroll.findAll({
                attributes: [
                    [Sequelize.fn('SUM', Sequelize.col('netSalary')), 'totalPayroll'],
                    [Sequelize.fn('SUM', Sequelize.col('pfDeduction')), 'totalPF'],
                ],
                where: { year },
                raw: true,
            }),
        ]);

        return {
            text: `Year-end summary for ${year} ready.`,
            data: {
                type: 'year_end_summary',
                year,
                leaves: leaveSummary,
                attendance: attendanceSummary,
                payroll: payrollSummary[0] || {},
            },
        };
    },

    carry_forward_leaves: async (user) => {
        const MAX_CARRY = 10;
        const nextYear = currentYear() + 1;

        const allBalances = await LeaveBalance.findAll({
            where: { companyId: user.company_id, year: currentYear() },
        });

        let processed = 0;
        const results = [];

        for (const bal of allBalances) {
            const carryForward = Math.min(bal.paidRemaining ?? 0, MAX_CARRY);
            const encash = Math.max((bal.paidRemaining ?? 0) - MAX_CARRY, 0);

            // Check if next year record already exists
            const existing = await LeaveBalance.findOne({
                where: { employeeId: bal.employeeId, year: nextYear },
            });

            if (!existing) {
                await LeaveBalance.create({
                    companyId: bal.companyId,
                    employeeId: bal.employeeId,
                    year: nextYear,
                    sickRemaining: 7,
                    casualRemaining: 7,
                    paidRemaining: 14 + carryForward,
                    maternityRemaining: bal.maternityRemaining ?? 90,
                    paternityRemaining: bal.paternityRemaining ?? 15,
                    bereavementRemaining: bal.bereavementRemaining ?? 5,
                });
                processed++;
                results.push({ employeeId: bal.employeeId, carryForward, encash });
            }
        }

        return {
            text: `✓ Carry-forward processed for ${processed} employee(s). Max ${MAX_CARRY} paid days carried forward; excess encashed.`,
            data: { type: 'carry_forward', processed, results, nextYear },
        };
    },

    reset_leave_balances: async (user, params) => {
        const year = Number(params.year);

        // Safety — don't reset current or past years
        if (year <= currentYear()) {
            return { text: `Cannot reset balances for ${year}. Only future years allowed.`, data: null };
        }

        const [updatedCount] = await LeaveBalance.update(
            {
                sickRemaining: 7,
                casualRemaining: 7,
                paidRemaining: 14,
                maternityRemaining: 90,
                paternityRemaining: 15,
                bereavementRemaining: 5,
            },
            { where: { companyId: user.company_id, year } }
        );

        return {
            text: `✓ Leave balances reset to defaults for ${updatedCount} employee(s) for year ${year}.`,
            data: { type: 'balances_reset', year, updatedCount },
        };
    },

    // ── SETTINGS ──────────────────────────────────────────────────────────────

    get_company_settings: async (user) => {
        if (!CompanySetting) return { text: 'Settings module not available.', data: null };

        const settings = await CompanySetting.findAll({
            where: { companyId: user.company_id },
        });

        return {
            text: `${settings.length} company setting(s) found`,
            data: { type: 'company_settings', settings },
        };
    },

    update_company_setting: async (user, params) => {
        if (!CompanySetting) return { text: 'Settings module not available.', data: null };

        const [setting, created] = await CompanySetting.upsert({
            companyId: user.company_id,
            key: params.key,
            value: String(params.value),
            updatedAt: new Date(),
            updatedBy: user.id,
        });

        return {
            text: `Setting "${params.key}" ${created ? 'created' : 'updated'} to "${params.value}".`,
            data: { type: 'setting_updated', setting },
        };
    },

    // ── AUDIT LOGS ────────────────────────────────────────────────────────────

    get_audit_logs: async (user, params) => {
        const where = {};
        if (params.userId) where.userId = params.userId;
        if (params.module) where.moduleName = params.module;
        if (params.action) where.actionType = params.action;

        const days = Number(params.days) || 7;
        where.createdAt = { [Op.gte]: nDaysAgo(days) };

        const logs = await AuditLog.findAll({
            where,
            include: [{
                model: User,
                as: 'user',
                attributes: ['first_name', 'last_name', 'email'],
            }],
            order: [['createdAt', 'DESC']],
            limit: 50,
        });

        return {
            text: `${logs.length} audit log(s) found for the last ${days} day(s)`,
            data: { type: 'audit_logs', logs },
        };
    },

    // ── POLICY ────────────────────────────────────────────────────────────────

    policy_search: async (_user, params) => {
        const results = searchPolicy(params.query || '');
        if (!results) {
            return { text: 'No relevant policy found. Please contact HR directly.', data: null };
        }
        return {
            text: results,
            data: { type: 'policy_results', query: params.query, results },
        };
    },

    // ── GENERAL / CLARIFY ─────────────────────────────────────────────────────

    // FIX #5 — correct 3rd param (intent) usage
    general_answer: async (_u, _p, intent) => ({
        text: intent?.reply || 'I can help with HR queries — leave, payslip, attendance, expenses, shifts, or policies.',
        data: null,
    }),

    clarify: async (_u, _p, intent) => ({
        text: intent?.question || 'Could you provide more details?',
        data: null,
    }),
};

// ─── MAIN CHAT FUNCTION ───────────────────────────────────────────────────────

const chat = async (user, message, history = []) => {
    try {
        const intent = await parseIntent(user, message, history);

        if (!ALLOWED_ACTIONS.has(intent.action)) {
            return {
                success: false,
                reply: 'Invalid AI action detected. Please rephrase your request.',
                action: 'invalid_action',
                data: null,
            };
        }

        if (!isAuthorised(user, intent.action)) {
            return {
                success: false,
                reply: 'You are not authorised to perform this action.',
                action: 'unauthorised',
                data: null,
            };
        }

        const validation = validateParams(intent.action, intent.params);
        if (!validation.success) {
            return {
                success: false,
                reply: `Validation error: ${validation.message}`,
                action: 'validation_error',
                data: null,
            };
        }

        const handler = handlers[intent.action];
        if (!handler) {
            return {
                success: true,
                reply: `Action "${intent.action}" is not yet implemented.`,
                action: intent.action,
                data: null,
            };
        }

        const result = await handler(user, intent.params || {}, intent);

        await writeAuditLog(user.id, intent.action, intent.params, result);

        return {
            success: true,
            reply: result.text,
            action: intent.action,
            data: result.data || null,
        };

    } catch (error) {
        // Config error
        if (error.code === 'CONFIG_ERROR') {
            return {
                success: false,
                reply: 'AI assistant is not configured. Contact your administrator.',
                action: 'config_error',
                data: null,
            };
        }

        // Safety / content filter
        if (error.code === 'SAFETY_BLOCKED') {
            return {
                success: false,
                reply: 'Your request could not be processed. Please rephrase.',
                action: 'safety_blocked',
                data: null,
            };
        }

        // DB / validation errors
        if (error.message?.includes('Validation') || error.name === 'SequelizeValidationError') {
            return {
                success: false,
                reply: `Data error: ${error.message}`,
                action: 'validation_error',
                data: null,
            };
        }

        console.error('[HRMS AI] chat error:', error);

        return {
            success: false,
            reply: 'Something went wrong. Please try again.',
            action: 'error',
            data: null,
        };
    }
};

module.exports = { chat };