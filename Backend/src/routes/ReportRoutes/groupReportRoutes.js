// ============================================================================
// ReportRoutes/groupReportRoutes.js - Group Report Routes
// ============================================================================

const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const ReportController = require("../../controllers/ReportController");
const {
  validateGroupReportParams,
  validateDateRange,
  handleValidationErrors,
} = require("../../Validation/Report/ReportValidation");

// Get group report
router.get(
  "/:groupId",
  protect,
  validateGroupReportParams,
  validateDateRange,
  handleValidationErrors,
  ReportController.getGroupReport
);

module.exports = router;
