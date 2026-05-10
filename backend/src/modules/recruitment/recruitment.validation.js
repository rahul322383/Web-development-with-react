'use strict';

const Joi = require('joi');

// ─────────────────────────────────────────────────────────────────────────────
// Shared validate helper — same pattern as user.validation.js
// ─────────────────────────────────────────────────────────────────────────────

const validate = (schema, data) => {
    const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
    });
    if (error) {
        return { valid: false, message: error.details.map((d) => d.message).join(', ') };
    }
    return { valid: true, value };
};

// ─────────────────────────────────────────────────────────────────────────────
// JOB
// ─────────────────────────────────────────────────────────────────────────────

const createJobSchema = Joi.object({
    title: Joi.string().trim().max(200).required(),
    department: Joi.string().trim().max(100).optional().allow('', null),
    location: Joi.string().trim().max(150).optional().allow('', null),
    employmentType: Joi.string().valid('Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance').default('Full-Time'),
    experienceLevel: Joi.string().valid('Entry', 'Mid', 'Senior', 'Lead', 'Manager', 'Executive').default('Mid'),
    salaryMin: Joi.number().min(0).optional().allow(null),
    salaryMax: Joi.number().min(0).optional().allow(null),
    currency: Joi.string().trim().max(10).default('INR'),
    description: Joi.string().trim().optional().allow('', null),
    responsibilities: Joi.string().trim().optional().allow('', null),
    requirements: Joi.string().trim().optional().allow('', null),
    skills: Joi.array().items(Joi.string().trim().max(80)).default([]),
    openings: Joi.number().integer().min(1).default(1),
    status: Joi.string().valid('Draft', 'Published').default('Draft'),
    isRemote: Joi.boolean().default(false),
    expiresAt: Joi.date().iso().optional().allow(null),
});

const updateJobSchema = Joi.object({
    title: Joi.string().trim().max(200).optional(),
    department: Joi.string().trim().max(100).optional().allow('', null),
    location: Joi.string().trim().max(150).optional().allow('', null),
    employmentType: Joi.string().valid('Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance').optional(),
    experienceLevel: Joi.string().valid('Entry', 'Mid', 'Senior', 'Lead', 'Manager', 'Executive').optional(),
    salaryMin: Joi.number().min(0).optional().allow(null),
    salaryMax: Joi.number().min(0).optional().allow(null),
    currency: Joi.string().trim().max(10).optional(),
    description: Joi.string().trim().optional().allow('', null),
    responsibilities: Joi.string().trim().optional().allow('', null),
    requirements: Joi.string().trim().optional().allow('', null),
    skills: Joi.array().items(Joi.string().trim().max(80)).optional(),
    openings: Joi.number().integer().min(1).optional(),
    status: Joi.string().valid('Draft', 'Published', 'Paused', 'Closed', 'Expired').optional(),
    isRemote: Joi.boolean().optional(),
    expiresAt: Joi.date().iso().optional().allow(null),
}).min(1);

const listJobsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().max(200).optional().allow(''),
    status: Joi.string().valid('Draft', 'Published', 'Paused', 'Closed', 'Expired').optional(),
    department: Joi.string().trim().max(100).optional().allow(''),
    isRemote: Joi.boolean().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATION
// ─────────────────────────────────────────────────────────────────────────────

const applyJobSchema = Joi.object({
    // Candidate info (new candidate created on the fly)
    firstName: Joi.string().trim().max(80).required(),
    lastName: Joi.string().trim().max(80).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().trim().max(20).optional().allow('', null),
    linkedinUrl: Joi.string().uri().optional().allow('', null),
    portfolioUrl: Joi.string().uri().optional().allow('', null),
    experienceYears: Joi.number().min(0).max(60).optional().allow(null),
    currentCompany: Joi.string().trim().max(150).optional().allow('', null),
    currentCtc: Joi.number().min(0).optional().allow(null),
    expectedCtc: Joi.number().min(0).optional().allow(null),
    noticePeriod: Joi.string().trim().max(50).optional().allow('', null),
    skills: Joi.array().items(Joi.string().trim().max(80)).default([]),
    city: Joi.string().trim().max(100).optional().allow('', null),
    // Application specific
    coverLetter: Joi.string().trim().optional().allow('', null),
    source: Joi.string().trim().max(80).default('portal'),
    // resumeUrl comes from Cloudinary upload (handled separately via multer middleware)
});

const updateApplicationStatusSchema = Joi.object({
    status: Joi.string().valid(
        'Applied', 'Screening', 'Shortlisted',
        'Interview Scheduled', 'Interviewed',
        'Selected', 'Rejected', 'Offer Sent',
        'Offer Accepted', 'Joined',
    ).required(),
    notes: Joi.string().trim().optional().allow('', null),
});

const listApplicationsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    jobId: Joi.number().integer().positive().optional(),
    status: Joi.string().optional().allow(''),
    search: Joi.string().trim().max(200).optional().allow(''),
});

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEW
// ─────────────────────────────────────────────────────────────────────────────

const scheduleInterviewSchema = Joi.object({
    applicationId: Joi.number().integer().positive().required(),
    interviewerId: Joi.number().integer().positive().required(),
    round: Joi.string().trim().max(100).required(),
    scheduledAt: Joi.date().iso().required(),
    meetLink: Joi.string().uri().optional().allow('', null),
});

const submitFeedbackSchema = Joi.object({
    feedback: Joi.string().trim().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    result: Joi.string().valid('Passed', 'Failed', 'No Show').required(),
});

// ─────────────────────────────────────────────────────────────────────────────
// OFFER
// ─────────────────────────────────────────────────────────────────────────────

const makeOfferSchema = Joi.object({
    applicationId: Joi.number().integer().positive().required(),
    salary: Joi.number().min(0).required(),
    joiningDate: Joi.date().iso().optional().allow(null),
    expiresAt: Joi.date().iso().optional().allow(null),
    notes: Joi.string().trim().optional().allow('', null),
});

// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
    validate,
    createJobSchema,
    updateJobSchema,
    listJobsSchema,
    applyJobSchema,
    updateApplicationStatusSchema,
    listApplicationsSchema,
    scheduleInterviewSchema,
    submitFeedbackSchema,
    makeOfferSchema,
};