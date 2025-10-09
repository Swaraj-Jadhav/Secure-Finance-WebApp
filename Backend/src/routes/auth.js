const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.use(authenticate);

router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);
router.put('/profile', validateProfileUpdate, authController.updateProfile);
router.put('/change-password', validatePasswordChange, authController.changePassword);
router.post('/verify-mfa', authController.verifyMFA);

module.exports = router;
