const express = require('express');

const authModule = require('../modules/auth');
const userModule = require('../modules/user');
const leaveModule = require('../modules/leave');
const expenseModule = require('../modules/expense');
const payrollModule = require('../modules/payroll');
const auditModule = require('../modules/audit');
const yearEndModule = require('../modules/yearEnd');
const notificationModule = require('../modules/notification');

const router = express.Router();

router.use('/auth', authModule.routes);
router.use('/users', userModule.routes);
router.use('/leaves', leaveModule.routes);
router.use('/expenses', expenseModule.routes);
router.use('/payrolls', payrollModule.routes);
router.use('/audit-logs', auditModule.routes);
router.use('/year-end', yearEndModule.routes);
router.use('/notifications', notificationModule.routes);

module.exports = router;