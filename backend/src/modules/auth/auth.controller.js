'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body, req);
  return res.status(result.success ? 201 : (result.statusCode || 400)).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, req);
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refreshSession(req.body.refreshToken, req);
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout({ refreshToken: req.body.refreshToken }, req);
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const me = asyncHandler(async (req, res) => {
  const result = await authService.getCurrentUser(req.user.id, req);

  return res.status(result.success ? 200 : (result.statusCode || 404)).json(result);
});

module.exports = { register, login, refresh, logout, me };