module.exports = (sequelize, DataTypes) => {
  const ExpenseReceipt = sequelize.define(
    'ExpenseReceipt',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      expenseId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      cloudinaryPublicId: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      cloudinaryUrl: {
        type: DataTypes.STRING(500),
        allowNull: false
      }
    },
    {
      tableName: 'expense_receipts',
      indexes: [{ fields: ['expense_id'] }]
    }
  );

  return ExpenseReceipt;
};