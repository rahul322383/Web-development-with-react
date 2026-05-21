'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ReviewCycle', {

    // =========================
    // PRIMARY KEY
    // =========================
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    // =========================
    // COMPANY FOREIGN KEY
    // MUST MATCH Companies.id
    // =========================
    companyId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,

      references: {
        model: 'Companies',
        key: 'id',
      },

      field: 'company_id',
    },

    // =========================
    // USER FOREIGN KEY
    // MUST MATCH Users.id
    // =========================
    createdBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,

      references: {
        model: 'Users',
        key: 'id',
      },

      field: 'created_by',
    },

    // =========================
    // BASIC DETAILS
    // =========================
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

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
    // DATES
    // =========================
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

    selfReviewDeadline: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'self_review_deadline',
    },

    managerReviewDeadline: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'manager_review_deadline',
    },

    peerReviewDeadline: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'peer_review_deadline',
    },

    // =========================
    // SETTINGS
    // =========================
    isSelfReviewEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_self_review_enabled',
    },

    isManagerReviewEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_manager_review_enabled',
    },

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

  }, {

    // =========================
    // MODEL OPTIONS
    // =========================
    tableName: 'ReviewCycles',

    underscored: true,

    timestamps: true,

    paranoid: true,

  });
};