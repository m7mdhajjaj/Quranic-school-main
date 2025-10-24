// routes/authRoutes/utility.routes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");

/**
 * Utility & Testing Routes
 */

// Test endpoint to check if server is working
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth API is working",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    jwt_secret: process.env.JWT_SECRET ? "Set" : "Not Set",
    mongodb_uri: process.env.MONGODB_URI ? "Set" : "Not Set",
  });
});

// Encrypt old student passwords (admin only)
router.post("/encrypt-student-passwords", protect, async (req, res) => {
  try {
    // Verify user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بتنفيذ هذا الأمر",
      });
    }

    const Student = require("../../schema/Student");
    const bcrypt = require("bcryptjs");

    // Get all students
    const students = await Student.find();

    let updatedCount = 0;
    let alreadyEncryptedCount = 0;

    for (const student of students) {
      // Check if password is already encrypted
      if (
        student.password &&
        student.password.startsWith("$2") &&
        student.password.length === 60
      ) {
        alreadyEncryptedCount++;
        continue;
      }

      // Encrypt password
      if (student.password) {
        const hashedPassword = await bcrypt.hash(student.password, 10);
        await Student.findByIdAndUpdate(student._id, {
          password: hashedPassword,
        });
        updatedCount++;
      } else if (student.idNumber) {
        // If no password, use ID number
        const hashedPassword = await bcrypt.hash(student.idNumber, 10);
        await Student.findByIdAndUpdate(student._id, {
          password: hashedPassword,
        });
        updatedCount++;
      }
    }

    res.json({
      success: true,
      message: `تم تشفير كلمات المرور بنجاح`,
      totalStudents: students.length,
      updatedCount: updatedCount,
      alreadyEncryptedCount: alreadyEncryptedCount,
    });
  } catch (error) {
    console.error("خطأ في تشفير كلمات المرور:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تشفير كلمات المرور",
      error: error.message,
    });
  }
});

module.exports = router;
