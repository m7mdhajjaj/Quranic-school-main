const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
// Authentication middleware - CRITICAL: All attendance routes now protected
const { protect } = require("../middleware/authMiddleware");

// Create or update attendance records for a specific date - PROTECTED
router.post("/", protect, attendanceController.createAttendance);

// Get attendance records for a specific date - PROTECTED
router.get("/date/:date", protect, attendanceController.getAttendanceByDate);

// Get all attendance records for a specific student - PROTECTED
router.get("/student/:studentId", protect, attendanceController.getStudentAttendance);

// Get attendance statistics for a specific student - PROTECTED
router.get(
  "/student/:studentId/stats",
  protect,
  attendanceController.getStudentAttendanceStats,
);

// Delete attendance record - PROTECTED
router.delete("/:id", protect, attendanceController.deleteAttendance);

module.exports = router;
