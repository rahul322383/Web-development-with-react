const asyncHandler = require('../../utils/asyncHandler');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json(result);
});

const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refreshSession(req.body.refreshToken);
  res.status(200).json(result);
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout({
    refreshToken: req.body.refreshToken,
    accessJti: req.user?.jti,
    accessExp: req.user?.exp
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  res.status(200).json(user);
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  me
};