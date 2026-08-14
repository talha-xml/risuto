const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
  signup,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getCurrentUser
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authMiddleware, getCurrentUser);
module.exports = router;
