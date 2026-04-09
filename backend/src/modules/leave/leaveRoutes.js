const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const validate = require('../../middleware/validate.middleware');
const leaveController = require('./leaveController');
const { applyLeaveSchema, leaveDecisionSchema } = require('./leaveValidation');

const router = express.Router();
router.use(authenticate);

router.post('/', authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'), validate(applyLeaveSchema), leaveController.applyLeave);
router.get('/my', authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'), leaveController.listMyLeaves);
router.get('/balance', authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'), leaveController.getLeaveBalance);
router.get('/pending-manager', authorize('Manager', 'Admin' ,'HR'), leaveController.listPendingForManager);
router.patch('/:id/review', authorize('Manager', 'Admin', 'HR'), validate(leaveDecisionSchema), leaveController.reviewLeave);



router.get('/team', authorize('Manager', 'Admin', 'HR'), leaveController.listTeamLeaves);
router.get('/dashboard-summary', authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'), leaveController.getDashboardSummary);
router.get('/stats', authorize('Admin', 'HR', 'Manager'), leaveController.getLeaveStats);
// router.post('/reset-balances', authorize('Admin'), validate(resetBalancesSchema), leaveController.resetLeaveBalances);

router.get('/:id', authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'), leaveController.getLeaveById);
router.patch('/cancel/:id', authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'), leaveController.cancelLeave);
module.exports = router; 