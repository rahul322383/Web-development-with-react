'use strict';

const Joi = require('joi');

const VALID_TYPES = ['EXPENSE', 'APPROVAL', 'SYSTEM', 'LEAVE', 'PAYROLL', 'SECURITY'];

const createNotificationSchema = Joi.object({
    userId: Joi.number().integer().positive().required(),
    type: Joi.string().valid(...VALID_TYPES).required(),
    message: Joi.string().trim().min(1).max(1000).required(),
    metadata: Joi.object().optional(),
});

const notificationQuerySchema = Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
});

const validate = (schema, data) => {
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
    if (error) {
        return { valid: false, message: error.details.map(d => d.message).join(', ') };
    }
    return { valid: true, value };
};

module.exports = { createNotificationSchema, notificationQuerySchema, validate, VALID_TYPES };