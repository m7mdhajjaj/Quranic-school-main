const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");

// Get all teachers
router.get("/", async (req, res) => {
  try {
    const teachers = await Teacher.find({}).select(
      "_id firstName lastName groups imageUrl",
    );
    res.status(200).json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res
      .status(500)
      .json({ message: "Error fetching teachers", error: error.message });
  }
});

// Get teachers for a specific student (filtered by student's group)
router.get("/for-student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get the student's group
    const student = await Student.findById(studentId).select("group");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find teachers who teach this student's group
    const teachers = await Teacher.find({
      groups: { $in: [student.group] },
    }).select("_id firstName lastName groups imageUrl");

    res.status(200).json(teachers);
  } catch (error) {
    console.error("Error fetching teachers for student:", error);
    res.status(500).json({
      message: "Error fetching teachers for student",
      error: error.message,
    });
  }
});

// Get teacher by ID
router.get("/:id", async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select(
      "_id firstName lastName groups imageUrl",
    );
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.status(200).json(teacher);
  } catch (error) {
    console.error("Error fetching teacher:", error);
    res
      .status(500)
      .json({ message: "Error fetching teacher", error: error.message });
  }
});

module.exports = router;
