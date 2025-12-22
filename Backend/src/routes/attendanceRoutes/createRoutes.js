const express = require("express");
const router = express.Router();
const {
  createAttendance,
} = require("../../controllers/AttendanceController/index");
const { protect } = require("../../middleware/auth");

// Create or update attendance records for a specific date
router.post("/", protect, createAttendance);

module.exports = router;
