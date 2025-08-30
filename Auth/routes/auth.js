const express = require('express');
const {
  register,
  verifyPhone,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  resendPhoneOtp,
  resendEmailVerification
} = require('../controllers/authController');
const {
  validateRegistration,
  validateLogin,
  validateChangePassword,
  validateResetPassword
} = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/verify-phone', verifyPhone);
router.get('/verify-email', verifyEmail);
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.post('/change-password', protect, validateChangePassword, changePassword);
router.post('/resend-phone-otp', resendPhoneOtp);
router.post('/resend-email-verification', resendEmailVerification);

module.exports = router;