const sequelize = require('../database/sequelize');
const { DataTypes } = require('sequelize'); // ✅ ADD THIS

const UserModel = require('./user.model');
const LeaveModel = require('./leave.model');
const ExpenseModel = require('./expense.model');
const PayrollModel = require('./payroll.model');
const YearEndModel = require('./yearEndSummary.model');

// 🔥 PASS BOTH sequelize + DataTypes
const User = UserModel(sequelize, DataTypes);
const Leave = LeaveModel(sequelize, DataTypes);
const Expense = ExpenseModel(sequelize, DataTypes);
const Payroll = PayrollModel(sequelize, DataTypes);
const YearEnd = YearEndModel(sequelize, DataTypes);

module.exports = {
  sequelize,
  User,
  Leave,
  Expense,
  Payroll,
  YearEnd
};