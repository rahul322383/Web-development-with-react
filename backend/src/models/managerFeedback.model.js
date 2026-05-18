'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ManagerFeedback', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reviewId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'PerformanceReviews', key: 'id' },
    },
    managerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true, // 1–5
    },
    performanceSummary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    strengths: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    areasOfImprovement: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    goalsForNextPeriod: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    developmentPlan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    promotionRecommended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    incrementPercent: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isDraft: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'ManagerFeedbacks',
    timestamps: true,
  });
};
