module.exports = (sequelize, DataTypes) => {
  const Payroll = sequelize.define(
    'Payroll',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      employeeId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      month: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      year: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      netSalary: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('Draft', 'Processed', 'Locked'),
        allowNull: false,
        defaultValue: 'Draft'
      },
      processedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'payrolls',
      indexes: [
        { fields: ['employee_id', 'month', 'year'], unique: true },
        { fields: ['status'] }
      ]
    }
  );

  return Payroll;
};