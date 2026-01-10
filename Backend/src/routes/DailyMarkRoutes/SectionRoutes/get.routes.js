const express = require("express");
const router = express.Router();
const dailyMarkController = require("../../../controllers/DailyMarkController");

// ============================================================================
// GET ROUTES - جلب المقاطع (V3: Date-Aware)
// ============================================================================
// 
// V3 Updates:
// - ✅ /last-segment now considers chronological order (not insertion order)
// - ✅ Returns suggestedEnd for exact-match review validation
// - ✅ Supports backfilling context

// Get all sections
router.get("/", dailyMarkController.getSections);

// Get last segment (for auto-increment) - MUST be before /:id
router.get("/last-segment", dailyMarkController.getLastSegment);

// ✅ V3: Get neighbor segments (for backfilling) - MUST be before /:id
router.get("/neighbor-segments", dailyMarkController.getNeighborSegments);

// Get a single section
router.get("/:id", dailyMarkController.getSection);

module.exports = router;
