'use strict';

module.exports = (sequelize, DataTypes) => {
    const Interview = sequelize.define(
        'Interview',
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
            },
            applicationId: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                field: 'application_id',
                references: { model: 'job_applications', key: 'id' },
            },
            interviewerId: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                field: 'interviewer_id',
                references: { model: 'users', key: 'id' },
            },
            round: {
                // e.g. "HR Screening", "Technical Round 1", "Final"
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'round',
            },
            scheduledAt: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'scheduled_at',
            },
            meetLink: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'meet_link',
            },
            feedback: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'feedback',
            },
            // 1–5 star rating submitted by interviewer
            rating: {
                type: DataTypes.TINYINT.UNSIGNED,
                allowNull: true,
                field: 'rating',
                validate: { min: 1, max: 5 },
            },
            result: {
                type: DataTypes.ENUM('Pending', 'Passed', 'Failed', 'No Show'),
                allowNull: false,
                defaultValue: 'Pending',
                field: 'result',
            },
        },
        {
            tableName: 'interviews',
            timestamps: true,
            underscored: true,
            paranoid: true,
            indexes: [
                { fields: ['application_id'] },
                { fields: ['interviewer_id'] },
                { fields: ['scheduled_at'] },
            ],
        },
    );

    return Interview;
};