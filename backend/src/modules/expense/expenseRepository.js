const { fn, col } = require('sequelize');
const { Expense, ExpenseReceipt, User } = require('../../database/initModels');

const createExpense = async (payload, transaction) => Expense.create(payload, { transaction });

const createReceipt = async (payload, transaction) => ExpenseReceipt.create(payload, { transaction });


const getUsersByRoles = async (roles = []) => {
  return User.findAll({
    where: { role: roles },
   attributes: ['id', 'role', 'firstName', 'lastName']
  });
};



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

// const listPendingManagerExpenses = async (managerId) =>
//   Expense.findAll({
//     where: { managerApprovalStatus: 'Pending' },
//     include: [
//       {
//         model: User,
//         as: 'employee',
//         where: { managerId },
//         attributes: ['id', 'firstName', 'lastName', 'email']
//       }
//     ],
//     order: [['createdAt', 'ASC']]
//   });

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

  

module.exports = {
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