'use strict';

// Application status pipeline — mirrors the flow in the architecture doc
const APPLICATION_STATUSES = [
    'Applied',
    'Screening',
    'Shortlisted',
    'Interview Scheduled',
    'Interviewed',
    'Selected',
    'Rejected',
    'Offer Sent',
    'Offer Accepted',
    'Joined',
];

module.exports = (sequelize, DataTypes) => {
    const JobApplication = sequelize.define(
        'JobApplication',
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
            },
            jobId: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                field: 'job_id',
                references: { model: 'jobs', key: 'id' },
            },
            candidateId: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                field: 'candidate_id',
                references: { model: 'candidates', key: 'id' },
            },
            coverLetter: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'cover_letter',
            },
            status: {
                type: DataTypes.ENUM(...APPLICATION_STATUSES),
                allowNull: false,
                defaultValue: 'Applied',
                field: 'status',
            },
            // AI screening score 0–100
            score: {
                type: DataTypes.DECIMAL(5, 2),
                allowNull: true,
                defaultValue: null,
                field: 'score',
            },
            // Where the candidate came from: portal, referral, linkedin, etc.
            source: {
                type: DataTypes.STRING(80),
                allowNull: true,
                defaultValue: 'portal',
                field: 'source',
            },
            // Internal HR notes
            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'notes',
            },
            appliedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                field: 'applied_at',
            },
        },
        {
            tableName: 'job_applications',
            timestamps: true,
            underscored: true,
            paranoid: true,
            indexes: [
                { fields: ['job_id'] },
                { fields: ['candidate_id'] },
                { fields: ['status'] },
                // Prevent duplicate applications for the same job
                { unique: true, fields: ['job_id', 'candidate_id'] },
            ],
        },
    );

    return JobApplication;
};