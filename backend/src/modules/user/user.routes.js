'use strict';

const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { requirePermission } = require('../../utils/permissions');
const userController = require('./user.controller');

const {
    analyticsLimiter,
    strictLimiter
} = require('../../config/security');

const {
    createUserSchema,
    updateUserSchema
} = require('./user.validation');

const router = express.Router();

router.use(authenticate);

router.get('/dashboard/summary', analyticsLimiter, requirePermission('VIEW_DASHBOARD'), userController.getDashboardSummary);
router.get('/dashboard/stats', analyticsLimiter, requirePermission('VIEW_DASHBOARD'), userController.getDashboardStats);
router.get('/dashboard/charts', analyticsLimiter, requirePermission('VIEW_DASHBOARD'), userController.getDashboardCharts);
router.get('/dashboard/leaves', analyticsLimiter, requirePermission('VIEW_LEAVE'), userController.getDashboardLeaves);
router.get('/dashboard/expenses', analyticsLimiter, requirePermission('VIEW_MY_EXPENSES'), userController.getDashboardExpenses);
router.get('/dashboard/users', analyticsLimiter, requirePermission('LIST_USERS'), userController.getDashboardUsers);

router.get('/analytics/attrition', analyticsLimiter, requirePermission('VIEW_ANALYTICS'), userController.getAttritionData);
router.get('/analytics/attrition/departments', analyticsLimiter, requirePermission('VIEW_ANALYTICS'), userController.getAttritionByDepartment);
router.get('/analytics/performance/departments', analyticsLimiter, requirePermission('VIEW_ANALYTICS'), userController.getDepartmentPerformance);
router.get('/analytics/leaves/trends', analyticsLimiter, requirePermission('VIEW_ANALYTICS'), userController.getLeaveTrends);
router.get('/analytics/leaves/status', analyticsLimiter, requirePermission('VIEW_ANALYTICS'), userController.getLeaveStatusBreakdown);
router.get('/analytics/cost-per-employee', analyticsLimiter, requirePermission('VIEW_FINANCE'), userController.getCostPerEmployee);
router.get('/analytics/cost-by-department', analyticsLimiter, requirePermission('VIEW_FINANCE'), userController.getCostByDepartment);

router.get('/department/:department', requirePermission('VIEW_DEPARTMENT'), userController.getUsersByDepartment);

router.post('/assign-manager', strictLimiter, requirePermission('ASSIGN_MANAGER'), userController.assignManagerController);

router.get('/', requirePermission('LIST_USERS'), userController.listUsers);

router.post('/', strictLimiter, requirePermission('CREATE_USER'), validate(createUserSchema), userController.createUser);

router.get('/:id', requirePermission('VIEW_USER_PROFILE'), userController.getUserById);

router.patch('/:id', strictLimiter, requirePermission('UPDATE_USER'), validate(updateUserSchema), userController.updateUser);

router.delete('/:id', strictLimiter, requirePermission('DELETE_USER'), userController.deleteUser);

module.exports = router;