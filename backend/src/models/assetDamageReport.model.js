'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('AssetDamageReport', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    assignmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'AssetAssignments', key: 'id' },
    },
    assetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Assets', key: 'id' },
    },
    reportedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' },
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Companies', key: 'id' },
    },
    severity: {
      type: DataTypes.ENUM('minor', 'moderate', 'severe', 'total_loss'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    incidentDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    repairCost: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    recoveryAmount: {
      // amount recovered from employee if applicable
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('reported', 'under_review', 'repair_initiated', 'resolved', 'written_off'),
      defaultValue: 'reported',
    },
    resolution: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    photoUrls: {
      type: DataTypes.JSON, // array of image URLs
      allowNull: true,
      defaultValue: [],
    },
    isEmployeeFault: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    hrNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'AssetDamageReports',
    timestamps: true,
  });
};
