// ============================================================================
// DailyMarkController/teacher/index.js - Teacher Operations
// ============================================================================
//
// 👨‍🏫 عمليات المعلم (Teacher Operations)
// ============================================================================
//
// 1️⃣ SECTION CRUD - إدارة المقاطع
//    ├── createSection()         → إنشاء مقطع جديد
//    ├── updateSection()         → تعديل مقطع
//    ├── deleteSection()         → حذف مقطع
//    ├── bulkCreateSections()    → إنشاء مقاطع بالجملة
//    ├── bulkDeleteSections()    → حذف مقاطع بالجملة
//    └── repairSequence()        → إصلاح تسلسل المقاطع (AI)
//
// 2️⃣ MARKS WRITE - تسجيل العلامات
//    ├── setMarks()              → تسجيل علامات (Bulk)
//    ├── setMarksForSection()    → تسجيل علامات لمقطع
//    ├── createOrUpdateMark()    → إنشاء/تعديل علامة واحدة
//    ├── updateMarkById()        → تعديل علامة بالـ ID
//    ├── updateMultipleMarks()   → تعديل علامات متعددة
//    └── deleteMark()            → حذف علامة
//
// 3️⃣ ACTIVE SURAH - إدارة السور الفعالة
//    ├── getActiveSurahs()       → السور الفعالة للحلقة
//    ├── getActiveSurahInfo()    → معلومات تفصيلية عن السورة الفعالة
//    ├── completeSurah()         → إكمال سورة يدوياً
//    └── resetActiveSurah()      → إعادة تعيين السورة الفعالة
//
// 4️⃣ SECTION HELPERS - مساعدات الإدخال
//    ├── getSections()           → جلب كل المقاطع
//    ├── getSection()            → جلب مقطع واحد
//    ├── getFilteredSections()   → المقاطع مع فلترة
//    ├── getLastSegment()        → آخر مقطع (للاقتراح التلقائي)
//    ├── getNeighborSegments()   → المقاطع المجاورة (للتعبئة الرجعية)
//    └── checkQuota()            → فحص الحصة (يومية/أسبوعية)
//
// ============================================================================

// ============================================================================
// MARKS WRITE OPERATIONS - ملفات محلية
// ============================================================================
const setMarksController = require("./setMarks");
const updateMarkController = require("./updateMark");
const deleteMarkController = require("./deleteMark");

// ============================================================================
// SECTION CONTROLLERS - من SectionControllers
// ============================================================================
const sectionCreateController = require("../SectionControllers/create.controller");
const sectionUpdateController = require("../SectionControllers/update.controller");
const sectionDeleteController = require("../SectionControllers/delete.controller");
const sectionBulkController = require("../SectionControllers/bulkCreate.controller");
const sectionRepairController = require("../SectionControllers/repair.controller");
const sectionGetController = require("../SectionControllers/get.controller");

// ============================================================================
// EXPORTS - تصدير دوال المعلم
// ============================================================================
module.exports = {
  // ========== SECTION CRUD ==========
  createSection: sectionCreateController.createSection,
  updateSection: sectionUpdateController.updateSection,
  deleteSection: sectionDeleteController.deleteSection,
  bulkCreateSections: sectionBulkController.bulkCreateSections,
  bulkDeleteSections: sectionDeleteController.bulkDeleteSections,
  repairSequence: sectionRepairController.repairSequence,

  // ========== MARKS WRITE (من ملفات محلية) ==========
  setMarks: setMarksController.setMarks,
  setMarksForSection: setMarksController.setMarksForSection,
  createOrUpdateMark: updateMarkController.createOrUpdateMark,
  updateMarkById: updateMarkController.updateMarkById,
  updateMultipleMarks: updateMarkController.updateMultipleMarks,
  deleteMark: deleteMarkController.deleteMark,

  // ========== ACTIVE SURAH MANAGEMENT ==========
  getActiveSurahs: sectionGetController.getActiveSurahs,
  getActiveSurahInfo: sectionGetController.getActiveSurahInfo,
  completeSurah: sectionGetController.completeSurah,
  resetActiveSurah: sectionGetController.resetActiveSurah,
  syncActiveSurahs: sectionGetController.syncActiveSurahs,

  // ========== SECTION HELPERS (READ) ==========
  getSections: sectionGetController.getSections,
  getSection: sectionGetController.getSection,
  getFilteredSections: sectionGetController.getFilteredSections,
  getLastSegment: sectionGetController.getLastSegment,
  getNeighborSegments: sectionGetController.getNeighborSegments,
  checkQuota: sectionGetController.checkQuota,
};
