// routes/pointsGameRoutes/rankingsRoutes.js
const express = require("express");
const router = express.Router();
const {
  getPointsRankings,
  getBadgesRankings,
} = require("../../controllers/PointsGameController");
const { protect } = require("../../middleware/auth");

// ترتيب الطلاب حسب النقاط
router.get("/points", protect, getPointsRankings);

// ترتيب الطلاب حسب الشارات
router.get("/badges", protect, getBadgesRankings);

module.exports = router;
