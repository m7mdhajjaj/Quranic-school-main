const express = require("express");
const router = express.Router();
const {
  createAttendance,
} = require("../../controllers/AttendanceController/index");
const { protect } = require("../../middleware/auth");
const { validate } = require("../../middleware/validation/validate.middleware");
const { createAttendanceSchema } = require("../../Validation/Attendance");

// Create or update attendance records for a specific date
router.post("/", protect, validate(createAttendanceSchema), createAttendance);

module.exports = router;
