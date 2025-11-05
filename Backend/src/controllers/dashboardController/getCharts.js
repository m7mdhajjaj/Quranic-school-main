const Student = require("../../schema/Student");
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
      // Students distribution by group
      Student.aggregate([
        {
          $lookup: {
            from: "groups",
            localField: "group",
            foreignField: "_id",
            as: "groupInfo",
          },
        },
        {
          $unwind: { path: "$groupInfo", preserveNullAndEmptyArrays: true },
        },
        {
          $group: {
            _id: "$groupInfo.name",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]),

      // Students by gender
      Student.aggregate([
        {
          $group: {
            _id: "$gender",
            count: { $sum: 1 },
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
