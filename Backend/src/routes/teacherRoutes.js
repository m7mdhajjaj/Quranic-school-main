


// routes/teacherRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");

const Teacher = require("../schema/Teacher");
const Student = require("../schema/Student"); // for /for-student
const controller = require("../controllers/teacherController");
const { protect } = require("../middleware/authMiddleware");
const { validateTeacherGroups, sanitizeTeacherData } = require("../middleware/validateTeacherData");

// ========== Multer in-memory (لا ملفات على الهارد) ==========
const teacherAvatarUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("يُسمح فقط بملفات الصور"), false);
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// ========== رفع أفاتار المعلّم (يحفظ في الداتابيس) - FIXED ==========
router.post("/:id/avatar", teacherAvatarUpload.single("avatar"), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ success: false, message: "المعلم غير موجود" });
    if (!req.file) return res.status(400).json({ success: false, message: "لم يتم استلام ملف صورة" });

    // Only update avatar field without triggering validation on other fields
    await Teacher.updateOne(
      { _id: req.params.id },
      { $set: { avatar: { data: req.file.buffer, contentType: req.file.mimetype } } }
    );

    return res.status(200).json({ success: true, message: "تم حفظ الصورة في قاعدة البيانات" });
  } catch (error) {
    console.error("Error uploading teacher avatar:", error);
    return res.status(500).json({ success: false, message: "خطأ في رفع الصورة" });
  }
});

// ========== عرض صورة أفاتار المعلّم مباشرة من الداتابيس ==========
router.get("/:id/avatar", async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select("avatar");
    if (!teacher || !teacher.avatar || !teacher.avatar.data) {
      return res.status(404).send("لا توجد صورة");
    }
    res.set("Content-Type", teacher.avatar.contentType || "image/jpeg");
    return res.send(teacher.avatar.data);
  } catch (error) {
    console.error("Error serving teacher avatar:", error);
    return res.status(500).send("خطأ في عرض الصورة");
  }
});

// ========== باقي المسارات ==========
router.get("/", protect, controller.getAllTeachers);
router.get("/stats/summary/all", protect, controller.getTeacherStats);

router.get("/for-student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).select("group groups");
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const sGroups = [
      ...(Array.isArray(student.groups) ? student.groups : []),
      ...(student.group ? [student.group] : []),
    ].filter(Boolean);

    // البحث في الحلقات بالبنية الجديدة والقديمة
    const teachers = await Teacher.find({
      $or: [
        { 'groups.name': { $in: sGroups } }, // البنية الجديدة
        { 'groups.id': { $in: sGroups } },   // البحث بالمعرف
        { groups: { $in: sGroups } }         // دعم البيانات القديمة
      ]
    }).select("-password");
    
    return res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching teachers for student" });
  }
});

router.get("/:id", controller.getTeacherById);
router.post("/", sanitizeTeacherData, validateTeacherGroups, controller.createTeacher);
router.put("/:id", sanitizeTeacherData, validateTeacherGroups, controller.updateTeacher);
router.delete("/:id", controller.deleteTeacher);

module.exports = router;