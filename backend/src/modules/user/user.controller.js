'use strict';

const userService = require('./user.service');
const {
  getSummaryStats,
  getChartData,
  getLeaveData,
  getExpenseData,
  getUserListData,
  getAttritionData,
  getAttritionByDepartment,
  getDepartmentPerformance,
  getLeaveTrends,
  getLeaveStatusBreakdown,
  getCostPerEmployee,
  getCostByDepartment
} = require('./userDashboard');

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Send a service result as an HTTP response.
 * Service functions return { success, statusCode, data, message }.
 */
const send = (res, result) => {
  if (!result) {
    return res.status(500).json({ success: false, message: 'No result returned' });
  }
  const status = result.statusCode ?? (result.success ? 200 : 400);
  return res.status(status).json(result);
};

/**
 * Parse date query params, with a sensible fallback to the current year boundary
 * when startDate / endDate are not supplied.
 */
const parseDateRange = (query) => {
  const now = new Date();
  const startDate = query.startDate
    ? new Date(query.startDate)
    : new Date(Date.UTC(now.getFullYear(), 0, 1));
  const endDate = query.endDate
    ? new Date(query.endDate)
    : new Date(Date.UTC(now.getFullYear(), 11, 31, 23, 59, 59, 999));
  return { startDate, endDate };
};

// ─────────────────────────────────────────────
// USER CRUD
// ─────────────────────────────────────────────

const listUsers = async (req, res) => {
  const result = await userService.listUsers(req.query, req.user);
  send(res, result);
};

const getUserById = async (req, res) => {
  const result = await userService.getUserById(req.params.id, req.user);
  send(res, result);
};

const createUser = async (req, res) => {
  const result = await userService.createUser(req.body, req.user, req.ip);
  send(res, result);
};

const updateUser = async (req, res) => {
  const result = await userService.updateUser(req.params.id, req.body, req.user, req.ip);
  send(res, result);
};

const deleteUser = async (req, res) => {
  const result = await userService.deleteUser(req.params.id, req.user, req.ip);
  send(res, result);
};

// ─────────────────────────────────────────────
// DASHBOARD — consolidated
// ─────────────────────────────────────────────

const getDashboardSummary = async (req, res) => {
  const { year, page, limit } = req.query;
  const result = await userService.getDashboardSummary({
    year,
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    user: req.user
  });
  send(res, result);
};

// ─────────────────────────────────────────────
// DASHBOARD — thin handlers (individual widgets)
// ─────────────────────────────────────────────

const getDashboardStats = async (req, res) => {
  const role = req.user?.primaryRole;
  const canViewFinance = ['Admin', 'Finance'].includes(role);
  const result = await getSummaryStats(req.query.year, canViewFinance);
  send(res, { success: true, statusCode: 200, data: result });
};

const getDashboardCharts = async (req, res) => {
  const role = req.user?.primaryRole;
  const canViewFinance = ['Admin', 'Finance'].includes(role);
  const result = await getChartData(req.query.year, canViewFinance);
  send(res, result.success !== false
    ? { success: true, statusCode: 200, data: result }
    : result
  );
};

const getDashboardLeaves = async (req, res) => {
  const { year, page = 1, limit = 10 } = req.query;
  const result = await getLeaveData(year, Number(page), Number(limit));
  send(res, result.success !== false
    ? { success: true, statusCode: 200, data: result }
    : result
  );
};

const getDashboardExpenses = async (req, res) => {
  const { year, page = 1, limit = 10 } = req.query;
  const role = req.user?.primaryRole;
  const result = await getExpenseData(year, Number(page), Number(limit), role);
  send(res, result.success !== false
    ? { success: true, statusCode: 200, data: result }
    : result
  );
};

const getDashboardUsers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await getUserListData(Number(page), Number(limit));
  send(res, result.success !== false
    ? { success: true, statusCode: 200, data: result }
    : result
  );
};

// ─────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────

const getAttritionDataController = async (req, res) => {
  const { startDate, endDate } = parseDateRange(req.query);
  const { department } = req.query;
  const result = await getAttritionData({ startDate, endDate, department });
  send(res, result.success !== false
    ? { success: true, statusCode: 200, data: result }
    : result
  );
};

const getAttritionByDepartmentController = async (req, res) => {
  const { startDate, endDate } = parseDateRange(req.query);
  const result = await getAttritionByDepartment({ startDate, endDate });
  send(res, result.success !== false
    ? { success: true, statusCode: 200, data: result }
    : result
  );
};

const getDepartmentPerformanceController = async (req, res) => {
  const { department } = req.query;
  const result = await getDepartmentPerformance({ department });
  send(res, result.success !== false
    ? { success: true, statusCode: 200, data: result }
    : result
  );
};

const getLeaveTrendsController = async (req, res) => {
  const { startDate, endDate } = parseDateRange(req.query);
  const { department } = req.query;
  const result = await getLeaveTrends({ startDate, endDate, department });
  send(res, result.success !== false
    ? { success: true, statusCode: 200, data: result }
    : result
  );
};

const getLeaveStatusBreakdownController = async (req, res) => {
  const { startDate, endDate } = parseDateRange(req.query);
  const result = await getLeaveStatusBreakdown({ startDate, endDate });
  send(res, result.success !== false
    ? { success: true, statusCode: 200, data: result }
    : result
  );
};

const getCostPerEmployeeController = async (req, res) => {
  const { startDate, endDate } = parseDateRange(req.query);
  const { department } = req.query;
  const result = await getCostPerEmployee({ startDate, endDate, department });
  send(res, result.success !== false
    ? { success: true, statusCode: 200, data: result }
    : result
  );
};

const getCostByDepartmentController = async (req, res) => {
  const { startDate, endDate } = parseDateRange(req.query);
  const result = await getCostByDepartment({ startDate, endDate });
  send(res, result.success !== false
    ? { success: true, statusCode: 200, data: result }
    : result
  );
};

// ─────────────────────────────────────────────
// DEPARTMENT / MANAGER
// ─────────────────────────────────────────────

const getUsersByDepartment = async (req, res) => {
  const result = await userService.getUsersByDepartment(req.params.department, req.user);
  send(res, result);
};

const assignManagerController = async (req, res) => {
  const { employeeId, managerId } = req.body;
  const result = await userService.assignManager({
    employeeId,
    managerId,
    actor: req.user
  });
  send(res, result);
};

// ─────────────────────────────────────────────

module.exports = {
  // CRUD
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,

  // Dashboard — consolidated
  getDashboardSummary,

  // Dashboard — individual widgets
  getDashboardStats,
  getDashboardCharts,
  getDashboardLeaves,
  getDashboardExpenses,
  getDashboardUsers,

  // Analytics
  getAttritionData: getAttritionDataController,
  getAttritionByDepartment: getAttritionByDepartmentController,
  getDepartmentPerformance: getDepartmentPerformanceController,
  getLeaveTrends: getLeaveTrendsController,
  getLeaveStatusBreakdown: getLeaveStatusBreakdownController,
  getCostPerEmployee: getCostPerEmployeeController,
  getCostByDepartment: getCostByDepartmentController,

  // Other
  getUsersByDepartment,
  assignManagerController
};