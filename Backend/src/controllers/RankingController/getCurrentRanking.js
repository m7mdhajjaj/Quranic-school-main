// ============================================================================
// Get Current Ranking - جلب الترتيب الحالي أو الأحدث
// ============================================================================

const Ranking = require("../../schema/Ranking");

/**
 * جلب الترتيب للشهر الحالي أو أحدث ترتيب متاح
 * @route GET /api/rankings/current
 * @access Protected
 */
const getCurrentRanking = async (req, res) => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // JavaScript months are 0-based
    const currentYear = today.getFullYear();

    // Get user's group
    let userGroup = null;
    if (req.user) {
      if (req.user.role === "student") {
        userGroup = req.user.group;
      } else if (req.user.role === "teacher") {
        // If teacher, get their first group (or from query)
        const Teacher = require("../../schema/Teacher");
        const teacher = await Teacher.findById(req.user._id).select("groups");
        if (teacher && teacher.groups && teacher.groups.length > 0) {
          userGroup = req.query.group || teacher.groups[0].name;
        }
      }
      // Admin sees all groups, no filter
    }

    // Build query - try with group first, then without (for backward compatibility)
    let ranking = null;

    // Try to find ranking with group filter (new schema)
    if (userGroup && req.user.role !== "admin") {
      ranking = await Ranking.findOne({
        month: currentMonth,
        year: currentYear,
        group: userGroup,
      }).populate({
        path: "topThree.studentId topTen.studentId",
        select: "firstName lastName fatherName group",
      });
    } else {
      // Admin or no group - find any ranking for this period
      ranking = await Ranking.findOne({
        month: currentMonth,
        year: currentYear,
      }).populate({
        path: "topThree.studentId topTen.studentId",
        select: "firstName lastName fatherName group",
      });
    }

    // If no ranking for current month, find the most recent one
    if (!ranking) {
      let allRankings;

      if (userGroup && req.user.role !== "admin") {
        // Try to find rankings with group filter
        allRankings = await Ranking.find({ group: userGroup })
          .sort({ year: -1, month: -1 })
          .limit(1);

        // If no rankings with group, find any ranking and filter later
        if (allRankings.length === 0) {
          allRankings = await Ranking.find()
            .sort({ year: -1, month: -1 })
            .limit(1);
        }
      } else {
        // Admin sees any ranking
        allRankings = await Ranking.find()
          .sort({ year: -1, month: -1 })
          .limit(1);
      }

      if (allRankings.length > 0) {
        ranking = await Ranking.findById(allRankings[0]._id).populate({
          path: "topThree.studentId topTen.studentId",
          select: "firstName lastName fatherName group",
        });
      }
    }

    if (!ranking) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على تصنيف للشهر الحالي أو الشهور السابقة",
      });
    }

    // Filter students by group if not admin
    if (userGroup && req.user.role !== "admin") {
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
      currentMonth,
      currentYear,
    });
  } catch (error) {
    console.error("Error fetching current ranking:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء استرجاع التصنيف",
      error: error.message,
    });
  }
};

module.exports = getCurrentRanking;
