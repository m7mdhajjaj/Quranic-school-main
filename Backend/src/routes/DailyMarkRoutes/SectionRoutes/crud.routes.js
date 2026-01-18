const express = require("express");
const router = express.Router();
const dailyMarkController = require("../../../controllers/DailyMarkController");
const { protect, teacherProtect } = require("../../../middleware/auth");
const {
  validateDailyMarksSectionData,
  validateRepairSequenceData,
  validateSectionId,
  validateActiveSurahData,
} = require("../../../Validation/DailyMark/DailyMarksSectionValidation");

// ============================================================================
// MIDDLEWARE - حماية routes الكتابة (المعلم فقط)
// ============================================================================
router.use(protect);
router.use(teacherProtect);

// ============================================================================
// POST/PUT/DELETE ROUTES - إدارة المقاطع (V3: Date-Aware + Active Surah)
// ============================================================================
// 
// V3 Features:
// - ✅ Supports backfilling (inserting sections with past dates)
// - ✅ Date-aware validation (chronological order)
// - ✅ Perfect bridging (no gaps between neighbors)
// - ✅ Same-day duplicate prevention (using dateKey)
// - ✅ Active Surah enforcement (can't start new surah before completing current)
//
// Validation Flow:
// 1. validateDailyMarksSectionData - Format/structure validation
// 2. Controller - Calls Group.canAddSegment() for Active Surah check
// 3. Controller - Calls SectionSequenceService.validateSequence()
// 4. Schema - Auto-generates dateKey & canonicalKey
// 5. Schema post-save - Updates Group.activeSurah automatically

// Create a new section (for daily marks)
router.post(
  "/",
  validateDailyMarksSectionData,
  dailyMarkController.createSection
);

// 🤖 AI Auto-Repair Sequence
router.post(
    "/repair-sequence", 
    validateRepairSequenceData,
    dailyMarkController.repairSequence
);

// 🚀 Bulk Create Sections (for auto-repair)
router.post(
    "/bulk-create",
    dailyMarkController.bulkCreateSections
);

// ✅ NEW: Mark a surah as completed (manual completion)
router.post(
    "/complete-surah",
    validateActiveSurahData,
    dailyMarkController.completeSurah
);

// ✅ NEW: Reset active surah (Admin/Emergency)
router.post(
    "/reset-active-surah",
    validateActiveSurahData,
    dailyMarkController.resetActiveSurah
);

// ✅ NEW: Sync active surahs from sections (fixes orphaned activeSurah data)
router.post(
    "/sync-active-surahs",
    dailyMarkController.syncActiveSurahs
);

// Update a section (for daily marks)
router.put(
  "/:id",
  validateDailyMarksSectionData,
  dailyMarkController.updateSection
);

// ✅ Bulk Delete Sections (must be before /:id)
router.delete(
  "/bulk",
  dailyMarkController.bulkDeleteSections
);

// Delete a section
router.delete(
  "/:id", 
  validateSectionId,
  dailyMarkController.deleteSection
);

module.exports = router;
