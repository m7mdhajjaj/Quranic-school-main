// ============================================================================
// ReportRoutes/studentMarksRoutes.js - Student Marks Routes
// ============================================================================

const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const ReportController = require("../../controllers/ReportController");

// Get student marks for charts (monthly/yearly)
router.get("/", protect, ReportController.getStudentMarks);

module.exports = router;
