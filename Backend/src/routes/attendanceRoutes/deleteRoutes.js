const express = require("express");
const router = express.Router();
const {
  deleteAttendance,
} = require("../../controllers/AttendanceController/index");
const { protect } = require("../../middleware/authMiddleware");

// Delete attendance record
router.delete("/:id", protect, deleteAttendance);

module.exports = router;
