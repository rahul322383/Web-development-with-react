'use strict';

const { Op } = require('sequelize');
const { Job, Candidate, JobApplication, Interview, Offer, User } =
    require('../../database/initModels');
const { buildPagination } = require('../user/userFormatter');

// ─────────────────────────────────────────────────────────────────────────────
// Slug generator  (title → "senior-react-developer-abc123")
// ─────────────────────────────────────────────────────────────────────────────

const makeSlug = (title) => {
    const base = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
    const suffix = Math.random().toString(36).slice(2, 7);
    return `${base}-${suffix}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Standard includes  (reused across queries)
// ─────────────────────────────────────────────────────────────────────────────

const posterAttrs = ['id', 'firstName', 'lastName', 'email'];
const candidateAttrs = ['id', 'firstName', 'lastName', 'email', 'phone', 'resumeUrl',
    'experienceYears', 'skills', 'city', 'status'];

// ── JOB ──────────────────────────────────────────────────────────────────────

const createJob = async (data, transaction) => {
    return Job.create({ ...data, slug: makeSlug(data.title) }, { transaction });
};

const findJobById = async (id) => {
    return Job.findByPk(id, {
        include: [{ model: User, as: 'poster', attributes: posterAttrs }],
    });
};

const findJobBySlug = async (slug) => {
    return Job.findOne({
        where: { slug },
        include: [{ model: User, as: 'poster', attributes: posterAttrs }],
    });
};

const findJobs = async ({ limit, offset, search, status, department, isRemote }) => {
    const where = {};

    if (status) where.status = status;
    if (department) where.department = department;
    if (isRemote !== undefined) where.isRemote = isRemote;

    if (search) {
        where[Op.or] = [
            { title: { [Op.like]: `%${search}%` } },
            { department: { [Op.like]: `%${search}%` } },
            { location: { [Op.like]: `%${search}%` } },
        ];
    }

    return Job.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'poster', attributes: posterAttrs }],
    });
};

// ✅ ADD THIS FUNCTION BELOW findJobs()

const findPublishedJobs = async ({
    limit,
    offset,
    search,
    department,
    isRemote
}) => {

    const where = {
        status: 'Published',
    };

    if (department) {
        where.department = department;
    }

    if (isRemote !== undefined) {
        where.isRemote = isRemote;
    }

    if (search) {
        where[Op.or] = [
            {
                title: {
                    [Op.like]: `%${search}%`
                }
            },
            {
                department: {
                    [Op.like]: `%${search}%`
                }
            },
            {
                location: {
                    [Op.like]: `%${search}%`
                }
            }
        ];
    }

    return Job.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
            {
                model: User,
                as: 'poster',
                attributes: posterAttrs
            }
        ]
    });
};

const updateJobById = async (id, data, transaction) => {
    const opts = transaction ? { transaction } : {};
    const [rows] = await Job.update(data, { where: { id }, ...opts });
    return rows;
};

const deleteJobById = async (id, transaction) => {
    const opts = transaction ? { transaction } : {};
    return Job.destroy({ where: { id }, ...opts }); // paranoid soft delete
};

// ── CANDIDATE ─────────────────────────────────────────────────────────────────

const findCandidateByEmail = async (email) => {
    return Candidate.findOne({ where: { email } });
};

const createCandidate = async (data, transaction) => {
    return Candidate.create(data, { transaction });
};

const updateCandidateById = async (id, data, transaction) => {
    const opts = transaction ? { transaction } : {};
    return Candidate.update(data, { where: { id }, ...opts });
};

const findCandidateById = async (id) => {
    return Candidate.findByPk(id);
};

const findCandidates = async ({ limit, offset, search, status }) => {
    const where = {};
    if (status) where.status = status;
    if (search) {
        where[Op.or] = [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
        ];
    }
    return Candidate.findAndCountAll({
        where,
        attributes: candidateAttrs,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
    });
};

// ── APPLICATION ───────────────────────────────────────────────────────────────

const createApplication = async (data, transaction) => {
    return JobApplication.create(data, { transaction });
};

const findApplicationById = async (id) => {
    return JobApplication.findByPk(id, {
        include: [
            { model: Job, as: 'job' },
            { model: Candidate, as: 'candidate' },
            {
                model: Interview,
                as: 'interviews',
                include: [{ model: User, as: 'interviewer', attributes: posterAttrs }],
            },
            {
                model: Offer,
                as: 'offer',
                include: [{ model: User, as: 'offeredByUser', attributes: posterAttrs }],
            },
        ],
    });
};

const findApplicationByJobAndCandidate = async (jobId, candidateId) => {
    return JobApplication.findOne({ where: { jobId, candidateId } });
};

const findApplications = async ({ limit, offset, jobId, status, search }) => {
    const where = {};
    if (jobId) where.jobId = jobId;
    if (status) where.status = status;

    const candidateWhere = {};
    if (search) {
        candidateWhere[Op.or] = [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
        ];
    }

    return JobApplication.findAndCountAll({
        where,
        limit,
        offset,
        order: [['appliedAt', 'DESC']],
        include: [
            { model: Job, as: 'job', attributes: ['id', 'title', 'department'] },
            { model: Candidate, as: 'candidate', attributes: candidateAttrs, where: Object.keys(candidateWhere).length ? candidateWhere : undefined },
        ],
    });
};

const updateApplicationById = async (id, data, transaction) => {
    const opts = transaction ? { transaction } : {};
    return JobApplication.update(data, { where: { id }, ...opts });
};

// ── INTERVIEW ─────────────────────────────────────────────────────────────────

const createInterview = async (data, transaction) => {
    return Interview.create(data, { transaction });
};

const findInterviewById = async (id) => {
    return Interview.findByPk(id, {
        include: [
            {
                model: JobApplication,
                as: 'application',
                include: [
                    { model: Candidate, as: 'candidate' },
                    { model: Job, as: 'job', attributes: ['id', 'title'] },
                ],
            },
            { model: User, as: 'interviewer', attributes: posterAttrs },
        ],
    });
};

const findInterviewsByApplication = async (applicationId) => {
    return Interview.findAll({
        where: { applicationId },
        order: [['scheduledAt', 'ASC']],
        include: [{ model: User, as: 'interviewer', attributes: posterAttrs }],
    });
};

const updateInterviewById = async (id, data, transaction) => {
    const opts = transaction ? { transaction } : {};
    return Interview.update(data, { where: { id }, ...opts });
};

// ── OFFER ─────────────────────────────────────────────────────────────────────

const createOffer = async (data, transaction) => {
    return Offer.create(data, { transaction });
};

const findOfferByApplication = async (applicationId) => {
    return Offer.findOne({ where: { applicationId } });
};

const findOfferById = async (id) => {
    return Offer.findByPk(id, {
        include: [
            {
                model: JobApplication,
                as: 'application',
                include: [
                    { model: Candidate, as: 'candidate' },
                    { model: Job, as: 'job', attributes: ['id', 'title'] },
                ],
            },
            { model: User, as: 'offeredByUser', attributes: posterAttrs },
        ],
    });
};

const updateOfferById = async (id, data, transaction) => {
    const opts = transaction ? { transaction } : {};
    return Offer.update(data, { where: { id }, ...opts });
};

// ── STATS ─────────────────────────────────────────────────────────────────────

const getRecruitmentStats = async (companyId) => {
    const [openJobs, totalApplications, interviewsToday, offers] = await Promise.all([
        Job.count({ where: { companyId, status: 'Published' } }),

        JobApplication.count({
            include: [{ model: Job, as: 'job', where: { companyId }, attributes: [] }],
        }),

        Interview.count({
            where: {
                scheduledAt: {
                    [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
                    [Op.lt]: new Date(new Date().setHours(23, 59, 59, 999)),
                },
            },
        }),

        Offer.count({ where: { status: 'Accepted' } }),
    ]);

    return { openJobs, totalApplications, interviewsToday, offersAccepted: offers };
};

// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
    // Jobs
    createJob,
    findJobById,
    findJobBySlug,
    findJobs,
    findPublishedJobs,
    updateJobById,
    deleteJobById,
    makeSlug,

    // Candidates
    findCandidateByEmail,
    createCandidate,
    updateCandidateById,
    findCandidateById,
    findCandidates,

    // Applications
    createApplication,
    findApplicationById,
    findApplicationByJobAndCandidate,
    findApplications,
    updateApplicationById,

    // Interviews
    createInterview,
    findInterviewById,
    findInterviewsByApplication,
    updateInterviewById,

    // Offers
    createOffer,
    findOfferByApplication,
    findOfferById,
    updateOfferById,

    // Stats
    getRecruitmentStats,

    // Helpers
    buildPagination,
};