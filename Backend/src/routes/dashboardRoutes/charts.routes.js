const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const {
  getDashboardCharts,
  getTopStudents,
  getTopTeachers,
} = require("../../controllers/dashboardController");

// @desc    Get dashboard charts data
// @route   GET /api/dashboard/charts
// @access  Protected (Admin/Teacher)
router.get("/charts", protect, getDashboardCharts);

// @desc    Get top 5 students by combined marks
// @route   GET /api/dashboard/top-students
// @access  Protected (Admin/Teacher)
router.get("/top-students", protect, getTopStudents);

// @desc    Get top 5 teachers by combined marks of all their students
// @route   GET /api/dashboard/top-teachers
// @access  Protected (Admin/Teacher)
router.get("/top-teachers", protect, getTopTeachers);

module.exports = router;
