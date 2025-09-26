const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Student = require("../models/Student");

// Multer config for student avatars
const studentAvatarStorage = multer.diskStorage({
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
		cb(null, `student-avatar-${uniqueSuffix}${extension}`);
	}
});
const studentAvatarUpload = multer({
	storage: studentAvatarStorage,
	fileFilter: (req, file, cb) => {
		if (file.mimetype.startsWith('image/')) cb(null, true);
		else cb(new Error('يُسمح فقط بملفات الصور'), false);
	},
	limits: { fileSize: 2 * 1024 * 1024 }
});

const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// Upload student avatar by ID
router.post('/:id/avatar', studentAvatarUpload.single('avatar'), async (req, res) => {
	try {
		const student = await Student.findById(req.params.id);
		if (!student) return res.status(404).json({ success: false, message: 'الطالب غير موجود' });
		// Remove old avatar if exists
		if (student.avatar) {
			const oldPath = path.join(__dirname, '../../public/uploads', student.avatar);
			if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
		}
		// Save new avatar path (relative to /uploads)
		const avatarFileName = `avatars/${req.file.filename}`;
		student.avatar = avatarFileName;
		await student.save();
		res.json({ success: true, avatar: avatarFileName });
	} catch (error) {
		console.error('Error uploading student avatar:', error);
		res.status(500).json({ success: false, message: 'خطأ في رفع الصورة', error: error.message });
	}
});


// Get all students
router.get("/", studentController.getStudents);

// Get students by group
router.get("/group/:group", studentController.getStudentsByGroup);


// Get single student by ID (for profile)
router.get("/:id", studentController.getStudentById);

// Add new student
router.post("/", studentController.createStudent);

// Update student
router.put("/:id", studentController.updateStudent);

// Delete student
router.delete("/:id", studentController.deleteStudent);

module.exports = router;
