// routes/pointsGameRoutes/index.js
const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const {
  getTeacherGroupsForPointsGame,
} = require("../../controllers/PointsGameController");

// استيراد الـ Routes الفرعية
const dailyPointsRoutes = require("./dailyPointsRoutes");
const badgesRoutes = require("./badgesRoutes");
const rankingsRoutes = require("./rankingsRoutes");
const statsRoutes = require("./statsRoutes");
const championsRoutes = require("./championsRoutes");
const debugRoutes = require("./debugRoutes");

// جلب حلقات المعلم
router.get("/teacher-groups", protect, getTeacherGroupsForPointsGame);

// تعيين المسارات
router.use("/daily", dailyPointsRoutes);
router.use("/badges", badgesRoutes);
router.use("/rankings", rankingsRoutes);
router.use("/stats", statsRoutes);
router.use("/champions", championsRoutes);
router.use("/debug", debugRoutes);

module.exports = router;
