const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

// Routes for reports
router.get("/student-marks", protect, reportController.getStudentMarks);
router.get("/average-marks", protect, reportController.getAverageMarks);
router.get("/student/:studentId", protect, reportController.getStudentReport);
router.get("/group/:groupId", protect, reportController.getGroupReport);
router.get("/student/:studentId/export", protect, reportController.exportStudentReportPDF);
router.get("/group/:groupId/export", protect, reportController.exportGroupReportPDF);

module.exports = router;