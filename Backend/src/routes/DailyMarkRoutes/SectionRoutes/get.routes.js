const express = require("express");
const router = express.Router();
const dailyMarkController = require("../../../controllers/DailyMarkController");
const { protect } = require("../../../middleware/auth");

// ============================================================================
// MIDDLEWARE - حماية routes القراءة
// ============================================================================
router.use(protect);

// ============================================================================
// GET ROUTES - جلب المقاطع (V7: Current Week + Flexible Review)
// ============================================================================
// 
// V7 Features:
// - ✅ /last-segment considers chronological order (not insertion order)
// - ✅ /check-quota enforces current week only
// - ✅ Flexible review ranges (1-50 ayahs)
// - ✅ Active Surah endpoints for group-level tracking

// Get all sections
router.get("/", dailyMarkController.getSections);

// Get last segment (for auto-increment) - MUST be before /:id
router.get("/last-segment", dailyMarkController.getLastSegment);

// ✅ V7: Get neighbor segments (for context) - MUST be before /:id
router.get("/neighbor-segments", dailyMarkController.getNeighborSegments);

// ✅ V7: Check Quota (Daily & Weekly) - Current week only
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
