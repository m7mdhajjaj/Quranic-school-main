const express = require("express");
const router = express.Router();
const dailyMarkController = require("../../../controllers/DailyMarkController");

// ============================================================================
// GET ROUTES - جلب المقاطع
// ============================================================================

// Get all sections
router.get("/", dailyMarkController.getSections);

// Get last segment (for auto-increment) - MUST be before /:id
router.get("/last-segment", dailyMarkController.getLastSegment);

// Get a single section
router.get("/:id", dailyMarkController.getSection);

module.exports = router;
