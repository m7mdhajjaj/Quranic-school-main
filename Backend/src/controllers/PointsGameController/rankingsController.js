// ============================================================================
// rankingsController - إدارة الترتيبات
// ============================================================================

const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const MonthlyPoints = require("../../schema/MonthlyPoints");
const StudentBadge = require("../../schema/StudentBadge");
const DailyPoints = require("../../schema/DailyPoints");
const {
  getCurrentMonth,
  getMonthName,
} = require("../../utils/helpers/dateHelpers");

/**
 * @desc    ترتيب الطلاب حسب النقاط (الشهر الحالي فقط)
 * @route   GET /api/points-game/rankings/points
 * @access  Private (Student or Teacher)
 */
exports.getPointsRankings = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    const { month, year } = getCurrentMonth();

    let rankings = [];

    if (userRole === "student") {
      // الطالب - جلب ترتيب حلقته فقط
      const student = await Student.findById(userId);
      if (!student) {
        return res.status(404).json({ message: "الطالب غير موجود" });
      }

      // جلب جميع الطلاب في نفس الحلقة (بغض النظر عن المعلم)
      // مثل ما يحدث في صفحة الحضور والغياب
      const allStudentsInGroup = await Student.find({
        group: student.group,
      }).select("_id firstName lastName group teacher");

      // جلب MonthlyPoints لجميع الطلاب في الحلقة
      const studentIdsInGroup = allStudentsInGroup.map((s) => s._id);

      const monthlyPointsRecords = await MonthlyPoints.find({
        month,
        year,
        studentId: { $in: studentIdsInGroup },
      }).lean();

      console.log(
        `🔍 [Rankings Debug] Found ${monthlyPointsRecords.length} MonthlyPoints records`
      );

      // إنشاء Map للوصول السريع إلى النقاط
      const pointsMap = new Map(
        monthlyPointsRecords.map((record) => [
          record.studentId.toString(),
          record,
        ])
      );

      // بناء الترتيب من جميع الطلاب في الحلقة
      rankings = allStudentsInGroup.map((student) => {
        const pointsRecord = pointsMap.get(student._id.toString());
        return {
          studentId: {
            _id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
          },
          totalPoints: pointsRecord?.totalPoints || 0,
          activeDays: pointsRecord?.activeDays || 0,
          group: student.group,
          teacher: student.teacher,
        };
      });

      // ترتيب حسب النقاط من الأعلى للأدنى
      rankings.sort((a, b) => b.totalPoints - a.totalPoints);

      console.log(
        "🔍 [Rankings Debug] Final rankings:",
        rankings.map((r) => ({
          student: `${r.studentId.firstName} ${r.studentId.lastName}`,
          points: r.totalPoints,
          activeDays: r.activeDays,
        }))
      );
    } else if (userRole === "teacher") {
      // المعلم - جلب ترتيب جميع طلابه من كل حلقاته
      const teacher = await Teacher.findById(userId);
      if (!teacher) {
        return res.status(404).json({ message: "المعلم غير موجود" });
      }

      const teacherName = `${teacher.firstName} ${teacher.lastName}`;

      // جلب النقاط من جميع الحلقات التي يدرّسها المعلم
      rankings = await MonthlyPoints.find({
        month,
        year,
        teacher: teacherName,
      })
        .populate("studentId", "firstName lastName")
        .sort({ totalPoints: -1 })
        .lean();
    } else {
      return res.status(403).json({ message: "غير مصرح" });
    }

    // فحص وتصفية السجلات
    const validRankings = rankings.filter((record) => {
      if (!record.studentId || !record.studentId._id) {
        return false;
      }
      return true;
    });

    // جلب جميع الشارات مرة واحدة
    const studentIds = validRankings.map((r) => r.studentId._id);
    const allBadges = await StudentBadge.find({
      studentId: { $in: studentIds },
    }).lean();

    // تحويل إلى Map للوصول السريع
    const badgesMap = new Map(
      allBadges.map((b) => [b.studentId.toString(), b])
    );

    // تنسيق البيانات وإضافة الترتيب
    const formattedRankings = validRankings.map((record, index) => {
      const badges = badgesMap.get(record.studentId._id.toString());

      return {
        rank: index + 1,
        _id: record.studentId._id,
        studentId: record.studentId._id,
        name: `${record.studentId.firstName} ${record.studentId.lastName}`,
        points: record.totalPoints,
        emoji: "👤",
        activeDays: record.activeDays,
        badgesCount: badges?.earnedBadges.length || 0,
        totalBadgeRepeats: badges?.totalBadgeRepeats || 0,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedRankings,
      month: getMonthName(month),
      year,
    });
  } catch (error) {
    console.error("خطأ في جلب الترتيب:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الترتيب",
      error: error.message,
    });
  }
};

/**
 * @desc    ترتيب الطلاب حسب الشارات
 * @route   GET /api/points-game/rankings/badges
 * @access  Private (Student or Teacher)
 */
exports.getBadgesRankings = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let studentsInGroup = [];

    if (userRole === "student") {
      // الطالب - جلب طلاب حلقته فقط (بغض النظر عن المعلم)
      const student = await Student.findById(userId);
      if (!student) {
        return res.status(404).json({ message: "الطالب غير موجود" });
      }

      studentsInGroup = await Student.find({
        group: student.group,
      });
    } else if (userRole === "teacher") {
      // المعلم - جلب جميع طلابه من كل حلقاته
      const teacher = await Teacher.findById(userId);
      if (!teacher) {
        return res.status(404).json({ message: "المعلم غير موجود" });
      }

      const teacherName = `${teacher.firstName} ${teacher.lastName}`;

      // جلب جميع الطلاب الذين معلمهم هو هذا المعلم
      studentsInGroup = await Student.find({
        teacher: teacherName,
      });
    } else {
      return res.status(403).json({ message: "غير مصرح" });
    }

    // جلب جميع البيانات مرة واحدة
    const studentIds = studentsInGroup.map((s) => s._id);

    // جلب جميع الشارات مرة واحدة
    const allBadges = await StudentBadge.find({
      studentId: { $in: studentIds },
    }).lean();

    // جلب جميع النقاط مرة واحدة
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const allPoints = await DailyPoints.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$studentId",
          totalPoints: { $sum: "$totalPoints" },
        },
      },
    ]);

    // تحويل النتائج إلى Map للوصول السريع
    const badgesMap = new Map(
      allBadges.map((b) => [b.studentId.toString(), b])
    );
    const pointsMap = new Map(
      allPoints.map((p) => [p._id.toString(), p.totalPoints])
    );

    // بناء الترتيب
    const rankings = studentsInGroup.map((stud) => {
      const studIdStr = stud._id.toString();
      const badges = badgesMap.get(studIdStr);
      const points = pointsMap.get(studIdStr) || 0;

      return {
        _id: stud._id,
        studentId: stud._id,
        name: `${stud.firstName} ${stud.lastName}`,
        emoji: "👤",
        badgesCount: badges?.earnedBadges.length || 0,
        totalBadgeRepeats: badges?.totalBadgeRepeats || 0,
        points: points,
      };
    });

    // ترتيب حسب مجموع التكرارات (من الأعلى للأدنى)
    rankings.sort((a, b) => {
      if (b.totalBadgeRepeats !== a.totalBadgeRepeats) {
        return b.totalBadgeRepeats - a.totalBadgeRepeats;
      }
      // في حالة التساوي، الترتيب حسب عدد الشارات
      return b.badgesCount - a.badgesCount;
    });

    // إضافة الترتيب
    rankings.forEach((r, index) => {
      r.rank = index + 1;
    });

    res.status(200).json({
      success: true,
      data: rankings,
    });
  } catch (error) {
    console.error("خطأ في جلب ترتيب الشارات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب ترتيب الشارات",
      error: error.message,
    });
  }
};

module.exports = exports;
