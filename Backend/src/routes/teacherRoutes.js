const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Teacher = require("../models/Teacher");

// Multer config for teacher avatars
const teacherAvatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../public/uploads/avatars');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `teacher-avatar-${uniqueSuffix}${extension}`);
  }
});
const teacherAvatarUpload = multer({
  storage: teacherAvatarStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('يُسمح فقط بملفات الصور'), false);
  },
  limits: { fileSize: 2 * 1024 * 1024 }
});

const express = require("express");
const router = express.Router();

// Upload teacher avatar by ID
router.post('/:id/avatar', teacherAvatarUpload.single('avatar'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ success: false, message: 'المعلم غير موجود' });
    // Remove old avatar if exists
    if (teacher.avatar) {
      const oldPath = path.join(__dirname, '../../public/uploads', teacher.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    // Save new avatar path (relative to /uploads)
    const avatarFileName = `avatars/${req.file.filename}`;
    teacher.avatar = avatarFileName;
    await teacher.save();
    res.json({ success: true, avatar: avatarFileName });
  } catch (error) {
    console.error('Error uploading teacher avatar:', error);
    res.status(500).json({ success: false, message: 'خطأ في رفع الصورة', error: error.message });
  }
});


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
