'use strict';

// Recruitment event listeners — follow the exact same pattern as your
// existing notificationListeners.js (on() wrapper + eventBus)

const eventBus = require('../../utils/Eventbus');
const { dispatch, dispatchBulk } = require('../notification/notificationDispatcher');
const logger = require('../../config/logger');

// ── Safety wrapper (identical to your existing listeners file) ────────────────

const on = (event, handler) => {
    eventBus.on(event, async (payload) => {
        try {
            if (!payload || typeof payload !== 'object') {
                logger.warn({ event: `INVALID_PAYLOAD:${event}`, payload });
                return;
            }
            await handler(payload);
        } catch (err) {
            logger.error({
                event: `LISTENER_ERROR:${event}`,
                error: err.message,
                stack: err.stack,
                payload,
            });
        }
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATION_RECEIVED  →  notify HR team + confirm to candidate (email only)
// ─────────────────────────────────────────────────────────────────────────────

on('APPLICATION_RECEIVED', async ({ application, candidate, job, hrIds = [] }) => {
    if (!application?.id || !candidate?.id) return;

    // In-app notifications to all HR users who have VIEW_CANDIDATES permission
    if (hrIds.length) {
        await dispatchBulk(hrIds, {
            type: 'APPLICATION_RECEIVED',
            data: {
                applicationId: application.id,
                candidateName: `${candidate.firstName} ${candidate.lastName}`,
                jobTitle: job?.title ?? '',
                jobId: job?.id ?? null,
                appliedAt: application.appliedAt,
            },
        });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEW_SCHEDULED  →  notify interviewer + HR
// ─────────────────────────────────────────────────────────────────────────────

on('INTERVIEW_SCHEDULED', async ({ interview, application, candidate, job, hrIds = [] }) => {
    if (!interview?.id) return;

    const data = {
        interviewId: interview.id,
        round: interview.round,
        scheduledAt: interview.scheduledAt,
        meetLink: interview.meetLink ?? null,
        candidateName: candidate ? `${candidate.firstName} ${candidate.lastName}` : '',
        jobTitle: job?.title ?? '',
    };

    // Notify the assigned interviewer
    if (interview.interviewerId) {
        await dispatch({
            userId: interview.interviewerId,
            type: 'INTERVIEW_SCHEDULED',
            data,
        });
    }

    // Notify HR team
    if (hrIds.length) {
        await dispatchBulk(hrIds, { type: 'INTERVIEW_SCHEDULED', data });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEW_FEEDBACK_SUBMITTED  →  notify HR
// ─────────────────────────────────────────────────────────────────────────────

on('INTERVIEW_FEEDBACK_SUBMITTED', async ({ interview, candidate, job, hrIds = [] }) => {
    if (!interview?.id || !hrIds.length) return;

    await dispatchBulk(hrIds, {
        type: 'INTERVIEW_FEEDBACK_SUBMITTED',
        data: {
            interviewId: interview.id,
            round: interview.round,
            result: interview.result,
            rating: interview.rating,
            candidateName: candidate ? `${candidate.firstName} ${candidate.lastName}` : '',
            jobTitle: job?.title ?? '',
        },
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// OFFER_SENT  →  notify HR + actor
// ─────────────────────────────────────────────────────────────────────────────

on('OFFER_SENT', async ({ offer, candidate, job, actorId, hrIds = [] }) => {
    if (!offer?.id) return;

    const data = {
        offerId: offer.id,
        salary: offer.salary,
        joiningDate: offer.joiningDate,
        candidateName: candidate ? `${candidate.firstName} ${candidate.lastName}` : '',
        jobTitle: job?.title ?? '',
    };

    if (hrIds.length) {
        await dispatchBulk(hrIds, { type: 'OFFER_SENT', data });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// OFFER_ACCEPTED / OFFER_REJECTED  →  notify HR
// ─────────────────────────────────────────────────────────────────────────────

on('OFFER_ACCEPTED', async ({ offer, candidate, job, hrIds = [] }) => {
    if (!offer?.id || !hrIds.length) return;

    await dispatchBulk(hrIds, {
        type: 'OFFER_ACCEPTED',
        data: {
            offerId: offer.id,
            candidateName: candidate ? `${candidate.firstName} ${candidate.lastName}` : '',
            jobTitle: job?.title ?? '',
            joiningDate: offer.joiningDate,
        },
    });
});

on('OFFER_REJECTED', async ({ offer, candidate, job, hrIds = [] }) => {
    if (!offer?.id || !hrIds.length) return;

    await dispatchBulk(hrIds, {
        type: 'OFFER_REJECTED',
        data: {
            offerId: offer.id,
            candidateName: candidate ? `${candidate.firstName} ${candidate.lastName}` : '',
            jobTitle: job?.title ?? '',
        },
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATE_REJECTED  →  notify actor (HR/Manager who rejected)
// ─────────────────────────────────────────────────────────────────────────────

on('CANDIDATE_REJECTED', async ({ application, candidate, job, actorId }) => {
    if (!actorId || !application?.id) return;

    await dispatch({
        userId: actorId,
        type: 'CANDIDATE_REJECTED',
        data: {
            applicationId: application.id,
            candidateName: candidate ? `${candidate.firstName} ${candidate.lastName}` : '',
            jobTitle: job?.title ?? '',
        },
    });
});