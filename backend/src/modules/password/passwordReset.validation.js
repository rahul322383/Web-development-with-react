'use strict';

const Joi = require('joi');

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
});

const verifyTokenSchema = Joi.object({
    token: Joi.string().hex().length(64).required(),
});

const resetPasswordSchema = Joi.object({
    token: Joi.string().hex().length(64).required(),
    newPassword: Joi.string().min(8).required(),
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
});

module.exports = { forgotPasswordSchema, verifyTokenSchema, resetPasswordSchema, changePasswordSchema };