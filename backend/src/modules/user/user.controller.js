const asyncHandler = require('../../utils/asyncHandler');
const userService = require('./user.service');

const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  res.status(200).json(result);
});

const getUserById = asyncHandler(async (req, res) => {
  const result = await userService.getUserById(req.params.id);
  res.status(200).json(result);
});

const createUser = asyncHandler(async (req, res) => {
  const result = await userService.createUser(req.body, req.user, req.ip);
  res.status(201).json(result);
});

const updateUser = asyncHandler(async (req, res) => {
  const result = await userService.updateUser(req.params.id, req.body, req.user, req.ip);
  res.status(200).json(result);
});

const deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.params.id, req.user, req.ip);
  res.status(200).json(result);
});



const getDashboardSummary = asyncHandler(async (req, res) => {
  const year = Number(req.query.year || new Date().getFullYear());

  const result = await userService.getDashboardSummary({ year });

  res.status(200).json({
    success: true,
    data: result
  });
});

const getUsersByDepartment = asyncHandler(async (req, res) => {
  const department = req.params.department?.trim().toLowerCase();

  if (!department) {
    return res.status(400).json({
      success: false,
      message: "Department is required"
    });
  }

  const users = await userService.getUsersByDepartment(department);

  res.status(200).json({
    success: true,
    message: users.length
      ? "Users fetched successfully"
      : "No users found for this department",
    count: users.length,
    data: users
  });
});

 
module.exports = {
  getUsersByDepartment,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getDashboardSummary
};