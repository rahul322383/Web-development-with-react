const { User, Payroll, PayrollItem } = require('../../database/initModels');

const listActiveEmployees = async () =>
  User.findAll({
    where: { isActive: true },
    attributes: ['id', 'baseSalary']
  });

const upsertPayroll = async ({ employeeId, month, year, netSalary, status, processedAt }, transaction) => {
  const [payroll] = await Payroll.findOrCreate({
    where: { employeeId, month, year },
    defaults: { employeeId, month, year, netSalary, status, processedAt },
    transaction
  });

  if (payroll.status === 'Locked') {
    return payroll;
  }

  await payroll.update({ netSalary, status, processedAt }, { transaction });
  return payroll;
};

const upsertPayrollItems = async ({ payrollId, baseSalary, bonus, deductions }, transaction) => {
  const [payrollItem] = await PayrollItem.findOrCreate({
    where: { payrollId },
    defaults: { payrollId, baseSalary, bonus, deductions },
    transaction
  });

  await payrollItem.update({ baseSalary, bonus, deductions }, { transaction });
  return payrollItem;
};

const listPayrollHistory = async (employeeId) =>
  Payroll.findAll({
    where: { employeeId },
    include: [{ model: PayrollItem, as: 'items' }],
    order: [
      ['year', 'DESC'],
      ['month', 'DESC']
    ]
  });

const findPayrollById = async (id) => Payroll.findByPk(id, { include: [{ model: PayrollItem, as: 'items' }] });

const getPayrollByEmployee = async (employeeId) =>
  Payroll.findAll({
    where: { employeeId },
    include: [{ model: PayrollItem, as: 'items' }],
    order: [
      ['year', 'DESC'],
      ['month', 'DESC']
    ]
  }); 

module.exports = {
  getPayrollByEmployee,
  listActiveEmployees,
  upsertPayroll,
  upsertPayrollItems,
  listPayrollHistory,
  findPayrollById
};