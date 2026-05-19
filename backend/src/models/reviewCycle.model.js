'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ReviewCycle', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Companies', key: 'id' },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false, // e.g. 'Q1 2025 Review', 'Annual 2025'
    },
    type: {
      type: DataTypes.ENUM('quarterly', 'half_yearly', 'annual', 'probation', 'custom'),
      defaultValue: 'annual',
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'closed', 'archived'),
      defaultValue: 'draft',
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    selfReviewDeadline: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    managerReviewDeadline: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    peerReviewDeadline: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    isSelfReviewEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isManagerReviewEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isPeerReviewEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // 360° is opt-in
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'ReviewCycles',
    timestamps: true,
    paranoid: true,
  });
};
