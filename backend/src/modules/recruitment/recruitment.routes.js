'use strict';

const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/auth.middleware');

const {
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
    acceptOffer,
    rejectOffer,

    getStats
} = require('./recruitment.controller');

const recruitmentNotifications = require('./recruitment.notifications');

// ===============================
// PUBLIC ROUTES
// ===============================

router.get('/careers', listPublishedJobs);

router.get('/careers/:id', getJob);

router.post('/careers/:id/apply', applyToJob);

// ===============================
// AUTHENTICATED ROUTES
// ===============================

router.use(authenticate);

// Dashboard
router.get('/stats', getStats);

// Jobs
router.post('/', createJob);

router.get('/jobs', listJobs);

router.get('/jobs/:id', getJob);

router.patch('/:id', updateJob);

router.delete('/:id', deleteJob);

// Applications
router.get('/applications', listApplications);

router.get('/applications/:id', getApplication);

router.patch(
    '/applications/:id/status',
    updateApplicationStatus
);

// Interviews
router.post(
    '/interviews',
    scheduleInterview
);

router.patch(
    '/interviews/:id/feedback',
    submitInterviewFeedback
);

// Offers
router.post(
    '/offers',
    makeOffer
);

router.patch(
    '/offers/:id/accept',
    acceptOffer
);

router.patch(
    '/offers/:id/reject',
    rejectOffer
);

module.exports = router;