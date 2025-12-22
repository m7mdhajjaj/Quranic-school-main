// ============================================================================
// ReportRoutes/exportRoutes.js - Export Routes
// ============================================================================

const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const ReportController = require("../../controllers/ReportController");
const {
  validateExportReportParams,
  handleValidationErrors,
} = require("../../Validation/Report/ReportValidation");

// Export student report as PDF
router.get(
  "/student/:studentId",
  protect,
  validateExportReportParams,
  handleValidationErrors,
  ReportController.exportStudentReportPDF
);

// Export group report as PDF
router.get(
  "/group/:groupId",
  protect,
  validateExportReportParams,
  handleValidationErrors,
  ReportController.exportGroupReportPDF
);

module.exports = router;
