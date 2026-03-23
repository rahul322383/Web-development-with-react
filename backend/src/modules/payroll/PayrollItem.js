module.exports = (sequelize, DataTypes) => {
  const PayrollItem = sequelize.define(
    'PayrollItem',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      payrollId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      baseSalary: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      bonus: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      deductions: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      tableName: 'payroll_items',
      indexes: [{ fields: ['payroll_id'], unique: true }]
    }
  );

  return PayrollItem;
};