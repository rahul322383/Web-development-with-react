'use strict';

const { Op } = require('sequelize');
const { User, Payroll, PayrollItem, Role } = require('../../database/initModels');

const listActiveEmployees = () =>
  User.findAll({
    where: { isActive: true },
    attributes: ['id', 'baseSalary'],
  });

const upsertPayroll = async ({ employeeId, month, year, netSalary, status, processedAt }, transaction) => {
  const [payroll] = await Payroll.findOrCreate({
    where: { employeeId, month, year },
    defaults: { employeeId, month, year, netSalary, status, processedAt },
    transaction,
  });

  // Never overwrite a locked payroll
  if (payroll.status === 'Locked') return payroll;

  await payroll.update({ netSalary, status, processedAt }, { transaction });
  return payroll;
};

const upsertPayrollItems = async ({ payrollId, baseSalary, bonus, deductions }, transaction) => {
  const [payrollItem] = await PayrollItem.findOrCreate({
    where: { payrollId },
    defaults: { payrollId, baseSalary, bonus, deductions },
    transaction,
  });

  await payrollItem.update({ baseSalary, bonus, deductions }, { transaction });
  return payrollItem;
};

const updatePayroll = (payrollId, data, transaction) =>
  Payroll.update(data, { where: { id: payrollId }, transaction });

const findPayrollById = (id) =>
  Payroll.findByPk(id, { include: [{ model: PayrollItem, as: 'items' }] });

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

const getAdminIds = async () => {
  try {
    const users = await User.findAll({
      include: [{
        model: Role,
        as: 'role',        // FIX: singular
        where: { name: ['Admin', 'HR', 'Finance'] },
        attributes: [],
      }],
      attributes: ['id'],
    });
    return users.map((u) => u.id);
  } catch (error) {
    logger.error({ event: 'GET_ADMIN_IDS_FAILED', error: error.message });
    return [];
  }
};

module.exports = {
  listActiveEmployees,
  upsertPayroll,
  upsertPayrollItems,
  updatePayroll,
  findPayrollById,
  listPayrollHistory,
  getPayrollByEmployee,
  getAdminIds,
};