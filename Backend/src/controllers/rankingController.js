const Ranking = require("../schema/Ranking");
const Student = require("../schema/Student");

// Get the current ranking or most recent one
exports.getCurrentRanking = async (req, res) => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // JavaScript months are 0-based
    const currentYear = today.getFullYear();

    // First try to find ranking for current month
    let ranking = await Ranking.findOne({
      month: currentMonth,
      year: currentYear,
    }).populate({
      path: "topThree.studentId topTen.studentId",
      select: "firstName lastName fatherName group", // Fields to include from Student model
    });

    // If no ranking for current month, find the most recent one
    if (!ranking) {
      // Get all rankings
      const allRankings = await Ranking.find()
        .sort({ year: -1, month: -1 })
        .limit(1);

      if (allRankings.length > 0) {
        // Get the first (most recent) ranking
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

// Get ranking for a specific month and year
exports.getRankingByMonthYear = async (req, res) => {
  try {
    const { month, year } = req.params;

    const ranking = await Ranking.findOne({
      month: parseInt(month),
      year: parseInt(year),
    }).populate({
      path: "topThree.studentId topTen.studentId",
      select: "firstName lastName fatherName group",
    });

    if (!ranking) {
      return res.status(404).json({
        success: false,
        message: `لم يتم العثور على تصنيف لشهر ${month}/${year}`,
      });
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

// Get all available months/years that have rankings
exports.getAvailableRankingPeriods = async (req, res) => {
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

// Create or update a ranking for a specific month/year
exports.createOrUpdateRanking = async (req, res) => {
  try {
    const { month, year, topThree, topTen } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "الشهر والسنة مطلوبان",
      });
    }

    // Validate month and year
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      return res.status(400).json({
        success: false,
        message: "الشهر يجب أن يكون بين 1 و 12",
      });
    }

    if (yearNum < 2020 || isNaN(yearNum)) {
      return res.status(400).json({
        success: false,
        message: "السنة يجب أن تكون 2020 أو أحدث",
      });
    }

    // Validate and prepare topThree data
    if (!Array.isArray(topThree) || topThree.length > 3) {
      return res.status(400).json({
        success: false,
        message: "يجب أن يحتوي topThree على مصفوفة تحتوي على 3 عناصر كحد أقصى",
      });
    }

    // Validate and prepare topTen data
    if (!Array.isArray(topTen) || topTen.length > 10) {
      return res.status(400).json({
        success: false,
        message: "يجب أن يحتوي topTen على مصفوفة تحتوي على 10 عناصر كحد أقصى",
      });
    }

    // Check if all student IDs exist
    const allStudentIds = [
      ...topThree.map((item) => item.studentId),
      ...topTen.map((item) => item.studentId),
    ];

    const uniqueStudentIds = [...new Set(allStudentIds)];
    const existingStudents = await Student.find({
      _id: { $in: uniqueStudentIds },
    }).select("_id");

    const existingStudentIds = existingStudents.map((s) => s._id.toString());
    const invalidStudentIds = uniqueStudentIds.filter(
      (id) => !existingStudentIds.includes(id),
    );

    if (invalidStudentIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `الطلاب بالمعرفات التالية غير موجودين: ${invalidStudentIds.join(
          ", ",
        )}`,
      });
    }

    // Prepare the topThree data with ranks
    const processedTopThree = topThree.map((item, index) => ({
      studentId: item.studentId,
      rank: index + 1,
      score: item.score,
    }));

    // Prepare the topTen data with ranks
    const processedTopTen = topTen.map((item, index) => ({
      studentId: item.studentId,
      rank: index + 1,
      score: item.score,
    }));

    // Find and update or create new ranking
    const ranking = await Ranking.findOneAndUpdate(
      { month: monthNum, year: yearNum },
      {
        month: monthNum,
        year: yearNum,
        topThree: processedTopThree,
        topTen: processedTopTen,
      },
      { new: true, upsert: true },
    );

    res.status(200).json({
      success: true,
      message: "تم حفظ التصنيف بنجاح",
      data: ranking,
    });
  } catch (error) {
    console.error("Error creating/updating ranking:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `التصنيف لشهر ${req.body.month}/${req.body.year} موجود بالفعل`,
      });
    }

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حفظ التصنيف",
      error: error.message,
    });
  }
};

// Delete ranking for a specific month/year
exports.deleteRanking = async (req, res) => {
  try {
    const { month, year } = req.params;

    const result = await Ranking.findOneAndDelete({
      month: parseInt(month),
      year: parseInt(year),
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: `لم يتم العثور على تصنيف لشهر ${month}/${year}`,
      });
    }

    res.status(200).json({
      success: true,
      message: `تم حذف التصنيف لشهر ${month}/${year} بنجاح`,
    });
  } catch (error) {
    console.error("Error deleting ranking:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف التصنيف",
      error: error.message,
    });
  }
};
