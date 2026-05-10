'use strict';

module.exports = (sequelize, DataTypes) => {
    const Candidate = sequelize.define(
        'Candidate',
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
            },
            firstName: {
                type: DataTypes.STRING(80),
                allowNull: false,
                field: 'first_name',
            },
            lastName: {
                type: DataTypes.STRING(80),
                allowNull: false,
                field: 'last_name',
            },
            email: {
                type: DataTypes.STRING(120),
                allowNull: false,
                unique: true,
                field: 'email',
            },
            phone: {
                type: DataTypes.STRING(20),
                allowNull: true,
                field: 'phone',
            },
            linkedinUrl: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'linkedin_url',
            },
            portfolioUrl: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'portfolio_url',
            },
            experienceYears: {
                type: DataTypes.DECIMAL(4, 1),
                allowNull: true,
                defaultValue: 0,
                field: 'experience_years',
            },
            currentCompany: {
                type: DataTypes.STRING(150),
                allowNull: true,
                field: 'current_company',
            },
            currentCtc: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: true,
                field: 'current_ctc',
            },
            expectedCtc: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: true,
                field: 'expected_ctc',
            },
            noticePeriod: {
                type: DataTypes.STRING(50),
                allowNull: true,
                field: 'notice_period',
            },
            skills: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
                field: 'skills',
            },
            city: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'city',
            },
            resumeUrl: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'resume_url',
            },
            resumePublicId: {
                // Cloudinary public_id — needed to delete/replace the file
                type: DataTypes.STRING(255),
                allowNull: true,
                field: 'resume_public_id',
            },
            status: {
                type: DataTypes.ENUM('Active', 'Hired', 'Blacklisted', 'Archived'),
                allowNull: false,
                defaultValue: 'Active',
                field: 'status',
            },
        },
        {
            tableName: 'candidates',
            timestamps: true,
            underscored: true,
            paranoid: true,
            indexes: [
                { fields: ['email'], unique: true },
                { fields: ['status'] },
            ],
        },
    );

    return Candidate;
};