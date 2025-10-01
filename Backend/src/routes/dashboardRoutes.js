const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Protected (Admin/Teacher)
router.get('/stats', protect, dashboardController.getDashboardStats);

// @desc    Get dashboard charts data
// @route   GET /api/dashboard/charts
// @access  Protected (Admin/Teacher)
router.get('/charts', protect, dashboardController.getDashboardCharts);

module.exports = router;