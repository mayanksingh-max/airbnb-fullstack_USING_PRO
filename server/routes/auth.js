const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const { authRateLimiter } = require('../middleware/rateLimiter');

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, uploadAvatar, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
