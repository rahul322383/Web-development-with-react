

const asyncHandler = require('../../utils/asyncHandler');
const userService = require('./user.service');

const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query, req.user);

  if (!result.success) {
    return res.status(result.statusCode || 400).json(result);
  }

  res.status(200).json(result);
});

const getUserById = asyncHandler(async (req, res) => {
  const result = await userService.getUserById(req.params.id);
  res.status(200).json({ success: true, data: result });
});

const createUser = asyncHandler(async (req, res) => {
  const result = await userService.createUser(req.body, req.user, req.ip);
  res.status(201).json({ success: true, data: result });
});

const updateUser = asyncHandler(async (req, res) => {
  const result = await userService.updateUser(req.params.id, req.body, req.user, req.ip);
  res.status(200).json({ success: true, data: result });
});

const deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.params.id, req.user, req.ip);
  res.status(200).json({ success: true, data: result });
});

const getDashboardSummary = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

  if (isNaN(year)) {
    return res.status(400).json({ success: false, message: 'Invalid year parameter' });
  }

  const result = await userService.getDashboardSummary({
    year,
    page,
    limit,
    user: req.user
  });

  res.status(200).json({ success: true, data: result });
});

const getUsersByDepartment = asyncHandler(async (req, res) => {
  const department = req.params.department?.trim().toLowerCase();

  if (!department) {
    return res.status(400).json({
      success: false,
      message: 'Department is required'
    });
  }

  const result = await userService.getUsersByDepartment(
    department,
    req.user
  );

  if (result?.success === false) {
    return res.status(result.statusCode || 400).json(result);
  }

  return res.status(200).json({
    success: true,
    message: result.length ? 'Users fetched successfully' : 'No users found',
    count: result.length,
    data: result
  });
});



const assignManagerController = async (req, res) => {
  const { employeeId, managerId } = req.body;

  const result = await assignManager({ employeeId, managerId });

  return res.status(result.statusCode).json(result);
};

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getDashboardSummary,
  getUsersByDepartment,
  assignManagerController
};