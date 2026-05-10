'use strict';

module.exports = (sequelize, DataTypes) => {
    const Offer = sequelize.define(
        'Offer',
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
            },
            applicationId: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                unique: true,             // one offer per application
                field: 'application_id',
                references: { model: 'job_applications', key: 'id' },
            },
            offeredBy: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                field: 'offered_by',
                references: { model: 'users', key: 'id' },
            },
            salary: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                field: 'salary',
            },
            joiningDate: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                field: 'joining_date',
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'expires_at',
            },
            status: {
                type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected', 'Expired', 'Withdrawn'),
                allowNull: false,
                defaultValue: 'Pending',
                field: 'status',
            },
            // Cloudinary URL of generated PDF
            offerLetterUrl: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'offer_letter_url',
            },
            offerLetterPublicId: {
                type: DataTypes.STRING(255),
                allowNull: true,
                field: 'offer_letter_public_id',
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'notes',
            },
        },
        {
            tableName: 'offers',
            timestamps: true,
            underscored: true,
            paranoid: true,
            indexes: [
                { fields: ['application_id'], unique: true },
                { fields: ['status'] },
            ],
        },
    );

    return Offer;
};