const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const validate = require('../../middleware/validate.middleware');
const yearEndController = require('./yearEndController');
const { yearSchema } = require('./yearEndValidation');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize('Admin', 'HR', 'Finance', 'Manager'), yearEndController.listSummaries);
router.post('/generate', authorize('Admin', 'HR', 'Finance', 'Manager'), validate(yearSchema), yearEndController.generateSummary);

module.exports = router;