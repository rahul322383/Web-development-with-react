

// module.exports = (sequelize, DataTypes) => {
//   const LeaveRequest = sequelize.define(
//     'LeaveRequest',
//     {
//       id: {
//         type: DataTypes.BIGINT.UNSIGNED,
//         primaryKey: true,
//         autoIncrement: true
//       },

//       employeeId: {
//         type: DataTypes.BIGINT.UNSIGNED,
//         allowNull: false,
//         field: 'employee_id' 
//       },

//       managerId: {
//         type: DataTypes.BIGINT.UNSIGNED,
//         allowNull: false,
//         field: 'manager_id' 
//       },

//       startDate: {
//         type: DataTypes.DATEONLY,
//         allowNull: false,
//         field: 'start_date'
//       },

//       endDate: {
//         type: DataTypes.DATEONLY,
//         allowNull: false,
//         field: 'end_date'
//       },

//       reason: {
//         type: DataTypes.STRING(300),
//         allowNull: true
//       },

//       daysRequested: {
//         type: DataTypes.INTEGER.UNSIGNED,
//         allowNull: false,
//         field: 'days_requested' 
//       },

//       status: {
//         type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
//         allowNull: false,
//         defaultValue: 'Pending'
//       },
//       companyId: {
//         type: DataTypes.BIGINT.UNSIGNED,
//         allowNull: false,
//         field: 'company_id'
//       },
      

//       decisionNote: {
//         type: DataTypes.STRING(300),
//         allowNull: true,
//         field: 'decision_note' 
//       }
//     },
//     {
//       tableName: 'leave_requests',
//       underscored: true,
//       timestamps: true 
//     }
//   );

//   return LeaveRequest;
// };

'use strict';

// models/LeaveRequest.js
// ─────────────────────────────────────────────────────────────
// BUG FIX: Was mixed into leaveValidation.js and had a conflicting
// module.exports that overwrote the Joi schema exports.
// Now lives in its own file.
//
// Additions:
//  - leaveType  ENUM  (SICK | CASUAL | PAID | UNPAID)
//  - leaveUnit  ENUM  (FULL_DAY | HALF_DAY)
//  - company_id properly mapped (was storing 0 because field was
//    defined but never set in LeaveRequest.create calls)
// ─────────────────────────────────────────────────────────────

module.exports = (sequelize, DataTypes) => {
  const LeaveRequest = sequelize.define(
    'LeaveRequest',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },

      // ── Tenant / company ────────────────────────────────────
      companyId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'company_id',
        comment: 'Populated from req.user.companyId in the controller',
      },

      // ── Actors ──────────────────────────────────────────────
      employeeId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'employee_id',
      },

      managerId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'manager_id',
      },

      // ── Dates ───────────────────────────────────────────────
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'start_date',
      },

      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'end_date',
      },

      // ── Leave metadata ──────────────────────────────────────
      reason: {
        type: DataTypes.STRING(500),  // bumped from 300 to match Joi max
        allowNull: true,
      },

      leaveType: {
        type: DataTypes.ENUM('SICK', 'CASUAL', 'PAID', 'UNPAID'),
        allowNull: false,
        defaultValue: 'CASUAL',
        field: 'leave_type',
      },

      leaveUnit: {
        type: DataTypes.ENUM('FULL_DAY', 'HALF_DAY'),
        allowNull: false,
        defaultValue: 'FULL_DAY',
        field: 'leave_unit',
      },

      daysRequested: {
        type: DataTypes.DECIMAL(4, 1),  // supports 0.5 for half-day
        allowNull: false,
        field: 'days_requested',
      },

      // ── Status ──────────────────────────────────────────────
      status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending',
      },

      decisionNote: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'decision_note',
      },
    },
    {
      tableName: 'leave_requests',
      underscored: true,
      timestamps: true,
      paranoid: true,  // keeps deleted_at (already in your schema)
    }
  );

  LeaveRequest.associate = (models) => {
    LeaveRequest.belongsTo(models.User, { foreignKey: 'employeeId', as: 'employee' });
    LeaveRequest.belongsTo(models.User, { foreignKey: 'managerId', as: 'manager' });
  };

  return LeaveRequest;
};