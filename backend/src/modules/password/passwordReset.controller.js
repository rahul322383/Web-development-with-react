'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const service = require('./passwordReset.service');

// POST /auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
    const result = await service.forgotPassword(req.body.email);
    return res.status(result.success ? 200 : result.statusCode).json(result);
});

// GET /auth/verify-reset-token?token=xxx
const verifyResetToken = asyncHandler(async (req, res) => {
    const result = await service.verifyResetToken(req.query.token);
    return res.status(result.success ? 200 : result.statusCode).json(result);
});

// POST /auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
    const result = await service.resetPassword(req.body.token, req.body.newPassword);
    return res.status(result.success ? 200 : result.statusCode).json(result);
});

const changePassword = asyncHandler(async (req, res) => {
    const result = await service.changePassword(
        req.user.id,
        req.body.currentPassword,
        req.body.newPassword
    );


    return res.status(result.statusCode).json(result);
});

module.exports = { forgotPassword, verifyResetToken, resetPassword, changePassword };