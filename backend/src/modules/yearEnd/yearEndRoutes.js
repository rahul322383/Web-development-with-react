const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const validate = require('../../middleware/validate.middleware');
const yearEndController = require('./yearEndController');
const { yearSchema } = require('./yearEndValidation');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize('Admin', 'HR', 'Finance'), yearEndController.listSummaries);
router.post('/generate', authorize('Admin', 'Finance'), validate(yearSchema), yearEndController.generateSummary);

module.exports = router;