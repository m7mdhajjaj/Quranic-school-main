const express = require("express");
const router = express.Router();
const {
  getAttendanceByDate,
  getStudentAttendance,
} = require("../../controllers/AttendanceController/index");
const { protect } = require("../../middleware/authMiddleware");

// Get attendance records for a specific date
router.get("/date/:date", protect, getAttendanceByDate);

// Get all attendance records for a specific student
router.get("/student/:studentId", protect, getStudentAttendance);

module.exports = router;
