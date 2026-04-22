'use strict';

const { PasswordResetToken, User, Role } = require('../../database/initModels');

const findUserByEmail = (email) =>
    User.findOne({
        where: { email },
        include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
    });

const findUserById = (id) =>
    User.findByPk(id, {
        include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
    });

// invalidate all previous unused tokens for user before creating new one
const invalidatePreviousTokens = (userId, transaction = null) =>
    PasswordResetToken.update(
        { usedAt: new Date() },
        { where: { userId, usedAt: null }, transaction }
    );

const createResetToken = ({ userId, tokenHash, expiresAt }, transaction = null) =>
    PasswordResetToken.create({ userId, tokenHash, expiresAt }, { transaction });

const findValidToken = (tokenHash) =>
    PasswordResetToken.findOne({
        where: { tokenHash, usedAt: null },
        include: [{ model: User, as: 'user', include: [{ model: Role, as: 'role' }] }],
    });

const markTokenUsed = (id, transaction = null) =>
    PasswordResetToken.update(
        { usedAt: new Date() },
        { where: { id }, transaction }
    );

const updatePassword = (userId, passwordHash, transaction = null) =>
    User.update(
        { passwordHash },
        { where: { id: userId }, transaction }
    );

module.exports = {
    findUserByEmail,
    findUserById,
    invalidatePreviousTokens,
    createResetToken,
    findValidToken,
    markTokenUsed,
    updatePassword,
};