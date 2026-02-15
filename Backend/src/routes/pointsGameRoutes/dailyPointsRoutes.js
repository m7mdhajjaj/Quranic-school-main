// routes/pointsGameRoutes/dailyPointsRoutes.js
const express = require("express");
const router = express.Router();
const {
  saveDailyPoints,
  getDailyPoints,
  getGroupDailyPoints,
  resetStudentDailyPoints,
} = require("../../controllers/PointsGameController");
const { protect } = require("../../middleware/auth");

// حفظ النقاط اليومية
router.post("/", protect, saveDailyPoints);

// جلب نقاط طلاب الحلقة اليومية (للمعلم)
router.get("/group/:groupId", protect, getGroupDailyPoints);

// تصفير نقاط طالب يومية (للمعلم)
router.delete("/:studentId/:date", protect, resetStudentDailyPoints);

// جلب النقاط اليومية (اليوم الحالي أو تاريخ محدد)
router.get("/:date", protect, getDailyPoints);
router.get("/", protect, getDailyPoints);

module.exports = router;
