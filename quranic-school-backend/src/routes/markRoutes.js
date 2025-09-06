const express = require("express");
const router = express.Router();
const markController = require("../controllers/markController");

// Get all marks
router.get("/", markController.getMarks);

// Get marks for a specific student
router.get("/student/:studentId", markController.getStudentMarks);

// Get marks for a specific section
router.get("/section/:sectionId", markController.getSectionMarks);

// Create or update a mark
router.post("/", markController.createOrUpdateMark);

// Delete a mark
router.delete("/:id", markController.deleteMark);

module.exports = router;
