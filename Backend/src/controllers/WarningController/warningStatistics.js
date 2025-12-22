// ============================================================================
// WarningController/warningStatistics.js - Warning Statistics Operations
// ============================================================================

const Warning = require("../../schema/Warning");
const mongoose = require("mongoose");

/**
 * جلب إحصائيات المعلم
 * ✅ OPTIMIZED: استخدام aggregation pipeline بدلاً من queries منفصلة
 * @route GET /api/warnings/statistics/teacher
 */
exports.getTeacherStatistics = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // ✅ استخدام aggregation واحد لحساب كل الإحصائيات دفعة واحدة
    const [statistics] = await Warning.aggregate([
      { $match: { teacherId: new mongoose.Types.ObjectId(teacherId) } },
      {
        $facet: {
          // إجمالي الإنذارات
          totalCount: [{ $count: "count" }],
          
          // الإنذارات حسب النوع
          byType: [
            {
              $group: {
                _id: "$type",
                count: { $sum: 1 },
              },
            },
          ],
          
          // عدد الطلاب الفريدين
          uniqueStudents: [
            {
              $group: {
                _id: "$studentId",
              },
            },
            { $count: "count" },
          ],
          
          // عدد المفصولين
          expelled: [
            { $match: { type: "expulsion" } },
            { $count: "count" },
          ],
          
          // أكثر 5 أسباب
          topReasons: [
            {
              $group: {
                _id: "$reason",
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ],
          
          // الإنذارات حسب الحلقة
          byGroup: [
            {
              $lookup: {
                from: "groups",
                localField: "groupId",
                foreignField: "_id",
                as: "group",
              },
            },
            { $unwind: { path: "$group", preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: "$group.name",
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
          ],
          
          // آخر 10 إنذارات
          recentWarnings: [
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: "students",
                localField: "studentId",
                foreignField: "_id",
                as: "student",
              },
            },
            { $unwind: "$student" },
            {
              $project: {
                _id: 1,
                type: 1,
                reason: 1,
                createdAt: 1,
                studentName: {
                  $concat: ["$student.firstName", " ", "$student.lastName"],
                },
              },
            },
          ],
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

    statistics.byType.forEach((item) => {
      warningsCount[item._id] = item.count;
    });

    res.json({
      totalWarnings: statistics.totalCount[0]?.count || 0,
      warningsCount,
      studentsWithWarnings: statistics.uniqueStudents[0]?.count || 0,
      expelledStudents: statistics.expelled[0]?.count || 0,
      topReasons: statistics.topReasons,
      warningsByGroup: statistics.byGroup,
      recentWarnings: statistics.recentWarnings,
    });
  } catch (error) {
    console.error("Error fetching teacher statistics:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الإحصائيات" });
  }
};
