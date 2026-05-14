'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

// ======================
// 🔥 MODEL IMPORTS
// ======================
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

// ✅ Recruitment Models
const defineJob = require('../models/job.model');
const defineCandidate = require('../models/candidate.model');
const defineJobApplication = require('../models/jobApplication.model');
const defineInterview = require('../models/interview.model');
const defineOffer = require('../models/offer.model');

// public models
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

// ======================
// 🔥 MODEL INIT
// ======================
const Company = defineCompany(sequelize, DataTypes);
const User = defineUser(sequelize, DataTypes);
const Role = defineRole(sequelize, DataTypes);
const Attendance = defineAttendance(sequelize, DataTypes);

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

// ✅ Recruitment Init
const Job = defineJob(sequelize, DataTypes);
const Candidate = defineCandidate(sequelize, DataTypes);
const JobApplication = defineJobApplication(sequelize, DataTypes);
const Interview = defineInterview(sequelize, DataTypes);
const Offer = defineOffer(sequelize, DataTypes);

// ======================
// 🔥 PUBLIC INIT
// ======================
SiteStat(sequelize, DataTypes);
Testimonial(sequelize, DataTypes);
TeamMember(sequelize, DataTypes);
Milestone(sequelize, DataTypes);
Feature(sequelize, DataTypes);
Integration(sequelize, DataTypes);
PricingPlan(sequelize, DataTypes);
ContactSubmission(sequelize, DataTypes);
DemoRequest(sequelize, DataTypes);
HelpCategory(sequelize, DataTypes);
HelpArticle(sequelize, DataTypes);
FAQ(sequelize, DataTypes);
Tutorial(sequelize, DataTypes);
SecurityCertification(sequelize, DataTypes);
LegalDocument(sequelize, DataTypes);
ContactOffice(sequelize, DataTypes);

// ======================
// 🔥 ASSOCIATIONS
// ======================

// 👤 User hierarchy
User.belongsTo(User, { as: 'manager', foreignKey: 'managerId' });
User.hasMany(User, { as: 'reportees', foreignKey: 'managerId' });

// 👤 Role
User.belongsTo(Role, { as: 'role', foreignKey: 'roleId' });
Role.hasMany(User, { as: 'users', foreignKey: 'roleId' });

// 🏢 Company
Company.hasMany(User, { foreignKey: 'companyId', as: 'employees' });
User.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// 📅 Attendance
User.hasMany(Attendance, {
  foreignKey: 'employeeId',
  as: 'attendances',
});

Attendance.belongsTo(User, {
  foreignKey: 'employeeId',
  as: 'employee',
});

Attendance.belongsTo(User, {
  foreignKey: 'approvedBy',
  as: 'approver',
});

// 🌴 Leave
User.hasOne(LeaveBalance, {
  foreignKey: 'employeeId',
  as: 'leaveBalance'
});

LeaveBalance.belongsTo(User, {
  foreignKey: 'employeeId',
  as: 'employee'
});

User.hasMany(LeaveRequest, {
  foreignKey: 'employeeId',
  as: 'leaveRequests'
});

LeaveRequest.belongsTo(User, {
  foreignKey: 'employeeId',
  as: 'employee'
});

User.hasMany(LeaveRequest, {
  foreignKey: 'managerId',
  as: 'managedLeaves'
});

LeaveRequest.belongsTo(User, {
  foreignKey: 'managerId',
  as: 'manager'
});

// 💰 Expense
User.hasMany(Expense, {
  foreignKey: 'employeeId',
  as: 'expenses'
});

Expense.belongsTo(User, {
  foreignKey: 'employeeId',
  as: 'employee'
});

Expense.hasOne(ExpenseReceipt, {
  foreignKey: 'expenseId',
  as: 'receipt'
});

ExpenseReceipt.belongsTo(Expense, {
  foreignKey: 'expenseId',
  as: 'expense'
});

// 💵 Payroll
User.hasMany(Payroll, {
  foreignKey: 'employeeId',
  as: 'payrolls'
});

Payroll.belongsTo(User, {
  foreignKey: 'employeeId',
  as: 'employee'
});

Payroll.hasOne(PayrollItem, {
  foreignKey: 'payrollId',
  as: 'items'
});

PayrollItem.belongsTo(Payroll, {
  foreignKey: 'payrollId',
  as: 'payroll'
});

// 📜 Audit
User.hasMany(AuditLog, {
  foreignKey: 'userId',
  as: 'auditLogs'
});

AuditLog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// 📊 Year summary
User.hasMany(YearEndSummary, {
  foreignKey: 'employeeId',
  as: 'yearSummaries'
});

YearEndSummary.belongsTo(User, {
  foreignKey: 'employeeId',
  as: 'employee'
});

// 🔐 Tokens
User.hasMany(RefreshToken, {
  foreignKey: 'userId',
  as: 'refreshTokens'
});

RefreshToken.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// 🔔 Notifications
User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications'
});

Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// ⚙️ Settings
User.hasMany(Setting, {
  foreignKey: 'userId',
  as: 'settings'
});

Setting.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// 🕒 Shift System
Company.hasMany(Shift, {
  foreignKey: 'companyId',
  as: 'shifts',
});

Shift.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
});

Company.hasMany(ShiftAssignment, {
  foreignKey: 'companyId',
  as: 'shiftAssignments',
});

ShiftAssignment.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
});

// User ↔ Shift
User.belongsTo(Shift, {
  foreignKey: 'shiftId',
  as: 'shift',
});

Shift.hasMany(User, {
  foreignKey: 'shiftId',
  as: 'employees',
});

// Shift Assignments
User.hasMany(ShiftAssignment, {
  foreignKey: 'employeeId',
  as: 'shiftAssignments',
});

ShiftAssignment.belongsTo(User, {
  foreignKey: 'employeeId',
  as: 'employee',
});

Shift.hasMany(ShiftAssignment, {
  foreignKey: 'shiftId',
  as: 'assignments',
});

ShiftAssignment.belongsTo(Shift, {
  foreignKey: 'shiftId',
  as: 'shift',
});

User.hasMany(ShiftAssignment, {
  foreignKey: 'assignedBy',
  as: 'assignedShifts',
});

ShiftAssignment.belongsTo(User, {
  foreignKey: 'assignedBy',
  as: 'assignor',
});

// ============================================================================
// ✅ RECRUITMENT ASSOCIATIONS
// ============================================================================

// ── Job ─────────────────────────────────────

Job.belongsTo(User, {
  foreignKey: 'postedBy',
  as: 'poster'
});

User.hasMany(Job, {
  foreignKey: 'postedBy',
  as: 'postedJobs'
});

Job.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company'
});

Company.hasMany(Job, {
  foreignKey: 'companyId',
  as: 'jobs'
});

// ── Job Application ─────────────────────────

JobApplication.belongsTo(Job, {
  foreignKey: 'jobId',
  as: 'job'
});

Job.hasMany(JobApplication, {
  foreignKey: 'jobId',
  as: 'applications'
});

JobApplication.belongsTo(Candidate, {
  foreignKey: 'candidateId',
  as: 'candidate'
});

Candidate.hasMany(JobApplication, {
  foreignKey: 'candidateId',
  as: 'applications'
});

// ── Interview ───────────────────────────────

Interview.belongsTo(JobApplication, {
  foreignKey: 'applicationId',
  as: 'application'
});

JobApplication.hasMany(Interview, {
  foreignKey: 'applicationId',
  as: 'interviews'
});

Interview.belongsTo(User, {
  foreignKey: 'interviewerId',
  as: 'interviewer'
});

User.hasMany(Interview, {
  foreignKey: 'interviewerId',
  as: 'conductedInterviews'
});

// ── Offer ───────────────────────────────────

Offer.belongsTo(JobApplication, {
  foreignKey: 'applicationId',
  as: 'application'
});

JobApplication.hasOne(Offer, {
  foreignKey: 'applicationId',
  as: 'offer'
});

Offer.belongsTo(User, {
  foreignKey: 'offeredBy',
  as: 'offeredByUser'
});

User.hasMany(Offer, {
  foreignKey: 'offeredBy',
  as: 'sentOffers'
});

// ======================
// 🔥 EXPORT
// ======================
module.exports = {
  sequelize,

  Company,
  User,
  Role,
  Attendance,
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

  // ✅ Recruitment
  Job,
  Candidate,
  JobApplication,
  Interview,
  Offer,

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