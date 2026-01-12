const express = require("express");
const router = express.Router();
const timetableController = require("../../controllers/TimeTableController");
const { 
  validateTimetableData, 
  validateSessionDate,
  validateCheckConflict 
} = require("../../Validation/Timetable/TimetableValidation");
const { protect } = require("../../middleware/auth");

// ============================================
// TIMETABLE ROUTES (NEW CRUD SYSTEM)
// ============================================
// ⚠️ التعارض يعتمد على التاريخ المحدد (sessionDate) وليس اليوم

// ============ AVAILABILITY ============

// الأوقات المتاحة (عامة) - صيفي/شتوي
router.get("/available-hours", protect, timetableController.getAvailableHours);

// الأوقات المتاحة لمعلم في تاريخ محدد
// GET /api/timetable/available-hours/teacher?teacherId=xxx&date=2026-01-12
router.get("/available-hours/teacher", protect, timetableController.getTeacherAvailableHours);

// فحص التعارض قبل الإنشاء
// POST /api/timetable/check-conflict
router.post("/check-conflict", protect, validateCheckConflict, timetableController.checkConflict);

// ============ READ ============

// جلب جميع المواعيد (مع فلترة بالتاريخ/المعلم/الحلقة)
// GET /api/timetable?teacherId=xxx&date=2026-01-12&groupId=xxx
router.get("/", protect, timetableController.getTimetables);

// جلب موعد محدد
router.get("/:id", protect, timetableController.getTimetableById);

// جدول حلقة معينة (بالـ ID)
router.get("/group/:groupId", protect, timetableController.getGroupTimetable);

// موعد مقطع محدد
router.get("/section/:sectionId", protect, timetableController.getTimetableBySection);

// مواعيد معلم معين
router.get("/teacher/:teacherId", protect, timetableController.getTeacherTimetables);

// ============ CREATE ============

// إنشاء موعد جديد (يحتاج sessionDate)
// POST /api/timetable
router.post("/", protect, validateTimetableData, timetableController.createTimetable);

// إنشاء موعد لمقطع محدد (التاريخ من المقطع تلقائياً)
// POST /api/timetable/section/:sectionId
router.post("/section/:sectionId", protect, validateSessionDate, timetableController.createTimetableForSection);

// ============ UPDATE ============

// تحديث موعد كامل
router.put("/:id", protect, validateTimetableData, timetableController.updateTimetable);

// تحديث الوقت فقط (startHour, endHour)
router.patch("/:id/time", protect, validateSessionDate, timetableController.updateTimetableTime);

// ربط موعد بمقطع
// POST /api/timetable/:id/link/:sectionId
router.post("/:id/link/:sectionId", protect, timetableController.linkTimetableToSection);

// ============ DELETE ============

// حذف موعد
router.delete("/:id", protect, timetableController.deleteTimetable);

// فك ربط موعد من مقطع (بدون حذف الموعد)
router.delete("/:id/unlink", protect, timetableController.unlinkTimetableFromSection);

module.exports = router;
