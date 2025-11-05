const Student = require("../../schema/Student");
const Group = require("../../schema/Group");
const DailyMark = require("../../schema/DailyMark");
const Attendance = require("../../schema/Attendance");

/**
 * Get detailed charts data for dashboard
 * @route GET /api/dashboard/charts
 */
const getDashboardCharts = async (req, res) => {
  try {
    console.log("📈 جلب بيانات الرسوم البيانية...");

    const [
      groupDistribution,
      genderDistribution,
      marksDistribution,
      attendanceByMonth,
    ] = await Promise.all([
      // Students distribution by group - طريقة مباشرة وأكثر كفاءة
      Student.aggregate([
        {
          // تجميع حسب حقل group (سواء كان string أو ObjectId)
          $group: {
            _id: "$group",
            count: { $sum: 1 },
          },
        },
        {
          // إزالة الطلاب بدون حلقة
          $match: {
            _id: { $exists: true, $ne: null, $ne: "" },
          },
        },
        {
          // ترتيب حسب العدد
          $sort: { count: -1 },
        },
        {
          // تحديد العدد لأفضل 10 حلقات
          $limit: 10,
        },
      ]),

      // Students by gender - تجميع الجنس بشكل موحد
      Student.aggregate([
        {
          $group: {
            _id: "$gender",
            count: { $sum: 1 },
          },
        },
        {
          // تحويل القيم للإنجليزية لتسهيل العرض في Frontend
          $project: {
            _id: {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id", "ذكر"] }, then: "male" },
                  { case: { $eq: ["$_id", "أنثى"] }, then: "female" },
                  { case: { $eq: ["$_id", "انثى"] }, then: "female" },
                ],
                default: "$_id",
              },
            },
            count: 1,
          },
        },
      ]),

      // Marks distribution
      DailyMark.aggregate([
        {
          $bucket: {
            groupBy: "$mark",
            boundaries: [0, 50, 70, 85, 100],
            default: "other",
            output: {
              count: { $sum: 1 },
              avgMark: { $avg: "$mark" },
            },
          },
        },
      ]),

      // Attendance by month (last 6 months)
      Attendance.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            total: { $sum: 1 },
            present: {
              $sum: {
                $cond: [{ $eq: ["$status", "present"] }, 1, 0],
              },
            },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ]),
    ]);

    const chartsData = {
      groupDistribution,
      genderDistribution,
      marksDistribution,
      attendanceByMonth,
    };

    console.log("✅ تم جلب بيانات الرسوم البيانية بنجاح");
    console.log(
      "📊 Group Distribution:",
      JSON.stringify(groupDistribution, null, 2)
    );
    console.log(
      "📊 Gender Distribution:",
      JSON.stringify(genderDistribution, null, 2)
    );

    res.status(200).json({
      success: true,
      message: "تم جلب بيانات الرسوم البيانية بنجاح",
      data: chartsData,
    });
  } catch (error) {
    console.error("❌ خطأ في جلب بيانات الرسوم البيانية:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب بيانات الرسوم البيانية",
      error: error.message,
    });
  }
};

module.exports = getDashboardCharts;
