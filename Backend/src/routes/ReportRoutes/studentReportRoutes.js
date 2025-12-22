// ============================================================================
// ReportRoutes/studentReportRoutes.js - Student Report Routes
// ============================================================================

const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const ReportController = require("../../controllers/ReportController");
const {
  validateStudentReportParams,
  validateDateRange,
  handleValidationErrors,
} = require("../../Validation/Report/ReportValidation");

// Get detailed student report
router.get(
  "/:studentId",
  protect,
  validateStudentReportParams,
  validateDateRange,
  handleValidationErrors,
  ReportController.getStudentReport
);

module.exports = router;
