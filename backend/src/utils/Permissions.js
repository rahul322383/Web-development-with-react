
'use strict';

const PERMISSIONS = {

    // ── Existing (unchanged) ──────────────────────────────────────────────────
    VIEW_DASHBOARD: ['Admin', 'HR', 'Manager', 'Employee'],
    LIST_USERS: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
    VIEW_DEPARTMENT: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
    VIEW_AUDIT_LOGS: ['Admin', 'HR', 'Manager'],
    VIEW_AUDIT_STATS: ['Admin', 'HR', 'Manager'],
    VIEW_USER_AUDIT: ['Admin', 'HR', 'Manager'],
    VIEW_MODULE_AUDIT: ['Admin', 'HR', 'Manager'],
    EXPORT_AUDIT_LOGS: ['Admin', 'HR'],
    DELETE_AUDIT_LOGS: ['Admin'],
    CREATE_AUDIT_LOG: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],

    SUBMIT_EXPENSE: ['Employee', 'Manager', 'HR', 'Finance', 'Admin'],
    REVIEW_EXPENSE: ['Manager', 'HR', 'Admin'],
    FINANCE_REVIEW: ['Finance', 'Admin', 'Manager', 'HR'],
    LIST_MY_EXPENSES: ['Employee', 'Manager', 'HR', 'Finance', 'Admin'],
    LIST_PENDING_MANAGER: ['Manager', 'HR', 'Admin'],
    LIST_PENDING_FINANCE: ['Finance', 'Admin'],
    DELETE_EXPENSE: ['Admin', 'HR'],

    VIEW_NOTIFICATIONS: ['Admin', 'HR', 'Manager', 'Employee'],
    SEND_NOTIFICATION: ['Admin', 'HR'],
    DELETE_NOTIFICATION: ['Admin'],

    VIEW_PAYROLL: ['Admin', 'HR', 'Finance', 'Manager'],
    GENERATE_PAYROLL: ['Admin', 'HR', 'Finance', 'Manager'],
    APPROVE_PAYROLL: ['Admin', 'HR', 'Finance', 'Manager'],
    EXPORT_PAYROLL: ['Admin', 'HR', 'Finance', 'Manager'],

    VIEW_YEAR_END_REPORT: ['Admin', 'HR', 'Finance', 'Manager'],
    GENERATE_YEAR_END_REPORT: ['Admin', 'HR', 'Finance', 'Manager'],

    VIEW_LEAVE: ['Admin', 'HR', 'Manager', 'Employee'],
    REVIEW_LEAVE: ['Admin', 'HR', 'Manager', 'Finance'],
    APPLY_LEAVE: ['Employee', 'Manager', 'Admin', 'Finance'],
    APPROVE_LEAVE: ['Admin', 'HR', 'Finance', 'Manager'],
    REJECT_LEAVE: ['Admin', 'HR', 'Finance', 'Manager'],

    CREATE_COMPANY: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
    LIST_COMPANIES: ['Admin', 'HR', 'Manager', 'Finance'],
    VIEW_COMPANY: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
    UPDATE_COMPANY: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
    DELETE_COMPANY: ['Admin'],
    REACTIVATE_COMPANY: ['Admin'],
    UPLOAD_COMPANY_LOGO: ['Admin', 'HR'],
    DELETE_COMPANY_LOGO: ['Admin', 'HR'],
    VIEW_COMPANY_SETTINGS: ['Admin', 'HR', 'Manager'],
    UPDATE_COMPANY_SETTINGS: ['Admin', 'HR'],
    VIEW_COMPANY_STATS: ['Admin', 'HR', 'Manager', 'Finance'],
    VIEW_COMPANY_DASHBOARD: ['Admin', 'HR', 'Manager', 'Finance'],
    VIEW_COMPANY_USERS: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
    ADD_COMPANY_USER: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
    REMOVE_COMPANY_USER: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
    UPDATE_USER: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
    VIEW_SUBSCRIPTION: ['Admin', 'HR'],
    UPDATE_SUBSCRIPTION: ['Admin'],
    SEND_COMPANY_NOTIFICATION: ['Admin', 'HR'],

    // ── NEW: Employee Lifecycle ───────────────────────────────────────────────
    VIEW_LIFECYCLE: ['Admin', 'HR', 'Manager', 'Employee'],
    MANAGE_LIFECYCLE: ['Admin', 'HR', 'Manager', 'Employee', 'Finance'],
    PROMOTE_EMPLOYEE: ['Admin', 'HR'],
    TRANSFER_EMPLOYEE: ['Admin', 'HR'],
    INITIATE_EXIT: ['Admin', 'HR', 'Employee'],
    APPROVE_EXIT: ['Admin', 'HR'],
    VIEW_ONBOARDING_TASKS: ['Admin', 'HR', 'Manager', 'Employee'],
    COMPLETE_ONBOARDING_TASK: ['Admin', 'HR', 'Employee'],

    // ── NEW: Full & Final Settlement ─────────────────────────────────────────
    VIEW_FNF: ['Admin', 'HR', 'Finance', 'Employee'],
    CALCULATE_FNF: ['Admin', 'HR', 'Finance'],
    APPROVE_FNF: ['Admin', 'Finance'],
    EXPORT_FNF: ['Admin', 'HR', 'Finance'],

    // ── NEW: Document Management ─────────────────────────────────────────────
    VIEW_DOCUMENTS: ['Admin', 'HR', 'Manager', 'Employee'],
    UPLOAD_DOCUMENT: ['Admin', 'HR', 'Employee'],
    DELETE_DOCUMENT: ['Admin', 'HR'],
    MANAGE_DOCUMENTS: ['Admin', 'HR'],
    VIEW_ALL_DOCUMENTS: ['Admin', 'HR'],
    VIEW_PAYROLL_DOCS: ['Admin', 'HR', 'Finance', 'Employee'],
    VIEW_COMPANY_DOCS: ['Admin', 'HR', 'Manager', 'Employee'],
    APPROVE_DOCUMENT: ['Admin', 'HR'],
    SEND_ESIGN_REQUEST: ['Admin', 'HR'],

    // ── NEW: ATS ─────────────────────────────────────────────────────────────
    VIEW_JOBS: ['Admin', 'HR', 'Manager'],
    CREATE_JOB: ['Admin', 'HR'],
    UPDATE_JOB: ['Admin', 'HR', 'Manager'],
    DELETE_JOB: ['Admin', 'HR'],
    VIEW_CANDIDATES: ['Admin', 'HR', 'Manager'],
    MANAGE_CANDIDATES: ['Admin', 'HR'],
    MOVE_CANDIDATE_STAGE: ['Admin', 'HR', 'Manager'],
    SCHEDULE_INTERVIEW: ['Admin', 'HR', 'Manager'],
    SUBMIT_INTERVIEW_FEEDBACK: ['Admin', 'HR', 'Manager'],
    MAKE_OFFER: ['Admin', 'HR'],
    REJECT_CANDIDATE: ['Admin', 'HR', 'Manager'],

    // ── NEW: Performance ─────────────────────────────────────────────────────
    VIEW_GOALS: ['Admin', 'HR', 'Manager', 'Employee'],
    VIEW_ALL_GOALS: ['Admin', 'HR', 'Manager'],
    CREATE_GOAL: ['Admin', 'HR', 'Manager', 'Employee'],
    UPDATE_GOAL: ['Admin', 'HR', 'Manager', 'Employee'],
    DELETE_GOAL: ['Admin', 'HR'],
    CREATE_REVIEW_CYCLE: ['Admin', 'HR'],
    VIEW_REVIEWS: ['Admin', 'HR', 'Manager', 'Employee'],
    VIEW_ALL_REVIEWS: ['Admin', 'HR'],
    SUBMIT_SELF_REVIEW: ['Employee', 'Manager', 'Admin', 'HR'],
    SUBMIT_MANAGER_REVIEW: ['Manager', 'Admin', 'HR'],
    SUBMIT_PEER_REVIEW: ['Employee', 'Manager', 'Admin', 'HR'],
    ACKNOWLEDGE_REVIEW: ['Employee', 'Manager'],
    VIEW_RATINGS: ['Admin', 'HR', 'Manager'],

    // ── NEW: Shift Management ────────────────────────────────────────────────
    VIEW_SHIFTS: ['Admin', 'HR', 'Manager', 'Employee', 'Finance'],
    MANAGE_SHIFTS: ['Admin', 'HR', 'Manager', 'Employee', 'Finance'],
    ASSIGN_SHIFT: ['Admin', 'HR', 'Manager'],
    VIEW_SHIFT_REPORT: ['Admin', 'HR', 'Manager'],

    // ── NEW: Tax / Generated Documents ───────────────────────────────────────
    GENERATE_FORM16: ['Admin', 'HR', 'Finance'],
    VIEW_FORM16: ['Admin', 'HR', 'Finance', 'Employee'],
    GENERATE_OFFER_LETTER: ['Admin', 'HR'],
    VIEW_OFFER_LETTER: ['Admin', 'HR', 'Employee'],
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

const getRoles = (user) => {
    if (!user) return [];
    const roles = [];
    if (Array.isArray(user.roles)) roles.push(...user.roles.map(r => String(r?.name ?? r)));
    if (user.primaryRole) roles.push(String(user.primaryRole));
    if (user.role) roles.push(String(user.role));
    return [...new Set(roles)];
};

const assertPermission = (actor, permission) => {
    const roles = getRoles(actor);
    if (roles.length === 0) return { allowed: false, reason: 'NO_ROLES' };
    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles) return { allowed: false, reason: 'UNKNOWN_PERMISSION' };
    const isAllowed = roles.some(role =>
        allowedRoles.some(a => a.toLowerCase() === role.toLowerCase())
    );
    return { allowed: isAllowed };
};

const requirePermission = (permission) => (req, res, next) => {
    const result = assertPermission(req.user, permission);
    if (!result.allowed) return res.status(403).json({ success: false, message: 'Forbidden' });
    next();
};

module.exports = { assertPermission, requirePermission, PERMISSIONS };