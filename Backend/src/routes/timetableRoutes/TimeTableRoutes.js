const express = require("express");
const router = express.Router();
const timetableController = require("../../controllers/TimeTableController");
const { 
  validateTimetableData, 
  validateSessionDate,
  validateCheckConflict 
} = require("../../Validation/Timetable/TimetableValidation");
const { 
  protect,
  adminProtect,
  secretaryTimetableAccess 
} = require("../../middleware/auth");

// ============================================
// TIMETABLE ROUTES (NEW CRUD SYSTEM)
// ============================================
// ⚠️ التعارض يعتمد على التاريخ المحدد (sessionDate) وليس اليوم
// ✅ تم إضافة: فجوة 30 دقيقة إلزامية + Redis Cache

// ============ AVAILABILITY ============

// الأوقات المتاحة (عامة) - صيفي/شتوي
router.get("/available-hours", protect, timetableController.getAvailableHours);

// الأوقات المتاحة لمعلم في تاريخ محدد
// GET /api/timetable/available-hours/teacher?teacherId=xxx&date=2026-01-12
router.get("/available-hours/teacher", protect, timetableController.getTeacherAvailableHours);

// ✅ الفترات المتاحة مع الفجوة الإلزامية (30 دقيقة)
// GET /api/timetable/available-slots?teacherId=xxx&date=2026-01-12
router.get("/available-slots", protect, timetableController.getAvailableSlots);

// ✅ جدول المعلم ليوم معين (ملخص حسب الحلقات)
// GET /api/timetable/day-schedule?teacherId=xxx&date=2026-01-14
router.get("/day-schedule", protect, timetableController.getTeacherDaySchedule);

// فحص التعارض قبل الإنشاء (يشمل فحص الفجوة)
// POST /api/timetable/check-conflict
router.post("/check-conflict", protect, validateCheckConflict, timetableController.checkConflict);

// ============ READ (Timetable - View Only for Secretary) ============

// جلب جميع المواعيد (مع فلترة بالتاريخ/المعلم/الحلقة)
// GET /api/timetable?teacherId=xxx&date=2026-01-12&groupId=xxx
router.get("/", secretaryTimetableAccess(), timetableController.getTimetables);

// جلب موعد محدد
router.get("/:id", secretaryTimetableAccess(), timetableController.getTimetableById);

// جدول حلقة معينة (بالـ ID)
router.get("/group/:groupId", secretaryTimetableAccess(), timetableController.getGroupTimetable);

// موعد مقطع محدد
router.get("/section/:sectionId", secretaryTimetableAccess(), timetableController.getTimetableBySection);

// مواعيد معلم معين
router.get("/teacher/:teacherId", secretaryTimetableAccess(), timetableController.getTeacherTimetables);

// ============ CREATE (Admin + Teacher for own groups) ============

// إنشاء موعد جديد (يحتاج sessionDate) - Admin أو المعلم لحلقاته
// POST /api/timetable
router.post("/", secretaryTimetableAccess('manage'), validateTimetableData, timetableController.createTimetable);

// إنشاء موعد لمقطع محدد (التاريخ من المقطع تلقائياً) - Admin أو المعلم لحلقاته
// POST /api/timetable/section/:sectionId
router.post("/section/:sectionId", secretaryTimetableAccess('manage'), validateSessionDate, timetableController.createTimetableForSection);

// ============ UPDATE (Admin + Teacher for own groups) ============

// تحديث موعد كامل - Admin أو المعلم لحلقاته
router.put("/:id", secretaryTimetableAccess('manage'), validateTimetableData, timetableController.updateTimetable);

// تحديث الوقت فقط (startHour, endHour) - Admin أو المعلم لحلقاته
router.patch("/:id/time", secretaryTimetableAccess('manage'), validateSessionDate, timetableController.updateTimetableTime);

// ربط موعد بمقطع - Admin أو المعلم لحلقاته
// POST /api/timetable/:id/link/:sectionId
router.post("/:id/link/:sectionId", secretaryTimetableAccess('manage'), timetableController.linkTimetableToSection);

// ============ DELETE (Admin + Teacher for own groups) ============

// حذف موعد - Admin أو المعلم لحلقاته
router.delete("/:id", secretaryTimetableAccess('manage'), timetableController.deleteTimetable);

// فك ربط موعد من مقطع (بدون حذف الموعد) - Admin فقط
router.delete("/:id/unlink", adminProtect, timetableController.unlinkTimetableFromSection);

module.exports = router;