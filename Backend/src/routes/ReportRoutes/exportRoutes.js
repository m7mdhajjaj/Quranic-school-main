// ============================================================================
// ReportRoutes/exportRoutes.js - Export Routes
// ============================================================================

const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const ReportController = require("../../controllers/ReportController");

// Export student report as PDF
router.get(
  "/student/:studentId",
  protect,
  ReportController.exportStudentReportPDF
);

// Export group report as PDF
router.get("/group/:groupId", protect, ReportController.exportGroupReportPDF);

module.exports = router;
