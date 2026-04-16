module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define(
    'Expense',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      employeeId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'employee_id'
      },
      approvedByManagerId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        field: 'approved_by_manager_id'
      },
      
      //   approvedByFinanceId: {
      //     type: DataTypes.BIGINT.UNSIGNED,
      //     allowNull: true,
      //     field: 'approved_by_finance_id'
      //   }
      // ,
      category: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING(5),
        allowNull: false,
        defaultValue: 'USD'
      },
      description: {
        type: DataTypes.STRING(300)
      },
      managerApprovalStatus: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending',
        field: 'manager_approval_status'
      },
      financeApprovalStatus: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending',
        field: 'finance_approval_status'
      },
      paymentStatus: {
        type: DataTypes.ENUM('Unpaid', 'Processing', 'Paid'),
        allowNull: false,
        defaultValue: 'Unpaid',
        field: 'payment_status'
      },
      paidAt: {
        type: DataTypes.DATE,
        field: 'paid_at'
      }
    },
    {
      tableName: 'expenses',
      underscored: true
    }
  );

  return Expense;
};