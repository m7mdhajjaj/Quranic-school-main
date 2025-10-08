const express = require("express");
const router = express.Router();
const sectionController = require("../controllers/sectionController");
const { validateSectionData } = require("../Validation/SectionValidation");

// Get all sections
router.get("/", sectionController.getSections);

// Get a single section
router.get("/:id", sectionController.getSection);

// Create a new section
router.post("/", validateSectionData, sectionController.createSection);

// Update a section
router.put("/:id", validateSectionData, sectionController.updateSection);

// Delete a section
router.delete("/:id", sectionController.deleteSection);

module.exports = router;
