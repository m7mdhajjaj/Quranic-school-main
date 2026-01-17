const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const ExamSchedule = require("../../schema/ExamShedule/ExamSchedule");
const Group = require("../../schema/Group");
const News = require("../../schema/News");
const DailyMark = require("../../schema/DailyMark/DailyMark");
const ExamMark = require("../../schema/ExamShedule/ExamMark");
const Attendance = require("../../schema/Attendance");

/**
 * Get dashboard statistics - optimized for performance
 * @route GET /api/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Use Promise.all for parallel execution of all database queries
    const [
      studentsCount,
      teachersCount,
      examsCount,
      groupsCount,
      newsCount,
      averageMarksResult,
      examMarksResult,
      activeStudentsCount,
      attendanceStats,
      upcomingExamsCount,
      recentMarks,
    ] = await Promise.all([
      // Count total students
      Student.countDocuments(),

      // Count total teachers
      Teacher.countDocuments(),

      // Count total exams
      ExamSchedule.countDocuments(),

      // Count total groups
      Group.countDocuments(),

      // Count total news
      News.countDocuments(),

      // Calculate average marks from regular marks
      DailyMark.aggregate([
        {
          $project: {
            avgMark: { $avg: ["$reviewMark", "$memorizationMark"] },
          },
        },
        {
          $group: {
            _id: null,
            averageMarks: { $avg: "$avgMark" },
          },
        },
      ]),

      // Calculate average marks from exam marks
      ExamMark.aggregate([
        {
          $group: {
            _id: null,
            averageExamMarks: { $avg: { $toDouble: "$mark" } },
          },
        },
      ]),

      // Count active students (logged in last 30 days)
      Student.countDocuments({
        lastSeen: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      }),

      // Get attendance statistics
      Attendance.aggregate([
        {
          $group: {
            _id: null,
            totalAttendance: { $sum: 1 },
            presentCount: {
              $sum: {
                $cond: [{ $eq: ["$isPresent", true] }, 1, 0],
              },
            },
          },
        },
      ]),

      // Count upcoming exams (next 30 days)
      ExamSchedule.countDocuments({
        date: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      }),

      // Get recent marks for trend analysis
      DailyMark.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .select("reviewMark memorizationMark createdAt"),
    ]);

    // Calculate attendance rate
    const attendanceRate =
      attendanceStats.length > 0 && attendanceStats[0].totalAttendance > 0
        ? Math.round(
            (attendanceStats[0].presentCount /
              attendanceStats[0].totalAttendance) *
              100
          )
        : 0;

    // Calculate average marks
    const averageMarks =
      averageMarksResult.length > 0
        ? Math.round(averageMarksResult[0].averageMarks || 0)
        : 0;

    // Calculate average exam marks
    const averageExamMarks =
      examMarksResult.length > 0
        ? Math.round(examMarksResult[0].averageExamMarks || 0)
        : 0;

    // Prepare response data
    const stats = {
      totalStudents: studentsCount,
      totalTeachers: teachersCount,
      totalExams: examsCount,
      totalGroups: groupsCount,
      totalActivities: 0,
      totalNews: newsCount,
      averageMarks: averageMarks,
      averageExamMarks: averageExamMarks,
      activeStudents: activeStudentsCount,
      attendanceRate: attendanceRate,
      upcomingExams: upcomingExamsCount,
      recentMarksCount: recentMarks.length,
    };

    res.status(200).json({
      success: true,
      message: "تم جلب إحصائيات لوحة التحكم بنجاح",
      data: stats,
    });
  } catch (error) {
    console.error("❌ خطأ في جلب إحصائيات لوحة التحكم:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب إحصائيات لوحة التحكم",
      error: error.message,
    });
  }
};

module.exports = getDashboardStats;
