const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const {
  getDashboardStats,
} = require("../../controllers/dashboardController");

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Protected (Admin/Teacher)
router.get("/stats", protect, getDashboardStats);

module.exports = router;
