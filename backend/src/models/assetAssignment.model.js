'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('AssetAssignment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    assetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Assets', key: 'id' },
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    assignedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Companies', key: 'id' },
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    expectedReturnDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    returnedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    returnedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' },
    },
    status: {
      type: DataTypes.ENUM('active', 'returned', 'overdue'),
      defaultValue: 'active',
    },
    conditionAtAssignment: {
      type: DataTypes.ENUM('new', 'good', 'fair', 'poor'),
      defaultValue: 'good',
    },
    conditionAtReturn: {
      type: DataTypes.ENUM('new', 'good', 'fair', 'poor'),
      allowNull: true,
    },
    assignmentNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    returnNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    acknowledgementSigned: {
      // employee acknowledged receipt
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    acknowledgementSignedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'AssetAssignments',
    timestamps: true,
  });
};
