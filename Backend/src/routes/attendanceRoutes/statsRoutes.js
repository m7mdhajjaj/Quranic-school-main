const express = require("express");
const router = express.Router();
const {
  getStudentAttendanceStats,
} = require("../../controllers/AttendanceController/index");
const { protect } = require("../../middleware/authMiddleware");

// Get attendance statistics for a specific student
router.get("/student/:studentId/stats", protect, getStudentAttendanceStats);

module.exports = router;
