const express = require("express");
const router = express.Router();
const dailyMarkController = require("../../../controllers/DailyMarkController");
const { protect, teacherProtect } = require("../../../middleware/auth");
const {
  validateDailyMarksSectionData,
  validateSectionId,
  validateActiveSurahData,
} = require("../../../Validation/DailyMark/DailyMarksSectionValidation");

// ============================================================================
// MIDDLEWARE - حماية routes الكتابة (المعلم فقط)
// ============================================================================
router.use(protect);
router.use(teacherProtect);

// ============================================================================
// POST/PUT/DELETE ROUTES - إدارة المقاطع (V7: Date-Aware + Flexible Range)
// ============================================================================
// 
// V7 Features:
// - ✅ Supports backfilling (inserting sections with past dates)
// - ✅ Date-aware validation (chronological order)
// - ✅ Perfect bridging (no gaps between neighbors)
// - ✅ Same-day duplicate prevention (using dateKey)
// - ✅ Active Surah enforcement (can't start new surah before completing current)
// - ✅ Current week only (can't select dates outside current week)
// - ✅ Flexible review ranges (can review 1-50 at once)
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

// 🚀 Bulk Create Sections
router.post(
    "/bulk-create",
    dailyMarkController.bulkCreateSections
);

// ✅ Mark a surah as completed (manual completion)
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
