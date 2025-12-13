const express = require("express");
const router = express.Router();
const {
  getAttendanceByDate,
  getStudentAttendance,
  getAbsentStudentsToday,
  getTeacherGroupsForAttendance,
  getTeacherGroupsForMarks,
} = require("../../controllers/AttendanceController/index");
const { protect } = require("../../middleware/authMiddleware");
const { validateGetTeacherGroups } = require("../../Validation/Group/GroupValidation");

// Get attendance records for a specific date
router.get("/date/:date", protect, getAttendanceByDate);

// Get all attendance records for a specific student
router.get("/student/:studentId", protect, getStudentAttendance);

// Get absent students for today
router.get("/absent/today", protect, getAbsentStudentsToday);

// Get all groups for a teacher (for attendance page)
// Query params: includeStudents (default: true), filter (default: 'all')
router.get("/teacher/:teacherId/groups", protect, validateGetTeacherGroups, getTeacherGroupsForAttendance);

// Get all groups for a teacher (for daily marks page)
// Query params: includeStudents (default: false), filter (default: 'all')
router.get("/teacher/:teacherId/groups-for-marks", protect, validateGetTeacherGroups, getTeacherGroupsForMarks);

module.exports = router;
