'use strict';

const AppError = require('./AppError');

const PERMISSIONS = {
    VIEW_AUDIT_LOGS: ['Admin', 'HR', 'Manager'],
    VIEW_AUDIT_STATS: ['Admin', 'HR', 'Manager'],
    VIEW_USER_AUDIT: ['Admin', 'HR', 'Manager'],
    VIEW_MODULE_AUDIT: ['Admin', 'HR', 'Manager'],
    EXPORT_AUDIT_LOGS: ['Admin', 'HR'],
    DELETE_AUDIT_LOGS: ['Admin'],
    CREATE_AUDIT_LOG: ['Admin', 'HR', 'Manager', 'Finance', 'Employee'],
};

const assertPermission = (actor, permission) => {
    if (!actor || !actor.primaryRole) {
        throw new AppError('Unauthorized: no actor provided', 403);
    }
    const allowed = PERMISSIONS[permission];
    if (!allowed) {
        throw new AppError(`Unknown permission: ${permission}`, 500);
    }
    if (!allowed.includes(actor.primaryRole)) {
        throw new AppError(
            `Unauthorized: role "${actor.primaryRole}" cannot perform "${permission}"`,
            403,
        );
    }
};

module.exports = { assertPermission, PERMISSIONS };