'use strict';

const Joi = require('joi');

// ─── Reusable field definitions ───────────────────────────────────────────────
const timeField = Joi.string()
  .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
  .messages({ 'string.pattern.base': '{{#label}} must be in HH:MM or HH:MM:SS format.' });

const dateField = Joi.string()
  .isoDate()
  .messages({ 'string.isoDate': '{{#label}} must be a valid ISO date (YYYY-MM-DD).' });

const pageField  = Joi.number().integer().min(1).default(1);
const limitField = Joi.number().integer().min(1).max(200).default(20);

// ─── Schemas ──────────────────────────────────────────────────────────────────

/** POST /attendance/checkin */
const checkInSchema = Joi.object({
  checkInTime: timeField.required().label('checkInTime'),
});

/** PATCH /attendance/checkout */
const checkOutSchema = Joi.object({
  checkOutTime: timeField.required().label('checkOutTime'),
});

/** POST /attendance/admin  (HR / manager manual entry) */
const adminRecordSchema = Joi.object({
  employeeId: Joi.number().integer().positive().required(),
  date:       dateField.required().label('date'),
  checkIn:    timeField.optional().label('checkIn'),
  checkOut:   timeField.optional().label('checkOut'),
  status:     Joi.string()
    .valid('present', 'late', 'absent', 'half_day', 'on_leave', 'holiday')
    .optional(),
  notes:      Joi.string().max(500).optional().allow('', null),
}).with('checkOut', 'checkIn');  // checkOut only valid when checkIn is also provided

/** GET /attendance/my  (employee's own records) */
const myAttendanceSchema = Joi.object({
  startDate: dateField.optional().label('startDate'),
  endDate:   dateField.optional().label('endDate'),
  page:      pageField,
  limit:     limitField,
});

/** GET /attendance/report  (HR team report) */
const teamReportSchema = Joi.object({
  startDate:  dateField.optional().label('startDate'),
  endDate:    dateField.optional().label('endDate'),
  employeeId: Joi.number().integer().positive().optional(),
  status:     Joi.string()
    .valid('present', 'late', 'absent', 'half_day', 'on_leave', 'holiday')
    .optional(),
  page:       pageField,
  limit:      limitField,
});

/** GET /attendance/overtime-summary */
const overtimeSummarySchema = Joi.object({
  employeeId: Joi.number().integer().positive().required(),
  month:      Joi.number().integer().min(1).max(12).required(),
  year:       Joi.number().integer().min(2000).max(2100).required(),
});

// ─── Validation middleware factory ────────────────────────────────────────────
const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map(d => ({ field: d.context?.key, message: d.message }));
    return res.status(422).json({ success: false, message: 'Validation failed.', errors: details });
  }

  req[source] = value;   // replace with sanitised values
  next();
};

module.exports = {
  validateCheckIn:        validate(checkInSchema,        'body'),
  validateCheckOut:       validate(checkOutSchema,       'body'),
  validateAdminRecord:    validate(adminRecordSchema,    'body'),
  validateMyAttendance:   validate(myAttendanceSchema,   'query'),
  validateTeamReport:     validate(teamReportSchema,     'query'),
  validateOvertimeSummary: validate(overtimeSummarySchema, 'query'),
};
