// ============================================================================
// studentRoutes/history.routes.js - Student History Routes
// ============================================================================

const express = require('express');
const router = express.Router();
const studentController = require('../../controllers/basicController/studentController');
const { protect } = require('../../middleware/authMiddleware');

// ============================================================================
// Student History Routes
// ============================================================================

const {
  validateGetStudentHistory,
  validateGetHistoryStats,
} = require('./validation/historyValidation');

/**
 * @route   GET /api/students/history/group/:groupId/expelled
 * @desc    جلب الطلاب المفصولين من حلقة معينة عبر البحث في التاريخ
 * @access  Private (Admin, Teacher للحلقة)
 */
router.get(
  '/history/group/:groupId/expelled',
  protect,
  studentController.getExpelledStudentsFromGroupHistory
);

/**
 * @route   GET /api/students/:studentId/history
 * @desc    جلب تاريخ طالب كامل مع الأحداث
 * @access  Private (Admin, Teacher للطالب التابع له, الطالب نفسه)
 * @query   eventType, startDate, endDate, limit
 */
router.get(
  '/:studentId/history',
  protect,
  validateGetStudentHistory,
  studentController.getStudentCompleteHistory
);

/**
 * @route   GET /api/students/:studentId/history/stats
 * @desc    جلب إحصائيات تاريخ الطالب فقط
 * @access  Private (Admin, Teacher للطالب التابع له, الطالب نفسه)
 */
router.get(
  '/:studentId/history/stats',
  protect,
  validateGetHistoryStats,
  studentController.getStudentHistoryStatistics
);

module.exports = router;
