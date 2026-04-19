'use strict';

const logger = require('../../config/logger');
const eventBus = require('../../utils/Eventbus ')
const { fullName } = require('./userFormatter');


const NOTIFICATION_TYPES = {
    USER_CREATED: 'USER_CREATED',
    USER_CREATED_ADMIN: 'USER_CREATED_ADMIN',
    USER_CREATED_HR: 'USER_CREATED_HR',
    NEW_TEAM_MEMBER: 'NEW_TEAM_MEMBER',

    USER_UPDATED: 'USER_UPDATED',
    USER_UPDATED_SUCCESS: 'USER_UPDATED_SUCCESS',
    USER_UPDATED_ADMIN: 'USER_UPDATED_ADMIN',
    TEAM_MEMBER_UPDATED: 'TEAM_MEMBER_UPDATED',
    TEAM_MEMBER_REMOVED: 'TEAM_MEMBER_REMOVED',

    USER_DELETED: 'USER_DELETED',
    USER_DELETED_ADMIN: 'USER_DELETED_ADMIN',
    TEAM_MEMBER_DELETED: 'TEAM_MEMBER_DELETED',
    EMPLOYEE_OFFBOARDED: 'EMPLOYEE_OFFBOARDED',
};

/**
 * Emit async notification event instead of direct socket call
 */
const dispatchNotification = (userId, payload) => {
    try {
        eventBus.emit('SEND_NOTIFICATION', { userId, payload });
    } catch (err) {
        logger.error({ event: 'NOTIFICATION_DISPATCH_FAILED', userId, error: err.message });
    }
};

/**
 * Deduplicate recipients
 */
const buildRecipients = (...arrays) => {
    const set = new Set();
    arrays.flat().forEach((id) => {
        if (id) set.add(Number(id));
    });
    return Array.from(set);
};

/**
 * USER CREATED
 */
const notifyUserCreated = ({ actor, user, role, adminIds = [], hrTeamIds = [] }) => {
    const actorName = fullName(actor);
    const userName = fullName(user);

    const recipients = buildRecipients(
        actor.id,
        user.managerId,
        adminIds,
        hrTeamIds
    );

    recipients.forEach((recipientId) => {
        let payload;

        if (recipientId === actor.id) {
            payload = {
                type: NOTIFICATION_TYPES.USER_CREATED,
                title: 'User Created Successfully',
                message: `New user ${userName} (${user.email}) has been created.`,
            };
        } else if (recipientId === user.managerId) {
            payload = {
                type: NOTIFICATION_TYPES.NEW_TEAM_MEMBER,
                title: 'New Team Member Added',
                message: `${userName} has been added to your team as ${role}.`,
            };
        } else if (adminIds.includes(recipientId)) {
            payload = {
                type: NOTIFICATION_TYPES.USER_CREATED_ADMIN,
                title: 'New User Created',
                message: `${actorName} created a new user: ${userName}`,
            };
        } else if (hrTeamIds.includes(recipientId)) {
            payload = {
                type: NOTIFICATION_TYPES.USER_CREATED_HR,
                title: 'New Employee Onboarded',
                message: `New employee ${userName} has been onboarded.`,
            };
        }

        if (payload) {
            dispatchNotification(recipientId, {
                ...payload,
                userId: user.id,
                employeeCode: user.employeeCode,
                email: user.email,
                role,
                department: user.department,
                createdBy: actorName,
            });
        }
    });
};

/**
 * USER UPDATED
 */
const notifyUserUpdated = ({ actor, existing, updated, changes = [], adminIds = [] }) => {
    const actorName = fullName(actor);
    const userName = fullName(updated);

    const recipients = buildRecipients(
        updated.id,
        actor.id,
        updated.managerId,
        existing.managerId,
        adminIds
    );

    recipients.forEach((recipientId) => {
        let payload;

        if (recipientId === updated.id) {
            payload = {
                type: NOTIFICATION_TYPES.USER_UPDATED,
                title: 'Profile Updated',
                message: `Your profile has been updated by ${actorName}.`,
            };
        } else if (recipientId === actor.id) {
            payload = {
                type: NOTIFICATION_TYPES.USER_UPDATED_SUCCESS,
                title: 'User Updated Successfully',
                message: `User ${userName} has been updated successfully.`,
            };
        } else if (recipientId === updated.managerId && recipientId !== actor.id) {
            payload = {
                type: NOTIFICATION_TYPES.TEAM_MEMBER_UPDATED,
                title: 'Team Member Updated',
                message: `${userName}'s profile has been updated.`,
            };
        } else if (
            recipientId === existing.managerId &&
            existing.managerId !== updated.managerId &&
            recipientId !== actor.id
        ) {
            payload = {
                type: NOTIFICATION_TYPES.TEAM_MEMBER_REMOVED,
                title: 'Team Member Reassigned',
                message: `${userName} has been moved from your team.`,
            };
        } else if (
            adminIds.includes(recipientId) &&
            recipientId !== actor.id &&
            recipientId !== updated.id
        ) {
            payload = {
                type: NOTIFICATION_TYPES.USER_UPDATED_ADMIN,
                title: 'User Profile Updated',
                message: `${actorName} updated ${userName}'s profile.`,
            };
        }

        if (payload) {
            dispatchNotification(recipientId, {
                ...payload,
                userId: updated.id,
                employeeName: userName,
                changes,
                updatedBy: actorName,
                updatedAt: new Date().toISOString(),
            });
        }
    });
};

/**
 * USER DELETED
 */
const notifyUserDeleted = ({ actor, user, adminIds = [], hrTeamIds = [] }) => {
    const actorName = fullName(actor);
    const userName = fullName(user);

    const recipients = buildRecipients(
        actor.id,
        user.managerId,
        adminIds,
        hrTeamIds
    );

    recipients.forEach((recipientId) => {
        let payload;

        if (recipientId === actor.id) {
            payload = {
                type: NOTIFICATION_TYPES.USER_DELETED,
                title: 'User Deleted',
                message: `User ${userName} (${user.email}) has been deleted.`,
            };
        } else if (recipientId === user.managerId && recipientId !== actor.id) {
            payload = {
                type: NOTIFICATION_TYPES.TEAM_MEMBER_DELETED,
                title: 'Team Member Removed',
                message: `${userName} has been removed from the system.`,
            };
        } else if (adminIds.includes(recipientId)) {
            payload = {
                type: NOTIFICATION_TYPES.USER_DELETED_ADMIN,
                title: 'User Account Deleted',
                message: `${actorName} deleted user ${userName}.`,
            };
        } else if (
            hrTeamIds.includes(recipientId) &&
            !adminIds.includes(recipientId) &&
            recipientId !== actor.id
        ) {
            payload = {
                type: NOTIFICATION_TYPES.EMPLOYEE_OFFBOARDED,
                title: 'Employee Offboarded',
                message: `${userName} has been removed from the system.`,
            };
        }

        if (payload) {
            dispatchNotification(recipientId, {
                ...payload,
                userId: user.id,
                employeeName: userName,
                email: user.email,
                department: user.department,
                deletedBy: actorName,
                deletedAt: new Date().toISOString(),
            });
        }
    });
};

module.exports = {
    notifyUserCreated,
    notifyUserUpdated,
    notifyUserDeleted,
    NOTIFICATION_TYPES,
};