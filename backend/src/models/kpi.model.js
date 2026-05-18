'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Kpi', {
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('KPI', 'OKR'),
      defaultValue: 'KPI',
    },
    targetValue: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    actualValue: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    unit: {
      // e.g. '%', 'count', '$', 'score'
      type: DataTypes.STRING,
      allowNull: true,
    },
    weight: {
      // importance weight 0-100
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'achieved', 'missed', 'cancelled'),
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
    achievedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    quarter: {
      type: DataTypes.STRING, // e.g. 'Q1-2025'
      allowNull: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'Kpis',
    timestamps: true,
    paranoid: true, // soft delete
  });
};
