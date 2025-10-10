// routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");

const Student = require("../schema/Student");
const studentController = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");
const { validateStudentData } = require("../Validation/StudentValidation");

// in-memory upload
const studentAvatarUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("يُسمح فقط بملفات الصور"), false);
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

// Upload student avatar (DB only) - FIXED
router.post(
  "/:id/avatar",
  studentAvatarUpload.single("avatar"),
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

      // Only update avatar field without triggering validation on other fields
      await Student.updateOne(
        { _id: req.params.id },
        {
          $set: {
            avatar: { data: req.file.buffer, contentType: req.file.mimetype },
          },
        }
      );

      res
        .status(200)
        .json({ success: true, message: "تم حفظ الصورة في قاعدة البيانات" });
    } catch (error) {
      console.error("Error uploading student avatar:", error);
      res.status(500).json({ success: false, message: "خطأ في رفع الصورة" });
    }
  }
);

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
      Student.countDocuments({ isActive: { $ne: false } }),
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
      totalStudents: totalCount,
      activeStudents: activeCount,
      maleStudents: maleCount,
      femaleStudents: femaleCount,
      byGroup: [], // Could be populated if needed
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
      Student.countDocuments({ isActive: { $ne: false } }), // النشطين (افتراضياً نشطين)
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
      total: totalCount,
      male: maleCount,
      female: femaleCount,
      active: activeCount,
      inactive: totalCount - activeCount,
      groups: groupsCount,
      teachers: teachersCount,
      avgAge: avgAge,
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
