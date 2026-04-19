
// const PERMISSIONS = {
//     VIEW_AUDIT_LOGS: ['Admin', 'HR', 'Manager'],
//     VIEW_AUDIT_STATS: ['Admin', 'HR', 'Manager'],
//     VIEW_USER_AUDIT: ['Admin', 'HR', 'Manager'],
//     VIEW_MODULE_AUDIT: ['Admin', 'HR', 'Manager'],
//     EXPORT_AUDIT_LOGS: ['Admin', 'HR'],
//     DELETE_AUDIT_LOGS: ['Admin'],
//     CREATE_AUDIT_LOG: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
// };


// const buildResponse = (success, message, statusCode = 200) => ({
//     success,
//     message,
//     statusCode,
// });



// const assertPermission = (actor, permission) => {
    
//     if (!actor || !actor.primaryRole) {
//         return buildResponse(false, 'Unauthorized: no actor provided', 403);
//     }

  
    
//     const allowed = PERMISSIONS[permission];
//     if (!allowed) {
//         return buildResponse(false, `Unknown permission: ${permission}`, 500);
//     }

    
    
//     if (!allowed.includes(actor.primaryRole)) {
//         return buildResponse(
//             false,
//             `Unauthorized: role "${actor.primaryRole}" cannot perform "${permission}"`,
//             403
//         );
//     }

//     // Success
//     return buildResponse(true, 'Permission granted', 200);
// };

// // -----------------------------
// module.exports = { assertPermission, PERMISSIONS };


'use strict';

// -----------------------------
// Permissions Config
// -----------------------------
const PERMISSIONS = {
    VIEW_AUDIT_LOGS: ['Admin', 'HR', 'Manager'],
    VIEW_AUDIT_STATS: ['Admin', 'HR', 'Manager'],
    VIEW_USER_AUDIT: ['Admin', 'HR', 'Manager'],
    VIEW_MODULE_AUDIT: ['Admin', 'HR', 'Manager'],
    EXPORT_AUDIT_LOGS: ['Admin', 'HR'],
    DELETE_AUDIT_LOGS: ['Admin'],
    CREATE_AUDIT_LOG: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
};

// -----------------------------
// Response Builder
// -----------------------------
const buildResponse = (success, message, statusCode = 200) => ({
    success,
    message,
    statusCode,
});

// -----------------------------
// Permission Checker
// -----------------------------
const assertPermission = (actor, permission) => {
    const roleRaw = actor?.primaryRole || actor?.role;
    const role = roleRaw ? String(roleRaw).trim() : null;

    // No actor / role
    if (!actor || !role) {
        return buildResponse(false, 'Unauthorized: no actor provided', 403);
    }

    // Permission not defined
    const allowed = PERMISSIONS[permission];
    if (!allowed) {
        console.error(`❌ Unknown permission used: ${permission}`);
        return buildResponse(false, `Unknown permission: ${permission}`, 500);
    }

    // Normalize roles (case-insensitive safety)
    const isAllowed = allowed.some(
        (r) => r.toLowerCase() === role.toLowerCase()
    );

    if (!isAllowed) {
        return buildResponse(
            false,
            `Unauthorized: role "${role}" cannot perform "${permission}"`,
            403
        );
    }

    return buildResponse(true, 'Permission granted', 200);
};

// -----------------------------
// OPTIONAL: Middleware Wrapper (🔥 BEST PRACTICE)
// -----------------------------
const requirePermission = (permission) => {
    return (req, res, next) => {
        const result = assertPermission(req.user, permission);

        if (!result.success) {
            return res.status(result.statusCode).json(result);
        }

        next();
    };
};

// -----------------------------
module.exports = {
    assertPermission,
    requirePermission, // 🔥 use this in routes
    PERMISSIONS,
};