'use strict';

const service = require('./recruitment.service');

// ─────────────────────────────────────────────────────────────────────────────
// Standard responder — same pattern used across your controllers
// ─────────────────────────────────────────────────────────────────────────────

const respond = (res, result) => {
    const status = result.statusCode || (result.success ? 200 : 400);
    return res.status(status).json(result);
};

const ip = (req) => req.ip || req.connection?.remoteAddress;

// ─────────────────────────────────────────────────────────────────────────────
// JOBS
// ─────────────────────────────────────────────────────────────────────────────

exports.createJob = async (req, res) => {
    respond(res, await service.createJob(req.body, req.user, ip(req)));
};

exports.listJobs = async (req, res) => {
    respond(res, await service.listJobs(req.query, req.user));
};

// Public careers endpoint — no auth middleware on this route
exports.listPublishedJobs = async (req, res) => {
    respond(res, await service.listPublishedJobs(req.query));
};

exports.getJob = async (req, res) => {
    // Pass req.user if authenticated, null for public access
    respond(res, await service.getJob(req.params.id, req.user ?? null));
};

exports.updateJob = async (req, res) => {
    respond(res, await service.updateJob(req.params.id, req.body, req.user, ip(req)));
};

exports.deleteJob = async (req, res) => {
    respond(res, await service.deleteJob(req.params.id, req.user, ip(req)));
};

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATIONS
// ─────────────────────────────────────────────────────────────────────────────

exports.applyToJob = async (req, res) => {
    // req.file is set by multer for the resume upload (optional)
    respond(res, await service.applyToJob(req.params.id, req.body, req.file ?? null));
};

exports.listApplications = async (req, res) => {
    respond(res, await service.listApplications(req.query, req.user));
};

exports.getApplication = async (req, res) => {
    respond(res, await service.getApplication(req.params.id, req.user));
};

exports.updateApplicationStatus = async (req, res) => {
    respond(res, await service.updateApplicationStatus(req.params.id, req.body, req.user, ip(req)));
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEWS
// ─────────────────────────────────────────────────────────────────────────────

exports.scheduleInterview = async (req, res) => {
    respond(res, await service.scheduleInterview(req.body, req.user, ip(req)));
};

exports.submitInterviewFeedback = async (req, res) => {
    respond(res, await service.submitInterviewFeedback(req.params.id, req.body, req.user, ip(req)));
};

// ─────────────────────────────────────────────────────────────────────────────
// OFFERS
// ─────────────────────────────────────────────────────────────────────────────

exports.makeOffer = async (req, res) => {
    respond(res, await service.makeOffer(req.body, req.user, ip(req)));
};

exports.acceptOffer = async (req, res) => {
    respond(res, await service.respondToOffer(req.params.id, 'accept', req.user));
};

exports.rejectOffer = async (req, res) => {
    respond(res, await service.respondToOffer(req.params.id, 'reject', req.user));
};

// ─────────────────────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────────────────────

exports.getStats = async (req, res) => {
    respond(res, await service.getRecruitmentStats(req.user));
};