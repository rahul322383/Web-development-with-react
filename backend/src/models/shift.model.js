'use strict';

// src/models/shift.model.js
// Defines a shift configuration (e.g. "Morning 9-6", "Night 10pm-6am")
// ShiftAssignment links a User to a Shift for a date range.

module.exports = (sequelize, DataTypes) => {
    const Shift = sequelize.define('Shift', {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        companyId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'company_id',
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,               // e.g. "Morning Shift", "Night Shift"
        },
        startTime: {
            type: DataTypes.TIME,
            allowNull: false,
            field: 'start_time',        // e.g. "09:00:00"
        },
        endTime: {
            type: DataTypes.TIME,
            allowNull: false,
            field: 'end_time',          // e.g. "18:00:00"
        },
        graceMins: {
            type: DataTypes.SMALLINT.UNSIGNED,
            allowNull: false,
            defaultValue: 15,
            field: 'grace_mins',     // late tolerance in minutes
        },
        overtimeAfterMins: {
            type: DataTypes.SMALLINT.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
            field: 'overtime_after_mins', // 0 = any extra counts as OT
        },
        overtimeRateMultiplier: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: false,
            defaultValue: 1.5,
            field: 'overtime_rate_multiplier', // 1.5 = time-and-a-half
        },
        workDays: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [1, 2, 3, 4, 5], // Mon-Fri (0=Sun, 6=Sat)
            field: 'work_days',
        },
        isNightShift: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_night_shift', // crosses midnight
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_active',
        },
        description: {
            type: DataTypes.STRING(300),
            allowNull: true,
        },
    }, {
        tableName: 'shifts',
        underscored: true,
        timestamps: true,
        paranoid: true,
        indexes: [
            { fields: ['company_id'], name: 'idx_shifts_company' },
            { fields: ['company_id', 'is_active'], name: 'idx_shifts_company_active' },
        ],
    });

    Shift.associate = (models) => {
        Shift.hasMany(models.ShiftAssignment, { foreignKey: 'shiftId', as: 'assignments' });
    };

    return Shift;
};