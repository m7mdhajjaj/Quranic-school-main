// ============================================================================
// championsController - إدارة أبطال الشهر
// ============================================================================

const Student = require("../../schema/Student");
const MonthlyPoints = require("../../schema/MonthlyPoints");
const MonthlyChampion = require("../../schema/MonthlyChampion");
const StudentBadge = require("../../schema/StudentBadge");
const { getMonthName } = require("./utils/dateHelpers");

/**
 * @desc    تتويج أبطال الشهر (يُستدعى في بداية كل شهر جديد)
 * @route   POST /api/points-game/crown-champions
 * @access  Private (Admin/Cron Job)
 */
exports.crownMonthlyChampions = async (req, res) => {
  try {
    // الشهر الماضي
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const lastYear =
      now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const monthName = getMonthName(lastMonth);

    // جلب جميع المجموعات (الحلقات) الفريدة
    const groups = await MonthlyPoints.distinct("group", {
      month: lastMonth,
      year: lastYear,
    });

    const champions = [];

    for (const group of groups) {
      // جلب أفضل طالب في كل مجموعة
      const topStudent = await MonthlyPoints.findOne({
        month: lastMonth,
        year: lastYear,
        group: group,
      })
        .sort({ totalPoints: -1 })
        .limit(1)
        .populate("studentId", "firstName lastName");

      if (topStudent && topStudent.totalPoints > 0) {
        // التحقق من عدم وجود بطل مسجل بالفعل
        const existingChampion = await MonthlyChampion.findOne({
          studentId: topStudent.studentId._id,
          month: lastMonth,
          year: lastYear,
        });

        if (!existingChampion) {
          // حفظ البطل
          const champion = new MonthlyChampion({
            studentId: topStudent.studentId._id,
            studentName: `${topStudent.studentId.firstName} ${topStudent.studentId.lastName}`,
            month: lastMonth,
            year: lastYear,
            monthName: monthName,
            totalPoints: topStudent.totalPoints,
            teacher: topStudent.teacher,
            group: topStudent.group,
            rank: 1,
            badgeData: {
              icon: "👑",
              description: `بطل ${monthName} ${lastYear} - ${topStudent.totalPoints} نقطة`,
              awardedAt: new Date(),
            },
          });

          await champion.save();

          // منح شارة "بطل الشهر" للطالب
          await awardMonthlyChampionBadge(
            topStudent.studentId._id,
            monthName,
            lastYear,
            topStudent.totalPoints
          );

          champions.push(champion);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `تم تتويج ${champions.length} بطل لشهر ${monthName} ${lastYear}`,
      data: champions,
    });
  } catch (error) {
    console.error("خطأ في تتويج الأبطال:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تتويج الأبطال",
      error: error.message,
    });
  }
};

/**
 * @desc    جلب أبطال الأشهر السابقة
 * @route   GET /api/points-game/champions
 * @access  Private (Student)
 */
exports.getMonthlyChampions = async (req, res) => {
  try {
    const studentId = req.user._id;

    // الحصول على معلومات الطالب
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    // جلب أبطال نفس الحلقة
    const champions = await MonthlyChampion.find({
      group: student.group,
      teacher: student.teacher,
    })
      .sort({ year: -1, month: -1 })
      .limit(12) // آخر 12 شهر
      .lean();

    res.status(200).json({
      success: true,
      data: champions,
    });
  } catch (error) {
    console.error("خطأ في جلب الأبطال:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الأبطال",
      error: error.message,
    });
  }
};

// دالة مساعدة لمنح شارة بطل الشهر
async function awardMonthlyChampionBadge(studentId, monthName, year, points) {
  try {
    let studentBadge = await StudentBadge.findOne({ studentId });

    if (!studentBadge) {
      studentBadge = new StudentBadge({
        studentId,
        teacher: null,
        group: null,
        badgeProgress: {},
        earnedBadges: [],
      });
    }

    // إنشاء شارة فريدة لكل شهر
    const badgeId = `champion_${year}_${monthName.replace(/\s/g, "_")}`;

    // التحقق من عدم وجود الشارة مسبقاً
    const existingBadge = studentBadge.earnedBadges.find(
      (b) => b.badgeId === badgeId
    );

    if (!existingBadge) {
      studentBadge.earnedBadges.push({
        badgeId: badgeId,
        name: `👑 بطل ${monthName}`,
        icon: "👑",
        description: `حصل على المركز الأول في منافسة ${monthName} ${year}`,
        requirement: `${points} نقطة`,
        count: 1,
        firstEarnedAt: new Date(),
        lastEarnedAt: new Date(),
      });

      await studentBadge.save();
    }
  } catch (error) {
    console.error("خطأ في منح شارة البطل:", error);
    throw error;
  }
}

module.exports = exports;
