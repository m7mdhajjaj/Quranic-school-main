


// routes/teacherRoutes.js
const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");

const Teacher = require("../schema/Teacher");
const Student = require("../schema/Student"); // for /for-student
const controller = require("../controllers/teacherController");
const { protect } = require("../middleware/authMiddleware");
const { 
  validateTeacherData, 
  validateTeacherGroups, 
  sanitizeTeacherData 
} = require("../Validation/TeacherValidation");
const { uploadAvatar } = require("../config/multer");

// ========== رفع أفاتار المعلّم (Cloudinary) - UPDATED ==========
router.post("/:id/avatar", uploadAvatar.single("avatar"), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ success: false, message: "المعلم غير موجود" });
    if (!req.file) return res.status(400).json({ success: false, message: "لم يتم استلام ملف صورة" });

    // Delete old avatar from Cloudinary if exists
    if (teacher.avatar && teacher.avatar.publicId) {
      try {
        await cloudinary.uploader.destroy(teacher.avatar.publicId);
      } catch (error) {
        console.log("Error deleting old avatar:", error);
      }
    }

    // Update avatar with Cloudinary URL and public ID
    await Teacher.updateOne(
      { _id: req.params.id },
      {
        $set: {
          avatar: {
            url: req.file.path,
            publicId: req.file.filename,
          },
        },
      }
    );

    // Emit socket event for real-time avatar update
    const io = req.app.get("io");
    if (io) {
      io.to("profile").emit("avatarUpdated", {
        userId: req.params.id,
        userRole: "teacher",
        avatarUrl: req.file.path,
        timestamp: Date.now(),
      });
      console.log("📡 Avatar updated event emitted via socket (teacher)");
    }

    return res.status(200).json({
      success: true,
      message: "تم رفع الصورة بنجاح",
      avatarUrl: req.file.path,
    });
  } catch (error) {
    console.error("Error uploading teacher avatar:", error);
    return res.status(500).json({ success: false, message: "خطأ في رفع الصورة" });
  }
});

// ========== عرض رابط صورة أفاتار المعلّم ==========
router.get("/:id/avatar", async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select("avatar");
    if (!teacher) {
      return res.status(404).json({ success: false, message: "المعلم غير موجود" });
    }
    // إذا ما في صورة، نرجع null بدل error
    const avatarUrl = teacher.avatar?.url || null;
    res.json({ success: true, avatarUrl });
  } catch (error) {
    console.error("Error getting teacher avatar:", error);
    return res.status(500).json({ success: false, message: "خطأ في عرض الصورة" });
  }
});

// ========== حذف أفاتار المعلّم ==========
router.delete("/:id/avatar", async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher)
      return res.status(404).json({ success: false, message: "المعلم غير موجود" });

    if (teacher.avatar && teacher.avatar.publicId) {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(teacher.avatar.publicId);

      // Remove from database
      await Teacher.updateOne(
        { _id: req.params.id },
        { $unset: { avatar: "" } }
      );

      // Emit socket event for real-time avatar deletion
      const io = req.app.get("io");
      if (io) {
        io.to("profile").emit("avatarDeleted", {
          userId: req.params.id,
          userRole: "teacher",
          timestamp: Date.now(),
        });
        console.log("📡 Avatar deleted event emitted via socket (teacher)");
      }

      res.json({ success: true, message: "تم حذف الصورة بنجاح" });
    } else {
      res.status(404).json({ success: false, message: "لا توجد صورة لحذفها" });
    }
  } catch (error) {
    console.error("Error deleting teacher avatar:", error);
    res.status(500).json({ success: false, message: "خطأ في حذف الصورة" });
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
router.post("/", sanitizeTeacherData, validateTeacherData, validateTeacherGroups, controller.createTeacher);
router.put("/:id", sanitizeTeacherData, validateTeacherData, validateTeacherGroups, controller.updateTeacher);
router.delete("/:id", controller.deleteTeacher);

module.exports = router;