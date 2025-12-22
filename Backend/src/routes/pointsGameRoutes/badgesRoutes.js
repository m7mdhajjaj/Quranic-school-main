// routes/pointsGameRoutes/badgesRoutes.js
const express = require("express");
const router = express.Router();
const { getStudentBadges } = require("../../controllers/PointsGameController");
const { protect } = require("../../middleware/auth");

// جلب شارات الطالب
router.get("/", protect, getStudentBadges);

module.exports = router;
