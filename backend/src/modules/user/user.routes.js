const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const validate = require('../../middleware/validate.middleware');
const userController = require('./user.controller');
const { createUserSchema, updateUserSchema } = require('./user.validation');

const router = express.Router();

router.use(authenticate);

router.get('/dashboard/summary', authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'), userController.getDashboardSummary);
router.get('/', authorize('HR', 'Admin', 'Manager'), userController.listUsers);
router.get('/:id', authorize('HR', 'Admin', 'Manager'), userController.getUserById);
router.post('/', authorize('HR', 'Admin'), validate(createUserSchema), userController.createUser);
router.patch('/:id', authorize('HR', 'Admin'), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', authorize('Admin'), userController.deleteUser);

module.exports = router;