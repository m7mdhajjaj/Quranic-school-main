// Backend API Route لحالة المستخدم
// routes/userStatusRoutes.js

const express = require('express');
const { getUserStatus, getActiveUsers, setUserStatus, getAllLastSeen } = require('../controllers/userStatusController');
const { protect, adminProtect } = require('../middleware/authMiddleware');

const router = express.Router();

// استخدم دوال الكنترولر فقط لتجنب التكرار والأخطاء
router.get('/active', protect, getActiveUsers);
router.get('/last-seen', protect, getAllLastSeen);
router.get('/:userId/status', protect, getUserStatus);
router.put('/:userId/status', adminProtect, setUserStatus);

module.exports = router;