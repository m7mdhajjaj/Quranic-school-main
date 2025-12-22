// ============================================================================
// ReportRoutes/index.js - Main Routes Entry Point
// ============================================================================

const express = require("express");
const router = express.Router();

// Import all route modules
const studentMarksRoutes = require("./studentMarksRoutes");
const averageMarksRoutes = require("./averageMarksRoutes");
const studentReportRoutes = require("./studentReportRoutes");
const groupReportRoutes = require("./groupReportRoutes");
const exportRoutes = require("./exportRoutes");

// Import middleware
const { protect } = require("../../middleware/auth");

// Import validation
const {
  validateStudentMarksQuery,
  validateAverageMarksQuery,
  validateStudentReportParams,
  validateGroupReportParams,
  validateExportReportParams,
  validateDateRange,
  handleValidationErrors,
  sanitizeQueryParams,
} = require("../../Validation/Report/ReportValidation");

// Import controllers
const ReportController = require("../../controllers/ReportController");

// Student Marks Routes
router.get(
  "/student-marks",
  protect,
  sanitizeQueryParams,
  validateStudentMarksQuery,
  handleValidationErrors,
  ReportController.getStudentMarks
);

// Average Marks Routes
router.get(
  "/average-marks",
  protect,
  sanitizeQueryParams,
  validateAverageMarksQuery,
  handleValidationErrors,
  ReportController.getAverageMarks
);

// Student Report Routes
router.get(
  "/student/:studentId",
  protect,
  validateStudentReportParams,
  validateDateRange,
  handleValidationErrors,
  ReportController.getStudentReport
);

// Group Report Routes
router.get(
  "/group/:groupId",
  protect,
  validateGroupReportParams,
  validateDateRange,
  handleValidationErrors,
  ReportController.getGroupReport
);

// Export Routes
router.get(
  "/student/:studentId/export",
  protect,
  validateExportReportParams,
  handleValidationErrors,
  ReportController.exportStudentReportPDF
);
router.get(
  "/group/:groupId/export",
  protect,
  validateExportReportParams,
  handleValidationErrors,
  ReportController.exportGroupReportPDF
);

module.exports = router;
