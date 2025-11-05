const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getDashboardStats,
  getDashboardCharts,
} = require("../controllers/dashboardController");

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Protected (Admin/Teacher)
router.get("/stats", protect, getDashboardStats);

// @desc    Get dashboard charts data
// @route   GET /api/dashboard/charts
// @access  Protected (Admin/Teacher)
router.get("/charts", protect, getDashboardCharts);

module.exports = router;
