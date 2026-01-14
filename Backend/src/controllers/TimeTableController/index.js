// ============================================
// TIMETABLE CONTROLLER - INDEX FILE (NEW)
// ============================================
// نظام جديد لإدارة المواعيد مع ربط مباشر بالمقاطع

const { 
  createTimetable, 
  createTimetableForSection 
} = require("./create.controller");

const { 
  getTimetables, 
  getTimetableById, 
  getTimetableBySection,
  getGroupTimetable,
  getTeacherTimetables
} = require("./get.controller");

const { 
  updateTimetable,
  updateTimetableTime,
  linkTimetableToSection
} = require("./update.controller");

const { 
  deleteTimetable,
  unlinkTimetableFromSection
} = require("./delete.controller");

const {
  getAvailableHours,
  getTeacherAvailableHours,
  getTeacherDaySchedule,
  checkConflict
} = require("./availability.controller");

module.exports = {
  // ============ CREATE ============
  createTimetable,           // إنشاء موعد جديد
  createTimetableForSection, // إنشاء موعد لمقطع محدد
  
  // ============ READ ============
  getTimetables,             // جلب جميع المواعيد (مع فلترة)
  getTimetableById,          // جلب موعد محدد
  getTimetableBySection,     // جلب موعد مقطع
  getGroupTimetable,         // جدول حلقة معينة
  getTeacherTimetables,      // مواعيد معلم معين
  
  // ============ UPDATE ============
  updateTimetable,           // تحديث موعد كامل
  updateTimetableTime,       // تحديث الوقت فقط
  linkTimetableToSection,    // ربط موعد بمقطع
  
  // ============ DELETE ============
  deleteTimetable,           // حذف موعد
  unlinkTimetableFromSection, // فك ربط موعد من مقطع
  
  // ============ AVAILABILITY ============
  getAvailableHours,         // الأوقات المتاحة (عامة)
  getTeacherAvailableHours,  // أوقات المعلم المتاحة مع تفاصيل المواعيد
  getTeacherDaySchedule,     // ✅ ملخص يوم المعلم (مجمع حسب الحلقات)
  checkConflict              // فحص التعارض
};
