const express = require("express");
const router = express.Router();
const rankingController = require("../controllers/rankingController");
const { validateRankingData } = require("../Validation/RankingValidation");
const {
  protect,
  teacherProtect,
  adminProtect,
} = require("../middleware/authMiddleware");

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

// Create or update ranking (teachers and admins only)
router.post(
  "/",
  protect,
  teacherProtect,
  // validateRankingData, // Disabled - using controller validation instead
  rankingController.createOrUpdateRanking
);

// Delete ranking for a specific month/year (admins only)
router.delete(
  "/:month/:year",
  protect,
  adminProtect,
  rankingController.deleteRanking
);

module.exports = router;
