// ============================================================================
// statsController - إحصائيات الطلاب
// ============================================================================

const Student = require("../../schema/Student");
const DailyPoints = require("../../schema/DailyPoints");

/**
 * @desc    جلب إحصائيات الطالب (أسبوع، شهر، ترتيب)
 * @route   GET /api/points-game/stats
 * @access  Private (Student)
 */
exports.getStudentStats = async (req, res) => {
  try {
    const studentId = req.user._id;

    const now = new Date();

    // النقاط الأسبوعية (آخر 7 أيام)
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const weeklyPoints = await DailyPoints.aggregate([
      {
        $match: {
          studentId: studentId,
          date: { $gte: weekStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPoints" },
        },
      },
    ]);

    // النقاط الشهرية (الشهر الحالي)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const monthlyPoints = await DailyPoints.aggregate([
      {
        $match: {
          studentId: studentId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPoints" },
        },
      },
    ]);

    // الحصول على ترتيب الطالب
    const student = await Student.findById(studentId);
    const studentsInGroup = await Student.find({
      group: student.group,
      teacher: student.teacher,
    });

    let myRank = 0;
    const rankings = [];

    for (const stud of studentsInGroup) {
      const points = await DailyPoints.aggregate([
        {
          $match: {
            studentId: stud._id,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalPoints: { $sum: "$totalPoints" },
          },
        },
      ]);

      rankings.push({
        studentId: stud._id,
        points: points[0]?.totalPoints || 0,
      });
    }

    rankings.sort((a, b) => b.points - a.points);

    rankings.forEach((r, index) => {
      if (r.studentId.toString() === studentId.toString()) {
        myRank = index + 1;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        weeklyPoints: weeklyPoints[0]?.total || 0,
        monthlyPoints: monthlyPoints[0]?.total || 0,
        currentRank: myRank,
      },
    });
  } catch (error) {
    console.error("خطأ في جلب الإحصائيات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الإحصائيات",
      error: error.message,
    });
  }
};

module.exports = exports;
