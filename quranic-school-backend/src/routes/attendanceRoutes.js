const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
// Authentication middleware imported but not used for debugging
const { protect } = require("../middleware/authMiddleware");

// Create or update attendance records for a specific date
router.post("/", attendanceController.createAttendance); // No auth for debugging

// Get attendance records for a specific date
router.get("/date/:date", attendanceController.getAttendanceByDate);

// Get all attendance records for a specific student
router.get(
  "/student/:studentId",
  attendanceController.getStudentAttendance
);

// Get attendance statistics for a specific student
router.get(
  "/student/:studentId/stats",
  attendanceController.getStudentAttendanceStats
);

// Delete attendance record
router.delete("/:id", attendanceController.deleteAttendance);

module.exports = router;
