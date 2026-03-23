module.exports = (sequelize, DataTypes) => {
  const YearEndSummary = sequelize.define(
    'YearEndSummary',
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
      year: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      totalSalaryPaid: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0
      },
      totalLeavesTaken: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
      },
      totalExpensesClaimed: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0
      },
      isFinalized: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: 'year_end_summary',
      indexes: [{ fields: ['employee_id', 'year'], unique: true }]
    }
  );

  YearEndSummary.beforeUpdate((instance) => {
    if (instance.isFinalized) {
      throw new Error('Year-end summary is immutable once finalized');
    }
  });

  return YearEndSummary;
};