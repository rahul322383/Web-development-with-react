'use strict';

const sequelize = require('../../database/sequelize');
const repo = require('./recruitment.repository');
const { logAuditEvent } = require('../../utils/auditLogger');
const { clearCacheKeys } = require('../../utils/cache');
const eventBus = require('../../utils/Eventbus');
const logger = require('../../config/logger');
const { assertPermission } = require('../../utils/permissions');
const cloudinary = require('../../config/cloudinary');  // your existing cloudinary setup

const {
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
} = require('./recruitment.validation');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers  (same pattern as userService.js)
// ─────────────────────────────────────────────────────────────────────────────

const fail = (message, statusCode = 400, data = null) => ({
    success: false, message, statusCode, data,
});

const handleError = (event, error, fallback = 'Operation failed') => {
    logger.error({ event, error: error.message, stack: error.stack });
    return fail(error.message || fallback, error.statusCode || 500);
};

// Fetch HR user IDs for bulk notifications (Admin + HR roles)
const getHrIds = async () => {
    try {
        const { User, Role } = require('../../database/initModels');
        const { Op } = require('sequelize');
        const hrRole = await Role.findOne({ where: { name: 'HR' }, attributes: ['id'], raw: true });
        const adminRole = await Role.findOne({ where: { name: 'Admin' }, attributes: ['id'], raw: true });
        const roleIds = [hrRole?.id, adminRole?.id].filter(Boolean);
        if (!roleIds.length) return [];
        const users = await User.findAll({ where: { roleId: { [Op.in]: roleIds } }, attributes: ['id'], raw: true });
        return users.map((u) => u.id);
    } catch { return []; }
};

// ─────────────────────────────────────────────────────────────────────────────
// JOB CRUD
// ─────────────────────────────────────────────────────────────────────────────

const createJob = async (payload, actor, ipAddress) => {
    const perm = assertPermission(actor, 'CREATE_JOB');
    if (!perm.allowed) return fail(perm.message, 403);

    const v = validate(createJobSchema, payload);
    if (!v.valid) return fail(v.message);

    try {
        const job = await repo.createJob({
            ...v.value,
            companyId: actor.companyId,
            postedBy: actor.id,
        });

        try {
            await logAuditEvent({
                userId: actor.id, moduleName: 'Recruitment', actionType: 'CREATE',
                oldData: null, newData: { id: job.id, title: job.title }, ipAddress,
            });
        } catch (e) { logger.error({ event: 'AUDIT_LOG_FAILED', error: e.message }); }

        eventBus.emit('JOB_CREATED', { job, actorId: actor.id });
        return { success: true, statusCode: 201, data: job };
    } catch (error) {
        return handleError('CREATE_JOB_FAILED', error, 'Failed to create job');
    }
};

const listJobs = async (query, actor) => {
    const perm = assertPermission(actor, 'VIEW_JOBS');
    if (!perm.allowed) return fail(perm.message, 403);

    const v = validate(listJobsSchema, query);
    if (!v.valid) return fail(v.message);

    const { page, limit, ...filters } = v.value;
    const offset = (page - 1) * limit;

    try {
        const { rows, count } = await repo.findJobs({ limit, offset, ...filters });
        return {
            success: true, statusCode: 200,
            data: rows,
            pagination: repo.buildPagination(count, page, limit),
        };
    } catch (error) {
        return handleError('LIST_JOBS_FAILED', error, 'Failed to list jobs');
    }
};

// Public — no auth required (careers page)
const listPublishedJobs = async (query) => {
    const v = validate(listJobsSchema, { ...query, status: 'Published' });
    if (!v.valid) return fail(v.message);

    const { page, limit, ...filters } = v.value;
    const offset = (page - 1) * limit;

    try {
        const { rows, count } = await repo.findJobs({ limit, offset, ...filters });
        return {
            success: true, statusCode: 200,
            data: rows,
            pagination: repo.buildPagination(count, page, limit),
        };
    } catch (error) {
        return handleError('LIST_PUBLIC_JOBS_FAILED', error, 'Failed to list jobs');
    }
};

const getJob = async (id, actor = null) => {

    if (!id || isNaN(Number(id))) {
        return fail('Invalid job ID');
    }

    try {

        // ✅ If logged in → permission check
        if (actor) {

            const perm = assertPermission(actor, 'VIEW_JOBS');

            if (!perm.allowed) {
                return fail(perm.message, 403);
            }
        }

        // ✅ Show job to both logged + public users
        const job = await repo.findJobById(id);

        if (!job) {
            return fail('Job not found', 404);
        }

        return {
            success: true,
            statusCode: 200,
            data: job
        };

    } catch (error) {

        return handleError(
            'GET_JOB_FAILED',
            error,
            'Failed to get job'
        );
    }
};


const updateJob = async (id, payload, actor, ipAddress) => {
    const perm = assertPermission(actor, 'UPDATE_JOB');
    if (!perm.allowed) return fail(perm.message, 403);

    if (!id || isNaN(Number(id))) return fail('Invalid job ID');

    const v = validate(updateJobSchema, payload);
    if (!v.valid) return fail(v.message);

    try {
        const existing = await repo.findJobById(id);
        if (!existing) return fail('Job not found', 404);

        await repo.updateJobById(id, v.value);
        const updated = await repo.findJobById(id);

        try {
            await logAuditEvent({
                userId: actor.id, moduleName: 'Recruitment', actionType: 'UPDATE',
                oldData: existing.toJSON(), newData: updated.toJSON(), ipAddress,
            });
        } catch (e) { logger.error({ event: 'AUDIT_LOG_FAILED', error: e.message }); }

        return { success: true, statusCode: 200, data: updated };
    } catch (error) {
        return handleError('UPDATE_JOB_FAILED', error, 'Failed to update job');
    }
};

const deleteJob = async (id, actor, ipAddress) => {
    const perm = assertPermission(actor, 'DELETE_JOB');
    if (!perm.allowed) return fail(perm.message, 403);

    if (!id || isNaN(Number(id))) return fail('Invalid job ID');

    try {
        const existing = await repo.findJobById(id);
        if (!existing) return fail('Job not found', 404);

        await repo.deleteJobById(id);

        try {
            await logAuditEvent({
                userId: actor.id, moduleName: 'Recruitment', actionType: 'DELETE',
                oldData: existing.toJSON(), newData: null, ipAddress,
            });
        } catch (e) { logger.error({ event: 'AUDIT_LOG_FAILED', error: e.message }); }

        return { success: true, statusCode: 200, message: 'Job deleted successfully' };
    } catch (error) {
        return handleError('DELETE_JOB_FAILED', error, 'Failed to delete job');
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Public apply — no actor needed.
 * resumeFile is the multer file object (optional; uploaded to Cloudinary here).
 */
const applyToJob = async (jobId, payload, resumeFile) => {
    if (!jobId || isNaN(Number(jobId))) return fail('Invalid job ID');

    const v = validate(applyJobSchema, payload);
    if (!v.valid) return fail(v.message);

    try {
        const job = await repo.findJobById(jobId);
        if (!job) return fail('Job not found', 404);
        if (job.status !== 'Published') return fail('This job is no longer accepting applications', 400);

        // Upload resume to Cloudinary if provided
        let resumeUrl = null;
        let resumePublicId = null;

        if (resumeFile) {
            const uploadResult = await cloudinary.uploader.upload(resumeFile.path, {
                folder: 'hrms/resumes',
                resource_type: 'raw',
                use_filename: true,
                unique_filename: true,
            });
            resumeUrl = uploadResult.secure_url;
            resumePublicId = uploadResult.public_id;
        }

        let application;

        await sequelize.transaction(async (transaction) => {
            // Upsert candidate — same email = same candidate record
            let candidate = await repo.findCandidateByEmail(v.value.email);

            if (candidate) {
                // Update candidate with latest info
                await repo.updateCandidateById(candidate.id, {
                    firstName: v.value.firstName,
                    lastName: v.value.lastName,
                    phone: v.value.phone ?? candidate.phone,
                    linkedinUrl: v.value.linkedinUrl ?? candidate.linkedinUrl,
                    portfolioUrl: v.value.portfolioUrl ?? candidate.portfolioUrl,
                    experienceYears: v.value.experienceYears ?? candidate.experienceYears,
                    currentCompany: v.value.currentCompany ?? candidate.currentCompany,
                    currentCtc: v.value.currentCtc ?? candidate.currentCtc,
                    expectedCtc: v.value.expectedCtc ?? candidate.expectedCtc,
                    noticePeriod: v.value.noticePeriod ?? candidate.noticePeriod,
                    skills: v.value.skills.length ? v.value.skills : candidate.skills,
                    city: v.value.city ?? candidate.city,
                    ...(resumeUrl ? { resumeUrl, resumePublicId } : {}),
                }, transaction);
            } else {
                candidate = await repo.createCandidate({
                    firstName: v.value.firstName,
                    lastName: v.value.lastName,
                    email: v.value.email,
                    phone: v.value.phone,
                    linkedinUrl: v.value.linkedinUrl,
                    portfolioUrl: v.value.portfolioUrl,
                    experienceYears: v.value.experienceYears,
                    currentCompany: v.value.currentCompany,
                    currentCtc: v.value.currentCtc,
                    expectedCtc: v.value.expectedCtc,
                    noticePeriod: v.value.noticePeriod,
                    skills: v.value.skills,
                    city: v.value.city,
                    resumeUrl,
                    resumePublicId,
                }, transaction);
            }

            // Check duplicate application
            const existing = await repo.findApplicationByJobAndCandidate(jobId, candidate.id);
            if (existing) throw Object.assign(new Error('You have already applied for this job'), { statusCode: 409 });

            application = await repo.createApplication({
                jobId,
                candidateId: candidate.id,
                coverLetter: v.value.coverLetter,
                source: v.value.source,
                status: 'Applied',
                appliedAt: new Date(),
            }, transaction);

            application.candidate = candidate; // attach for notification
        });

        const hrIds = await getHrIds();
        eventBus.emit('APPLICATION_RECEIVED', {
            application, candidate: application.candidate, job, hrIds,
        });

        return { success: true, statusCode: 201, data: application };

    } catch (error) {
        if (error.statusCode === 409) return fail(error.message, 409);
        return handleError('APPLY_JOB_FAILED', error, 'Failed to submit application');
    }
};

const listApplications = async (query, actor) => {
    const perm = assertPermission(actor, 'VIEW_CANDIDATES');
    if (!perm.allowed) return fail(perm.message, 403);

    const v = validate(listApplicationsSchema, query);
    if (!v.valid) return fail(v.message);

    const { page, limit, ...filters } = v.value;
    const offset = (page - 1) * limit;

    try {
        const { rows, count } = await repo.findApplications({ limit, offset, ...filters });
        return {
            success: true, statusCode: 200,
            data: rows,
            pagination: repo.buildPagination(count, page, limit),
        };
    } catch (error) {
        return handleError('LIST_APPLICATIONS_FAILED', error, 'Failed to list applications');
    }
};

const getApplication = async (id, actor) => {
    const perm = assertPermission(actor, 'VIEW_CANDIDATES');
    if (!perm.allowed) return fail(perm.message, 403);

    if (!id || isNaN(Number(id))) return fail('Invalid application ID');

    try {
        const app = await repo.findApplicationById(id);
        if (!app) return fail('Application not found', 404);
        return { success: true, statusCode: 200, data: app };
    } catch (error) {
        return handleError('GET_APPLICATION_FAILED', error, 'Failed to get application');
    }
};

const updateApplicationStatus = async (id, payload, actor, ipAddress) => {
    const perm = assertPermission(actor, 'MOVE_CANDIDATE_STAGE');
    if (!perm.allowed) return fail(perm.message, 403);

    if (!id || isNaN(Number(id))) return fail('Invalid application ID');

    const v = validate(updateApplicationStatusSchema, payload);
    if (!v.valid) return fail(v.message);

    try {
        const app = await repo.findApplicationById(id);
        if (!app) return fail('Application not found', 404);

        await repo.updateApplicationById(id, { status: v.value.status, notes: v.value.notes });

        // If rejected, fire event for notification + audit
        if (v.value.status === 'Rejected') {
            const hrIds = await getHrIds();
            eventBus.emit('CANDIDATE_REJECTED', {
                application: app,
                candidate: app.candidate,
                job: app.job,
                actorId: actor.id,
                hrIds,
            });
        }

        try {
            await logAuditEvent({
                userId: actor.id, moduleName: 'Recruitment', actionType: 'UPDATE',
                oldData: { status: app.status }, newData: { status: v.value.status }, ipAddress,
            });
        } catch (e) { logger.error({ event: 'AUDIT_LOG_FAILED', error: e.message }); }

        const updated = await repo.findApplicationById(id);
        return { success: true, statusCode: 200, data: updated };
    } catch (error) {
        return handleError('UPDATE_APPLICATION_STATUS_FAILED', error, 'Failed to update status');
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEWS
// ─────────────────────────────────────────────────────────────────────────────

const scheduleInterview = async (payload, actor, ipAddress) => {
    const perm = assertPermission(actor, 'SCHEDULE_INTERVIEW');
    if (!perm.allowed) return fail(perm.message, 403);

    const v = validate(scheduleInterviewSchema, payload);
    if (!v.valid) return fail(v.message);

    try {
        const app = await repo.findApplicationById(v.value.applicationId);
        if (!app) return fail('Application not found', 404);

        const interview = await repo.createInterview({
            applicationId: v.value.applicationId,
            interviewerId: v.value.interviewerId,
            round: v.value.round,
            scheduledAt: v.value.scheduledAt,
            meetLink: v.value.meetLink,
            result: 'Pending',
        });

        // Move application stage
        await repo.updateApplicationById(v.value.applicationId, { status: 'Interview Scheduled' });

        const hrIds = await getHrIds();
        eventBus.emit('INTERVIEW_SCHEDULED', {
            interview,
            application: app,
            candidate: app.candidate,
            job: app.job,
            hrIds,
        });

        try {
            await logAuditEvent({
                userId: actor.id, moduleName: 'Recruitment', actionType: 'CREATE',
                oldData: null, newData: { interviewId: interview.id }, ipAddress,
            });
        } catch (e) { logger.error({ event: 'AUDIT_LOG_FAILED', error: e.message }); }

        return { success: true, statusCode: 201, data: interview };
    } catch (error) {
        return handleError('SCHEDULE_INTERVIEW_FAILED', error, 'Failed to schedule interview');
    }
};

const submitInterviewFeedback = async (interviewId, payload, actor, ipAddress) => {
    const perm = assertPermission(actor, 'SUBMIT_INTERVIEW_FEEDBACK');
    if (!perm.allowed) return fail(perm.message, 403);

    if (!interviewId || isNaN(Number(interviewId))) return fail('Invalid interview ID');

    const v = validate(submitFeedbackSchema, payload);
    if (!v.valid) return fail(v.message);

    try {
        const interview = await repo.findInterviewById(interviewId);
        if (!interview) return fail('Interview not found', 404);

        // Only the assigned interviewer or admin/HR can submit
        const isInterviewer = interview.interviewerId === actor.id;
        const isAdminHR = ['admin', 'hr'].includes(actor.primaryRole?.toLowerCase());
        if (!isInterviewer && !isAdminHR) return fail('You are not the assigned interviewer', 403);

        await repo.updateInterviewById(interviewId, {
            feedback: v.value.feedback,
            rating: v.value.rating,
            result: v.value.result,
        });

        // Auto-update application stage based on result
        const newAppStatus = v.value.result === 'Passed' ? 'Interviewed' : 'Interviewed';
        await repo.updateApplicationById(interview.applicationId, { status: newAppStatus });

        const hrIds = await getHrIds();
        eventBus.emit('INTERVIEW_FEEDBACK_SUBMITTED', {
            interview: { ...interview.toJSON(), ...v.value },
            candidate: interview.application?.candidate,
            job: interview.application?.job,
            hrIds,
        });

        const updated = await repo.findInterviewById(interviewId);
        return { success: true, statusCode: 200, data: updated };
    } catch (error) {
        return handleError('SUBMIT_FEEDBACK_FAILED', error, 'Failed to submit feedback');
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// OFFERS
// ─────────────────────────────────────────────────────────────────────────────

const makeOffer = async (payload, actor, ipAddress) => {
    const perm = assertPermission(actor, 'MAKE_OFFER');
    if (!perm.allowed) return fail(perm.message, 403);

    const v = validate(makeOfferSchema, payload);
    if (!v.valid) return fail(v.message);

    try {
        const app = await repo.findApplicationById(v.value.applicationId);
        if (!app) return fail('Application not found', 404);

        // Prevent duplicate offers
        const existing = await repo.findOfferByApplication(v.value.applicationId);
        if (existing && ['Pending', 'Accepted'].includes(existing.status)) {
            return fail('An active offer already exists for this application', 409);
        }

        const offer = await repo.createOffer({
            applicationId: v.value.applicationId,
            offeredBy: actor.id,
            salary: v.value.salary,
            joiningDate: v.value.joiningDate,
            expiresAt: v.value.expiresAt,
            notes: v.value.notes,
            status: 'Pending',
        });

        // Move application to Offer Sent
        await repo.updateApplicationById(v.value.applicationId, { status: 'Offer Sent' });

        const hrIds = await getHrIds();
        eventBus.emit('OFFER_SENT', {
            offer, candidate: app.candidate, job: app.job, actorId: actor.id, hrIds,
        });

        try {
            await logAuditEvent({
                userId: actor.id, moduleName: 'Recruitment', actionType: 'CREATE',
                oldData: null, newData: { offerId: offer.id }, ipAddress,
            });
        } catch (e) { logger.error({ event: 'AUDIT_LOG_FAILED', error: e.message }); }

        return { success: true, statusCode: 201, data: offer };
    } catch (error) {
        return handleError('MAKE_OFFER_FAILED', error, 'Failed to create offer');
    }
};

const respondToOffer = async (offerId, action, actor) => {
    // action: 'accept' | 'reject'
    if (!['accept', 'reject'].includes(action)) return fail('Invalid action');
    if (!offerId || isNaN(Number(offerId))) return fail('Invalid offer ID');

    try {
        const offer = await repo.findOfferById(offerId);
        if (!offer) return fail('Offer not found', 404);
        if (offer.status !== 'Pending') return fail(`Offer is already ${offer.status}`, 400);

        const newStatus = action === 'accept' ? 'Accepted' : 'Rejected';
        const appStatus = action === 'accept' ? 'Offer Accepted' : 'Rejected';

        await repo.updateOfferById(offerId, { status: newStatus });
        await repo.updateApplicationById(offer.applicationId, { status: appStatus });

        const hrIds = await getHrIds();
        const event = action === 'accept' ? 'OFFER_ACCEPTED' : 'OFFER_REJECTED';
        eventBus.emit(event, {
            offer, candidate: offer.application?.candidate, job: offer.application?.job, hrIds,
        });

        const updated = await repo.findOfferById(offerId);
        return { success: true, statusCode: 200, data: updated };
    } catch (error) {
        return handleError('RESPOND_OFFER_FAILED', error, 'Failed to respond to offer');
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// STATS / DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

const getRecruitmentStats = async (actor) => {
    const perm = assertPermission(actor, 'VIEW_JOBS');
    if (!perm.allowed) return fail(perm.message, 403);

    try {
        const stats = await repo.getRecruitmentStats(actor.companyId);
        return { success: true, statusCode: 200, data: stats };
    } catch (error) {
        return handleError('GET_RECRUITMENT_STATS_FAILED', error, 'Failed to get stats');
    }
};

// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
    createJob,
    listJobs,
    listPublishedJobs,
    getJob,
    updateJob,
    deleteJob,

    applyToJob,
    listApplications,
    getApplication,
    updateApplicationStatus,

    scheduleInterview,
    submitInterviewFeedback,

    makeOffer,
    respondToOffer,

    getRecruitmentStats,
};