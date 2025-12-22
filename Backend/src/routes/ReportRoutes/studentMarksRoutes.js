// ============================================================================
// ReportRoutes/studentMarksRoutes.js - Student Marks Routes
// ============================================================================

const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const ReportController = require("../../controllers/ReportController");
const {
  validateStudentMarksQuery,
  handleValidationErrors,
  sanitizeQueryParams,
} = require("../../Validation/Report/ReportValidation");

// Get student marks for charts (monthly/yearly)
router.get(
  "/",
  protect,
  sanitizeQueryParams,
  validateStudentMarksQuery,
  handleValidationErrors,
  ReportController.getStudentMarks
);

module.exports = router;
