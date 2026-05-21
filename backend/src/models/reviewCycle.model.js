'use strict';

module.exports = (sequelize, DataTypes) => {

  const ReviewCycle = sequelize.define(
    'ReviewCycle',
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
      // COMPANY FOREIGN KEY
      // MUST MATCH Companies.id
      // =========================
      companyId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,

        field: 'company_id',

        references: {
          model: 'Companies',
          key: 'id',
        },

        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      // =========================
      // CREATED BY FOREIGN KEY
      // MUST MATCH Users.id
      // =========================
      createdBy: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,

        field: 'created_by',

        references: {
          model: 'users',
          key: 'id',
        },

        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      // =========================
      // REVIEW CYCLE NAME
      // =========================
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      // =========================
      // REVIEW TYPE
      // =========================
      type: {
        type: DataTypes.ENUM(
          'quarterly',
          'half_yearly',
          'annual',
          'probation',
          'custom'
        ),

        allowNull: false,
        defaultValue: 'annual',
      },

      // =========================
      // STATUS
      // =========================
      status: {
        type: DataTypes.ENUM(
          'draft',
          'active',
          'closed',
          'archived'
        ),

        allowNull: false,
        defaultValue: 'draft',
      },

      // =========================
      // START DATE
      // =========================
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'start_date',
      },

      // =========================
      // END DATE
      // =========================
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'end_date',
      },

      // =========================
      // SELF REVIEW DEADLINE
      // =========================
      selfReviewDeadline: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'self_review_deadline',
      },

      // =========================
      // MANAGER REVIEW DEADLINE
      // =========================
      managerReviewDeadline: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'manager_review_deadline',
      },

      // =========================
      // PEER REVIEW DEADLINE
      // =========================
      peerReviewDeadline: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'peer_review_deadline',
      },

      // =========================
      // SELF REVIEW ENABLED
      // =========================
      isSelfReviewEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_self_review_enabled',
      },

      // =========================
      // MANAGER REVIEW ENABLED
      // =========================
      isManagerReviewEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_manager_review_enabled',
      },

      // =========================
      // PEER REVIEW ENABLED
      // =========================
      isPeerReviewEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_peer_review_enabled',
      },

      // =========================
      // DESCRIPTION
      // =========================
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

    },

    {

      // =========================
      // MODEL OPTIONS
      // =========================
      tableName: 'ReviewCycles',

      timestamps: true,

      paranoid: true,

      underscored: true,

      indexes: [
        {
          fields: ['company_id'],
        },
        {
          fields: ['created_by'],
        },
        {
          fields: ['status'],
        },
      ],

    }
  );

  return ReviewCycle;
};