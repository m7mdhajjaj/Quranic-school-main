// routes/pointsGameRoutes.js
const express = require("express");
const router = express.Router();
const {
  saveDailyPoints,
  getDailyPoints,
  getStudentBadges,
  getPointsRankings,
  getBadgesRankings,
  getStudentStats,
  crownMonthlyChampions,
  getMonthlyChampions,
  getDebugMonthlyPoints,
  recalculateMonthlyPoints,
} = require("../controllers/pointsGameController");
const { protect, adminProtect } = require("../middleware/authMiddleware");

// حفظ النقاط اليومية (تحتاج مصادقة)
router.post("/daily", protect, saveDailyPoints);

// الحصول على النقاط اليومية (اليوم الحالي أو تاريخ محدد)
router.get("/daily/:date", protect, getDailyPoints);
router.get("/daily", protect, getDailyPoints);

// الحصول على شارات الطالب
router.get("/badges", protect, getStudentBadges);

// ترتيب الطلاب حسب النقاط (في نفس الحلقة)
router.get("/rankings/points", protect, getPointsRankings);

// ترتيب الطلاب حسب الشارات (في نفس الحلقة)
router.get("/rankings/badges", protect, getBadgesRankings);

// إحصائيات الطالب (أسبوعي، شهري، ترتيب)
router.get("/stats", protect, getStudentStats);

// تتويج أبطال الشهر (Admin/Cron)
router.post("/crown-champions", adminProtect, crownMonthlyChampions);

// جلب أبطال الأشهر السابقة
router.get("/champions", protect, getMonthlyChampions);

// [DEBUG] جلب جميع نقاط الشهر (للتطوير)
router.get("/debug/monthly-points", protect, getDebugMonthlyPoints);

// [ADMIN] إعادة حساب النقاط الشهرية لجميع الطلاب
router.post(
  "/admin/recalculate-monthly",
  adminProtect,
  recalculateMonthlyPoints
);

module.exports = router;
