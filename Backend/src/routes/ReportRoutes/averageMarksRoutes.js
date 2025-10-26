// ============================================================================
// ReportRoutes/averageMarksRoutes.js - Average Marks Routes
// ============================================================================

const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const ReportController = require("../../controllers/ReportController");
const {
  validateAverageMarksQuery,
  handleValidationErrors,
  sanitizeQueryParams,
} = require("../../Validation/Report/ReportValidation");

// Get average marks for all students in a group
router.get(
  "/",
  protect,
  sanitizeQueryParams,
  validateAverageMarksQuery,
  handleValidationErrors,
  ReportController.getAverageMarks
);

module.exports = router;
