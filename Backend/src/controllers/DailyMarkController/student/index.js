// ============================================================================
// DailyMarkController/student/index.js - Student Operations
// ============================================================================
//
// 👨‍🎓 عمليات الطالب (Student Operations)
// ============================================================================
//
// 1️⃣ MY MARKS - علاماتي
//    ├── getStudentMarks()         → جلب علاماتي
//    └── getStudentMarkStats()     → إحصائيات علاماتي
//
// 2️⃣ MY PROGRESS - تقدمي
//    ├── getStudentAverages()      → معدلاتي (شهرية/سنوية)
//    └── getStudentSectionsGrouped() → مقاطعي مجمعة بالسور
//
// 3️⃣ SURAH HISTORY - تاريخ السور
//    ├── getCompletedSurahs()      → السور المكتملة
//    └── getSurahHistory()         → تاريخ سورة معينة
//
// ============================================================================

// ============================================================================
// STUDENT MARKS - ملفات محلية
// ============================================================================
const getStudentMarksController = require("./getStudentMarks");
const getStudentAveragesController = require("./getStudentAverages");
const getStudentSectionsGroupedController = require("./getStudentSectionsGrouped");

// ============================================================================
// SECTION CONTROLLERS (for surah history)
// ============================================================================
const sectionGetController = require("../SectionControllers/get.controller");

// ============================================================================
// EXPORTS - تصدير دوال الطالب
// ============================================================================
module.exports = {
  // ========== MY MARKS (من ملفات محلية) ==========
  getStudentMarks: getStudentMarksController.getStudentMarks,
  getStudentMarkStats: getStudentMarksController.getStudentMarkStats,

  // ========== MY PROGRESS (من ملفات محلية) ==========
  getStudentAverages: getStudentAveragesController.getStudentAverages,
  getStudentSectionsGrouped: getStudentSectionsGroupedController.getStudentSectionsGrouped,

  // ========== SURAH HISTORY ==========
  getCompletedSurahs: sectionGetController.getCompletedSurahs,
  getSurahHistory: sectionGetController.getSurahHistory,
};
