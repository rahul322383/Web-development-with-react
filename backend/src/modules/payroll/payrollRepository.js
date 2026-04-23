'use strict';

const { Op } = require('sequelize');
const { User, Payroll, PayrollItem, Role } = require('../../database/initModels');

// ─── Existing (unchanged) ─────────────────────────────────────────────────────

const listActiveEmployees = () =>
  User.findAll({
    where: { isActive: true },
    attributes: ['id', 'firstName', 'lastName', 'email', 'employeeCode',
      'department', 'baseSalary'],
  });

const upsertPayroll = async (
  { employeeId, month, year, netSalary, status, processedAt },
  transaction,
) => {
  const [payroll] = await Payroll.findOrCreate({
    where: { employeeId, month, year },
    defaults: { employeeId, month, year, netSalary, status, processedAt },
    transaction,
  });

  if (payroll.status === 'Locked') return payroll;

  await payroll.update({ netSalary, status, processedAt }, { transaction });
  return payroll;
};

const upsertPayrollItems = async (
  { payrollId, baseSalary, bonus, deductions,
    hra, specialAllowance, overtimePay,
    pfEmployee, pfEmployer, professionalTax, tds,
    grossEarnings, ctcMonthly, ctcAnnual },
  transaction,
) => {
  const [item] = await PayrollItem.findOrCreate({
    where: { payrollId },
    defaults: {
      payrollId, baseSalary, bonus, deductions,
      hra, specialAllowance, overtimePay,
      pfEmployee, pfEmployer, professionalTax, tds,
      grossEarnings, ctcMonthly, ctcAnnual,
    },
    transaction,
  });

  await item.update({
    baseSalary, bonus, deductions,
    hra, specialAllowance, overtimePay,
    pfEmployee, pfEmployer, professionalTax, tds,
    grossEarnings, ctcMonthly, ctcAnnual,
  }, { transaction });

  return item;
};

const updatePayroll = (payrollId, data, transaction) =>
  Payroll.update(data, { where: { id: payrollId }, transaction });

const findPayrollById = (id) =>
  Payroll.findByPk(id, {
    include: [
      { model: PayrollItem, as: 'items' },
      {
        model: User, as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'email', 'employeeCode', 'department', 'baseSalary']
      },
    ],
  });

const listPayrollHistory = (employeeId) =>
  Payroll.findAll({
    where: { employeeId },
    include: [{ model: PayrollItem, as: 'items' }],
    order: [['year', 'DESC'], ['month', 'DESC']],
  });

const getPayrollByEmployee = (employeeId) =>
  Payroll.findAll({
    where: { employeeId },
    include: [{ model: PayrollItem, as: 'items' }],
    order: [['year', 'DESC'], ['month', 'DESC']],
  });

// ─── NEW: single payroll with full employee details (for payslip) ─────────────
const findPayrollWithEmployee = (payrollId) =>
  Payroll.findByPk(payrollId, {
    include: [
      { model: PayrollItem, as: 'items' },
      {
        model: User, as: 'employee',
        attributes: [
          'id', 'firstName', 'lastName', 'email', 'employeeCode',
          'department', 'baseSalary', 'createdAt',
        ],
      },
    ],
  });

// ─── NEW: salary history summary per year ────────────────────────────────────
const getSalaryHistory = async (employeeId, year) => {
  const where = { employeeId };
  if (year) where.year = year;

  return Payroll.findAll({
    where,
    include: [{ model: PayrollItem, as: 'items' }],
    order: [['year', 'DESC'], ['month', 'DESC']],
  });
};

// ─── NEW: year-to-date aggregate for an employee ─────────────────────────────
const getYTDSummary = async (employeeId, year) => {
  const records = await Payroll.findAll({
    where: { employeeId, year, status: { [Op.in]: ['Processed', 'Locked'] } },
    include: [{ model: PayrollItem, as: 'items' }],
  });

  const ytd = records.reduce((acc, p) => {
    const it = p.items || {};
    acc.grossEarnings += Number(it.grossEarnings || 0);
    acc.netSalary += Number(p.netSalary || 0);
    acc.totalTDS += Number(it.tds || 0);
    acc.totalPF += Number(it.pfEmployee || 0);
    acc.totalBonus += Number(it.bonus || 0);
    acc.totalOvertimePay += Number(it.overtimePay || 0);
    return acc;
  }, { grossEarnings: 0, netSalary: 0, totalTDS: 0, totalPF: 0, totalBonus: 0, totalOvertimePay: 0 });

  return { employeeId, year, monthsProcessed: records.length, ...ytd };
};

// ─── NEW: all payrolls for a month (HR bulk view) ────────────────────────────
const getMonthlyPayrollSummary = async ({ month, year }) =>
  Payroll.findAll({
    where: { month, year },
    include: [
      { model: PayrollItem, as: 'items' },
      {
        model: User, as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeCode', 'department']
      },
    ],
    order: [['net_salary', 'DESC']],
  });

const getAdminIds = async () => {
  try {
    const users = await User.findAll({
      include: [{
        model: Role, as: 'role',
        where: { name: ['Admin', 'HR', 'Finance'] },
        attributes: [],
      }],
      attributes: ['id'],
    });
    return users.map(u => u.id);
  } catch {
    return [];
  }
};

module.exports = {
  // existing
  listActiveEmployees,
  upsertPayroll,
  upsertPayrollItems,
  updatePayroll,
  findPayrollById,
  listPayrollHistory,
  getPayrollByEmployee,
  getAdminIds,
  // new
  findPayrollWithEmployee,
  getSalaryHistory,
  getYTDSummary,
  getMonthlyPayrollSummary,
};