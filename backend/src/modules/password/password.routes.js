const passwordResetController = require('./passwordReset.controller');
const {
    forgotPasswordSchema,
    verifyTokenSchema,
    resetPasswordSchema,
    changePasswordSchema,
} = require('./passwordReset.validation');

// public routes
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), passwordResetController.forgotPassword);
router.get('/verify-reset-token', authLimiter, validate(verifyTokenSchema, 'query'), passwordResetController.verifyResetToken);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), passwordResetController.resetPassword);

// authenticated route
router.post('/change-password', authenticate, apiLimiter, validate(changePasswordSchema), passwordResetController.changePassword);