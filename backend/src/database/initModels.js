

// const { DataTypes } = require('sequelize');
// const sequelize = require('./sequelize');

// const defineUser = require('../models/user.model');
// const defineRole = require('../models/role.model');
// const defineLeaveRequest = require('../models/leave.model');
// const defineLeaveBalance = require('../models/leaveBalance.model');
// const defineExpense = require('../models/expense.model');
// const defineExpenseReceipt = require('../models/ExpenseReceipt');
// const definePayroll = require('../models/payroll.model');
// const definePayrollItem = require('../models/PayrollItem');
// const defineAuditLog = require('../models/auditLog.model');
// const defineYearEndSummary = require('../models/yearEndSummary.model');
// const defineRefreshToken = require('../models/refreshToken.model');
// const defineNotification = require('../models/Notification');
// const defineSetting = require('../models/setting.model');
// const defineAttendance = require('../models/attendance.model');

// const defineCompany = require('../models/company.model');
// const Company = defineCompany(sequelize, DataTypes);





// const Attendance = defineAttendance(sequelize, DataTypes);
// const User = defineUser(sequelize, DataTypes);
// const Role = defineRole(sequelize, DataTypes);
// const LeaveRequest = defineLeaveRequest(sequelize, DataTypes);
// const LeaveBalance = defineLeaveBalance(sequelize, DataTypes);
// const Expense = defineExpense(sequelize, DataTypes);
// const ExpenseReceipt = defineExpenseReceipt(sequelize, DataTypes);
// const Payroll = definePayroll(sequelize, DataTypes);
// const PayrollItem = definePayrollItem(sequelize, DataTypes);
// const AuditLog = defineAuditLog(sequelize, DataTypes);
// const YearEndSummary = defineYearEndSummary(sequelize, DataTypes);
// const RefreshToken = defineRefreshToken(sequelize, DataTypes);
// const Notification = defineNotification(sequelize, DataTypes);
// const Setting = defineSetting(sequelize, DataTypes);

// User.belongsTo(User, { as: 'manager', foreignKey: 'managerId' });
// User.hasMany(User, { as: 'reportees', foreignKey: 'managerId' });

// // FIX: belongsTo with roleId on users table — no junction table
// User.belongsTo(Role, { as: 'role', foreignKey: 'roleId' });
// Role.hasMany(User, { as: 'users', foreignKey: 'roleId' });

// User.hasOne(LeaveBalance, { foreignKey: 'employeeId', as: 'leaveBalance' });
// LeaveBalance.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });

// User.hasMany(LeaveRequest, { foreignKey: 'employeeId', as: 'leaveRequests' });
// LeaveRequest.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
// LeaveRequest.belongsTo(User, { foreignKey: 'managerId', as: 'approver' });

// User.hasMany(Expense, { foreignKey: 'employeeId', as: 'expenses' });
// Expense.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
// Expense.hasOne(ExpenseReceipt, { foreignKey: 'expenseId', as: 'receipt' });
// ExpenseReceipt.belongsTo(Expense, { foreignKey: 'expenseId', as: 'expense' });

// User.hasMany(Payroll, { foreignKey: 'employeeId', as: 'payrolls' });
// Payroll.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
// Payroll.hasOne(PayrollItem, { foreignKey: 'payrollId', as: 'items' });
// PayrollItem.belongsTo(Payroll, { foreignKey: 'payrollId', as: 'payroll' });

// User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
// AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User.hasMany(YearEndSummary, { foreignKey: 'employeeId', as: 'yearSummaries' });
// YearEndSummary.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });

// User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
// RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
// Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });


// User.hasMany(Setting, { foreignKey: 'userId', as: 'settings' });
// Setting.belongsTo(User, { foreignKey: 'userId', as: 'user' });


// User.hasMany(Attendance, { foreignKey: 'employeeId', as: 'attendances' });
// Attendance.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
// Attendance.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

// // associations
// Company.hasMany(User, { foreignKey: 'companyId', as: 'employees' });
// User.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// module.exports = {
//   Attendance,
//   Company,
//   sequelize,
//   User,
//   Role,
//   LeaveRequest,
//   LeaveBalance,
//   Expense,
//   ExpenseReceipt,
//   Payroll,
//   PayrollItem,
//   AuditLog,
//   YearEndSummary,
//   RefreshToken,
//   Notification,
//   Setting,
// };

const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

// core HRMS models
const defineUser = require('../models/user.model');
const defineRole = require('../models/role.model');
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
const defineSetting = require('../models/setting.model');
const defineAttendance = require('../models/attendance.model');
const defineCompany = require('../models/company.model');
const defineShift = require('../models/shift.model');
const defineShiftAssignment = require('../models/shiftAssignment.model');

// public website models (ADD THIS FILE PATH)
const {
  SiteStat,
  Testimonial,
  TeamMember,
  Milestone,
  Feature,
  Integration,
  PricingPlan,
  ContactSubmission,
  DemoRequest,
  HelpCategory,
  HelpArticle,
  FAQ,
  Tutorial,
  SecurityCertification,
  LegalDocument,
  ContactOffice
} = require('../models/publicmodels');

const Company = defineCompany(sequelize, DataTypes);

const Attendance = defineAttendance(sequelize, DataTypes);
const User = defineUser(sequelize, DataTypes);
const Role = defineRole(sequelize, DataTypes);
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
const Setting = defineSetting(sequelize, DataTypes);
const Shift = defineShift(sequelize, DataTypes);
const ShiftAssignment = defineShiftAssignment(sequelize, DataTypes);

// public models init
const siteStat = SiteStat(sequelize, DataTypes);
const testimonial = Testimonial(sequelize, DataTypes);
const teamMember = TeamMember(sequelize, DataTypes);
const milestone = Milestone(sequelize, DataTypes);
const feature = Feature(sequelize, DataTypes);
const integration = Integration(sequelize, DataTypes);
const pricingPlan = PricingPlan(sequelize, DataTypes);
const contactSubmission = ContactSubmission(sequelize, DataTypes);
const demoRequest = DemoRequest(sequelize, DataTypes);
const helpCategory = HelpCategory(sequelize, DataTypes);
const helpArticle = HelpArticle(sequelize, DataTypes);
const faq = FAQ(sequelize, DataTypes);
const tutorial = Tutorial(sequelize, DataTypes);
const securityCertification = SecurityCertification(sequelize, DataTypes);
const legalDocument = LegalDocument(sequelize, DataTypes);
const contactOffice = ContactOffice(sequelize, DataTypes);


User.belongsTo(User, { as: 'manager', foreignKey: 'managerId' });
User.hasMany(User, { as: 'reportees', foreignKey: 'managerId' });

User.belongsTo(Role, { as: 'role', foreignKey: 'roleId' });
Role.hasMany(User, { as: 'users', foreignKey: 'roleId' });

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

User.hasMany(Setting, { foreignKey: 'userId', as: 'settings' });
Setting.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Attendance, { foreignKey: 'employeeId', as: 'attendances' });
Attendance.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });

Attendance.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

Company.hasMany(User, { foreignKey: 'companyId', as: 'employees' });
User.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

ShiftAssignment.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
ShiftAssignment.belongsTo(Shift, { foreignKey: 'shiftId', as: 'shift' });
ShiftAssignment.belongsTo(User, { foreignKey: 'assignedBy', as: 'assignor' });

Shift.hasMany(ShiftAssignment, { foreignKey: 'shiftId', as: 'assignments' });




module.exports = {
  sequelize,

  // core
  Company,
  Attendance,
  User,
  Role,
  LeaveRequest,
  LeaveBalance,
  Expense,
  ExpenseReceipt,
  Payroll,
  PayrollItem,
  AuditLog,
  YearEndSummary,
  RefreshToken,
  Notification,
  Setting,
  Shift,
  ShiftAssignment,

  // public
  SiteStat,
  Testimonial,
  TeamMember,
  Milestone,
  Feature,
  Integration,
  PricingPlan,
  ContactSubmission,
  DemoRequest,
  HelpCategory,
  HelpArticle,
  FAQ,
  Tutorial,
  SecurityCertification,
  LegalDocument,
  ContactOffice
};