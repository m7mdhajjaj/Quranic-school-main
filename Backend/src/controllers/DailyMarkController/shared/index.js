// ============================================================================
// DailyMarkController/shared/index.js - Shared Operations
// ============================================================================
//
// 🔄 عمليات مشتركة (Shared Operations)
// ============================================================================
//
// يمكن استخدام هذه الدوال من:
// - المعلم (Teacher)
// - الطالب (Student) - للقراءة فقط
// - السكرتيرة (Secretary)
// - الأدمن (Admin)
//
// 1️⃣ MARKS READ - قراءة العلامات
//    ├── getMarks()              → جلب كل العلامات (مع pagination)
//    ├── getFilteredMarks()      → جلب العلامات مع فلترة متقدمة
//    └── getSectionMarks()       → علامات مقطع معين
//
// 2️⃣ GROUP STATS - إحصائيات الحلقة
//    └── getGroupStats()         → عدد الطلاب وعدد المقاطع
//
// ============================================================================

// ============================================================================
// MARKS READ OPERATIONS - ملفات محلية
// ============================================================================
const getMarksController = require("./getMarks");
const getFilteredMarksController = require("./getFilteredMarks");

// ============================================================================
// GROUP STATS - ملفات محلية
// ============================================================================
const getGroupStatsController = require("./getGroupStats");

// ============================================================================
// EXPORTS - تصدير الدوال المشتركة
// ============================================================================
module.exports = {
  // ========== MARKS READ (من ملفات محلية) ==========
  getMarks: getMarksController.getMarks,
  getSectionMarks: getMarksController.getSectionMarks,
  getFilteredMarks: getFilteredMarksController.getFilteredMarks,

  // ========== GROUP STATS (من ملفات محلية) ==========
  getGroupStats: getGroupStatsController.getGroupStats,
};
