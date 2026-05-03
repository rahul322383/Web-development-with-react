'use strict';

const Joi = require('joi');

// ── SHIFT SCHEMA ─────────────────────────────────────────

const shiftSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),

    startTime: Joi.string()
        .pattern(/^\d{2}:\d{2}$/)
        .required()
        .messages({
            'string.pattern.base': 'startTime must be HH:MM (e.g. 09:00)',
        }),

    endTime: Joi.string()
        .pattern(/^\d{2}:\d{2}$/)
        .required()
        .messages({
            'string.pattern.base': 'endTime must be HH:MM (e.g. 18:00)',
        }),

    graceMins: Joi.number().integer().min(0).max(60).default(15),

    breakDurationMins: Joi.number().integer().min(0).max(180).default(0),

    overtimeAfterMins: Joi.number().integer().min(0).default(0),

    overtimeRateMultiplier: Joi.number().min(1).max(5).default(1.5),

    workDays: Joi.array()
        .items(Joi.number().integer().min(0).max(6))
        .min(1)
        .default([1, 2, 3, 4, 5]),

    isNightShift: Joi.boolean().default(false),

    description: Joi.string().trim().max(300).optional().allow('', null),
});


// ── ASSIGN SHIFT SCHEMA ─────────────────────────────────

const assignShiftSchema = Joi.object({
    employeeId: Joi.number().integer().positive().required(),

    shiftId: Joi.number().integer().positive().required(),

    effectiveFrom: Joi.date().iso().required(),

    effectiveTo: Joi.date()
        .iso()
        .min(Joi.ref('effectiveFrom'))
        .optional()
        .allow(null),

    notes: Joi.string().trim().max(300).optional().allow('', null),
});


// ── REPORT QUERY SCHEMA ─────────────────────────────────

const shiftReportQuerySchema = Joi.object({
    month: Joi.number().integer().min(1).max(12).optional(),
    year: Joi.number().integer().min(2000).max(2100).optional(),
});


// ── EXPORTS ────────────────────────────────────────────

module.exports = {
    shiftSchema,
    assignShiftSchema,
    shiftReportQuerySchema,
};