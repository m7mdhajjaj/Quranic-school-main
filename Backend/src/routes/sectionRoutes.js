const express = require("express");
const router = express.Router();
const sectionController = require("../controllers/sectionController");
const {
  validateDailyMarksSectionData,
} = require("../Validation/DailyMarkValidation/DailyMarksSectionValidation");

// Get all sections
router.get("/", sectionController.getSections);

// Get a single section
router.get("/:id", sectionController.getSection);

// Create a new section (for daily marks)
router.post(
  "/",
  validateDailyMarksSectionData,
  sectionController.createSection
);

// Update a section (for daily marks)
router.put(
  "/:id",
  validateDailyMarksSectionData,
  sectionController.updateSection
);

// Delete a section
router.delete("/:id", sectionController.deleteSection);

module.exports = router;
