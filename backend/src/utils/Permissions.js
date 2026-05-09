'use strict';

const PERMISSIONS = {
    VIEW_DASHBOARD: ['Admin', 'HR', 'Manager', 'Employee'],
    VIEW_ANALYTICS:['Admin', 'HR', 'Manager', 'Finance', 'Employee'],

    LIST_USERS: ['Admin', 'HR', 'Manager', 'Finance'],
    VIEW_USER_PROFILE: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
    CREATE_USER: ['Admin', 'HR'],
    UPDATE_USER: ['Admin', 'HR', 'Manager', 'Finance'],
    DELETE_USER: ['Admin'],
    ASSIGN_MANAGER: ['Admin', 'HR'],
    VIEW_DEPARTMENT: ['Admin', 'HR', 'Manager', 'Finance'],

    VIEW_AUDIT_LOGS: ['Admin', 'HR', 'Manager'],
    VIEW_AUDIT_STATS: ['Admin', 'HR', 'Manager'],
    VIEW_USER_AUDIT: ['Admin', 'HR', 'Manager'],
    VIEW_MODULE_AUDIT: ['Admin', 'HR', 'Manager'],
    EXPORT_AUDIT_LOGS: ['Admin', 'HR'],
    DELETE_AUDIT_LOGS: ['Admin'],
    CREATE_AUDIT_LOG: ['Admin'],

    SUBMIT_EXPENSE: ['Employee', 'Manager', 'HR', 'Finance', 'Admin'],
    REVIEW_EXPENSE: ['Manager', 'HR', 'Admin'],
    FINANCE_REVIEW: ['Finance', 'Admin', 'HR'],
    VIEW_MY_EXPENSES: ['Employee', 'Manager', 'HR', 'Finance', 'Admin'],
    VIEW_PENDING_EXPENSES: ['Manager', 'HR', 'Finance', 'Admin'],
    DELETE_EXPENSE: ['Admin', 'HR'],

    VIEW_NOTIFICATIONS: ['Employee', 'Manager', 'HR', 'Finance', 'Admin'],
    LIST_NOTIFICATIONS: ['Employee', 'Manager', 'HR', 'Finance', 'Admin'],
    VIEW_NOTIFICATION_PREFERENCES: ['Employee', 'Manager', 'HR', 'Finance', 'Admin'],
    UPDATE_NOTIFICATION_PREFERENCES: ['Employee', 'Manager', 'HR', 'Finance', 'Admin'],
    MARK_NOTIFICATION_READ: ['Employee', 'Manager', 'HR', 'Finance', 'Admin'],
    CLEAR_NOTIFICATIONS: ['Employee', 'Manager', 'HR', 'Finance', 'Admin'],
    SEND_NOTIFICATION: ['Admin', 'HR'],
    DELETE_NOTIFICATION: ['Admin'],

    VIEW_PAYROLL: ['Admin', 'HR', 'Finance', 'Manager'],
    VIEW_PAYSLIP: ['Admin', 'HR', 'Finance', 'Manager', 'Employee'],
    VIEW_PAYROLL_BREAKDOWN: ['Admin', 'HR', 'Finance', 'Manager', 'Employee'],
    VIEW_PAYROLL_HISTORY: ['Admin', 'HR', 'Finance', 'Manager', 'Employee'],
    VIEW_YTD_PAYROLL: ['Admin', 'HR', 'Finance', 'Manager', 'Employee'],
    GENERATE_PAYROLL: ['Admin', 'HR', 'Finance', 'Manager'],
    APPROVE_PAYROLL: ['Admin', 'HR', 'Finance', 'Manager'],
    EXPORT_PAYROLL: ['Admin', 'HR', 'Finance', 'Manager'],
    LOCK_PAYROLL: ['Admin', 'HR', 'Finance', 'Manager'],

    VIEW_YEAR_END_REPORT: ['Admin', 'HR', 'Finance', 'Manager'],
    GENERATE_YEAR_END_REPORT: ['Admin', 'HR', 'Finance', 'Manager'],

    VIEW_LEAVE: ['Admin', 'HR', 'Manager', 'Employee'],
    APPLY_LEAVE: ['Employee', 'Manager', 'HR', 'Finance', 'Admin'],
    REVIEW_LEAVE: ['Admin', 'HR', 'Manager'],
    APPROVE_LEAVE: ['Admin', 'HR', 'Manager'],
    REJECT_LEAVE: ['Admin', 'HR', 'Manager'],
    CANCEL_LEAVE: ['Employee', 'Manager', 'HR', 'Finance', 'Admin'],
    VIEW_LEAVE_STATS: ['Admin', 'HR', 'Manager'],
    RESET_LEAVE_BALANCE: ['Admin'],

    CREATE_COMPANY: ['Admin'],
    LIST_COMPANIES: ['Admin', 'HR', 'Manager', 'Finance'],
    VIEW_COMPANY: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
    UPDATE_COMPANY: ['Admin', 'HR'],
    DELETE_COMPANY: ['Admin'],
    REACTIVATE_COMPANY: ['Admin'],
    UPLOAD_COMPANY_LOGO: ['Admin', 'HR'],
    DELETE_COMPANY_LOGO: ['Admin', 'HR'],
    VIEW_COMPANY_SETTINGS: ['Admin', 'HR', 'Manager'],
    UPDATE_COMPANY_SETTINGS: ['Admin', 'HR'],
    VIEW_COMPANY_STATS: ['Admin', 'HR', 'Manager', 'Finance'],
    VIEW_COMPANY_DASHBOARD: ['Admin', 'HR', 'Manager', 'Finance'],
    VIEW_COMPANY_USERS: ['Admin', 'HR', 'Manager', 'Finance'],
    ADD_COMPANY_USER: ['Admin', 'HR'],
    REMOVE_COMPANY_USER: ['Admin', 'HR'],
    VIEW_SUBSCRIPTION: ['Admin', 'HR'],
    UPDATE_SUBSCRIPTION: ['Admin'],
    SEND_COMPANY_NOTIFICATION: ['Admin', 'HR'],

    VIEW_LIFECYCLE: ['Admin', 'HR', 'Manager', 'Employee'],
    MANAGE_LIFECYCLE: ['Admin', 'HR', 'Manager'],
    PROMOTE_EMPLOYEE: ['Admin', 'HR'],
    TRANSFER_EMPLOYEE: ['Admin', 'HR'],
    INITIATE_EXIT: ['Admin', 'HR', 'Employee'],
    APPROVE_EXIT: ['Admin', 'HR'],
    VIEW_ONBOARDING_TASKS: ['Admin', 'HR', 'Manager', 'Employee'],
    COMPLETE_ONBOARDING_TASK: ['Admin', 'HR', 'Employee'],

    VIEW_FNF: ['Admin', 'HR', 'Finance', 'Employee'],
    CALCULATE_FNF: ['Admin', 'HR', 'Finance'],
    APPROVE_FNF: ['Admin', 'Finance'],
    EXPORT_FNF: ['Admin', 'HR', 'Finance'],

    VIEW_DOCUMENTS: ['Admin', 'HR', 'Manager', 'Employee'],
    UPLOAD_DOCUMENT: ['Admin', 'HR', 'Employee'],
    DELETE_DOCUMENT: ['Admin', 'HR'],
    MANAGE_DOCUMENTS: ['Admin', 'HR'],
    VIEW_ALL_DOCUMENTS: ['Admin', 'HR'],
    VIEW_PAYROLL_DOCS: ['Admin', 'HR', 'Finance', 'Employee'],
    VIEW_COMPANY_DOCS: ['Admin', 'HR', 'Manager', 'Employee'],
    APPROVE_DOCUMENT: ['Admin', 'HR'],
    SEND_ESIGN_REQUEST: ['Admin', 'HR'],

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

    VIEW_SHIFTS: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
    MANAGE_SHIFTS: ['Admin', 'HR', 'Manager'],
    ASSIGN_SHIFT: ['Admin', 'HR', 'Manager'],
    DELETE_SHIFT: ['Admin', 'HR', 'Manager'],
    VIEW_SHIFT_HISTORY: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
    VIEW_SHIFT_REPORT: ['Admin', 'HR', 'Manager', 'Finance'],

    VIEW_ATTENDANCE: ['Admin', 'HR', 'Manager', 'Employee'],
    CHECKIN_ATTENDANCE: ['Admin', 'HR', 'Manager', 'Employee'],
    CHECKOUT_ATTENDANCE: ['Admin', 'HR', 'Manager', 'Employee'],
    VIEW_TEAM_ATTENDANCE: ['Admin', 'HR', 'Manager'],
    VIEW_ATTENDANCE_REPORT: ['Admin', 'HR', 'Manager'],
    VIEW_OVERTIME_SUMMARY: ['Admin', 'HR'],
    ADMIN_ATTENDANCE_RECORD: ['Admin', 'HR'],
    MANAGE_ATTENDANCE: ['Admin', 'HR'],

    VIEW_REPORTS: ['Admin', 'HR', 'Manager'],
    VIEW_EMPLOYEE_REPORTS: ['Admin', 'HR'],
    VIEW_PAYROLL_REPORTS: ['Admin', 'Finance'],
    VIEW_LEAVE_REPORTS: ['Admin', 'HR', 'Manager'],
    VIEW_EXPENSE_REPORTS: ['Admin', 'Finance', 'HR'],
    EXPORT_REPORTS: ['Admin', 'HR', 'Finance'],

    GENERATE_FORM16: ['Admin', 'HR', 'Finance'],
    VIEW_FORM16: ['Admin', 'HR', 'Finance', 'Employee'],
    GENERATE_OFFER_LETTER: ['Admin', 'HR'],
    VIEW_OFFER_LETTER: ['Admin', 'HR', 'Employee'],

    VIEW_FINANCE: ['Admin', 'HR', 'Finance', 'Manager'],



};

const getRoles = (user) => {
    if (!user) return [];

    const roles = [];

    if (Array.isArray(user.roles)) {
        roles.push(...user.roles.map(r => String(r?.name ?? r)));
    }

    if (user.primaryRole) {
        roles.push(String(user.primaryRole));
    }

    if (user.role) {
        roles.push(String(user.role));
    }

    return [...new Set(roles)];
};

const assertPermission = (actor, permission) => {
    const roles = getRoles(actor);

    if (roles.length === 0) {
        return {
            allowed: false,
            reason: 'NO_ROLES',
        };
    }

    const allowedRoles = PERMISSIONS[permission];

    if (!allowedRoles) {
        return {
            allowed: false,
            reason: 'UNKNOWN_PERMISSION',
        };
    }

    const isAllowed = roles.some(role =>
        allowedRoles.some(
            allowed => allowed.toLowerCase() === role.toLowerCase()
        )
    );

    return {
        allowed: isAllowed,
    };
};

const requirePermission = (permission) => {
    return (req, res, next) => {
        const result = assertPermission(req.user, permission);

        if (!result.allowed) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden',
                permission,
                reason: result.reason || 'ACCESS_DENIED',
            });
        }

        next();
    };
};

module.exports = {
    PERMISSIONS,
    getRoles,
    assertPermission,
    requirePermission,
};