const sequelize = require('../database/sequelize');
const { DataTypes } = require('sequelize');

const UserModel = require('./user.model');
const RoleModel = require('./role.model');
const LeaveModel = require('./leave.model');
const ExpenseModel = require('./expense.model');
const PayrollModel = require('./payroll.model');
const YearEndModel = require('./yearEndSummary.model');

const User = UserModel(sequelize, DataTypes);
const Role = RoleModel(sequelize, DataTypes);
const LeaveRequest = LeaveModel(sequelize, DataTypes);
const Expense = ExpenseModel(sequelize, DataTypes);
const Payroll = PayrollModel(sequelize, DataTypes);
const YearEnd = YearEndModel(sequelize, DataTypes);

// 🔥 ASSOCIATIONS (CRITICAL)
User.belongsTo(Role, { foreignKey: 'roleId' });
Role.hasMany(User, { foreignKey: 'roleId' });

module.exports = {
  sequelize,
  User,
  Role,
  LeaveRequest,
  Expense,
  Payroll,
  YearEnd
};