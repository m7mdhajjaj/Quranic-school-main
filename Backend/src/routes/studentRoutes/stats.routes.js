// routes/studentRoutes/stats.routes.js
const express = require("express");
const router = express.Router();
const Student = require("../../schema/Student");

/**
 * Statistics Routes for Students
 * Fast endpoints for dashboards and analytics
 */

// Fast count endpoint (no authentication for count)
router.get("/count", async (req, res) => {
  try {
    console.log("⚡ تحميل عدد الطلاب...");
    const startTime = Date.now();

    const count = await Student.countDocuments();

    const duration = Date.now() - startTime;
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

// Main statistics endpoint
router.get("/stats", async (req, res) => {
  try {
    console.log("📊 تحميل إحصائيات الطلاب...");
    const startTime = Date.now();

    const [totalCount, maleCount, femaleCount, activeCount, teachersCount, avgAge] =
      await Promise.all([
        Student.countDocuments(),
        Student.countDocuments({ gender: "ذكر" }),
        Student.countDocuments({ gender: "أنثى" }),
        Student.countDocuments({
          group: { $exists: true, $ne: null, $ne: "", $ne: "غير محدد", $ne: "undefined" },
        }),
        Student.distinct("teacher").then(
          (teachers) => teachers.filter((t) => t && t.trim() !== "").length
        ),
        Student.aggregate([{ $group: { _id: null, avgAge: { $avg: "$age" } } }]).then(
          (result) => (result.length > 0 ? Math.round(result[0].avgAge || 0) : 0)
        ),
      ]);

    const groupsCount = await Student.distinct("group").then(
      (groups) => groups.filter((g) => g && g.trim() !== "").length
    );

    const duration = Date.now() - startTime;

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

    console.log(`✅ تم تحميل الإحصائيات في ${duration}ms`);

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
      stats: { total: 0, male: 0, female: 0, active: 0, inactive: 0, groups: 0, teachers: 0, avgAge: 0 },
    });
  }
});

// Comprehensive statistics (alternative endpoint)
router.get("/stats/summary/all", async (req, res) => {
  try {
    console.log("📊 تحميل إحصائيات الطلاب (ملخص شامل)...");
    const startTime = Date.now();

    const [totalCount, maleCount, femaleCount, activeCount] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ gender: "ذكر" }),
      Student.countDocuments({ gender: "أنثى" }),
      Student.countDocuments({
        group: { $exists: true, $ne: null, $ne: "", $ne: "غير محدد", $ne: "undefined" },
      }),
    ]);

    const duration = Date.now() - startTime;

    const stats = {
      totalStudents: totalCount,
      activeStudents: activeCount,
      maleStudents: maleCount,
      femaleStudents: femaleCount,
      byGroup: [],
    };

    console.log(`✅ تم تحميل الإحصائيات الشاملة في ${duration}ms`);

    res.json({
      success: true,
      data: stats,
      queryTime: `${duration}ms`,
      message: `إحصائيات ${totalCount} طالب`,
    });
  } catch (error) {
    console.error("❌ Error getting comprehensive stats:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في الحصول على الإحصائيات الشاملة",
    });
  }
});

module.exports = router;
