// ============================================================================
// ReportRoutes/groupReportRoutes.js - Group Report Routes
// ============================================================================

const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const ReportController = require("../../controllers/ReportController");

// Get group report
router.get("/:groupId", protect, ReportController.getGroupReport);

module.exports = router;
