'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PromotionTrack', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    recommendedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' },
    },
    reviewId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'PerformanceReviews', key: 'id' },
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Companies', key: 'id' },
    },
    currentDesignation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    proposedDesignation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currentSalary: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    proposedSalary: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    effectiveDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('recommended', 'under_review', 'approved', 'rejected', 'on_hold'),
      defaultValue: 'recommended',
    },
    justification: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hrNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'PromotionTracks',
    timestamps: true,
    paranoid: true,
  });
};
