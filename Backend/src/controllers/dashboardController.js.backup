const Student = require('../schema/Student');
const Teacher = require('../schema/Teacher');
const Exam = require('../schema/Exam');
const Group = require('../schema/Group');
const Activity = require('../schema/Activity');
const News = require('../schema/News');
const DailyMark = require('../schema/DailyMark');
const ExamMark = require('../schema/ExamMark');
const Attendance = require('../schema/Attendance');

// Get dashboard statistics - optimized for performance
exports.getDashboardStats = async (req, res) => {
  try {
    console.log('📊 جلب إحصائيات لوحة التحكم...');

    // Use Promise.all for parallel execution of all database queries
    const [
      studentsCount,
      teachersCount,
      examsCount,
      groupsCount,
      activitiesCount,
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
      Exam.countDocuments(),

      // Count total groups
      Group.countDocuments(),

      // Count total activities
      Activity.countDocuments(),

      // Count total news
      News.countDocuments(),

      // Calculate average marks from regular marks
      DailyMark.aggregate([
        {
          $group: {
            _id: null,
            averageMarks: { $avg: '$mark' },
          },
        },
      ]),

      // Calculate average marks from exam marks
      ExamMark.aggregate([
        {
          $group: {
            _id: null,
            averageExamMarks: { $avg: { $toDouble: '$mark' } },
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
                $cond: [{ $eq: ['$status', 'present'] }, 1, 0],
              },
            },
          },
        },
      ]),

      // Count upcoming exams (next 30 days)
      Exam.countDocuments({
        date: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      }),

      // Get recent marks for trend analysis
      DailyMark.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .select('mark createdAt'),
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
      totalActivities: activitiesCount,
      totalNews: newsCount,
      averageMarks: averageMarks,
      averageExamMarks: averageExamMarks,
      activeStudents: activeStudentsCount,
      attendanceRate: attendanceRate,
      upcomingExams: upcomingExamsCount,
      recentMarksCount: recentMarks.length,
    };

    console.log('✅ تم جلب الإحصائيات بنجاح:', stats);

    res.status(200).json({
      success: true,
      message: 'تم جلب إحصائيات لوحة التحكم بنجاح',
      data: stats,
    });
  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات لوحة التحكم:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات لوحة التحكم',
      error: error.message,
    });
  }
};

// Get detailed charts data for dashboard
exports.getDashboardCharts = async (req, res) => {
  try {
    console.log('📈 جلب بيانات الرسوم البيانية...');

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
            from: 'groups',
            localField: 'group',
            foreignField: '_id',
            as: 'groupInfo',
          },
        },
        {
          $unwind: { path: '$groupInfo', preserveNullAndEmptyArrays: true },
        },
        {
          $group: {
            _id: '$groupInfo.name',
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
            _id: '$gender',
            count: { $sum: 1 },
          },
        },
      ]),

      // Marks distribution
      DailyMark.aggregate([
        {
          $bucket: {
            groupBy: '$mark',
            boundaries: [0, 50, 70, 85, 100],
            default: 'other',
            output: {
              count: { $sum: 1 },
              avgMark: { $avg: '$mark' },
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
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
            total: { $sum: 1 },
            present: {
              $sum: {
                $cond: [{ $eq: ['$status', 'present'] }, 1, 0],
              },
            },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 },
        },
      ]),
    ]);

    const chartsData = {
      groupDistribution,
      genderDistribution,
      marksDistribution,
      attendanceByMonth,
    };

    console.log('✅ تم جلب بيانات الرسوم البيانية بنجاح');

    res.status(200).json({
      success: true,
      message: 'تم جلب بيانات الرسوم البيانية بنجاح',
      data: chartsData,
    });
  } catch (error) {
    console.error('❌ خطأ في جلب بيانات الرسوم البيانية:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الرسوم البيانية',
      error: error.message,
    });
  }
};
