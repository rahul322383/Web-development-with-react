'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PerformanceReview', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cycleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'ReviewCycles', key: 'id' },
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    reviewerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' },
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Companies', key: 'id' },
    },
    overallRating: {
      // 1–5 scale
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'self_submitted',
        'manager_submitted',
        'completed',
        'acknowledged'
      ),
      defaultValue: 'pending',
    },
    selfReviewStatus: {
      type: DataTypes.ENUM('pending', 'submitted'),
      defaultValue: 'pending',
    },
    managerReviewStatus: {
      type: DataTypes.ENUM('pending', 'submitted'),
      defaultValue: 'pending',
    },
    peerReviewStatus: {
      type: DataTypes.ENUM('pending', 'submitted', 'not_applicable'),
      defaultValue: 'not_applicable',
    },
    acknowledgedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    managerComments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hrComments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    strengthsNoted: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    improvementAreas: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    promotionRecommended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    incrementRecommended: {
      type: DataTypes.FLOAT,
      allowNull: true, // percentage
    },
  }, {
    tableName: 'PerformanceReviews',
    timestamps: true,
    paranoid: true,
  });
};
