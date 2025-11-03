// routes/pointsGameRoutes/dailyPointsRoutes.js
const express = require("express");
const router = express.Router();
const {
  saveDailyPoints,
  getDailyPoints,
} = require("../../controllers/PointsGameController");
const { protect } = require("../../middleware/authMiddleware");

// حفظ النقاط اليومية
router.post("/", protect, saveDailyPoints);

// جلب النقاط اليومية (اليوم الحالي أو تاريخ محدد)
router.get("/:date", protect, getDailyPoints);
router.get("/", protect, getDailyPoints);

module.exports = router;
