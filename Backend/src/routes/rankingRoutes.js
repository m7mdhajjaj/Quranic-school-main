const express = require("express");
const router = express.Router();
const rankingController = require("../controllers/rankingController");
const { validateRankingData } = require("../Validation/RankingValidation");
const {
  protect,
  teacherProtect,
  adminProtect,
} = require("../middleware/authMiddleware");

// Get current ranking (current month or most recent)
router.get("/current", rankingController.getCurrentRanking);

// Get all available months/years that have rankings
router.get("/periods", rankingController.getAvailableRankingPeriods);

// Get ranking by month and year
router.get("/period/:year/:month", rankingController.getRankingByMonthYear);

// Create or update ranking (teachers and admins only)
router.post(
  "/",
  protect,
  teacherProtect,
  validateRankingData,
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
