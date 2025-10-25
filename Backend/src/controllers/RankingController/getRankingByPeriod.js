// ============================================================================
// Get Ranking By Period - جلب ترتيب فترة معينة والفترات المتاحة
// ============================================================================

const Ranking = require("../../schema/Ranking");

/**
 * جلب الترتيب لشهر وسنة محددة
 * @route GET /api/rankings/period/:year/:month
 * @access Protected
 */
const getRankingByMonthYear = async (req, res) => {
  try {
    const { month, year } = req.params;

    // Get user's group
    let userGroup = null;
    if (req.user) {
      if (req.user.role === "student") {
        userGroup = req.user.group;
      } else if (req.user.role === "teacher") {
        const Teacher = require("../../schema/Teacher");
        const teacher = await Teacher.findById(req.user._id).select("groups");
        if (teacher && teacher.groups && teacher.groups.length > 0) {
          userGroup = req.query.group || teacher.groups[0].name;
        }
      }
    }

    // Build query - try with group first for better filtering
    let ranking = null;

    if (userGroup && req.user && req.user.role !== "admin") {
      // Try to find ranking with group filter
      ranking = await Ranking.findOne({
        month: parseInt(month),
        year: parseInt(year),
        group: userGroup,
      }).populate({
        path: "topThree.studentId topTen.studentId",
        select: "firstName lastName fatherName group",
      });

      // If not found with group, try without group (old rankings) and filter later
      if (!ranking) {
        ranking = await Ranking.findOne({
          month: parseInt(month),
          year: parseInt(year),
        }).populate({
          path: "topThree.studentId topTen.studentId",
          select: "firstName lastName fatherName group",
        });
      }
    } else {
      // Admin sees any ranking
      ranking = await Ranking.findOne({
        month: parseInt(month),
        year: parseInt(year),
      }).populate({
        path: "topThree.studentId topTen.studentId",
        select: "firstName lastName fatherName group",
      });
    }

    if (!ranking) {
      return res.status(404).json({
        success: false,
        message: `لم يتم العثور على تصنيف لشهر ${month}/${year}`,
      });
    }

    // Filter students by group if not admin
    if (userGroup && req.user && req.user.role !== "admin") {
      // Filter topThree to show only students from the user's group
      ranking.topThree = ranking.topThree.filter(
        (item) => item.studentId && item.studentId.group === userGroup
      );

      // Filter topTen to show only students from the user's group
      ranking.topTen = ranking.topTen.filter(
        (item) => item.studentId && item.studentId.group === userGroup
      );
    }

    res.status(200).json({
      success: true,
      data: ranking,
    });
  } catch (error) {
    console.error("Error fetching ranking by month/year:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء استرجاع التصنيف",
      error: error.message,
    });
  }
};

/**
 * جلب كل الفترات (شهر/سنة) المتاحة للترتيبات
 * @route GET /api/rankings/periods
 * @access Public
 */
const getAvailableRankingPeriods = async (req, res) => {
  try {
    const rankings = await Ranking.find()
      .select("month year -_id")
      .sort({ year: -1, month: -1 });

    const periods = rankings.map((r) => ({
      month: r.month,
      year: r.year,
      label: `${r.month}/${r.year}`,
    }));

    res.status(200).json({
      success: true,
      data: periods,
    });
  } catch (error) {
    console.error("Error fetching ranking periods:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء استرجاع فترات التصنيف",
      error: error.message,
    });
  }
};

module.exports = {
  getRankingByMonthYear,
  getAvailableRankingPeriods,
};
