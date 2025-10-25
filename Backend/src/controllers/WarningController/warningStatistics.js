// ============================================================================
// WarningController/warningStatistics.js - Warning Statistics Operations
// ============================================================================

const Warning = require("../../schema/Warning");
const mongoose = require("mongoose");

/**
 * جلب إحصائيات الإنذارات (للمدير)
 * @route GET /api/warnings/statistics/all
 */
exports.getWarningsStatistics = async (req, res) => {
  try {
    const totalWarnings = await Warning.countDocuments();
    const warningsByType = await Warning.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    const activeWarnings = await Warning.countDocuments({ isActive: true });

    res.json({
      totalWarnings,
      warningsByType,
      activeWarnings,
    });
  } catch (error) {
    console.error("Error fetching warnings statistics:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الإحصائيات" });
  }
};

/**
 * جلب إحصائيات المعلم
 * @route GET /api/warnings/statistics/teacher
 */
exports.getTeacherStatistics = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // إجمالي الإنذارات التي أعطاها هذا المعلم
    const totalWarnings = await Warning.countDocuments({ teacherId });

    // الإنذارات حسب النوع
    const warningsByType = await Warning.aggregate([
      { $match: { teacherId: new mongoose.Types.ObjectId(teacherId) } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    // تحويل النتيجة إلى object سهل القراءة
    const warningsCount = {
      warning: 0,
      first: 0,
      second: 0,
      third: 0,
      expulsion: 0,
    };

    warningsByType.forEach((item) => {
      warningsCount[item._id] = item.count;
    });

    // عدد الطلاب الذين لديهم إنذارات من هذا المعلم
    const studentsWithWarnings = await Warning.distinct("studentId", {
      teacherId,
    });

    // عدد الطلاب المفصولين
    const expelledStudents = await Warning.countDocuments({
      teacherId,
      type: "expulsion",
    });

    // أكثر 5 أسباب تكراراً
    const topReasons = await Warning.aggregate([
      { $match: { teacherId: new mongoose.Types.ObjectId(teacherId) } },
      {
        $group: {
          _id: "$reason",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // الإنذارات حسب الحلقة
    const warningsByGroup = await Warning.aggregate([
      { $match: { teacherId: new mongoose.Types.ObjectId(teacherId) } },
      {
        $lookup: {
          from: "groups",
          localField: "groupId",
          foreignField: "_id",
          as: "group",
        },
      },
      { $unwind: "$group" },
      {
        $group: {
          _id: "$group.name",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // آخر 5 إنذارات
    const recentWarnings = await Warning.find({ teacherId })
      .populate("studentId", "firstName lastName")
      .populate("groupId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalWarnings,
      warningsCount,
      studentsWithWarnings: studentsWithWarnings.length,
      expelledStudents,
      topReasons,
      warningsByGroup,
      recentWarnings,
    });
  } catch (error) {
    console.error("Error fetching teacher statistics:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الإحصائيات" });
  }
};
