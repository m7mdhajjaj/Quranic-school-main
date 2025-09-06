const express = require("express");
const router = express.Router();
const rankingController = require("../controllers/rankingController");

// Get current ranking (current month or most recent)
router.get("/current", rankingController.getCurrentRanking);

// Get all available months/years that have rankings
router.get("/periods", rankingController.getAvailableRankingPeriods);

// Get ranking by month and year
router.get("/:month/:year", rankingController.getRankingByMonthYear);

// Create or update ranking
router.post("/", rankingController.createOrUpdateRanking);

// Delete ranking for a specific month/year
router.delete("/:month/:year", rankingController.deleteRanking);

module.exports = router;
