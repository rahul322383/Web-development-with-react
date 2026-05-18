'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Goal', {
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
    managerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' },
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Companies', key: 'id' },
    },
    cycleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'ReviewCycles', key: 'id' },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM('individual', 'team', 'company', 'learning'),
      defaultValue: 'individual',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium',
    },
    progressPercent: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: { min: 0, max: 100 },
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'on_hold', 'completed', 'cancelled'),
      defaultValue: 'draft',
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isManagerApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    managerApprovedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'Goals',
    timestamps: true,
    paranoid: true,
  });
};
