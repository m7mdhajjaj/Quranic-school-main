// ============================================================================
// ReportRoutes/averageMarksRoutes.js - Average Marks Routes
// ============================================================================

const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const ReportController = require("../../controllers/ReportController");

// Get average marks for all students in a group
router.get("/", protect, ReportController.getAverageMarks);

module.exports = router;
