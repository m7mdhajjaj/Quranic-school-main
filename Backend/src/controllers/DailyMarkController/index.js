// ============================================================================
// DailyMarkController/index.js - Main Controller Entry Point
// ============================================================================
//
// 📚 نظام العلامات اليومية (DailyMark System)
// ============================================================================
//
// 🎯 التنظيم حسب الدور (Role-Based Organization):
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 👨‍🏫 TEACHER (المعلم)                                                    │
// │ ─────────────────────────────────────────────────────────────────────── │
// │ • Section CRUD: createSection, updateSection, deleteSection             │
// │ • Bulk Operations: bulkCreateSections, repairSequence                   │
// │ • Marks Write: setMarks, createOrUpdateMark, updateMarkById, deleteMark │
// │ • Active Surah: getActiveSurahs, completeSurah, resetActiveSurah        │
// │ • Helpers: getSections, getLastSegment, checkQuota                      │
// └─────────────────────────────────────────────────────────────────────────┘
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 👨‍🎓 STUDENT (الطالب)                                                    │
// │ ─────────────────────────────────────────────────────────────────────── │
// │ • My Marks: getStudentMarks, getStudentMarkStats                        │
// │ • My Progress: getStudentAverages, getStudentSectionsGrouped            │
// │ • Surah History: getCompletedSurahs, getSurahHistory                    │
// └─────────────────────────────────────────────────────────────────────────┘
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 🔄 SHARED (مشترك - للجميع)                                              │
// │ ─────────────────────────────────────────────────────────────────────── │
// │ • Marks Read: getMarks, getFilteredMarks, getSectionMarks               │
// │ • Group Stats: getGroupStats                                            │
// └─────────────────────────────────────────────────────────────────────────┘
//
// 📁 هيكل المجلدات:
// ─────────────────
// DailyMarkController/
// ├── index.js              ← أنت هنا (Main Entry)
// ├── teacher/
// │   └── index.js          ← دوال المعلم (26 دالة)
// ├── student/
// │   └── index.js          ← دوال الطالب (6 دوال)
// ├── shared/
// │   └── index.js          ← دوال مشتركة (4 دوال)
// ├── SectionControllers/   ← كونترولرز المقاطع
// ├── utils/                ← دوال مساعدة
// └── [legacy files]        ← ملفات الدوال الأصلية
//
// ============================================================================

// ============================================================================
// ROLE-BASED IMPORTS
// ============================================================================
const teacherController = require("./teacher");
const studentController = require("./student");
const sharedController = require("./shared");

// ============================================================================
// SCHEDULER (Background Jobs)
// ============================================================================
const schedulerController = require("./schedulerController");

// ============================================================================
// LEGACY SUPPORT - للتوافق مع الكود القديم
// ============================================================================
// يمكن الوصول للدوال مباشرة أو عبر الفولدرات:
// - dailyMarkController.setMarks() ← طريقة قديمة (لا تزال تعمل)
// - dailyMarkController.teacher.setMarks() ← طريقة جديدة (موصى بها)

// ============================================================================
// EXPORTS - تصدير مع دعم كلا الطريقتين
// ============================================================================
module.exports = {
  // ========== ROLE-BASED ACCESS (NEW) ==========
  teacher: teacherController,
  student: studentController,
  shared: sharedController,
  
  // ========== SCHEDULER ==========
  ...schedulerController,

  // ========== LEGACY FLAT EXPORTS (للتوافق) ==========
  // Teacher Operations
  ...teacherController,
  
  // Student Operations
  ...studentController,
  
  // Shared Operations
  ...sharedController,
};

