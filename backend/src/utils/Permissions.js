
// 'use strict';

// const PERMISSIONS = {
//     VIEW_DASHBOARD: ['Admin', 'HR', 'Manager', 'Employee'],
//     LIST_USERS: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
//     VIEW_DEPARTMENT: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
//     VIEW_AUDIT_LOGS: ['Admin', 'HR', 'Manager'],
//     VIEW_AUDIT_STATS: ['Admin', 'HR', 'Manager'],
//     VIEW_USER_AUDIT: ['Admin', 'HR', 'Manager'],
//     VIEW_MODULE_AUDIT: ['Admin', 'HR', 'Manager'],
//     EXPORT_AUDIT_LOGS: ['Admin', 'HR'],
//     DELETE_AUDIT_LOGS: ['Admin'],
//     CREATE_AUDIT_LOG: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],

//     SUBMIT_EXPENSE: ['Employee', 'Manager', 'HR', 'Finance', 'Admin'],
//     REVIEW_EXPENSE: ['Manager', 'HR', 'Admin'],
//     FINANCE_REVIEW: ['Finance', 'Admin','Manager', 'HR'],
//     LIST_MY_EXPENSES: ['Employee', 'Manager', 'HR', 'Finance', 'Admin'],
//     LIST_PENDING_MANAGER: ['Manager', 'HR', 'Admin'],
//     LIST_PENDING_FINANCE: ['Finance', 'Admin'],
//     DELETE_EXPENSE: ['Admin', 'HR'],

//     VIEW_NOTIFICATIONS: ['Admin', 'HR', 'Manager', 'Employee'],
//     SEND_NOTIFICATION: ['Admin', 'HR'],
//     DELETE_NOTIFICATION: ['Admin'],

//     VIEW_PAYROLL: ['Admin', 'HR', 'Finance', 'Manager'],
//     GENERATE_PAYROLL: ['Admin', 'HR', 'Finance', 'Manager'],
//     APPROVE_PAYROLL: ['Admin', 'HR', 'Finance', 'Manager'],
//     EXPORT_PAYROLL: ['Admin', 'HR', 'Finance', 'Manager'],

//     VIEW_YEAR_END_REPORT: ['Admin', 'HR', 'Finance', 'Manager'],
//     GENERATE_YEAR_END_REPORT: ['Admin', 'HR', 'Finance', 'Manager'],

//     VIEW_LEAVE: ['Admin', 'HR', 'Manager', 'Employee'],
//     REVIEW_LEAVE: ['Admin', 'HR', 'Manager','Finance'],
//     APPLY_LEAVE: ['Employee', 'Manager', 'Admin','Finance'],
//     APPROVE_LEAVE: ['Admin', 'HR', 'Finance', 'Manager'],
//     REJECT_LEAVE: ['Admin', 'HR', 'Finance', 'Manager'],

//     CREATE_COMPANY: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
//         LIST_COMPANIES: ['Admin', 'HR', 'Manager', 'Finance'],
//         VIEW_COMPANY: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
//     UPDATE_COMPANY: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
//         DELETE_COMPANY: ['Admin'],
//         REACTIVATE_COMPANY: ['Admin'],

//         UPLOAD_COMPANY_LOGO: ['Admin', 'HR'],
//         DELETE_COMPANY_LOGO: ['Admin', 'HR'],

//         VIEW_COMPANY_SETTINGS: ['Admin', 'HR', 'Manager'],
//         UPDATE_COMPANY_SETTINGS: ['Admin', 'HR'],

//         VIEW_COMPANY_STATS: ['Admin', 'HR', 'Manager', 'Finance'],
//         VIEW_COMPANY_DASHBOARD: ['Admin', 'HR', 'Manager', 'Finance'],

//     VIEW_COMPANY_USERS: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'], 
//     ADD_COMPANY_USER: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
//     REMOVE_COMPANY_USER: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
//     UPDATE_USER: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],

//         VIEW_SUBSCRIPTION: ['Admin', 'HR'],
//         UPDATE_SUBSCRIPTION: ['Admin'],

//         SEND_COMPANY_NOTIFICATION: ['Admin', 'HR'],

 
// };

// const getRoles = (user) => {

//     if (!user) return [];

//     const roles = [];
   

//     if (Array.isArray(user.roles)) {
        
//         roles.push(...user.roles.map(r => String(r?.name ?? r)));
//     }

//     if (user.primaryRole) roles.push(String(user.primaryRole));
//     if (user.role) roles.push(String(user.role));

   

//     return [...new Set(roles)];
// };

// const buildResponse = (success, message, statusCode = 200) => ({
//     success,
//     message,
//     statusCode,
// });



// const assertPermission = (actor, permission) => {
//     const roles = getRoles(actor);
    
    

//     if (roles.length === 0) {
//         return { allowed: false, reason: 'NO_ROLES' };
//     }

//     const allowedRoles = PERMISSIONS[permission];
  

//     if (!allowedRoles) {
//         return { allowed: false, reason: 'UNKNOWN_PERMISSION' };
//     }

//     const isAllowed = roles.some(role =>
//         allowedRoles.some(a => a.toLowerCase() === role.toLowerCase())
//     );

//     return { allowed: isAllowed };
// };


// const requirePermission = (permission) => (req, res, next) => {
//     const result = assertPermission(req.user, permission);
  

//     if (!result.allowed) {
//         return res.status(403).json({
//             success: false,
//             message: 'Forbidden',
//         });
//     }

//     next();
// };

// module.exports = {
//     assertPermission,
//     requirePermission,
//     PERMISSIONS,
// };

'use strict';

// src/utils/Permissions.js
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for every permission in the system.
// Format: PERMISSION_KEY: ['Role1', 'Role2', ...]
// Roles: Admin | HR | Manager | Finance | Employee
// ─────────────────────────────────────────────────────────────────────────────

const PERMISSIONS = {

    // ── DASHBOARD ──────────────────────────────────────────────────────────────
    VIEW_DASHBOARD: ['Admin', 'HR', 'Manager', 'Employee'],

    // ── USERS ─────────────────────────────────────────────────────────────────
    LIST_USERS: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
    VIEW_DEPARTMENT: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
    UPDATE_USER: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],

    // ── AUDIT LOGS ────────────────────────────────────────────────────────────
    VIEW_AUDIT_LOGS: ['Admin', 'HR', 'Manager'],
    VIEW_AUDIT_STATS: ['Admin', 'HR', 'Manager'],
    VIEW_USER_AUDIT: ['Admin', 'HR', 'Manager'],
    VIEW_MODULE_AUDIT: ['Admin', 'HR', 'Manager'],
    EXPORT_AUDIT_LOGS: ['Admin', 'HR'],
    DELETE_AUDIT_LOGS: ['Admin'],
    CREATE_AUDIT_LOG: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],

    // ── EXPENSE ───────────────────────────────────────────────────────────────
    SUBMIT_EXPENSE: ['Employee', 'Manager', 'HR', 'Finance', 'Admin'],
    REVIEW_EXPENSE: ['Manager', 'HR', 'Admin'],
    FINANCE_REVIEW: ['Finance', 'Admin', 'Manager', 'HR'],
    LIST_MY_EXPENSES: ['Employee', 'Manager', 'HR', 'Finance', 'Admin'],
    LIST_PENDING_MANAGER: ['Manager', 'HR', 'Admin'],
    LIST_PENDING_FINANCE: ['Finance', 'Admin'],
    DELETE_EXPENSE: ['Admin', 'HR'],

    // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
    VIEW_NOTIFICATIONS: ['Admin', 'HR', 'Manager', 'Employee'],
    SEND_NOTIFICATION: ['Admin', 'HR'],
    DELETE_NOTIFICATION: ['Admin'],

    // ── PAYROLL ───────────────────────────────────────────────────────────────
    VIEW_PAYROLL: ['Admin', 'HR', 'Finance', 'Manager', 'Employee'],
    GENERATE_PAYROLL: ['Admin', 'HR', 'Finance', 'Manager'],
    APPROVE_PAYROLL: ['Admin', 'HR', 'Finance', 'Manager'],
    EXPORT_PAYROLL: ['Admin', 'HR', 'Finance', 'Manager'],

    // ── YEAR END ──────────────────────────────────────────────────────────────
    VIEW_YEAR_END_REPORT: ['Admin', 'HR', 'Finance', 'Manager'],
    GENERATE_YEAR_END_REPORT: ['Admin', 'HR', 'Finance', 'Manager'],

    // ── LEAVE ─────────────────────────────────────────────────────────────────
    VIEW_LEAVE: ['Admin', 'HR', 'Manager', 'Employee'],
    REVIEW_LEAVE: ['Admin', 'HR', 'Manager', 'Finance'],
    APPLY_LEAVE: ['Employee', 'Manager', 'Admin', 'Finance'],
    APPROVE_LEAVE: ['Admin', 'HR', 'Finance', 'Manager'],
    REJECT_LEAVE: ['Admin', 'HR', 'Finance', 'Manager'],

    // ── COMPANY ───────────────────────────────────────────────────────────────
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
    VIEW_SUBSCRIPTION: ['Admin', 'HR'],
    UPDATE_SUBSCRIPTION: ['Admin'],
    SEND_COMPANY_NOTIFICATION: ['Admin', 'HR'],

    // ─────────────────────────────────────────────────────────────────────────
    // NEW PERMISSIONS — all modules below are newly added
    // ─────────────────────────────────────────────────────────────────────────

    // ── ATTENDANCE ────────────────────────────────────────────────────────────
    // (was missing — employees couldn't be checked for VIEW_ATTENDANCE)
    VIEW_ATTENDANCE: ['Admin', 'HR', 'Manager', 'Employee'],   // own records
    MANAGE_ATTENDANCE: ['Admin', 'HR', 'Manager'],               // admin override / bulk

    // ── SHIFT MANAGEMENT ──────────────────────────────────────────────────────
    VIEW_SHIFTS: ['Admin', 'HR', 'Manager', 'Employee'],  // employee sees own shift
    MANAGE_SHIFTS: ['Admin', 'HR', 'Manager'],              // create/edit shift configs
    ASSIGN_SHIFT: ['Admin', 'HR', 'Manager'],              // assign shift to employee

    // ── EMPLOYEE LIFECYCLE ────────────────────────────────────────────────────
    VIEW_LIFECYCLE: ['Admin', 'HR', 'Manager', 'Employee'],   // own timeline
    MANAGE_LIFECYCLE: ['Admin', 'HR'],                          // create stages, edit
    MANAGE_TRANSFER: ['Admin', 'HR', 'Manager'],               // dept / location transfer
    VIEW_FNF: ['Admin', 'HR', 'Finance', 'Employee'],   // own F&F
    GENERATE_FNF: ['Admin', 'HR', 'Finance'],               // calculate + issue F&F

    // ── DOCUMENT MANAGEMENT ───────────────────────────────────────────────────
    VIEW_DOCUMENTS: ['Admin', 'HR', 'Manager', 'Employee'],  // own docs
    UPLOAD_DOCUMENT: ['Admin', 'HR', 'Manager', 'Employee'],  // upload own docs
    DOWNLOAD_DOCUMENT: ['Admin', 'HR', 'Manager', 'Employee'],  // own docs
    DELETE_DOCUMENT: ['Admin', 'HR'],                         // hard delete
    MANAGE_DOCUMENT_ACCESS: ['Admin', 'HR'],                         // set visibility
    VIEW_ALL_DOCUMENTS: ['Admin', 'HR'],                         // all employees' docs
    UPLOAD_COMPANY_DOCUMENT: ['Admin', 'HR'],                         // policies, compliance

    // ── ATS — HIRING PIPELINE ─────────────────────────────────────────────────
    VIEW_ATS: ['Admin', 'HR', 'Manager'],       // view jobs + candidates
    MANAGE_ATS: ['Admin', 'HR'],                  // create/edit jobs
    VIEW_CANDIDATES: ['Admin', 'HR', 'Manager'],       // candidate list
    MANAGE_CANDIDATES: ['Admin', 'HR', 'Manager'],       // move pipeline stages
    CONDUCT_INTERVIEW: ['Admin', 'HR', 'Manager'],       // schedule + give feedback
    MAKE_OFFER: ['Admin', 'HR'],                  // generate + send offer letter
    CONVERT_TO_EMPLOYEE: ['Admin', 'HR'],                  // candidate → employee trigger

    // ── PERFORMANCE ───────────────────────────────────────────────────────────
    VIEW_PERFORMANCE: ['Admin', 'HR', 'Manager', 'Employee'],   // own goals/reviews
    MANAGE_GOALS: ['Admin', 'HR', 'Manager', 'Employee'],   // set own goals
    VIEW_TEAM_GOALS: ['Admin', 'HR', 'Manager'],               // see team's goals
    MANAGE_TEAM_GOALS: ['Admin', 'HR', 'Manager'],               // edit team goals
    CONDUCT_REVIEW: ['Admin', 'HR', 'Manager'],               // submit manager review
    VIEW_REVIEWS: ['Admin', 'HR', 'Manager', 'Employee'],   // own reviews
    VIEW_ALL_REVIEWS: ['Admin', 'HR'],                          // all employees
    ACKNOWLEDGE_REVIEW: ['Employee', 'Manager'],                  // sign off own review
    TRIGGER_PROMOTION: ['Admin', 'HR'],                          // based on review rating
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract all role strings from a user object.
 * Handles: user.roles (array), user.primaryRole (string), user.role (string).
 */
const getRoles = (user) => {
    if (!user) return [];

    const roles = [];

    if (Array.isArray(user.roles)) {
        roles.push(...user.roles.map(r => String(r?.name ?? r)));
    }

    if (user.primaryRole) roles.push(String(user.primaryRole));
    if (user.role) roles.push(String(user.role));

    return [...new Set(roles)];
};

/**
 * Check whether an actor has a given permission.
 * Returns { allowed: boolean, reason?: string }
 */
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

/**
 * Express middleware factory — use directly in routes.
 * Usage: router.get('/foo', requirePermission('VIEW_DOCUMENTS'), ctrl.foo)
 */
const requirePermission = (permission) => (req, res, next) => {
    const result = assertPermission(req.user, permission);

    if (!result.allowed) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    next();
};

module.exports = {
    assertPermission,
    requirePermission,
    PERMISSIONS,
};