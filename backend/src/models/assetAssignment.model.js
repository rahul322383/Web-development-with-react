'use strict';

module.exports = (sequelize, DataTypes) => {

  const AssetAssignment = sequelize.define(
    'AssetAssignment',
    {

      // =========================
      // PRIMARY KEY
      // =========================
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // =========================
      // ASSET ID
      // =========================
      assetId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,

        field: 'asset_id',

        references: {
          model: 'Assets',
          key: 'id',
        },

        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      // =========================
      // EMPLOYEE ID
      // =========================
      employeeId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,

        field: 'employee_id',

        references: {
          model: 'users',
          key: 'id',
        },

        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      // =========================
      // ASSIGNED BY
      // =========================
      assignedBy: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,

        field: 'assigned_by',

        references: {
          model: 'users',
          key: 'id',
        },

        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      // =========================
      // COMPANY ID
      // =========================
      companyId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,

        field: 'company_id',

        references: {
          model: 'Companies',
          key: 'id',
        },

        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },

      // =========================
      // ASSIGNED DATE
      // =========================
      assignedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,

        field: 'assigned_at',
      },

      // =========================
      // EXPECTED RETURN DATE
      // =========================
      expectedReturnDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,

        field: 'expected_return_date',
      },

      // =========================
      // RETURNED AT
      // =========================
      returnedAt: {
        type: DataTypes.DATE,
        allowNull: true,

        field: 'returned_at',
      },

      // =========================
      // RETURNED TO
      // =========================
      returnedTo: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,

        field: 'returned_to',

        references: {
          model: 'users',
          key: 'id',
        },

        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },

      // =========================
      // STATUS
      // =========================
      status: {
        type: DataTypes.ENUM(
          'active',
          'returned',
          'overdue'
        ),

        allowNull: false,
        defaultValue: 'active',
      },

      // =========================
      // CONDITION AT ASSIGNMENT
      // =========================
      conditionAtAssignment: {
        type: DataTypes.ENUM(
          'new',
          'good',
          'fair',
          'poor'
        ),

        allowNull: false,
        defaultValue: 'good',

        field: 'condition_at_assignment',
      },

      // =========================
      // CONDITION AT RETURN
      // =========================
      conditionAtReturn: {
        type: DataTypes.ENUM(
          'new',
          'good',
          'fair',
          'poor'
        ),

        allowNull: true,

        field: 'condition_at_return',
      },

      // =========================
      // ASSIGNMENT NOTES
      // =========================
      assignmentNotes: {
        type: DataTypes.TEXT,
        allowNull: true,

        field: 'assignment_notes',
      },

      // =========================
      // RETURN NOTES
      // =========================
      returnNotes: {
        type: DataTypes.TEXT,
        allowNull: true,

        field: 'return_notes',
      },

      // =========================
      // ACKNOWLEDGEMENT
      // =========================
      acknowledgementSigned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,

        field: 'acknowledgement_signed',
      },

      acknowledgementSignedAt: {
        type: DataTypes.DATE,
        allowNull: true,

        field: 'acknowledgement_signed_at',
      },

    },

    {

      tableName: 'AssetAssignments',

      timestamps: true,

      underscored: true,

    }
  );

  return AssetAssignment;
};