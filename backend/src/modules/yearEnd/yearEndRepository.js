// 'use strict';

// const { Op, fn, col, literal } = require('sequelize');
// const {
//   User,
//   Payroll,
//   LeaveRequest,
//   Expense,
//   YearEndSummary,
// } = require('../../database/initModels');

// const listActiveEmployees = (transaction) =>
//   User.findAll({
//     where: { isActive: true },
//     attributes: ['id'],
//     transaction,
//   });
  
// // FIX: added transaction param, raw: true, and group clause so Sequelize
// // actually executes the SUM and returns a plain value
// const getSalaryTotal = async (employeeId, year, transaction) => {
//   const row = await Payroll.findOne({
//     where: {
//       employee_id: employeeId, // 👈 use DB column directly (safe fix)
//       year,
//       status: { [Op.in]: ['Processed', 'Locked'] },
//     },
//     attributes: [
//       [fn('COALESCE', fn('SUM', col('net_salary')), 0), 'total']
//     ],
//     raw: true,
//     transaction,
//   });

//   return Number(row?.total || 0);
// };

// const getApprovedLeavesCount = (employeeId, year, transaction) =>
//   LeaveRequest.count({
//     where: {
//       employeeId,
//       status: 'Approved',
//       startDate: { [Op.gte]: `${year}-01-01` },
//       endDate: { [Op.lte]: `${year}-12-31` },
//     },
//     transaction,
//   });

// // FIX: added transaction param, raw: true, and group clause
// const getExpenseTotal = async (employeeId, year, transaction) => {
//   const row = await Expense.findOne({
//     where: {
//       employee_id: employeeId, // 👈 fix here too
//       financeApprovalStatus: 'Approved',
//       createdAt: {
//         [Op.gte]: new Date(`${year}-01-01`),
//         [Op.lte]: new Date(`${year}-12-31T23:59:59.999Z`),
//       },
//     },
//     attributes: [
//       [fn('COALESCE', fn('SUM', col('amount')), 0), 'total']
//     ],
//     raw: true,
//     transaction,
//   });

//   return Number(row?.total || 0);
// };

// // const upsertYearSummary = async (payload, transaction) => {
// //   const [summary] = await YearEndSummary.findOrCreate({
// //     where: { employeeId: payload.employeeId, year: payload.year },
// //     defaults: payload,
// //     transaction,
// //   });

// //   // Only update if not yet finalized — never overwrite a locked summary
// //   if (!summary.isFinalized) {
// //     await summary.update(payload, { transaction });
// //   }

// //   return summary;
// // };

// // const upsertYearSummary = async (payload, transaction) => {
// //   const [summary, created] = await YearEndSummary.findOrCreate({
// //     where: { employeeId: payload.employeeId, year: payload.year },
// //     defaults: payload,
// //     transaction,
// //   });

// //   // ✅ ALWAYS update values (finalized just means "ready", not "immutable")
// //   await summary.update(payload, { transaction });

// //   return summary;
// // };

// const upsertYearSummary = async (payload, transaction) => {
//   const [summary] = await YearEndSummary.findOrCreate({
//     where: { employeeId: payload.employeeId, year: payload.year },
//     defaults: payload,
//     transaction,
//   });

//   // ✅ Only update if NOT finalized
//   if (!summary.isFinalized) {
//     await summary.update(payload, { transaction });
//   }

//   return summary;
// };
// const listYearSummaries = (year) =>
//   YearEndSummary.findAll({
//     where: { year },
//     include: [{
//       model: User,
//       as: 'employee',
//       attributes: ['id', 'firstName', 'lastName', 'email'],
//     }],
//     order: [['employeeId', 'ASC']],
//   });

// module.exports = {
//   listActiveEmployees,
//   getSalaryTotal,
//   getApprovedLeavesCount,
//   getExpenseTotal,
//   upsertYearSummary,
//   listYearSummaries,
// };


'use strict';

const { Op, fn, col } = require('sequelize');
const {
  User,
  Payroll,
  LeaveRequest,
  Expense,
  YearEndSummary,
} = require('../../database/initModels');

const listActiveEmployees = (transaction) =>
  User.findAll({
    where: { isActive: true },
    attributes: ['id'],
    transaction,
  });

/* =========================
   SALARY TOTAL
========================= */
const getSalaryTotal = async (employeeId, year, transaction) => {
  const row = await Payroll.findOne({
    where: {
      employee_id: employeeId,
      year,
      status: { [Op.in]: ['Processed', 'Locked'] },
    },
    attributes: [
      [fn('COALESCE', fn('SUM', col('net_salary')), 0), 'total'],
    ],
    raw: true,
    transaction,
  });

  return Number(row?.total || 0);
};

/* =========================
   LEAVES COUNT
========================= */
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

/* =========================
   LEAVES DETAILS (NEW 🔥)
========================= */
const getApprovedLeaves = (employeeId, year, transaction) =>
  LeaveRequest.findAll({
    where: {
      employeeId,
      status: 'Approved',
      startDate: { [Op.gte]: `${year}-01-01` },
      endDate: { [Op.lte]: `${year}-12-31` },
    },
    order: [['startDate', 'ASC']],
    raw: true,
    transaction,
  });

/* =========================
   EXPENSE TOTAL
========================= */
const getExpenseTotal = async (employeeId, year, transaction) => {
  const row = await Expense.findOne({
    where: {
      employee_id: employeeId,
      financeApprovalStatus: 'Approved',
      createdAt: {
        [Op.gte]: new Date(`${year}-01-01`),
        [Op.lte]: new Date(`${year}-12-31T23:59:59.999Z`),
      },
    },
    attributes: [
      [fn('COALESCE', fn('SUM', col('amount')), 0), 'total'],
    ],
    raw: true,
    transaction,
  });

  return Number(row?.total || 0);
};

/* =========================
   EXPENSE DETAILS (NEW 🔥)
========================= */
const getApprovedExpenses = (employeeId, year, transaction) =>
  Expense.findAll({
    where: {
      employee_id: employeeId,
      financeApprovalStatus: 'Approved',
      createdAt: {
        [Op.gte]: new Date(`${year}-01-01`),
        [Op.lte]: new Date(`${year}-12-31T23:59:59.999Z`),
      },
    },
    order: [['createdAt', 'ASC']],
    raw: true,
    transaction,
  });

/* =========================
   UPSERT SUMMARY
========================= */
const upsertYearSummary = async (payload, transaction) => {
  const [summary] = await YearEndSummary.findOrCreate({
    where: { employeeId: payload.employeeId, year: payload.year },
    defaults: payload,
    transaction,
  });

  // ✅ Respect immutability
  if (!summary.isFinalized) {
    await summary.update(payload, { transaction });
  }

  return summary;
};

/* =========================
   FETCH SUMMARIES
========================= */
const listYearSummaries = (year) =>
  YearEndSummary.findAll({
    where: { year },
    include: [
      {
        model: User,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
    ],
    order: [['employeeId', 'ASC']],
  });

module.exports = {
  listActiveEmployees,
  getSalaryTotal,
  getApprovedLeavesCount,
  getApprovedLeaves,          // 👈 NEW
  getExpenseTotal,
  getApprovedExpenses,        // 👈 NEW
  upsertYearSummary,
  listYearSummaries,
};