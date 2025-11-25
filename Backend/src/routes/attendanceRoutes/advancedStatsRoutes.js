const express = require("express");
const router = express.Router();
const {
  getAdvancedAttendanceStats,
  getFilteredAttendanceStats,
  getAttendanceReport,
} = require("../../controllers/AttendanceController/index");
const { protect } = require("../../middleware/authMiddleware");

/**
 * Advanced Statistics Routes
 * All routes require authentication
 */

// POST /api/attendance/stats/advanced
// Get advanced attendance statistics for a group of students
// Body: { studentIds: string[], date?: string, startDate?: string, endDate?: string }
router.post("/stats/advanced", protect, getAdvancedAttendanceStats);

// POST /api/attendance/stats/filtered
// Get attendance statistics for filtered students with pagination
// Body: { teacherId: string, date: string, groupFilter?: string, searchQuery?: string, page?: number, limit?: number }
router.post("/stats/filtered", protect, getFilteredAttendanceStats);

// POST /api/attendance/stats/report
// Get comprehensive attendance report for date range
// Body: { studentIds?: string[], teacherId?: string, groupId?: string, startDate: string, endDate: string }
router.post("/stats/report", protect, getAttendanceReport);

module.exports = router;
