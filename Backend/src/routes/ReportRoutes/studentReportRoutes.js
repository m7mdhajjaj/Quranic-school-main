// ============================================================================
// ReportRoutes/studentReportRoutes.js - Student Report Routes
// ============================================================================

const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const ReportController = require("../../controllers/ReportController");

// Get detailed student report
router.get("/:studentId", protect, ReportController.getStudentReport);

module.exports = router;
