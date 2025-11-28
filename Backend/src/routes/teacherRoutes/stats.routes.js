// routes/teacherRoutes/stats.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../../controllers/basicController/teacherController");
const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const { protect } = require("../../middleware/authMiddleware");

/**
 * Statistics and Query Routes for Teachers
 */

// Get teacher statistics
router.get("/stats/summary/all", protect, controller.getTeacherStats);

// Get teachers for a specific student
router.get("/for-student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).select("group groups");
    
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const sGroups = [
      ...(Array.isArray(student.groups) ? student.groups : []),
      ...(student.group ? [student.group] : []),
    ].filter(Boolean);

    // Search in groups with new and old structure
    const teachers = await Teacher.find({
      $or: [
        { "groups.name": { $in: sGroups } }, // New structure
        { "groups.id": { $in: sGroups } }, // Search by ID
        { groups: { $in: sGroups } }, // Old data support
      ],
    }).select("-password");

    return res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    console.error("❌ Error fetching teachers for student:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching teachers for student",
    });
  }
});

module.exports = router;
