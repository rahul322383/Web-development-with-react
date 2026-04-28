const express = require('express');

const authModule = require('../modules/auth');
const userModule = require('../modules/user');
const leaveModule = require('../modules/leave');
const expenseModule = require('../modules/expense');
const payrollModule = require('../modules/payroll');
const auditModule = require('../modules/audit');
const yearEndModule = require('../modules/yearEnd');
const notificationModule = require('../modules/notification');
const settingModule = require('../modules/settings');
const reportsModule = require('../modules/reports'); 
const attendanceModule = require('../modules/attendence');
const AImodules = require('../modules/AI')
const anaylticsModule = require('../modules/anayltics')
const companyModule = require('../modules/company');


const router = express.Router();

router.use('/auth', authModule.routes);
router.use('/users', userModule.routes);
router.use('/leaves', leaveModule.routes);
router.use('/expenses', expenseModule.routes);
router.use('/payroll', payrollModule.routes);
router.use('/audit-logs', auditModule.routes);
router.use('/year-end', yearEndModule.routes);
router.use('/notifications', notificationModule.routes);
router.use('/attendance', attendanceModule.routes);
router.use('/settings', settingModule.routes);
router.use('/ai', AImodules.routes)
router.use('/analytics', anaylticsModule.routes);
router.use('/company', companyModule.routes);

// ✅ FIX REPORTS
router.use('/reports', reportsModule.routes);

module.exports = router;