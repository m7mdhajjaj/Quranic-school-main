// routes/pointsGameRoutes/debugRoutes.js
const express = require("express");
const router = express.Router();
const {
  getDebugMonthlyPoints,
  recalculateMonthlyPoints,
} = require("../../controllers/PointsGameController");
const { protect, adminProtect } = require("../../middleware/authMiddleware");

// [DEBUG] جلب جميع نقاط الشهر
router.get("/monthly-points", protect, getDebugMonthlyPoints);

// [ADMIN] إعادة حساب النقاط الشهرية
router.post("/recalculate-monthly", adminProtect, recalculateMonthlyPoints);

module.exports = router;
