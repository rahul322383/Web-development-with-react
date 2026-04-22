'use strict';

module.exports = (sequelize, DataTypes) => {
  const PayrollItem = sequelize.define(
    'PayrollItem',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      payrollId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'payroll_id',
      },

      // ── Earnings ────────────────────────────────────────────────────────────
      baseSalary: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'base_salary',
        comment: 'Basic salary (40% of monthly CTC)',
      },
      hra: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'hra',
        comment: 'House Rent Allowance (50% basic metro / 40% non-metro)',
      },
      specialAllowance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'special_allowance',
        comment: 'Fills gap between CTC and other components',
      },
      bonus: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'bonus',
      },
      overtimePay: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'overtime_pay',
        comment: '1.5x hourly rate on overtime hours',
      },
      grossEarnings: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'gross_earnings',
        comment: 'basic + hra + special + bonus + OT',
      },

      // ── Deductions ──────────────────────────────────────────────────────────
      pfEmployee: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'pf_employee',
        comment: '12% of basic (capped at ₹1,800)',
      },
      pfEmployer: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'pf_employer',
        comment: 'Employer PF — part of CTC, not deducted from take-home',
      },
      professionalTax: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'professional_tax',
      },
      tds: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'tds',
        comment: 'Monthly income tax advance (new regime)',
      },
      deductions: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'deductions',
        comment: 'Total deductions = pfEmployee + PT + TDS',
      },

      // ── CTC reference ───────────────────────────────────────────────────────
      ctcMonthly: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'ctc_monthly',
      },
      ctcAnnual: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'ctc_annual',
      },
    },
    {
      tableName: 'payroll_items',
      underscored: true,
      timestamps: true,
      indexes: [{ fields: ['payroll_id'], unique: true }],
    },
  );

  PayrollItem.associate = (models) => {
    PayrollItem.belongsTo(models.Payroll, {
      foreignKey: 'payrollId',
      as: 'payroll',
    });
  };

  return PayrollItem;
};