const express = require("express");
const router = express.Router();
const rankingController = require("../../controllers/RankingController");
const { protect, teacherProtect, adminProtect } = require("../../middleware/auth");

// ============================================================================
// POST/DELETE ROUTES - إنشاء وحذف الترتيبات
// ============================================================================

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
