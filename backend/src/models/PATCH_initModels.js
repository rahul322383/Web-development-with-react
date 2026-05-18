// ============================================================
// PATCH: Add to your existing database/initModels.js
// ============================================================

// ── STEP 1: Add these imports at the top with other model imports ──

const defineKpi                = require('../models/kpi.model');
const defineReviewCycle        = require('../models/reviewCycle.model');
const definePerformanceReview  = require('../models/performanceReview.model');
const defineSelfAppraisal      = require('../models/selfAppraisal.model');
const defineManagerFeedback    = require('../models/managerFeedback.model');
const definePeerReview         = require('../models/peerReview.model');
const defineGoal               = require('../models/goal.model');
const definePromotionTrack     = require('../models/promotionTrack.model');

const defineAsset              = require('../models/asset.model');
const defineAssetAssignment    = require('../models/assetAssignment.model');
const defineAssetDamageReport  = require('../models/assetDamageReport.model');


// ── STEP 2: Add these model inits after your existing ones ──

const Kpi               = defineKpi(sequelize, DataTypes);
const ReviewCycle       = defineReviewCycle(sequelize, DataTypes);
const PerformanceReview = definePerformanceReview(sequelize, DataTypes);
const SelfAppraisal     = defineSelfAppraisal(sequelize, DataTypes);
const ManagerFeedback   = defineManagerFeedback(sequelize, DataTypes);
const PeerReview        = definePeerReview(sequelize, DataTypes);
const Goal              = defineGoal(sequelize, DataTypes);
const PromotionTrack    = definePromotionTrack(sequelize, DataTypes);

const Asset             = defineAsset(sequelize, DataTypes);
const AssetAssignment   = defineAssetAssignment(sequelize, DataTypes);
const AssetDamageReport = defineAssetDamageReport(sequelize, DataTypes);


// ── STEP 3: Add these associations in the ASSOCIATIONS section ──

// ════════════ PERFORMANCE ════════════

// KPI
User.hasMany(Kpi, { foreignKey: 'employeeId', as: 'kpis' });
Kpi.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
User.hasMany(Kpi, { foreignKey: 'managerId', as: 'managedKpis' });
Kpi.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });
Company.hasMany(Kpi, { foreignKey: 'companyId', as: 'kpis' });
Kpi.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// Review Cycle
Company.hasMany(ReviewCycle, { foreignKey: 'companyId', as: 'reviewCycles' });
ReviewCycle.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
User.hasMany(ReviewCycle, { foreignKey: 'createdBy', as: 'createdCycles' });
ReviewCycle.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Performance Review
ReviewCycle.hasMany(PerformanceReview, { foreignKey: 'cycleId', as: 'reviews' });
PerformanceReview.belongsTo(ReviewCycle, { foreignKey: 'cycleId', as: 'cycle' });
User.hasMany(PerformanceReview, { foreignKey: 'employeeId', as: 'performanceReviews' });
PerformanceReview.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
User.hasMany(PerformanceReview, { foreignKey: 'reviewerId', as: 'givenReviews' });
PerformanceReview.belongsTo(User, { foreignKey: 'reviewerId', as: 'reviewer' });
Company.hasMany(PerformanceReview, { foreignKey: 'companyId', as: 'performanceReviews' });
PerformanceReview.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// Self Appraisal
PerformanceReview.hasOne(SelfAppraisal, { foreignKey: 'reviewId', as: 'selfAppraisal' });
SelfAppraisal.belongsTo(PerformanceReview, { foreignKey: 'reviewId', as: 'review' });
User.hasMany(SelfAppraisal, { foreignKey: 'employeeId', as: 'selfAppraisals' });
SelfAppraisal.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });

// Manager Feedback
PerformanceReview.hasOne(ManagerFeedback, { foreignKey: 'reviewId', as: 'managerFeedback' });
ManagerFeedback.belongsTo(PerformanceReview, { foreignKey: 'reviewId', as: 'review' });
User.hasMany(ManagerFeedback, { foreignKey: 'managerId', as: 'givenFeedbacks' });
ManagerFeedback.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });
User.hasMany(ManagerFeedback, { foreignKey: 'employeeId', as: 'receivedFeedbacks' });
ManagerFeedback.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });

// Peer Review (360°)
PerformanceReview.hasMany(PeerReview, { foreignKey: 'reviewId', as: 'peerReviews' });
PeerReview.belongsTo(PerformanceReview, { foreignKey: 'reviewId', as: 'performanceReview' });
User.hasMany(PeerReview, { foreignKey: 'reviewerId', as: 'givenPeerReviews' });
PeerReview.belongsTo(User, { foreignKey: 'reviewerId', as: 'reviewer' });
User.hasMany(PeerReview, { foreignKey: 'revieweeId', as: 'receivedPeerReviews' });
PeerReview.belongsTo(User, { foreignKey: 'revieweeId', as: 'reviewee' });

// Goals
User.hasMany(Goal, { foreignKey: 'employeeId', as: 'goals' });
Goal.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
User.hasMany(Goal, { foreignKey: 'managerId', as: 'managedGoals' });
Goal.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });
ReviewCycle.hasMany(Goal, { foreignKey: 'cycleId', as: 'goals' });
Goal.belongsTo(ReviewCycle, { foreignKey: 'cycleId', as: 'cycle' });
Company.hasMany(Goal, { foreignKey: 'companyId', as: 'goals' });
Goal.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// Promotion Tracking
User.hasMany(PromotionTrack, { foreignKey: 'employeeId', as: 'promotions' });
PromotionTrack.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
User.hasMany(PromotionTrack, { foreignKey: 'recommendedBy', as: 'recommendedPromotions' });
PromotionTrack.belongsTo(User, { foreignKey: 'recommendedBy', as: 'recommender' });
User.hasMany(PromotionTrack, { foreignKey: 'approvedBy', as: 'approvedPromotions' });
PromotionTrack.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
PerformanceReview.hasMany(PromotionTrack, { foreignKey: 'reviewId', as: 'promotionTracks' });
PromotionTrack.belongsTo(PerformanceReview, { foreignKey: 'reviewId', as: 'review' });
Company.hasMany(PromotionTrack, { foreignKey: 'companyId', as: 'promotionTracks' });
PromotionTrack.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// ════════════ ASSETS ════════════

// Asset
Company.hasMany(Asset, { foreignKey: 'companyId', as: 'assets' });
Asset.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// Asset Assignment
Asset.hasMany(AssetAssignment, { foreignKey: 'assetId', as: 'assignments' });
AssetAssignment.belongsTo(Asset, { foreignKey: 'assetId', as: 'asset' });
User.hasMany(AssetAssignment, { foreignKey: 'employeeId', as: 'assetAssignments' });
AssetAssignment.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
User.hasMany(AssetAssignment, { foreignKey: 'assignedBy', as: 'assignedAssets' });
AssetAssignment.belongsTo(User, { foreignKey: 'assignedBy', as: 'assignor' });
User.hasMany(AssetAssignment, { foreignKey: 'returnedTo', as: 'receivedAssets' });
AssetAssignment.belongsTo(User, { foreignKey: 'returnedTo', as: 'returnedTo' });
Company.hasMany(AssetAssignment, { foreignKey: 'companyId', as: 'assetAssignments' });
AssetAssignment.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// Asset Damage Report
AssetAssignment.hasMany(AssetDamageReport, { foreignKey: 'assignmentId', as: 'damageReports' });
AssetDamageReport.belongsTo(AssetAssignment, { foreignKey: 'assignmentId', as: 'assignment' });
Asset.hasMany(AssetDamageReport, { foreignKey: 'assetId', as: 'damageReports' });
AssetDamageReport.belongsTo(Asset, { foreignKey: 'assetId', as: 'asset' });
User.hasMany(AssetDamageReport, { foreignKey: 'reportedBy', as: 'filedDamageReports' });
AssetDamageReport.belongsTo(User, { foreignKey: 'reportedBy', as: 'reporter' });
User.hasMany(AssetDamageReport, { foreignKey: 'reviewedBy', as: 'reviewedDamageReports' });
AssetDamageReport.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });
Company.hasMany(AssetDamageReport, { foreignKey: 'companyId', as: 'damageReports' });
AssetDamageReport.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });


// ── STEP 4: Add to your module.exports at the bottom ──

// Performance
// Kpi, ReviewCycle, PerformanceReview, SelfAppraisal,
// ManagerFeedback, PeerReview, Goal, PromotionTrack,

// Assets
// Asset, AssetAssignment, AssetDamageReport,
