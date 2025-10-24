// routes/studentRoutes/average.routes.js
const express = require("express");
const router = express.Router();
const studentController = require("../../controllers/studentController");
const { protect } = require("../../middleware/authMiddleware");

/**
 * Monthly Average Routes for Students
 * Handle student performance averages
 */

// Get student monthly average
router.get(
  "/:studentId/monthly-average",
  protect,
  studentController.getStudentMonthlyAverage
);

// Get all student monthly averages
router.get(
  "/:studentId/all-monthly-averages",
  protect,
  studentController.getAllStudentMonthlyAverages
);

// Calculate student monthly average
router.post(
  "/:studentId/calculate-monthly-average",
  protect,
  studentController.calculateStudentMonthlyAverage
);

// Get student overall average
router.get(
  "/:studentId/overall-average",
  protect,
  studentController.getStudentOverallAverage
);

module.exports = router;
