'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('SelfAppraisal', {
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
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    // Self-rated score 1–5
    selfRating: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    achievements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    challenges: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    goalsForNextPeriod: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    trainingRequests: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    careerAspirations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    additionalComments: {
      type: DataTypes.TEXT,
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
    tableName: 'SelfAppraisals',
    timestamps: true,
  });
};
