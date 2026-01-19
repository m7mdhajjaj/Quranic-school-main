// ============================================================================
// WarningRoutes/WarningRoutes.js - Warning Routes
// ============================================================================

const express = require('express');
const router = express.Router();
const warningController = require('../../controllers/WarningController/index');
const { protect } = require('../../middleware/auth');
const {
  validateCreateWarning,
  validateDeleteWarning,
  validateDeleteWarningByType,
  validateGetStudentWarnings,
  validateGetGroupWarnings,
  validateRestoreStudent,
} = require('../../Validation/Warning/warningValidation');

// ============================================================================
// GET ROUTES - جلب الإنذارات
// ============================================================================

// جلب إحصائيات المعلم (USED by Frontend)
// GET /api/warnings/statistics/teacher
router.get(
  '/statistics/teacher',
  protect,
  warningController.getTeacherStatistics
);

// جلب إنذارات طالب معين (USED by Frontend)
// GET /api/warnings/student/:studentId
router.get(
  '/student/:studentId',
  protect,
  validateGetStudentWarnings,
  warningController.getStudentWarnings
);

// جلب إحصائيات حلقة معينة (USED by Frontend)
// GET /api/warnings/group/:groupId/statistics
router.get(
  '/group/:groupId/statistics',
  protect,
  validateGetGroupWarnings,
  warningController.getGroupStatistics
);

// جلب طلاب الحلقة مع تفاصيل الإنذارات الكاملة (USED by Frontend)
// GET /api/warnings/group/:groupId/students-with-warnings
router.get(
  '/group/:groupId/students-with-warnings',
  protect,
  validateGetGroupWarnings,
  warningController.getGroupWithStudentsWarnings
);

// جلب الطلاب المفصولين من حلقة (USED by Frontend)
// GET /api/warnings/group/:groupId/expelled-students
router.get(
  '/group/:groupId/expelled-students',
  protect,
  validateGetGroupWarnings,
  warningController.getExpelledStudentsFromGroup
);

// ✅ NEW: التحقق من حالة طالب (مفصول/محظور)
// GET /api/warnings/status/:studentId
router.get(
  '/status/:studentId',
  protect,
  validateGetStudentWarnings,
  warningController.checkStudentStatus
);

// ============================================================================
// POST ROUTES - إنشاء الإنذارات
// ============================================================================

// إنشاء إنذار جديد (للمعلم فقط)
// POST /api/warnings
router.post('/', protect, validateCreateWarning, warningController.createWarning);

// استعادة طالب مفصول
// POST /api/warnings/restore
router.post(
  '/restore',
  protect,
  validateRestoreStudent,
  warningController.restoreStudentToGroup
);

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
