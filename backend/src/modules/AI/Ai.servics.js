'use strict';

const dayjs = require('dayjs');
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
} = require('../../database/initModels');

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

const GROQ_MODEL = 'llama-3.3-70b-versatile';

const ALLOWED_ACTIONS = new Set([
    'get_leave_balance',
    'get_my_leaves',
    'apply_leave',
    'cancel_leave',
    'get_payslip',
    'get_attendance',
    'get_holidays',
    'get_profile',
    'get_monthly_summary',
    'get_team_leaves',
    'approve_leave',
    'reject_leave',
    'who_on_leave_tomorrow',
    'get_late_employees',
    'get_burnout_report',
    'get_leave_predictions',
    'get_attrition_predictions',
    'get_performance_insights',
    'screen_resume',
    'rank_candidates',
    'generate_jd',
    'get_open_positions',
    'general_answer',
    'clarify',
    'policy_search',
]);

const MANAGER_ACTIONS = new Set([
    'get_team_leaves',
    'approve_leave',
    'reject_leave',
    'who_on_leave_tomorrow',
    'get_late_employees',
    'get_burnout_report',
    'get_leave_predictions',
    'get_attrition_predictions',
    'get_performance_insights',
]);

const HR_ADMIN_ACTIONS = new Set([
    'screen_resume',
    'rank_candidates',
    'generate_jd',
    'get_open_positions',
]);

const isAuthorised = (user, action) => {
    if (MANAGER_ACTIONS.has(action)) {
        return ['Manager', 'Admin', 'HR'].includes(user.role);
    }
    if (HR_ADMIN_ACTIONS.has(action)) {
        return ['Admin', 'HR'].includes(user.role);
    }
    return true;
};

const LEAVE_BALANCE_MAP = {
    Sick: 'sickRemaining',
    Casual: 'casualRemaining',
    Paid: 'paidRemaining',
    Maternity: 'maternityRemaining',
    Paternity: 'paternityRemaining',
    Bereavement: 'bereavementRemaining',
    Unpaid: null,
};

const today = () => dayjs().format('YYYY-MM-DD');
const tomorrow = () => dayjs().add(1, 'day').format('YYYY-MM-DD');
const nDaysAgo = (n) => dayjs().subtract(n, 'day').toDate();
const currentYear = () => dayjs().year();
const currentMonth = () => dayjs().format('MMMM');

const writeAuditLog = async (userId, action, params, result) => {
    try {
        const ACTION_MAP = {
            get_profile: 'PROFILE_VIEW',
            apply_leave: 'LEAVE_APPLY',
            cancel_leave: 'LEAVE_CANCEL',
            policy_search: 'POLICY_SEARCH',
        };

        await AuditLog.create({
            userId,
            moduleName: 'AI',
            actionType: ACTION_MAP[action] || 'CHAT',
            newData: {
                action,
                params,
                reply: result?.text,
            },
            timestamp: new Date(),
            createdAt: new Date(),
        });
    } catch (err) {
        // silent
    }
};

const HR_POLICY_CHUNKS = [
    {
        topic: 'leave policy',
        content: 'Annual entitlement: 21 days — Sick: 7, Casual: 7, Paid: 14. Maternity: 90 days, Paternity: 15 days, Bereavement: 5 days. Minimum 1 working day advance notice for Casual/Paid. Sick leave same day; medical cert required for 3+ consecutive days. Leaves do not carry over except Paid (max 10 days).',
    },
    {
        topic: 'working hours',
        content: 'Standard: 9:00 AM – 6:00 PM Mon–Fri. Late if check-in after 9:15 AM. Early leave if check-out before 5:45 PM. Half-day absent if absent less than 4 hours. Overtime not calculated through this system.',
    },
    {
        topic: 'payroll',
        content: 'Monthly pay cycle. Disbursed on last working day of the month. Components: Basic, HRA, Transport Allowance, Medical, Bonus, Deductions (PF, TDS). Credited to registered bank account.',
    },
    {
        topic: 'attendance',
        content: 'Minimum 70% attendance per month required. Below 70% triggers HR review. Weekly off: Saturday & Sunday. Valid statuses: Present, Absent, Late, Early Leave, WFH, Holiday.',
    },
    {
        topic: 'remote work wfh',
        content: 'WFH must be pre-approved by manager via official channel. No limit specified, but manager discretion applies.',
    },
    {
        topic: 'probation notice period',
        content: 'Probation: 3 months for new employees; limited leave during probation. Notice period: 30 days for employees, 30–90 days for managers depending on grade.',
    },
    {
        topic: 'reimbursement expenses',
        content: 'Travel reimbursements require manager approval and original bills within 30 days. Medical reimbursements processed monthly with payroll. Claim form to be submitted via HR portal.',
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

const buildSystemPrompt = (user) => `
You are an intelligent HR Assistant embedded inside an HRMS application.
Understand the employee's intent and return a structured JSON response.

━━━ EMPLOYEE CONTEXT ━━━
Name: ${user.name || 'Employee'}
Department: ${user.department || 'N/A'}
Designation: ${user.designation || 'N/A'}
Role: ${user.role || 'Employee'}

━━━ AVAILABLE ACTIONS ━━━

EMPLOYEE ACTIONS:
- get_leave_balance      → check remaining leave days
- get_my_leaves          → list user's leave requests
- apply_leave            → apply for leave (REQUIRES: startDate, endDate, leaveType, reason)
- cancel_leave           → cancel a pending leave (REQUIRES: leaveId)
- get_payslip            → get payslip (optional: month as YYYY-MM)
- get_attendance         → attendance summary (optional: days, default 30)
- get_holidays           → upcoming public holidays
- get_profile            → view own profile
- get_monthly_summary    → AI-generated monthly insights (attendance trends, leave usage, suggestions)
- policy_search          → search HR policy docs (REQUIRES: query)
- general_answer         → answer HR policy questions
- clarify                → ask follow-up if required field is missing

MANAGER ACTIONS (role: Manager/Admin/HR only):
- get_team_leaves        → pending team leave requests
- approve_leave          → approve team leave (REQUIRES: leaveId)
- reject_leave           → reject team leave (REQUIRES: leaveId, rejectionReason)
- who_on_leave_tomorrow  → team members on leave tomorrow
- get_late_employees     → late arrivals this week (optional: days)
- get_burnout_report     → team burnout risk analysis
- get_leave_predictions  → predict team leave likelihood
- get_attrition_predictions → predict which employees may resign soon
- get_performance_insights  → team performance risk based on attendance + KPI signals

HR/ADMIN ACTIONS (role: Admin/HR only):
- screen_resume          → screen a candidate resume vs a job (REQUIRES: candidateId, jobId)
- rank_candidates        → rank all candidates for a job (REQUIRES: jobId)
- generate_jd            → generate a job description (REQUIRES: role, department, optional: requirements[])
- get_open_positions     → list all open job postings

━━━ LEAVE TYPES ━━━
Valid leaveType values: "Sick", "Casual", "Paid", "Maternity", "Paternity", "Bereavement", "Unpaid"

━━━ RESPONSE FORMAT ━━━
Respond ONLY with valid JSON. No markdown, no code fences.
{
  "action": "<action_name>",
  "params": {},
  "reply": "<short loading message OR policy answer>",
  "question": "<only when action=clarify>"
}

━━━ KEY RULES ━━━
1. Today is ${today()}. Tomorrow is ${tomorrow()}. Year: ${currentYear()}. Month: ${currentMonth()}.
2. Resolve all relative dates (today, tomorrow, next Monday) to YYYY-MM-DD.
3. apply_leave: startDate, endDate, leaveType, reason are ALL mandatory. Any missing → action = "clarify".
4. reject_leave: rejectionReason is mandatory.
5. policy_search: extract the search query from the user's question.
6. general_answer: write a clear, policy-accurate "reply".
7. Be concise, friendly, professional.
`.trim();

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
            ...conversationHistory.slice(-8).map(m => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content,
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

const validateParams = (action, params = {}) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (action === 'apply_leave') {
        if (!params.startDate || !dateRegex.test(params.startDate))
            return { success: false, message: 'Invalid or missing start date' };
        if (!params.endDate || !dateRegex.test(params.endDate))
            return { success: false, message: 'Invalid or missing end date' };
        if (!params.reason || params.reason.trim().length < 2)
            return { success: false, message: 'Reason is required' };
        if (!params.leaveType)
            return { success: false, message: 'Leave type is required' };
        if (dayjs(params.endDate).isBefore(dayjs(params.startDate)))
            return { success: false, message: 'End date cannot be before start date' };
    }

    if (action === 'cancel_leave' && !params.leaveId)
        return { success: false, message: 'Leave ID is required to cancel' };

    if (action === 'approve_leave' && !params.leaveId)
        return { success: false, message: 'Leave ID is required to approve' };

    if (action === 'reject_leave') {
        if (!params.leaveId)
            return { success: false, message: 'Leave ID is required to reject' };
        if (!params.rejectionReason || params.rejectionReason.trim().length < 3)
            return { success: false, message: 'Rejection reason is required' };
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

    if (action === 'policy_search' && !params.query)
        return { success: false, message: 'query is required for policy search' };

    return { success: true };
};

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

    const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate();
    const recentSick = leaveHistory.filter(l =>
        l.leaveType === 'Sick' &&
        l.status === 'Approved' &&
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

    const remaining = balance?.remaining ?? 21;
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

    const remaining = balance?.remaining ?? 21;
    if (remaining === 0) { score += 15; reasons.push('Zero leave balance'); }

    const rejectedLeaves = leaveHistory.filter(l => l.status === 'Rejected').length;
    if (rejectedLeaves >= 2) { score += 20; reasons.push(`${rejectedLeaves} rejected leave requests`); }

    score = Math.min(score, 100);
    const risk = score >= 60 ? 'High' : score >= 35 ? 'Medium' : 'Low';
    return { score, risk, reasons };
};

const TECH_KEYWORDS = [
    'node', 'react', 'python', 'java', 'aws', 'sql', 'mongodb', 'docker',
    'kubernetes', 'typescript', 'graphql', 'rest', 'api', 'redis', 'git',
    'ci/cd', 'agile', 'scrum', 'html', 'css', 'express', 'django', 'spring',
    'machine learning', 'tensorflow', 'pytorch', 'data analysis', 'tableau',
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

const handlers = {

    get_leave_balance: async (user) => {
        const balance = await LeaveBalance.findOne({
            where: { employeeId: user.id, year: currentYear() },
        });
        if (!balance) return { text: 'No leave balance record found for this year.', data: null };

        return {
            text: `You have ${balance.remaining ?? 0} days remaining — Sick: ${balance.sickRemaining ?? 0}, Casual: ${balance.casualRemaining ?? 0}, Paid: ${balance.paidRemaining ?? 0}`,
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
            return { text: `Cannot cancel leave that is already ${leave.status}.`, data: null };

        await leave.update({ status: 'Cancelled' });
        return {
            text: `Leave ${params.leaveId} cancelled successfully.`,
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
        const wfh = countMap['Work From Home'] || 0;
        const total = records.length;
        const pct = total > 0 ? Math.round((present / total) * 100) : 0;

        return {
            text: `Last ${days} days — Present: ${present}, Absent: ${absent}, Late: ${late}, WFH: ${wfh} (${pct}% attendance)`,
            data: { type: 'attendance', summary: { present, absent, late, wfh, total, pct, days }, records },
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

    get_profile: async (user) => {
        const profile = await User.findOne({
            where: { id: user.id },
            attributes: [
                'id',
                'email',
                'designation',
                'department',
                ['employee_code', 'employeeCode'],
                ['manager_id', 'managerId'],
                ['first_name', 'firstName'],
                ['last_name', 'lastName'],
                ['role_id', 'roleId'],
            ],
        });

        if (!profile) {
            return { text: 'Profile not found.', data: null };
        }

        return {
            text: `Profile: ${profile.firstName} ${profile.lastName} — ${profile.designation}, ${profile.department}`,
            data: { type: 'profile', profile },
        };
    },

    get_monthly_summary: async (user) => {
        const daysInMonth = dayjs().daysInMonth();

        const [attendanceSummary, leaveHistory, payslip, balance] = await Promise.all([
            Attendance.findAll({
                attributes: [
                    'status',
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
                ],
                where: { employeeId: user.id, date: { [Op.gte]: nDaysAgo(daysInMonth) } },
                group: ['status'],
                raw: true,
            }),
            LeaveRequest.findAll({
                where: { employeeId: user.id, createdAt: { [Op.gte]: nDaysAgo(daysInMonth) } },
            }),
            Payroll.findOne({
                where: { employeeId: user.id, year: currentYear(), month: dayjs().month() + 1 },
            }),
            LeaveBalance.findOne({
                where: { employeeId: user.id, year: currentYear() },
            }),
        ]);

        const countMap = attendanceSummary.reduce((acc, r) => { acc[r.status] = parseInt(r.count); return acc; }, {});
        const present = countMap['Present'] || 0;
        const absent = countMap['Absent'] || 0;
        const late = countMap['Late'] || 0;
        const total = Object.values(countMap).reduce((s, v) => s + v, 0);
        const pct = total > 0 ? Math.round((present / total) * 100) : 0;
        const remaining = balance?.remaining ?? 0;

        const suggestions = [];
        if (pct < 70) suggestions.push('⚠ Attendance dropped below 70% — HR review may be triggered.');
        if (late >= 3) suggestions.push(`⚠ You had ${late} late arrivals this month. Consider adjusting your schedule.`);
        if (remaining <= 3) suggestions.push(`⚠ Only ${remaining} leave day(s) remaining for the year.`);
        if (remaining >= 10 && dayjs().month() >= 9)
            suggestions.push(`💡 You have ${remaining} unused leave days. Consider planning time off before year-end.`);
        if (absent === 0) suggestions.push('✓ Perfect attendance this month! Great work.');
        if (suggestions.length === 0) suggestions.push('✓ Everything looks healthy this month. Keep it up!');

        return {
            text: `Monthly summary for ${currentMonth()} ${currentYear()}: ${pct}% attendance, ${leaveHistory.length} leave request(s), ${remaining} leave days remaining.`,
            data: {
                type: 'monthly_summary',
                attendance: { present, absent, late, total, pct },
                leaves: leaveHistory.length,
                payslip: payslip ? { net: payslip.netSalary, month: payslip.month, year: payslip.year } : null,
                balance: balance ? { remaining, sick: balance.sickRemaining, casual: balance.casualRemaining, paid: balance.paidRemaining } : null,
                suggestions,
            },
        };
    },

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

    get_team_leaves: async (user, params) => {
        const leaves = await LeaveRequest.findAll({
            where: { managerId: user.id, status: params.status || 'Pending' },
            include: [{
                model: User,
                as: 'employee',
                attributes: [
                    'designation',
                    ['first_name', 'firstName'],
                    ['last_name', 'lastName'],
                ],
            }],
            order: [['createdAt', 'ASC']],
        });

        return {
            text: leaves.length ? `${leaves.length} leave request(s) from your team` : 'No pending team leaves',
            data: { type: 'team_leave_list', leaves },
        };
    },

    approve_leave: async (user, params) => {
        const leave = await LeaveRequest.findOne({ where: { id: params.leaveId, managerId: user.id } });
        if (!leave) return { text: `Leave ${params.leaveId} not found in your team.`, data: null };
        if (leave.status !== 'Pending') return { text: `Leave is already ${leave.status}.`, data: null };

        await leave.update({ status: 'Approved', approvedAt: new Date(), approvedBy: user.id });
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
            include: [{ model: User, as: 'employee', attributes: ['first_name', 'last_name', 'designation', 'department'] }],
        });

        return {
            text: leaves.length
                ? `${leaves.length} team member(s) on leave tomorrow`
                : 'No one from your team is on leave tomorrow',
            data: { type: 'on_leave_tomorrow', leaves, date: tmr },
        };
    },

    get_late_employees: async (user, params) => {
        const days = params.days || 7;

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
            Attendance.findAll({
                where: { employeeId: { [Op.in]: teamIds }, date: { [Op.gte]: thirtyAgo } },
            }),
            LeaveRequest.findAll({
                where: { employeeId: { [Op.in]: teamIds }, createdAt: { [Op.gte]: thirtyAgo } },
            }),
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
            attributes: ['id', 'designation', 'department',
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
                remainingDays: balance?.remaining ?? 'N/A',
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
            attributes: ['id', 'designation', 'department',
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
                'employeeId',
                'status',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
            ],
            where: {
                employeeId: { [Op.in]: teamIds },
                date: { [Op.gte]: nDaysAgo(30) },
            },
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
            const total = Object.values(stats).reduce((s, v) => s + v, 0) || 1;
            const pct = Math.round((present / total) * 100);

            let performanceRisk = 'Low';
            const flags = [];
            if (pct < 70) { performanceRisk = 'High'; flags.push(`${pct}% attendance`); }
            else if (pct < 80) { performanceRisk = 'Medium'; flags.push(`${pct}% attendance`); }
            if (late >= 3) { flags.push(`${late} late arrivals`); }
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

        let verdict = 'Weak fit';
        if (score >= 70) verdict = 'Strong fit';
        else if (score >= 45) verdict = 'Moderate fit';

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
            return { text: 'No screened candidates found for this position. Run screen_resume first.', data: null };
        }

        const ranked = candidates.map((c, i) => ({
            rank: i + 1, name: c.name, email: c.email,
            score: c.fitScore, verdict: c.fitScore >= 70 ? 'Strong' : c.fitScore >= 45 ? 'Moderate' : 'Weak',
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
                content: `Write a professional job description for a ${params.role} in the ${params.department} department. Requirements: ${requirements}. Include: Role summary, Key responsibilities (5 bullets), Required qualifications (4 bullets), Nice-to-have (3 bullets), and a brief about-company paragraph. Keep it under 400 words. Plain text only.`,
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

    general_answer: async (_u, _p, intent) => ({
        text: intent.reply || 'I can help with HR queries. Ask me about leave, payslip, attendance, or policies.',
        data: null,
    }),

    clarify: async (_u, _p, intent) => ({
        text: intent.question || 'Could you provide more details?',
        data: null,
    }),
};

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
                reply: `I don't know how to handle "${intent.action}" yet.`,
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
        if (error.code === 'CONFIG_ERROR') {
            return {
                success: false,
                reply: 'AI assistant is not configured. Contact your administrator.',
                action: 'config_error',
                data: null,
            };
        }

        if (error.message?.includes('Invalid') || error.message?.includes('required')) {
            return {
                success: false,
                reply: `Validation error: ${error.message}`,
                action: 'validation_error',
                data: null,
            };
        }

        return {
            success: false,
            reply: 'Something went wrong. Please try again.',
            action: 'error',
            data: null,
        };
    }
};

module.exports = { chat };