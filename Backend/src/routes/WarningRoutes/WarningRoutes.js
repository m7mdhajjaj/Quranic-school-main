// ============================================================================
// WarningRoutes/WarningRoutes.js - Warning Routes
// ============================================================================

const express = require('express');
const router = express.Router();
const warningController = require('../../controllers/WarningController/index');
const { protect } = require('../../middleware/authMiddleware');
const {
  validateCreateWarning,
  validateDeleteWarning,
  validateDeleteWarningByType,
  validateGetStudentWarnings,
  validateGetGroupWarnings,
  validateCheckStudentStatus,
  validateGetExpelledStudents,
} = require('../../Validation/Warning/warningValidation');

// ============================================================================
// GET ROUTES - جلب الإنذارات
// ============================================================================

// جلب إحصائيات الإنذارات (للمدير) - يجب أن يكون قبل الـ routes الديناميكية
// GET /api/warnings/statistics/all
router.get('/statistics/all', protect, warningController.getWarningsStatistics);

// جلب إحصائيات المعلم
// GET /api/warnings/statistics/teacher
router.get(
  '/statistics/teacher',
  protect,
  warningController.getTeacherStatistics
);

// التحقق من حالة الطالب (مفصول أم لا)
// GET /api/warnings/status/:studentId
router.get('/status/:studentId', protect, validateCheckStudentStatus, warningController.checkStudentStatus);

// جلب إنذارات طالب معين
// GET /api/warnings/student/:studentId
router.get(
  '/student/:studentId',
  protect,
  validateGetStudentWarnings,
  warningController.getStudentWarnings
);

// جلب إحصائيات حلقة معينة
// GET /api/warnings/group/:groupId/statistics
router.get(
  '/group/:groupId/statistics',
  protect,
  validateGetGroupWarnings,
  warningController.getGroupStatistics
);

// جلب طلاب الحلقة مع تفاصيل الإنذارات الكاملة
// GET /api/warnings/group/:groupId/students-with-warnings
router.get(
  '/group/:groupId/students-with-warnings',
  protect,
  validateGetGroupWarnings,
  warningController.getGroupWithStudentsWarnings
);

// جلب الطلاب المفصولين من حلقة معينة عبر البحث في التاريخ
// GET /api/warnings/group/:groupId/expelled-students
router.get(
  '/group/:groupId/expelled-students',
  protect,
  validateGetExpelledStudents,
  warningController.getExpelledStudentsFromGroup
);

// جلب إنذارات حلقة معينة (للمعلم فقط)
// GET /api/warnings/group/:groupId
router.get('/group/:groupId', protect, validateGetGroupWarnings, warningController.getGroupWarnings);

// ============================================================================
// POST ROUTES - إنشاء الإنذارات
// ============================================================================

// إنشاء إنذار جديد (للمعلم فقط)
// POST /api/warnings
router.post('/', protect, validateCreateWarning, warningController.createWarning);

// ============================================================================
// DELETE ROUTES - حذف الإنذارات
// ============================================================================

// حذف إنذار (للمدير فقط)
// DELETE /api/warnings/:warningId
router.delete('/:warningId', protect, validateDeleteWarning, warningController.deleteWarning);

// حذف إنذار حسب النوع
// DELETE /api/warnings/student/:studentId/type/:warningType
router.delete(
  '/student/:studentId/type/:warningType',
  protect,
  validateDeleteWarningByType,
  warningController.deleteWarningByType
);

module.exports = router;
