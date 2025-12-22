const express = require("express");
const router = express.Router();
const timetableController = require("../../controllers/TimeTableController");
const { validateTimetableData } = require("../../Validation/Timetable/TimetableValidation");
const { protect } = require("../../middleware/auth");

// ============================================
// TIMETABLE ROUTES
// ============================================

// Get available hours - الأوقات المتاحة حسب التوقيت الحالي (صيفي/شتوي)
router.get("/available-hours", protect, timetableController.getAvailableHours);

// Get available hours for teacher - الأوقات المتاحة للمعلم في يوم معين (بعد حذف الأوقات المحجوزة)
router.get("/available-hours-teacher", protect, timetableController.getAvailableHoursForTeacher);

// Get group timetable by ID - جدول أوقات حلقة معينة
router.get("/group/:groupId", protect, timetableController.getGroupTimetable);

// Get group timetable by name - جدول أوقات حلقة باسمها
router.get("/group/name/:groupName", protect, timetableController.getGroupTimetableByName);

// Get all timetables - مع المصادقة لفلترة البيانات حسب المستخدم
router.get("/", protect, timetableController.getAllTimetables);

// Create new timetable - يحتاج مصادقة لفحص تعارب حلقات المعلم
router.post("/", protect, validateTimetableData, timetableController.createTimetable);

// Update timetable - يحتاج مصادقة لفحص تعارب حلقات المعلم
router.put("/:id", protect, validateTimetableData, timetableController.updateTimetable);

// Delete timetable - يحتاج مصادقة
router.delete("/:id", protect, timetableController.deleteTimetable);

// Backward compatibility aliases
router.get("/sessions", protect, timetableController.getSessions);
router.post("/sessions", protect, validateTimetableData, timetableController.addSession);
router.put("/sessions/:id", protect, validateTimetableData, timetableController.updateSession);
router.delete("/sessions/:id", protect, timetableController.deleteSession);

module.exports = router;
