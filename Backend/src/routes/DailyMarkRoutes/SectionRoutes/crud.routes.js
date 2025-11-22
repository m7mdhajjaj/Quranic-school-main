const express = require("express");
const router = express.Router();
const dailyMarkController = require("../../../controllers/DailyMarkController");
const {
  validateDailyMarksSectionData,
} = require("../../../Validation/DailyMark/DailyMarksSectionValidation");

// ============================================================================
// POST/PUT/DELETE ROUTES - إدارة المقاطع
// ============================================================================

// Create a new section (for daily marks)
router.post(
  "/",
  validateDailyMarksSectionData,
  dailyMarkController.createSection
);

// Update a section (for daily marks)
router.put(
  "/:id",
  validateDailyMarksSectionData,
  dailyMarkController.updateSection
);

// Delete a section
router.delete("/:id", dailyMarkController.deleteSection);

module.exports = router;
