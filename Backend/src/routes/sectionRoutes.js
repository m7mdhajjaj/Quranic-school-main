const express = require("express");
const router = express.Router();
const sectionController = require("../controllers/sectionController");

// Get all sections
router.get("/", sectionController.getSections);

// Get a single section
router.get("/:id", sectionController.getSection);

// Create a new section
router.post("/", sectionController.createSection);

// Update a section
router.put("/:id", sectionController.updateSection);

// Delete a section
router.delete("/:id", sectionController.deleteSection);

module.exports = router;
