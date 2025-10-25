// ============================================================================
// WarningRoutes/WarningRoutes.js - Warning Routes
// ============================================================================

const express = require("express");
const router = express.Router();
const warningController = require("../../controllers/WarningController/index");
const { protect } = require("../../middleware/authMiddleware");

// ============================================================================
// GET ROUTES - جلب الإنذارات
// ============================================================================

// جلب إحصائيات الإنذارات (للمدير) - يجب أن يكون قبل الـ routes الديناميكية
// GET /api/warnings/statistics/all
router.get("/statistics/all", protect, warningController.getWarningsStatistics);

// جلب إحصائيات المعلم
// GET /api/warnings/statistics/teacher
router.get(
  "/statistics/teacher",
  protect,
  warningController.getTeacherStatistics
);

// التحقق من حالة الطالب (مفصول أم لا)
// GET /api/warnings/status/:studentId
router.get("/status/:studentId", protect, warningController.checkStudentStatus);

// جلب إنذارات طالب معين
// GET /api/warnings/student/:studentId
router.get(
  "/student/:studentId",
  protect,
  warningController.getStudentWarnings
);

// جلب طلاب الحلقة مع عدد الإنذارات
// GET /api/warnings/group/:groupId/students
router.get(
  "/group/:groupId/students",
  protect,
  warningController.getGroupStudentsWithWarnings
);

// جلب إنذارات حلقة معينة (للمعلم فقط)
// GET /api/warnings/group/:groupId
router.get("/group/:groupId", protect, warningController.getGroupWarnings);

// ============================================================================
// POST ROUTES - إنشاء الإنذارات
// ============================================================================

// إنشاء إنذار جديد (للمعلم فقط)
// POST /api/warnings
router.post("/", protect, warningController.createWarning);

// ============================================================================
// DELETE ROUTES - حذف الإنذارات
// ============================================================================

// حذف إنذار (للمدير فقط)
// DELETE /api/warnings/:warningId
router.delete("/:warningId", protect, warningController.deleteWarning);

module.exports = router;
