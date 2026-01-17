const express = require("express");
const router = express.Router();
const dailyMarkController = require("../../../controllers/DailyMarkController");

// ============================================================================
// GET ROUTES - جلب المقاطع (V3: Date-Aware + Active Surah System)
// ============================================================================
// 
// V3 Updates:
// - ✅ /last-segment now considers chronological order (not insertion order)
// - ✅ Returns suggestedEnd for exact-match review validation
// - ✅ Supports backfilling context
// - ✅ Active Surah endpoints for group-level tracking

// Get all sections
router.get("/", dailyMarkController.getSections);

// Get last segment (for auto-increment) - MUST be before /:id
router.get("/last-segment", dailyMarkController.getLastSegment);

// ✅ V3: Get neighbor segments (for backfilling) - MUST be before /:id
router.get("/neighbor-segments", dailyMarkController.getNeighborSegments);

// ✅ V3: Check Quota (Daily & Weekly)
router.get("/check-quota", dailyMarkController.checkQuota);

// ✅ NEW: Get Completed Surahs
router.get("/completed-surahs", dailyMarkController.getCompletedSurahs);

// ✅ NEW: Get Surah History
router.get("/surah-history", dailyMarkController.getSurahHistory);

// ✅ NEW: Get Active Surahs for a group (basic info)
router.get("/active-surahs/:groupId", dailyMarkController.getActiveSurahs);

// ✅ NEW: Get Active Surah Info with progress (detailed)
router.get("/active-surah-info/:groupId", dailyMarkController.getActiveSurahInfo);

// Get a single section
router.get("/:id", dailyMarkController.getSection);

module.exports = router;
