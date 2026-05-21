'use strict';

module.exports = (sequelize, DataTypes) => {

  const AssetDamageReport = sequelize.define(
    'AssetDamageReport',
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
      // ASSIGNMENT ID
      // =========================
      assignmentId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,

        field: 'assignment_id',

        references: {
          model: 'AssetAssignments',
          key: 'id',
        },

        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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
      // REPORTED BY
      // =========================
      reportedBy: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,

        field: 'reported_by',

        references: {
          model: 'users',
          key: 'id',
        },

        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      // =========================
      // REVIEWED BY
      // =========================
      reviewedBy: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,

        field: 'reviewed_by',

        references: {
          model: 'users',
          key: 'id',
        },

        onDelete: 'SET NULL',
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
      // SEVERITY
      // =========================
      severity: {
        type: DataTypes.ENUM(
          'minor',
          'moderate',
          'severe',
          'total_loss'
        ),

        allowNull: false,
      },

      // =========================
      // DESCRIPTION
      // =========================
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      // =========================
      // INCIDENT DATE
      // =========================
      incidentDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,

        field: 'incident_date',
      },

      // =========================
      // REPAIR COST
      // =========================
      repairCost: {
        type: DataTypes.FLOAT,
        allowNull: true,

        field: 'repair_cost',
      },

      // =========================
      // RECOVERY AMOUNT
      // =========================
      recoveryAmount: {
        type: DataTypes.FLOAT,
        allowNull: true,

        field: 'recovery_amount',
      },

      // =========================
      // STATUS
      // =========================
      status: {
        type: DataTypes.ENUM(
          'reported',
          'under_review',
          'repair_initiated',
          'resolved',
          'written_off'
        ),

        allowNull: false,
        defaultValue: 'reported',
      },

      // =========================
      // RESOLUTION
      // =========================
      resolution: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // =========================
      // PHOTO URLS
      // =========================
      photoUrls: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],

        field: 'photo_urls',
      },

      // =========================
      // EMPLOYEE FAULT
      // =========================
      isEmployeeFault: {
        type: DataTypes.BOOLEAN,
        allowNull: true,

        field: 'is_employee_fault',
      },

      // =========================
      // HR NOTES
      // =========================
      hrNotes: {
        type: DataTypes.TEXT,
        allowNull: true,

        field: 'hr_notes',
      },

      // =========================
      // RESOLVED AT
      // =========================
      resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true,

        field: 'resolved_at',
      },

    },

    {

      tableName: 'AssetDamageReports',

      timestamps: true,

      underscored: true,

    }
  );

  return AssetDamageReport;
};