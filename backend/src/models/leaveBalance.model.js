module.exports = (sequelize, DataTypes) => {
  const LeaveBalance = sequelize.define(
    'LeaveBalance',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      employeeId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        unique: true
      },
      totalAnnual: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 24
      },
      used: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
      },
      remaining: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 24
      },
      year: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      }
    },
    {
      tableName: 'leave_balances',
      indexes: [{ fields: ['employee_id', 'year'], unique: true }]
    }
  );

  return LeaveBalance;
};