const express = require("express");
const router = express.Router();
const rankingController = require("../../controllers/RankingController");
const { protect } = require("../../middleware/authMiddleware");

// ============================================================================
// GET ROUTES - جلب الترتيبات
// ============================================================================

// Get ranking based on student monthly averages (NEW)
router.get("/by-averages", protect, rankingController.getRankingByAverages);

// Get current ranking (current month or most recent) - requires authentication to filter by group
router.get("/current", protect, rankingController.getCurrentRanking);

// Get all available months/years that have rankings
router.get("/periods", rankingController.getAvailableRankingPeriods);

// Get ranking by month and year - requires authentication to filter by group
router.get(
  "/period/:year/:month",
  protect,
  rankingController.getRankingByMonthYear
);

module.exports = router;
