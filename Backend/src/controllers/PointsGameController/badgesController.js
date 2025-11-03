// ============================================================================
// badgesController - إدارة الشارات
// ============================================================================

const StudentBadge = require("../../schema/StudentBadge");
const { allBadges } = require("./utils/badgeDefinitions");

/**
 * @desc    الحصول على شارات الطالب
 * @route   GET /api/points-game/badges
 * @access  Private (Student)
 */
exports.getStudentBadges = async (req, res) => {
  try {
    const studentId = req.user._id;

    let studentBadge = await StudentBadge.findOne({ studentId });

    if (!studentBadge) {
      // إرجاع بيانات فارغة إذا لم يكن هناك سجل
      return res.status(200).json({
        success: true,
        data: {
          earnedBadges: [],
          badgeProgress: {
            mosquePrayerStreak: 0,
            adhkarStreak: 0,
            parentRespectPerfect: 0,
            schoolAttendanceStreak: 0,
            overallStreak: 0,
            sunanStreak: 0,
            mosqueTwoPrayersWeek: 0,
          },
          allBadges,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        earnedBadges: studentBadge.earnedBadges,
        badgeProgress: studentBadge.badgeProgress,
        allBadges,
      },
    });
  } catch (error) {
    console.error("خطأ في جلب الشارات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الشارات",
      error: error.message,
    });
  }
};

module.exports = exports;
