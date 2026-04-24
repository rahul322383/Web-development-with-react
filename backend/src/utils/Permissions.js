
'use strict';

const PERMISSIONS = {
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
    FINANCE_REVIEW: ['Finance', 'Admin','Manager', 'HR'],
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
    REVIEW_LEAVE: ['Admin', 'HR', 'Manager','Finance'],
    APPLY_LEAVE: ['Employee', 'Manager', 'Admin','Finance'],
    APPROVE_LEAVE: ['Admin', 'HR', 'Finance', 'Manager'],
    REJECT_LEAVE: ['Admin', 'HR', 'Finance', 'Manager'],
};

const getRoles = (user) => {
    // Return empty array instead of throwing — assertPermission handles the
    // empty-roles case and returns a clean 403, avoiding unhandled exceptions
    if (!user) return [];

    const roles = [];
   

    if (Array.isArray(user.roles)) {
        // Handle both { name: 'Admin' } objects and plain 'Admin' strings
        roles.push(...user.roles.map(r => String(r?.name ?? r)));
    }

    if (user.primaryRole) roles.push(String(user.primaryRole));
    if (user.role) roles.push(String(user.role));

   

    return [...new Set(roles)];
};

const buildResponse = (success, message, statusCode = 200) => ({
    success,
    message,
    statusCode,
});



const assertPermission = (actor, permission) => {
    const roles = getRoles(actor);
    

    if (roles.length === 0) {
        return { allowed: false, reason: 'NO_ROLES' };
    }

    const allowedRoles = PERMISSIONS[permission];

    if (!allowedRoles) {
        return { allowed: false, reason: 'UNKNOWN_PERMISSION' };
    }

    const isAllowed = roles.some(role =>
        allowedRoles.some(a => a.toLowerCase() === role.toLowerCase())
    );

    return { allowed: isAllowed };
};

// const assertPermission = (actor, permission) => {
//     const roles = getRoles(actor);
//     console.log("permission", roles)
//     if (roles.length === 0) {
//         return buildResponse(false, 'Unauthorized: no roles found', 403);
//     }

//     const allowed = PERMISSIONS[permission];

//     if (!allowed) {
//         return buildResponse(false, `Unknown permission: ${permission}`, 500);
//     }

//     const isAllowed = roles.some(role =>
//         allowed.some(a => String(a).toLowerCase() === String(role).toLowerCase())
//     );

//     return isAllowed
//         ? buildResponse(true, 'Permission granted', 200)
//         : buildResponse(false, `Forbidden: roles [${roles}] cannot perform ${permission}`, 403);
// };

const requirePermission = (permission) => (req, res, next) => {
    const result = assertPermission(req.user, permission);
    

    if (!result.success) {
        return res.status(result.statusCode).json({
            success: false,
            message: result.message,
            data: null,
        });
    }

    next();
};

module.exports = {
    assertPermission,
    requirePermission,
    PERMISSIONS,
};