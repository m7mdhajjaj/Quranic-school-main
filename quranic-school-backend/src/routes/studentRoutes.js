const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// Get all students
router.get("/", studentController.getStudents);

// Get students by group
router.get("/group/:group", studentController.getStudentsByGroup);

// Add new student
router.post("/", studentController.createStudent);

// Update student
router.put("/:id", studentController.updateStudent);

// Delete student
router.delete("/:id", studentController.deleteStudent);

module.exports = router;
