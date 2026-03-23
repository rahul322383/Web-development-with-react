// module.exports = (sequelize, DataTypes) => {
//   const Expense = sequelize.define(
//     'Expense',
//     {
//       id: {
//         type: DataTypes.BIGINT.UNSIGNED,
//         primaryKey: true,
//         autoIncrement: true
//       },
//       employeeId: {
//         type: DataTypes.BIGINT.UNSIGNED,
//         allowNull: false
//       },
//       category: {
//         type: DataTypes.STRING(100),
//         allowNull: false
//       },
//       amount: {
//         type: DataTypes.DECIMAL(12, 2),
//         allowNull: false
//       },
//       currency: {
//         type: DataTypes.STRING(5),
//         allowNull: false,
//         defaultValue: 'USD'
//       },
//       description: {
//         type: DataTypes.STRING(300),
//         allowNull: true
//       },
//       managerApprovalStatus: {
//         type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
//         allowNull: false,
//         defaultValue: 'Pending'
//       },
//       financeApprovalStatus: {
//         type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
//         allowNull: false,
//         defaultValue: 'Pending'
//       },
//       paymentStatus: {
//         type: DataTypes.ENUM('Unpaid', 'Processing', 'Paid'),
//         allowNull: false,
//         defaultValue: 'Unpaid'
//       },
//       paidAt: {
//         type: DataTypes.DATE,
//         allowNull: true
//       }
//     },
//     {
//       tableName: 'expenses',
//       indexes: [
//         { fields: ['employee_id', 'created_at'] },
//         { fields: ['manager_approval_status'] },
//         { fields: ['finance_approval_status'] },
//         { fields: ['payment_status'] }
//       ]
//     }
//   );

//   return Expense;
// };

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
      category: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: 'amount'
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
      underscored: true // 🔥 THIS FIXES created_at automatically
    }
  );

  return Expense;
};