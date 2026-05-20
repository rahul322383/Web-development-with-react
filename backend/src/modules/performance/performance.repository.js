'use strict';

const { Op } = require('sequelize');
const {
  Kpi,
  ReviewCycle,
  PerformanceReview,
  SelfAppraisal,
  ManagerFeedback,
  PeerReview,
  Goal,
  PromotionTrack,
  User,
  Role,
} = require('../../database/initModels');

const userAttrs = ['id', 'firstName', 'lastName', 'email', 'department', 'designation', 'profilePhoto'];

// ─── KPI ────────────────────────────────────────────────────────────────────

const createKpi = (payload, transaction = null) =>
  Kpi.create(payload, { transaction });

const findKpiById = (id) =>
  Kpi.findByPk(id, {
    include: [
      { model: User, as: 'employee', attributes: userAttrs },
      { model: User, as: 'manager',  attributes: userAttrs },
    ],
  });

const listKpis = ({ employeeId, managerId, companyId, status, year, quarter, type } = {}) => {
  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (managerId)  where.managerId  = managerId;
  if (companyId)  where.companyId  = companyId;
  if (status)     where.status     = status;
  if (year)       where.year       = year;
  if (quarter)    where.quarter    = quarter;
  if (type)       where.type       = type;
  return Kpi.findAll({
    where,
    include: [
      { model: User, as: 'employee', attributes: userAttrs },
      { model: User, as: 'manager',  attributes: userAttrs },
    ],
    order: [['createdAt', 'DESC']],
  });
};

const updateKpi = (id, payload, transaction = null) =>
  Kpi.update(payload, { where: { id }, transaction });

const deleteKpi = (id, transaction = null) =>
  Kpi.destroy({ where: { id }, transaction });

// ─── Review Cycle ────────────────────────────────────────────────────────────

const createReviewCycle = (payload, transaction = null) =>
  ReviewCycle.create(payload, { transaction });

const findReviewCycleById = (id) =>
  ReviewCycle.findByPk(id, {
    include: [{ model: User, as: 'creator', attributes: userAttrs }],
  });

const listReviewCycles = ({ companyId, status } = {}) => {
  const where = {};
  if (companyId) where.companyId = companyId;
  if (status)    where.status    = status;
  return ReviewCycle.findAll({ where, order: [['startDate', 'DESC']] });
};

const updateReviewCycle = (id, payload, transaction = null) =>
  ReviewCycle.update(payload, { where: { id }, transaction });

// ─── Performance Review ──────────────────────────────────────────────────────

const createPerformanceReview = (payload, transaction = null) =>
  PerformanceReview.create(payload, { transaction });

const findPerformanceReviewById = (id) =>
  PerformanceReview.findByPk(id, {
    include: [
      { model: User,        as: 'employee', attributes: userAttrs },
      { model: User,        as: 'reviewer', attributes: userAttrs },
      { model: ReviewCycle, as: 'cycle' },
      { model: SelfAppraisal,   as: 'selfAppraisal'   },
      { model: ManagerFeedback, as: 'managerFeedback'  },
      { model: PeerReview,      as: 'peerReviews'      },
    ],
  });

const listPerformanceReviews = ({ cycleId, employeeId, reviewerId, companyId, status } = {}) => {
  const where = {};
  if (cycleId)    where.cycleId    = cycleId;
  if (employeeId) where.employeeId = employeeId;
  if (reviewerId) where.reviewerId = reviewerId;
  if (companyId)  where.companyId  = companyId;
  if (status)     where.status     = status;
  return PerformanceReview.findAll({
    where,
    include: [
      { model: User,        as: 'employee', attributes: userAttrs },
      { model: User,        as: 'reviewer', attributes: userAttrs },
      { model: ReviewCycle, as: 'cycle',    attributes: ['id', 'name', 'type', 'status'] },
    ],
    order: [['createdAt', 'DESC']],
  });
};

const updatePerformanceReview = (id, payload, transaction = null) =>
  PerformanceReview.update(payload, { where: { id }, transaction });

// ─── Self Appraisal ──────────────────────────────────────────────────────────

const upsertSelfAppraisal = async (payload, transaction = null) => {
  const [record] = await SelfAppraisal.upsert(payload, { transaction });
  return record;
};

const findSelfAppraisalByReview = (reviewId) =>
  SelfAppraisal.findOne({ where: { reviewId } });

// ─── Manager Feedback ────────────────────────────────────────────────────────

const upsertManagerFeedback = async (payload, transaction = null) => {
  const [record] = await ManagerFeedback.upsert(payload, { transaction });
  return record;
};

const findManagerFeedbackByReview = (reviewId) =>
  ManagerFeedback.findOne({ where: { reviewId } });

// ─── Peer Review (360°) ──────────────────────────────────────────────────────

const createPeerReview = (payload, transaction = null) =>
  PeerReview.create(payload, { transaction });

const findPeerReviewById = (id) =>
  PeerReview.findByPk(id);

const listPeerReviews = ({ reviewId, revieweeId, reviewerId } = {}) => {
  const where = {};
  if (reviewId)   where.reviewId   = reviewId;
  if (revieweeId) where.revieweeId = revieweeId;
  if (reviewerId) where.reviewerId = reviewerId;
  return PeerReview.findAll({
    where,
    include: [
      { model: User, as: 'reviewer', attributes: userAttrs },
      { model: User, as: 'reviewee', attributes: userAttrs },
    ],
  });
};

const updatePeerReview = (id, payload, transaction = null) =>
  PeerReview.update(payload, { where: { id }, transaction });

// ─── Goals ───────────────────────────────────────────────────────────────────

const createGoal = (payload, transaction = null) =>
  Goal.create(payload, { transaction });

const findGoalById = (id) =>
  Goal.findByPk(id, {
    include: [
      { model: User, as: 'employee', attributes: userAttrs },
      { model: User, as: 'manager',  attributes: userAttrs },
    ],
  });

const listGoals = ({ employeeId, managerId, companyId, cycleId, status, category } = {}) => {
  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (managerId)  where.managerId  = managerId;
  if (companyId)  where.companyId  = companyId;
  if (cycleId)    where.cycleId    = cycleId;
  if (status)     where.status     = status;
  if (category)   where.category   = category;
  return Goal.findAll({
    where,
    include: [
      { model: User, as: 'employee', attributes: userAttrs },
      { model: User, as: 'manager',  attributes: userAttrs },
    ],
    order: [['createdAt', 'DESC']],
  });
};

const updateGoal = (id, payload, transaction = null) =>
  Goal.update(payload, { where: { id }, transaction });

const deleteGoal = (id, transaction = null) =>
  Goal.destroy({ where: { id }, transaction });

// ─── Promotion Tracking ──────────────────────────────────────────────────────

const createPromotionTrack = (payload, transaction = null) =>
  PromotionTrack.create(payload, { transaction });

const findPromotionById = (id) =>
  PromotionTrack.findByPk(id, {
    include: [
      { model: User, as: 'employee',    attributes: userAttrs },
      { model: User, as: 'recommender', attributes: userAttrs },
      { model: User, as: 'approver',    attributes: userAttrs },
    ],
  });

const listPromotions = ({ employeeId, companyId, status } = {}) => {
  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (companyId)  where.companyId  = companyId;
  if (status)     where.status     = status;
  return PromotionTrack.findAll({
    where,
    include: [
      { model: User, as: 'employee',    attributes: userAttrs },
      { model: User, as: 'recommender', attributes: userAttrs },
      { model: User, as: 'approver',    attributes: userAttrs },
    ],
    order: [['createdAt', 'DESC']],
  });
};

const updatePromotion = (id, payload, transaction = null) =>
  PromotionTrack.update(payload, { where: { id }, transaction });

module.exports = {
  // KPI
  createKpi, findKpiById, listKpis, updateKpi, deleteKpi,
  // Review Cycle
  createReviewCycle, findReviewCycleById, listReviewCycles, updateReviewCycle,
  // Performance Review
  createPerformanceReview, findPerformanceReviewById, listPerformanceReviews, updatePerformanceReview,
  // Self Appraisal
  upsertSelfAppraisal, findSelfAppraisalByReview,
  // Manager Feedback
  upsertManagerFeedback, findManagerFeedbackByReview,
  // Peer Review
  createPeerReview, findPeerReviewById, listPeerReviews, updatePeerReview,
  // Goals
  createGoal, findGoalById, listGoals, updateGoal, deleteGoal,
  // Promotions
  createPromotionTrack, findPromotionById, listPromotions, updatePromotion,
};
