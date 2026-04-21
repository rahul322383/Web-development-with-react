const { fn, col, Op } = require('sequelize');
const { Expense, ExpenseReceipt, User, Role } = require('../../database/initModels');

const createExpense = async (payload, transaction) => Expense.create(payload, { transaction });

const createReceipt = async (payload, transaction) => ExpenseReceipt.create(payload, { transaction });



const getUsersByRoles = (roles = []) =>
 
  User.findAll({
    include: [{
      model: Role,
      as: 'role',          // FIX: singular 'role' matches User.belongsTo alias
      where: { name: { [Op.in]: roles } },
      attributes: ['id', 'name'],
    }],
    attributes: ['id', 'firstName', 'lastName'],
  });



const findExpenseById = async (id) =>
  Expense.findByPk(id, {
    include: [
      { model: ExpenseReceipt, as: 'receipt', required: false },
      { model: User, as: 'employee', attributes: ['id', 'managerId', 'firstName', 'lastName'] }
    ]
  });

const updateExpense = async (id, payload, transaction) => Expense.update(payload, { where: { id }, transaction });

const listExpensesForEmployee = async (employeeId) =>
  Expense.findAll({
    where: { employeeId },
    include: [{ model: ExpenseReceipt, as: 'receipt', required: false }],
    order: [['createdAt', 'DESC']]
  });


const listPendingManagerExpenses = async (managerId) => {
  return Expense.findAll({
    where: {
      managerApprovalStatus: 'Pending'
    },
    include: [
      {
        model: User,
        as: 'employee',
        attributes: ['id', 'managerId', 'firstName', 'lastName', 'email']
      }
    ],
    order: [['createdAt', 'ASC']]
  });
};


const listPendingFinanceExpenses = async () =>
  Expense.findAll({
    where: {
      managerApprovalStatus: 'Approved',
      financeApprovalStatus: 'Pending'
    },
    include: [{ model: User, as: 'employee', attributes: ['id','firstName', 'lastName', 'email'] }],
    order: [['createdAt', 'ASC']]
  });

const expenseAggregateByEmployee = async (employeeId) =>
  Expense.findOne({
    where: { employeeId },
    attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'totalClaimed']]
  });

  
const findExpenseByIdempotencyKey = async (idempotencyKey, employeeId) => {
  return Expense.findOne({
    where: {
      idempotencyKey,
      employeeId
    },
    include: [
      { model: ExpenseReceipt, as: 'receipt', required: false },
      { model: User, as: 'employee', attributes: ['id', 'firstName', 'lastName'] }
    ]
  });
};


module.exports = {
  findExpenseByIdempotencyKey,
  createExpense,
  createReceipt,
  findExpenseById,
  updateExpense,
  getUsersByRoles,
  listExpensesForEmployee,
  listPendingManagerExpenses,
  listPendingFinanceExpenses,
  expenseAggregateByEmployee
};