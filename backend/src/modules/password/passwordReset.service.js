'use strict';

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const repo = require('./passwordReset.repository');
const { sequelize } = require('../../database/initModels');
const { sendMail } = require('../../utils/mailer');
const env = require('../../config/env');

const forgotPassword = async (email) => {
    try {
        const user = await repo.findUserByEmail(email);

        if (!user) return { success: true, message: 'If that email exists, a reset link has been sent' };
        if (!user.isActive) return { success: true, message: 'If that email exists, a reset link has been sent' };

        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(
            Date.now() + Number(env.PASSWORD_RESET_EXPIRES_MINUTES || 15) * 60 * 1000
        );

        await sequelize.transaction(async (transaction) => {
            await repo.invalidatePreviousTokens(user.id, transaction);
            await repo.createResetToken({ userId: user.id, tokenHash, expiresAt }, transaction);
        });

        const resetLink = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;

        await sendMail({
            to: user.email,
            subject: 'Password Reset Request',
            html: `
        <h2>Password Reset</h2>
        <p>Hi ${user.firstName},</p>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetLink}" style="
          display:inline-block;padding:10px 20px;background:#4F46E5;
          color:#fff;text-decoration:none;border-radius:5px;margin:16px 0
        ">Reset Password</a>
        <p>This link expires in <strong>${env.PASSWORD_RESET_EXPIRES_MINUTES || 15} minutes</strong>.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr/>
        <small>Do not share this link with anyone.</small>
      `,
        });

        return { success: true, message: 'If that email exists, a reset link has been sent' };

    } catch (error) {
        return { success: false, message: 'Something went wrong', statusCode: 500 };
    }
};

const verifyResetToken = async (rawToken) => {
    try {
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const record = await repo.findValidToken(tokenHash);

        if (!record) return { success: false, message: 'Invalid or expired token', statusCode: 400 };
        if (new Date() > record.expiresAt) return { success: false, message: 'Token has expired', statusCode: 400 };

        return { success: true, message: 'Token is valid' };
    } catch (error) {
        return { success: false, message: 'Something went wrong', statusCode: 500 };
    }
};

const resetPassword = async (rawToken, newPassword) => {
    try {
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const record = await repo.findValidToken(tokenHash);

        if (!record) return { success: false, message: 'Invalid or expired token', statusCode: 400 };
        if (new Date() > record.expiresAt) return { success: false, message: 'Token has expired', statusCode: 400 };

        const user = record.user;
        if (!user || !user.isActive) return { success: false, message: 'User not found or inactive', statusCode: 400 };

        const passwordHash = await bcrypt.hash(newPassword, Number(env.BCRYPT_ROUNDS) || 10);

        await sequelize.transaction(async (transaction) => {
            await repo.updatePassword(user.id, passwordHash, transaction);
            await repo.markTokenUsed(record.id, transaction);
        });

        await sendMail({
            to: user.email,
            subject: 'Password Changed Successfully',
            html: `
        <h2>Password Changed</h2>
        <p>Hi ${user.firstName},</p>
        <p>Your password was successfully changed.</p>
        <p>If you did not make this change, please contact support immediately.</p>
      `,
        });

        return { success: true, message: 'Password reset successfully' };

    } catch (error) {
        return { success: false, message: 'Something went wrong', statusCode: 500 };
    }
};

const changePassword = async (userId, currentPassword, newPassword) => {
    try {
        const user = await repo.findUserById(userId);

        if (!user) {
            return { success: false, statusCode: 404, message: 'User not found' };
        }

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

        if (!isMatch) {
            return { success: false, statusCode: 400, message: 'Current password is incorrect' };
        }

        if (currentPassword === newPassword) {
            return { success: false, statusCode: 400, message: 'New password must be different from current password' };
        }

        const passwordHash = await bcrypt.hash(newPassword, Number(env.BCRYPT_ROUNDS) || 10);

        await repo.updatePassword(userId, passwordHash);

        sendMail({
            to: user.email,
            subject: 'Password Changed Successfully',
            html: `
        <h2>Password Changed</h2>
        <p>Hi ${user.firstName},</p>
        <p>Your password was changed successfully.</p>
        <p>If this wasn't you, contact support immediately.</p>
      `,
        }).catch(() => { });

        return { success: true, statusCode: 200, message: 'Password changed successfully' };

    } catch (error) {
        return { success: false, statusCode: 500, message: 'Something went wrong' };
    }
};

module.exports = { forgotPassword, verifyResetToken, resetPassword, changePassword };