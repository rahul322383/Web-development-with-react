'use strict';

const { Op } = require('sequelize');
const {
  User,
  Payroll,
  PayrollItem,
  Role,
} = require('../../database/initModels');

// ─────────────────────────────────────────────────────────────
// ACTIVE EMPLOYEES
// ─────────────────────────────────────────────────────────────

const listActiveEmployees = () =>
  User.findAll({
    where: {
      isActive: true,
    },
    attributes: [
      'id',
      'firstName',
      'lastName',
      'email',
      'employeeCode',
      'department',
      'designation',
      'baseSalary',
    ],
    order: [['id', 'ASC']],
  });

// ─────────────────────────────────────────────────────────────
// CREATE / UPDATE PAYROLL
// ─────────────────────────────────────────────────────────────

const upsertPayroll = async (
  {
    employeeId,
    month,
    year,
    netSalary,
    status,
    processedAt,
  },
  transaction,
) => {

  const [payroll] = await Payroll.findOrCreate({
    where: {
      employeeId,
      month,
      year,
    },

    defaults: {
      employeeId,
      month,
      year,
      netSalary,
      status,
      processedAt,
    },

    transaction,
  });

  // locked payroll cannot be modified
  if (payroll.status === 'Locked') {
    return payroll;
  }

  await payroll.update(
    {
      netSalary,
      status,
      processedAt,
    },
    { transaction }
  );

  return payroll;
};

// ─────────────────────────────────────────────────────────────
// PAYROLL ITEMS
// ─────────────────────────────────────────────────────────────

const upsertPayrollItems = async (
  {
    payrollId,

    baseSalary,
    bonus,
    deductions,

    hra,
    specialAllowance,
    overtimePay,

    pfEmployee,
    pfEmployer,
    professionalTax,
    tds,

    grossEarnings,

    ctcMonthly,
    ctcAnnual,
  },
  transaction,
) => {

  const [item] = await PayrollItem.findOrCreate({
    where: { payrollId },

    defaults: {
      payrollId,

      baseSalary,
      bonus,
      deductions,

      hra,
      specialAllowance,
      overtimePay,

      pfEmployee,
      pfEmployer,
      professionalTax,
      tds,

      grossEarnings,

      ctcMonthly,
      ctcAnnual,
    },

    transaction,
  });

  await item.update(
    {
      baseSalary,
      bonus,
      deductions,

      hra,
      specialAllowance,
      overtimePay,

      pfEmployee,
      pfEmployer,
      professionalTax,
      tds,

      grossEarnings,

      ctcMonthly,
      ctcAnnual,
    },
    { transaction }
  );

  return item;
};

// ─────────────────────────────────────────────────────────────
// UPDATE PAYROLL
// ─────────────────────────────────────────────────────────────

const updatePayroll = (payrollId, data, transaction) =>
  Payroll.update(
    data,
    {
      where: { id: payrollId },
      transaction,
    }
  );

// ─────────────────────────────────────────────────────────────
// FIND SINGLE PAYROLL
// ─────────────────────────────────────────────────────────────

const findPayrollById = (id) =>
  Payroll.findByPk(id, {
    include: [
      {
        model: PayrollItem,
        as: 'items',
      },

      {
        model: User,
        as: 'employee',

        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'employeeCode',
          'department',
          'designation',
          'baseSalary',
        ],
      },
    ],
  });

// ─────────────────────────────────────────────────────────────
// PAYROLL HISTORY
// ─────────────────────────────────────────────────────────────

const listPayrollHistory = (employeeId) =>
  Payroll.findAll({
    where: {
      employeeId,
    },

    include: [
      {
        model: PayrollItem,
        as: 'items',
      },
    ],

    order: [
      ['year', 'DESC'],
      ['month', 'DESC'],
    ],
  });

// ─────────────────────────────────────────────────────────────
// GET EMPLOYEE PAYROLL
// ─────────────────────────────────────────────────────────────

const getPayrollByEmployee = (employeeId) =>
  Payroll.findAll({
    where: {
      employeeId,
    },

    include: [
      {
        model: PayrollItem,
        as: 'items',
      },
    ],

    order: [
      ['year', 'DESC'],
      ['month', 'DESC'],
    ],
  });

// ─────────────────────────────────────────────────────────────
// PAYROLL + FULL EMPLOYEE DETAILS
// ─────────────────────────────────────────────────────────────

const findPayrollWithEmployee = (payrollId) =>
  Payroll.findByPk(payrollId, {
    include: [
      {
        model: PayrollItem,
        as: 'items',
      },

      {
        model: User,
        as: 'employee',

        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'employeeCode',
          'department',
          'designation',
          'baseSalary',
          'createdAt',
        ],
      },
    ],
  });

// ─────────────────────────────────────────────────────────────
// SALARY HISTORY
// ─────────────────────────────────────────────────────────────

const getSalaryHistory = async (employeeId, year) => {

  const where = {
    employeeId,
  };

  if (year) {
    where.year = year;
  }

  return Payroll.findAll({
    where,

    include: [
      {
        model: PayrollItem,
        as: 'items',
      },
    ],

    order: [
      ['year', 'DESC'],
      ['month', 'DESC'],
    ],
  });
};

// ─────────────────────────────────────────────────────────────
// YTD SUMMARY
// ─────────────────────────────────────────────────────────────

const getYTDSummary = async (employeeId, year) => {

  const records = await Payroll.findAll({
    where: {
      employeeId,
      year,

      status: {
        [Op.in]: ['Processed', 'Locked'],
      },
    },

    include: [
      {
        model: PayrollItem,
        as: 'items',
      },
    ],
  });

  const ytd = records.reduce(
    (acc, payroll) => {

      const item = payroll.items || {};

      acc.grossEarnings += Number(item.grossEarnings || 0);
      acc.netSalary += Number(payroll.netSalary || 0);

      acc.totalTDS += Number(item.tds || 0);
      acc.totalPF += Number(item.pfEmployee || 0);

      acc.totalBonus += Number(item.bonus || 0);
      acc.totalOvertimePay += Number(item.overtimePay || 0);

      return acc;
    },

    {
      grossEarnings: 0,
      netSalary: 0,
      totalTDS: 0,
      totalPF: 0,
      totalBonus: 0,
      totalOvertimePay: 0,
    }
  );

  return {
    employeeId,
    year,
    monthsProcessed: records.length,
    ...ytd,
  };
};

// ─────────────────────────────────────────────────────────────
// MONTHLY PAYROLL SUMMARY
// ─────────────────────────────────────────────────────────────

const getMonthlyPayrollSummary = async ({ month, year }) =>
  Payroll.findAll({
    where: {
      month,
      year,
    },

    include: [
      {
        model: PayrollItem,
        as: 'items',
      },

      {
        model: User,
        as: 'employee',

        attributes: [
          'id',
          'firstName',
          'lastName',
          'employeeCode',
          'department',
          'designation',
        ],
      },
    ],

    // ✅ FIXED
    order: [['netSalary', 'DESC']],
  });

// ─────────────────────────────────────────────────────────────
// ADMIN IDS
// ─────────────────────────────────────────────────────────────

const getAdminIds = async () => {

  try {

    const users = await User.findAll({

      include: [
        {
          model: Role,
          as: 'role',

          where: {
            name: ['Admin', 'HR', 'Finance'],
          },

          attributes: [],
        },
      ],

      attributes: ['id'],
    });

    return users.map(user => user.id);

  } catch (error) {

    console.error('GET_ADMIN_IDS_ERROR:', error.message);

    return [];
  }
};

// ─────────────────────────────────────────────────────────────

module.exports = {

  // employee
  listActiveEmployees,

  // payroll
  upsertPayroll,
  updatePayroll,

  // payroll items
  upsertPayrollItems,

  // payroll fetch
  findPayrollById,
  findPayrollWithEmployee,

  // history
  listPayrollHistory,
  getPayrollByEmployee,
  getSalaryHistory,

  // analytics
  getYTDSummary,
  getMonthlyPayrollSummary,

  // admin
  getAdminIds,
};