const express = require("express");
const router = express.Router();
const dailyMarkController = require("../../../controllers/DailyMarkController");
const {
  validateDailyMarksSectionData,
  validateRepairSequenceData,
  validateSectionId,
} = require("../../../Validation/DailyMark/DailyMarksSectionValidation");

// ============================================================================
// POST/PUT/DELETE ROUTES - إدارة المقاطع (V3: Date-Aware + Backfilling)
// ============================================================================
// 
// V3 Features:
// - ✅ Supports backfilling (inserting sections with past dates)
// - ✅ Date-aware validation (chronological order)
// - ✅ Perfect bridging (no gaps between neighbors)
// - ✅ Same-day duplicate prevention (using dateKey)
//
// Validation Flow:
// 1. validateDailyMarksSectionData - Format/structure validation
// 2. Controller - Calls SectionSequenceService.validateSequence()
// 3. Schema - Auto-generates dateKey & canonicalKey

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

// Update a section (for daily marks)
router.put(
  "/:id",
  validateDailyMarksSectionData,
  dailyMarkController.updateSection
);

// Delete a section
router.delete(
  "/:id", 
  validateSectionId,
  dailyMarkController.deleteSection
);

module.exports = router;
