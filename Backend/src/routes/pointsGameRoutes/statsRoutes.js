// routes/pointsGameRoutes/statsRoutes.js
const express = require("express");
const router = express.Router();
const { getStudentStats } = require("../../controllers/PointsGameController");
const { protect } = require("../../middleware/authMiddleware");

// إحصائيات الطالب (أسبوعي، شهري، ترتيب)
router.get("/", protect, getStudentStats);

module.exports = router;
