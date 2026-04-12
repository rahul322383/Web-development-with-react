const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const validate = require('../../middleware/validate.middleware');
const payrollController = require('./payrollController');

const { enqueuePayrollSchema, lockPayrollSchema } = require('./payrollValidation');

const router = express.Router();
router.use(authenticate);

router.post('/process', authorize('Admin', 'HR', 'Finance'), validate(enqueuePayrollSchema), payrollController.enqueueProcessing);
router.post('/lock', authorize('Admin', 'Finance'), validate(lockPayrollSchema), payrollController.lockPayroll);
router.get('/my-history', authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'), payrollController.getMyPayrollHistory);
router.get('/employee/:employeeId', authorize('Admin', 'HR', 'Finance', 'Manager'), payrollController.getPayrollByEmployee);

module.exports = router;