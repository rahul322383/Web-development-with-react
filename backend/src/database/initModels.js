const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const defineUser = require('../models/user.model');
const defineRole = require('../models/role.model');
const defineUserRole = require('../models/UserRole');
const defineLeaveRequest = require('../models/leave.model');
const defineLeaveBalance = require('../models/leaveBalance.model');
const defineExpense = require('../models/expense.model');
const defineExpenseReceipt = require('../models/ExpenseReceipt');
const definePayroll = require('../models/payroll.model');
const definePayrollItem = require('../models/PayrollItem');
const defineAuditLog = require('../models/auditLog.model');
const defineYearEndSummary = require('../models/yearEndSummary.model');
const defineRefreshToken = require('../models/refreshToken.model');
const defineNotification = require('../models/Notification');

const User = defineUser(sequelize, DataTypes);
const Role = defineRole(sequelize, DataTypes);
const UserRole = defineUserRole(sequelize, DataTypes);
const LeaveRequest = defineLeaveRequest(sequelize, DataTypes);
const LeaveBalance = defineLeaveBalance(sequelize, DataTypes);
const Expense = defineExpense(sequelize, DataTypes);
const ExpenseReceipt = defineExpenseReceipt(sequelize, DataTypes);
const Payroll = definePayroll(sequelize, DataTypes);
const PayrollItem = definePayrollItem(sequelize, DataTypes);
const AuditLog = defineAuditLog(sequelize, DataTypes);
const YearEndSummary = defineYearEndSummary(sequelize, DataTypes);
const RefreshToken = defineRefreshToken(sequelize, DataTypes);
const Notification = defineNotification(sequelize, DataTypes);

User.belongsTo(User, { as: 'manager', foreignKey: 'managerId' });
User.hasMany(User, { as: 'reportees', foreignKey: 'managerId' });

User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId', otherKey: 'roleId' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId', otherKey: 'userId' });

User.hasOne(LeaveBalance, { foreignKey: 'employeeId', as: 'leaveBalance' });
LeaveBalance.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });

User.hasMany(LeaveRequest, { foreignKey: 'employeeId', as: 'leaveRequests' });
LeaveRequest.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
LeaveRequest.belongsTo(User, { foreignKey: 'managerId', as: 'approver' });

User.hasMany(Expense, { foreignKey: 'employeeId', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
Expense.hasOne(ExpenseReceipt, { foreignKey: 'expenseId', as: 'receipt' });
ExpenseReceipt.belongsTo(Expense, { foreignKey: 'expenseId', as: 'expense' });

User.hasMany(Payroll, { foreignKey: 'employeeId', as: 'payrolls' });
Payroll.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
Payroll.hasOne(PayrollItem, { foreignKey: 'payrollId', as: 'items' });
PayrollItem.belongsTo(Payroll, { foreignKey: 'payrollId', as: 'payroll' });

User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(YearEndSummary, { foreignKey: 'employeeId', as: 'yearSummaries' });
YearEndSummary.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });

User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Role,
  UserRole,
  LeaveRequest,
  LeaveBalance,
  Expense,
  ExpenseReceipt,
  Payroll,
  PayrollItem,
  AuditLog,
  YearEndSummary,
  RefreshToken,
  Notification
};