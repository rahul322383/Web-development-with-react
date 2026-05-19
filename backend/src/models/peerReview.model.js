'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PeerReview', {
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
    revieweeId: {
      // employee being reviewed
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    reviewerId: {
      // peer/colleague giving the review
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    relationship: {
      type: DataTypes.ENUM('peer', 'direct_report', 'cross_functional', 'skip_level'),
      defaultValue: 'peer',
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true, // 1–5
    },
    collaboration: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    communication: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    technicalSkills: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    leadership: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    strengths: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    improvements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isAnonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: 'PeerReviews',
    timestamps: true,
  });
};
