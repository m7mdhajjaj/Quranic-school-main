// // // routes/studentRoutes.js
// // const express = require("express");
// // const router = express.Router();
// // const multer = require("multer");

// // const Student = require("../models/Student");
// // const studentController = require("../controllers/studentController");

// // // in-memory upload
// // const studentAvatarUpload = multer({
// //   storage: multer.memoryStorage(),
// //   fileFilter: (_req, file, cb) => {
// //     if (file.mimetype.startsWith('image/')) cb(null, true);
// //     else cb(new Error('يُسمح فقط بملفات الصور'), false);
// //   },
// //   limits: { fileSize: 2 * 1024 * 1024 }
// // });

// // // Upload student avatar (DB only)
// // router.post('/:id/avatar', studentAvatarUpload.single('avatar'), async (req, res) => {
// //   try {
// //     const student = await Student.findById(req.params.id);
// //     if (!student) return res.status(404).json({ success: false, message: 'الطالب غير موجود' });
// //     if (!req.file)   return res.status(400).json({ success: false, message: 'لم يتم استلام ملف صورة' });

// //     student.avatar = { data: req.file.buffer, contentType: req.file.mimetype };
// //     await student.save();

// //     res.status(200).json({ success: true, message: 'تم حفظ الصورة في قاعدة البيانات' });
// //   } catch (error) {
// //     console.error('Error uploading student avatar:', error);
// //     res.status(500).json({ success: false, message: 'خطأ في رفع الصورة' });
// //   }
// // });

// // // Serve student avatar
// // router.get('/:id/avatar', async (req, res) => {
// //   try {
// //     const student = await Student.findById(req.params.id).select("avatar");
// //     if (!student || !student.avatar || !student.avatar.data) return res.status(404).send('لا توجد صورة');
// //     res.set('Content-Type', student.avatar.contentType || 'image/jpeg');
// //     res.send(student.avatar.data);
// //   } catch (e) {
// //     res.status(500).send('خطأ في عرض الصورة');
// //   }
// // });

// // // CRUD
// // router.get("/", studentController.getStudents);
// // router.get("/group/:group", studentController.getStudentsByGroup);
// // router.get("/:id", studentController.getStudentById);
// // router.post("/", studentController.createStudent);
// // router.put("/:id", studentController.updateStudent);
// // router.delete("/:id", studentController.deleteStudent);

// // module.exports = router;


// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const Student = require('../models/Student');
// const studentController = require('../controllers/studentController');


// // Multer in-memory storage (2MB limit)
// const studentAvatarUpload = multer({
// storage: multer.memoryStorage(),
// fileFilter: (_req, file, cb) => {
// if (file.mimetype.startsWith('image/')) cb(null, true);
// else cb(new Error('يُسمح فقط بملفات الصور'), false);
// },
// limits: { fileSize: 2 * 1024 * 1024 },
// });


// // POST /api/students/:id/avatar — any student can change their avatar
// router.post('/:id/avatar', studentAvatarUpload.single('avatar'), async (req, res) => {
// try {
// const student = await Student.findById(req.params.id);
// if (!student) return res.status(404).json({ success: false, message: 'الطالب غير موجود' });
// if (!req.file) return res.status(400).json({ success: false, message: 'لم يتم استلام ملف صورة' });


// student.avatar = { data: req.file.buffer, contentType: req.file.mimetype };
// await student.save();


// res.status(200).json({ success: true, message: 'تم حفظ الصورة في قاعدة البيانات' });
// } catch (error) {
// console.error('Error uploading student avatar:', error);
// res.status(500).json({ success: false, message: 'خطأ في رفع الصورة' });
// }
// });


// // GET /api/students/:id/avatar — serve avatar
// router.get('/:id/avatar', async (req, res) => {
// try {
// const student = await Student.findById(req.params.id).select('avatar');
// if (!student || !student.avatar || !student.avatar.data) return res.status(404).send('لا توجد صورة');
// res.set('Content-Type', student.avatar.contentType || 'image/jpeg');
// res.set('Cache-Control', 'public, max-age=3600');
// res.send(student.avatar.data);
// } catch (e) {
// res.status(500).send('خطأ في عرض الصورة');
// }
// });


// // CRUD
// router.get('/', studentController.getStudents);
// router.get('/group/:group', studentController.getStudentsByGroup);
// router.get('/:id', studentController.getStudentById);
// router.post('/', studentController.createStudent);
// router.put('/:id', studentController.updateStudent);
// router.delete('/:id', studentController.deleteStudent);


// module.exports = router;

// routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");

const Student = require("../models/Student");
const studentController = require("../controllers/studentController");
const { restrictAdmin } = require("../middleware/authMiddleware");

// in-memory upload
const studentAvatarUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('يُسمح فقط بملفات الصور'), false);
  },
  limits: { fileSize: 2 * 1024 * 1024 }
});

// Upload student avatar (DB only) - FIXED
router.post('/:id/avatar', studentAvatarUpload.single('avatar'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'الطالب غير موجود' });
    if (!req.file) return res.status(400).json({ success: false, message: 'لم يتم استلام ملف صورة' });

    // Only update avatar field without triggering validation on other fields
    await Student.updateOne(
      { _id: req.params.id },
      { $set: { avatar: { data: req.file.buffer, contentType: req.file.mimetype } } }
    );

    res.status(200).json({ success: true, message: 'تم حفظ الصورة في قاعدة البيانات' });
  } catch (error) {
    console.error('Error uploading student avatar:', error);
    res.status(500).json({ success: false, message: 'خطأ في رفع الصورة' });
  }
});

// Serve student avatar - same as working teacher route
router.get("/:id/avatar", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("avatar");
    if (!student || !student.avatar || !student.avatar.data) {
      return res.status(404).send("لا توجد صورة");
    }
    res.set("Content-Type", student.avatar.contentType || "image/jpeg");
    return res.send(student.avatar.data);
  } catch (error) {
    console.error("Error serving student avatar:", error);
    return res.status(500).send("خطأ في عرض الصورة");
  }
});

// CRUD routes - منع الأدمن من الوصول
router.get("/", restrictAdmin, studentController.getStudents);
router.get("/group/:group", restrictAdmin, studentController.getStudentsByGroup);
router.get("/:id", restrictAdmin, studentController.getStudentById);
router.post("/", studentController.createStudent);
router.put("/:id", studentController.updateStudent);
router.delete("/:id", studentController.deleteStudent);

module.exports = router;