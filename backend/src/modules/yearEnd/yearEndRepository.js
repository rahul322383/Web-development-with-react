'use strict';

const { Op, fn, col, literal } = require('sequelize');
const {
  User,
  Payroll,
  LeaveRequest,
  Expense,
  YearEndSummary,
} = require('../../database/initModels');

// FIX: accepts transaction so reads are consistent within the same transaction
const listActiveEmployees = (transaction) =>
  User.findAll({
    where: { isActive: true },
    attributes: ['id'],
    transaction,
  });

// FIX: added transaction param, raw: true, and group clause so Sequelize
// actually executes the SUM and returns a plain value
const getSalaryTotal = async (employeeId, year, transaction) => {
  const row = await Payroll.findOne({
    where: {
      employeeId,
      year,
      status: { [Op.in]: ['Processed', 'Locked'] },
    },
    attributes: [[fn('COALESCE', fn('SUM', col('net_salary')), 0), 'total']],
    group: ['employeeId'],
    raw: true,
    transaction,
  });
  return Number(row?.total || 0);
};

const getApprovedLeavesCount = (employeeId, year, transaction) =>
  LeaveRequest.count({
    where: {
      employeeId,
      status: 'Approved',
      startDate: { [Op.gte]: `${year}-01-01` },
      endDate: { [Op.lte]: `${year}-12-31` },
    },
    transaction,
  });

// FIX: added transaction param, raw: true, and group clause
const getExpenseTotal = async (employeeId, year, transaction) => {
  const row = await Expense.findOne({
    where: {
      employeeId,
      financeApprovalStatus: 'Approved',
      createdAt: {
        [Op.gte]: new Date(`${year}-01-01`),
        [Op.lte]: new Date(`${year}-12-31T23:59:59.999Z`),
      },
    },
    attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'total']],
    group: ['employeeId'],
    raw: true,
    transaction,
  });
  return Number(row?.total || 0);
};

const upsertYearSummary = async (payload, transaction) => {
  const [summary] = await YearEndSummary.findOrCreate({
    where: { employeeId: payload.employeeId, year: payload.year },
    defaults: payload,
    transaction,
  });

  // Only update if not yet finalized — never overwrite a locked summary
  if (!summary.isFinalized) {
    await summary.update(payload, { transaction });
  }

  return summary;
};

const listYearSummaries = (year) =>
  YearEndSummary.findAll({
    where: { year },
    include: [{
      model: User,
      as: 'employee',
      attributes: ['id', 'firstName', 'lastName', 'email'],
    }],
    order: [['employeeId', 'ASC']],
  });

module.exports = {
  listActiveEmployees,
  getSalaryTotal,
  getApprovedLeavesCount,
  getExpenseTotal,
  upsertYearSummary,
  listYearSummaries,
};