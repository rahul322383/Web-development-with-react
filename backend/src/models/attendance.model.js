'use strict';

module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {

    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    employeeId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'employee_id',
      references: { model: 'users', key: 'id' },
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    checkIn: {
      type: DataTypes.TIME,
      allowNull: true,
      field: 'check_in',
    },
    

    checkOut: {
      type: DataTypes.TIME,
      allowNull: true,
      field: 'check_out',
    },

    workedMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'worked_minutes',
    },

    overtimeMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'overtime_minutes',
    },

    lateMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'late_minutes',
    },

    status: {
      type: DataTypes.ENUM(
        'present',
        'late',
        'absent',
        'half_day',
        'on_leave',
        'holiday'
      ),
      allowNull: false,
      defaultValue: 'absent',
    },

    isLate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_late',
    },

    hasOvertime: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'has_overtime',
    },

    notes: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    checkInIp: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'check_in_ip',
    },

    checkOutIp: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'check_out_ip',
    },

    approvedBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'approved_by',
      references: { model: 'users', key: 'id' },
    },

  }, {
    tableName: 'attendances',
    underscored: true,
    timestamps: true,
    paranoid: true,

    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',

    indexes: [
      {
        unique: true,
        fields: ['employee_id', 'date'],
        name: 'ux_attendance_employee_date',
      },
      { fields: ['date'], name: 'idx_attendance_date' },
      { fields: ['status'], name: 'idx_attendance_status' },
    ],
  });

  // 🔥 Associations (VERY IMPORTANT)
  Attendance.associate = (models) => {
    Attendance.belongsTo(models.User, {
      foreignKey: 'employee_id',
      as: 'employee',
    });

    Attendance.belongsTo(models.User, {
      foreignKey: 'approved_by',
      as: 'approver',
    });
  };

  return Attendance;
};