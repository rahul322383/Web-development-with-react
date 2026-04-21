'use strict';

module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    employeeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    checkIn: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Actual check-in time (HH:MM:SS)',
    },

    checkOut: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Actual check-out time (HH:MM:SS)',
    },

    
    workedMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'Total minutes between checkIn and checkOut',
    },

    overtimeMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Minutes beyond the standard shift length',
    },

    lateMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Minutes past grace window at check-in',
    },

    status: {
      type: DataTypes.ENUM('present', 'late', 'absent', 'half_day', 'on_leave', 'holiday'),
      allowNull: false,
      defaultValue: 'absent',
    },

    isLate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    hasOvertime: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    notes: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    // IP / device for audit trail
    checkInIp: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },

    checkOutIp: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },

    // Which manager / HR last touched this record
    approvedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
  }, {
    tableName: 'attendances',
    underscored: true,
    timestamps: true,
    paranoid: true,                          // soft-delete (deleted_at)
    indexes: [
      { fields: ['employee_id', 'date'], unique: true },   // one record per employee per day
      { fields: ['date'] },
      { fields: ['status'] },
    ],
  });

  return Attendance;
};
