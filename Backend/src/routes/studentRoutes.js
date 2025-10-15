// routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");

const Student = require("../schema/Student");
const studentController = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");
const { validateStudentData } = require("../Validation/StudentValidation");
const { uploadAvatar } = require("../config/multer");

// Upload student avatar (Cloudinary) - UPDATED
router.post(
  "/:id/avatar",
  uploadAvatar.single("avatar"),
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id);
      if (!student)
        return res
          .status(404)
          .json({ success: false, message: "الطالب غير موجود" });
      if (!req.file)
        return res
          .status(400)
          .json({ success: false, message: "لم يتم استلام ملف صورة" });

      // Delete old avatar from Cloudinary if exists
      if (student.avatar && student.avatar.publicId) {
        try {
          await cloudinary.uploader.destroy(student.avatar.publicId);
        } catch (error) {
          console.log("Error deleting old avatar:", error);
        }
      }

      // Update avatar with Cloudinary URL and public ID
      await Student.updateOne(
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

      res.status(200).json({
        success: true,
        message: "تم رفع الصورة بنجاح",
        avatarUrl: req.file.path,
      });
    } catch (error) {
      console.error("Error uploading student avatar:", error);
      res.status(500).json({ success: false, message: "خطأ في رفع الصورة" });
    }
  }
);

// Get student avatar URL
router.get("/:id/avatar", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("avatar");
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "الطالب غير موجود" });
    }
    // إذا ما في صورة، نرجع null بدل error
    const avatarUrl = student.avatar?.url || null;
    res.json({ success: true, avatarUrl });
  } catch (error) {
    console.error("Error getting student avatar:", error);
    return res.status(500).json({ success: false, message: "خطأ في عرض الصورة" });
  }
});

// Delete student avatar
router.delete("/:id/avatar", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "الطالب غير موجود" });

    if (student.avatar && student.avatar.publicId) {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(student.avatar.publicId);

      // Remove from database
      await Student.updateOne(
        { _id: req.params.id },
        { $unset: { avatar: "" } }
      );

      res.json({ success: true, message: "تم حذف الصورة بنجاح" });
    } else {
      res.status(404).json({ success: false, message: "لا توجد صورة لحذفها" });
    }
  } catch (error) {
    console.error("Error deleting student avatar:", error);
    res.status(500).json({ success: false, message: "خطأ في حذف الصورة" });
  }
});

// Fast endpoint for students count only - no authentication needed for count
router.get("/count", async (req, res) => {
  try {
    console.log("⚡ تحميل عدد الطلاب بسرعة...");
    const startTime = Date.now();

    const count = await Student.countDocuments();

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ تم تحميل عدد الطلاب في ${duration}ms`);
    res.json({
      success: true,
      count: count,
      queryTime: `${duration}ms`,
      message: `تم العثور على ${count} طالب`,
    });
  } catch (error) {
    console.error("❌ Error getting students count:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في الحصول على عدد الطلاب",
      count: 0,
    });
  }
});

// Alternative endpoint for compatibility (same as /stats)
router.get("/stats/summary/all", async (req, res) => {
  try {
    console.log("📊 تحميل إحصائيات الطلاب (ملخص شامل)...");
    const startTime = Date.now();

    const [
      totalCount,
      maleCount,
      femaleCount,
      activeCount,
      teachersCount,
      avgAge,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ gender: "ذكر" }),
      Student.countDocuments({ gender: "انثى" }),
      Student.countDocuments({
        group: {
          $exists: true,
          $ne: null,
          $ne: "",
          $ne: "غير محدد",
          $ne: "undefined",
        },
      }),
      Student.distinct("teacher").then(
        (teachers) =>
          teachers.filter((teacher) => teacher && teacher.trim() !== "").length
      ),
      Student.aggregate([
        { $group: { _id: null, avgAge: { $avg: "$age" } } },
      ]).then((result) =>
        result.length > 0 ? Math.round(result[0].avgAge || 0) : 0
      ),
    ]);

    const groupsCount = await Student.distinct("group").then(
      (groups) => groups.filter((group) => group && group.trim() !== "").length
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    const stats = {
      totalStudents: totalCount, // إجمالي الطلاب
      activeStudents: activeCount, // الطلاب الذين لديهم حلقات
      maleStudents: maleCount, // عدد الذكور
      femaleStudents: femaleCount, // عدد الإناث
      byGroup: [], // توزيع الطلاب حسب الحلقات (يمكن تطويره لاحقاً)
    };

    console.log(`✅ تم تحميل الإحصائيات الشاملة في ${duration}ms:`, stats);

    res.json({
      success: true,
      data: stats,
      queryTime: `${duration}ms`,
      message: `إحصائيات ${totalCount} طالب`,
    });
  } catch (error) {
    console.error("❌ Error getting comprehensive students stats:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في الحصول على الإحصائيات الشاملة للطلاب",
    });
  }
});

// Fast endpoint for students statistics - minimal data for dashboards
router.get("/stats", async (req, res) => {
  try {
    console.log("📊 تحميل إحصائيات الطلاب...");
    const startTime = Date.now();

    const [
      totalCount,
      maleCount,
      femaleCount,
      activeCount,
      teachersCount,
      avgAge,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ gender: "ذكر" }),
      Student.countDocuments({ gender: "انثى" }),
      Student.countDocuments({
        group: {
          $exists: true,
          $ne: null,
          $ne: "",
          $ne: "غير محدد",
          $ne: "undefined",
        },
      }), // الطلاب الذين لديهم حلقات فعلية
      Student.distinct("teacher").then(
        (teachers) =>
          teachers.filter((teacher) => teacher && teacher.trim() !== "").length
      ),
      Student.aggregate([
        { $group: { _id: null, avgAge: { $avg: "$age" } } },
      ]).then((result) =>
        result.length > 0 ? Math.round(result[0].avgAge || 0) : 0
      ),
    ]);

    // Get unique groups count efficiently
    const groupsCount = await Student.distinct("group").then(
      (groups) => groups.filter((group) => group && group.trim() !== "").length
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    const stats = {
      total: totalCount, // إجمالي الطلاب
      male: maleCount, // عدد الذكور
      female: femaleCount, // عدد الإناث
      active: activeCount, // الطلاب الذين لديهم حلقات
      inactive: totalCount - activeCount, // الطلاب بدون حلقات
      groups: groupsCount, // عدد الحلقات
      teachers: teachersCount, // عدد المعلمين
      avgAge: avgAge, // متوسط العمر
    };

    console.log(`✅ تم تحميل الإحصائيات في ${duration}ms:`, stats);

    res.json({
      success: true,
      stats: stats,
      queryTime: `${duration}ms`,
      message: `إحصائيات ${totalCount} طالب`,
    });
  } catch (error) {
    console.error("❌ Error getting students stats:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في الحصول على إحصائيات الطلاب",
      stats: {
        total: 0,
        male: 0,
        female: 0,
        active: 0,
        inactive: 0,
        groups: 0,
        teachers: 0,
        avgAge: 0,
      },
    });
  }
});

// CRUD routes - require authentication (admins and teachers can access)
router.get("/", protect, studentController.getStudents);
router.get("/group/:group", protect, studentController.getStudentsByGroup);
router.get(
  "/teacher/:teacher",
  protect,
  studentController.getStudentsByTeacher
);
router.get("/:id", protect, studentController.getStudentById);
router.post("/", validateStudentData, studentController.createStudent);
router.put("/:id", validateStudentData, studentController.updateStudent);
router.delete("/bulk", studentController.bulkDeleteStudents); // Bulk delete - must be before /:id
router.delete("/:id", studentController.deleteStudent);

// Monthly averages routes
router.get(
  "/:studentId/monthly-average",
  protect,
  studentController.getStudentMonthlyAverage
);
router.get(
  "/:studentId/all-monthly-averages",
  protect,
  studentController.getAllStudentMonthlyAverages
);
router.post(
  "/:studentId/calculate-monthly-average",
  protect,
  studentController.calculateStudentMonthlyAverage
);
router.get(
  "/:studentId/overall-average",
  protect,
  studentController.getStudentOverallAverage
);

module.exports = router;
