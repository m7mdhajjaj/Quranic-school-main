// routes/pointsGameRoutes/championsRoutes.js
const express = require("express");
const router = express.Router();
const {
  crownMonthlyChampions,
  getMonthlyChampions,
} = require("../../controllers/PointsGameController");
const { protect, adminProtect } = require("../../middleware/authMiddleware");

// تتويج أبطال الشهر (Admin/Cron)
router.post("/crown", adminProtect, crownMonthlyChampions);

// جلب أبطال الأشهر السابقة
router.get("/", protect, getMonthlyChampions);

module.exports = router;
