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
const definePerformanceReview = require('../models/performanceReview.model');
const defineReviewCycle = require('../models/reviewCycle.model');
const defineAsset = require('../models/asset.model');
const defineAssetAssignment = require('../models/assetAssignment.model');
const defineAssetDamageReport = require('../models/assetDamageReport.model');
const defineCourse = require('../models/course.model');
const defineCourseModule = require('../models/courseModule.model');
const defineCourseEnrollment = require('../models/courseEnrollment.model');
const defineQuiz = require('../models/quiz.model');
const defineQuizQuestion = require('../models/quizQuestion.model');
const defineQuizAttempt = require('../models/quizAttempt.model');
const defineCertification = require('../models/certification.model');

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
const PerformanceReview = definePerformanceReview(sequelize, DataTypes);
const ReviewCycle = defineReviewCycle(sequelize, DataTypes);
const Asset = defineAsset(sequelize, DataTypes);
const AssetAssignment = defineAssetAssignment(sequelize, DataTypes);
const AssetDamageReport = defineAssetDamageReport(sequelize, DataTypes);
// ✅ Recruitment Init
const Job = defineJob(sequelize, DataTypes);
const Candidate = defineCandidate(sequelize, DataTypes);
const JobApplication = defineJobApplication(sequelize, DataTypes);
const Interview = defineInterview(sequelize, DataTypes);
const Offer = defineOffer(sequelize, DataTypes);

const Course           = defineCourse(sequelize, DataTypes);
const CourseModule     = defineCourseModule(sequelize, DataTypes);
const CourseEnrollment = defineCourseEnrollment(sequelize, DataTypes);
const Quiz             = defineQuiz(sequelize, DataTypes);
const QuizQuestion     = defineQuizQuestion(sequelize, DataTypes);
const QuizAttempt      = defineQuizAttempt(sequelize, DataTypes);
const Certification    = defineCertification(sequelize, DataTypes);

const defineTicketCategory = require('../models/ticketCategory.model');
const defineTicket = require('../models/ticket.model');
const defineTicketComment = require('../models/ticketComment.model');
const defineTicketActivity = require('../models/ticketActivity.model');
const defineSlaPolicy = require('../models/slaPolicy.model');
const defineSubscriptionPlan    = require('../models/subscriptionPlan.model');
const defineCompanySubscription = require('../models/companySubscription.model');
const definePaymentTransaction  = require('../models/paymentTransaction.model');
const defineInvoice             = require('../models/invoice.model');

const SubscriptionPlan    = defineSubscriptionPlan(sequelize, DataTypes);
const CompanySubscription = defineCompanySubscription(sequelize, DataTypes);
const PaymentTransaction  = definePaymentTransaction(sequelize, DataTypes);
const Invoice             = defineInvoice(sequelize, DataTypes);



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


const TicketCategory = defineTicketCategory(sequelize, DataTypes);
const Ticket         = defineTicket(sequelize, DataTypes);
const TicketComment  = defineTicketComment(sequelize, DataTypes);
const TicketActivity = defineTicketActivity(sequelize, DataTypes);
const SlaPolicy      = defineSlaPolicy(sequelize, DataTypes);





Company.hasMany(TicketCategory, { foreignKey: 'companyId', as: 'ticketCategories' });
TicketCategory.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Company.hasMany(SlaPolicy, { foreignKey: 'companyId', as: 'slaPolicies' });
SlaPolicy.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Company.hasMany(Ticket, { foreignKey: 'companyId', as: 'tickets' });
Ticket.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

User.hasMany(Ticket, { foreignKey: 'raisedBy', as: 'raisedTickets' });
Ticket.belongsTo(User, { foreignKey: 'raisedBy', as: 'requester' });

User.hasMany(Ticket, { foreignKey: 'assignedTo', as: 'assignedTickets' });
Ticket.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

TicketCategory.hasMany(Ticket, { foreignKey: 'categoryId', as: 'tickets' });
Ticket.belongsTo(TicketCategory, { foreignKey: 'categoryId', as: 'category' });

Ticket.hasMany(TicketComment, { foreignKey: 'ticketId', as: 'comments' });
TicketComment.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });

User.hasMany(TicketComment, { foreignKey: 'authorId', as: 'ticketComments' });
TicketComment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

Ticket.hasMany(TicketActivity, { foreignKey: 'ticketId', as: 'activities' });
TicketActivity.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });

User.hasMany(TicketActivity, { foreignKey: 'actorId', as: 'ticketActivities' });
TicketActivity.belongsTo(User, { foreignKey: 'actorId', as: 'actor' });

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

// Performance
User.hasMany(PerformanceReview, { foreignKey: 'employeeId', as: 'performanceReviews' });
User.hasMany(PerformanceReview, { foreignKey: 'reviewerId', as: 'givenReviews' });
ReviewCycle.hasMany(PerformanceReview, { foreignKey: 'cycleId', as: 'reviews' });

// Assets
Asset.hasMany(AssetAssignment, { foreignKey: 'assetId', as: 'assignments' });
User.hasMany(AssetAssignment, { foreignKey: 'employeeId', as: 'assets' });
AssetAssignment.hasMany(AssetDamageReport, { foreignKey: 'assignmentId', as: 'damageReports' });

Company.hasMany(Course, { foreignKey: 'companyId', as: 'courses' });
Course.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
User.hasMany(Course, { foreignKey: 'createdBy', as: 'createdCourses' });
Course.belongsTo(User, { foreignKey: 'createdBy', as: 'author' });

// Course ↔ Modules
Course.hasMany(CourseModule, { foreignKey: 'courseId', as: 'modules' });
CourseModule.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Course ↔ Enrollments
Course.hasMany(CourseEnrollment, { foreignKey: 'courseId', as: 'enrollments' });
CourseEnrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
User.hasMany(CourseEnrollment, { foreignKey: 'employeeId', as: 'courseEnrollments' });
CourseEnrollment.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
User.hasMany(CourseEnrollment, { foreignKey: 'enrolledBy', as: 'managedEnrollments' });
CourseEnrollment.belongsTo(User, { foreignKey: 'enrolledBy', as: 'enrolledByUser' });

// Module ↔ Quiz
CourseModule.hasOne(Quiz, { foreignKey: 'moduleId', as: 'quiz' });
Quiz.belongsTo(CourseModule, { foreignKey: 'moduleId', as: 'module' });
Course.hasMany(Quiz, { foreignKey: 'courseId', as: 'quizzes' });
Quiz.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Quiz ↔ Questions
Quiz.hasMany(QuizQuestion, { foreignKey: 'quizId', as: 'questions' });
QuizQuestion.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });

// Quiz ↔ Attempts
Quiz.hasMany(QuizAttempt, { foreignKey: 'quizId', as: 'attempts' });
QuizAttempt.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });
CourseEnrollment.hasMany(QuizAttempt, { foreignKey: 'enrollmentId', as: 'quizAttempts' });
QuizAttempt.belongsTo(CourseEnrollment, { foreignKey: 'enrollmentId', as: 'enrollment' });
User.hasMany(QuizAttempt, { foreignKey: 'employeeId', as: 'quizAttempts' });
QuizAttempt.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });

// Certifications
CourseEnrollment.hasOne(Certification, { foreignKey: 'enrollmentId', as: 'certification' });
Certification.belongsTo(CourseEnrollment, { foreignKey: 'enrollmentId', as: 'enrollment' });
Course.hasMany(Certification, { foreignKey: 'courseId', as: 'certifications' });
Certification.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
User.hasMany(Certification, { foreignKey: 'employeeId', as: 'certifications' });
Certification.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
Company.hasMany(Certification, { foreignKey: 'companyId', as: 'certifications' });
Certification.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

SubscriptionPlan.hasMany(CompanySubscription, { foreignKey: 'planId', as: 'subscriptions' });
CompanySubscription.belongsTo(SubscriptionPlan, { foreignKey: 'planId', as: 'plan' });

// Company → Subscriptions
Company.hasMany(CompanySubscription, { foreignKey: 'companyId', as: 'subscriptions' });
CompanySubscription.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// Company → Transactions
Company.hasMany(PaymentTransaction, { foreignKey: 'companyId', as: 'paymentTransactions' });
PaymentTransaction.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// Subscription → Transactions
CompanySubscription.hasMany(PaymentTransaction, { foreignKey: 'subscriptionId', as: 'transactions' });
PaymentTransaction.belongsTo(CompanySubscription, { foreignKey: 'subscriptionId', as: 'subscription' });

// Company → Invoices
Company.hasMany(Invoice, { foreignKey: 'companyId', as: 'invoices' });
Invoice.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// Subscription → Invoices
CompanySubscription.hasMany(Invoice, { foreignKey: 'subscriptionId', as: 'invoices' });
Invoice.belongsTo(CompanySubscription, { foreignKey: 'subscriptionId', as: 'subscription' });

// Transaction → Invoice
PaymentTransaction.hasOne(Invoice, { foreignKey: 'transactionId', as: 'invoice' });
Invoice.belongsTo(PaymentTransaction, { foreignKey: 'transactionId', as: 'transaction' });


module.exports = {
  SubscriptionPlan, CompanySubscription, PaymentTransaction, Invoice,
  sequelize,
  TicketCategory, Ticket, TicketComment, TicketActivity, SlaPolicy,
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
  ContactOffice,
  PerformanceReview,
  ReviewCycle,
  Asset,
  AssetAssignment,
  AssetDamageReport,
  Course,
  CourseModule,
  CourseEnrollment,
  Quiz,
  
  QuizQuestion,
  QuizAttempt,
  Certification,
  Course,
  CourseModule,
  CourseEnrollment,

};