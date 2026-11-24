const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
  signup,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  changePassword,
  requestEmailChange,
  verifyNewEmail,
  deleteAccount
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authMiddleware, getCurrentUser);

// Settings routes (Protected)
router.post('/change-password', authMiddleware, changePassword);
router.post('/request-email-change', authMiddleware, requestEmailChange);
router.get('/verify-new-email/:token', verifyNewEmail);
router.delete('/delete-account', authMiddleware, deleteAccount);

module.exports = router;
