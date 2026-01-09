// ============================================================================
// debugController - وظائف التصحيح والصيانة
// ============================================================================

const Student = require("../../schema/Student");
const MonthlyPoints = require("../../schema/MonthlyPoints");
const DailyPoints = require("../../schema/DailyPoints");
const { getCurrentMonth, getMonthName } = require("../../utils/helpers/pointsGameDateUtils");

/**
 * @desc    [DEBUG] جلب جميع نقاط الشهر الحالي (للتطوير)
 * @route   GET /api/points-game/debug/monthly-points
 * @access  Private (Student)
 */
exports.getDebugMonthlyPoints = async (req, res) => {
  try {
    const studentId = req.user._id;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    const { month, year } = getCurrentMonth();

    // جلب جميع السجلات للشهر الحالي
    const allMonthlyPoints = await MonthlyPoints.find({
      month,
      year,
    })
      .populate("studentId", "firstName lastName group teacher")
      .lean();

    // جلب سجلات نفس الحلقة فقط
    const sameGroupPoints = await MonthlyPoints.find({
      month,
      year,
      group: student.group,
      teacher: student.teacher,
    })
      .populate("studentId", "firstName lastName")
      .lean();

    res.status(200).json({
      success: true,
      debug: {
        currentStudent: {
          name: `${student.firstName} ${student.lastName}`,
          group: student.group,
          teacher: student.teacher,
        },
        month: getMonthName(month),
        year,
        allRecordsCount: allMonthlyPoints.length,
        sameGroupCount: sameGroupPoints.length,
        allRecords: allMonthlyPoints,
        sameGroupRecords: sameGroupPoints,
      },
    });
  } catch (error) {
    console.error("خطأ في debug:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ",
      error: error.message,
    });
  }
};

/**
 * @desc    [ADMIN] إعادة حساب النقاط الشهرية لجميع الطلاب
 * @route   POST /api/points-game/admin/recalculate-monthly
 * @access  Private (Admin)
 */
exports.recalculateMonthlyPoints = async (req, res) => {
  try {
    const { month, year } = getCurrentMonth();
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    // جلب جميع الطلاب الذين لديهم نقاط هذا الشهر
    const studentsWithPoints = await DailyPoints.distinct("studentId", {
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    console.log(`🔄 إعادة حساب النقاط لـ ${studentsWithPoints.length} طالب...`);

    let updated = 0;
    let created = 0;

    for (const studentId of studentsWithPoints) {
      const student = await Student.findById(studentId);
      if (!student) continue;

      // البحث عن سجل الشهر الحالي
      let monthlyPoints = await MonthlyPoints.findOne({
        studentId,
        month,
        year,
      });

      const isNew = !monthlyPoints;

      if (!monthlyPoints) {
        monthlyPoints = new MonthlyPoints({
          studentId,
          month,
          year,
          totalPoints: 0,
          activeDays: 0,
          teacher: student.teacher,
          group: student.group,
        });
      } else {
        // تحديث المعلم والحلقة (في حال تغيرت)
        monthlyPoints.teacher = student.teacher;
        monthlyPoints.group = student.group;
      }

      // حساب النقاط
      const monthlyAggregate = await DailyPoints.aggregate([
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
            days: { $sum: 1 },
          },
        },
      ]);

      if (monthlyAggregate.length > 0) {
        monthlyPoints.totalPoints = monthlyAggregate[0].total;
        monthlyPoints.activeDays = monthlyAggregate[0].days;
      }

      await monthlyPoints.save();

      if (isNew) {
        created++;
      } else {
        updated++;
      }
    }

    console.log(`✅ تم: ${created} جديد، ${updated} محدث`);

    res.status(200).json({
      success: true,
      message: `تم إعادة حساب النقاط بنجاح`,
      data: {
        month: getMonthName(month),
        year,
        totalStudents: studentsWithPoints.length,
        created,
        updated,
      },
    });
  } catch (error) {
    console.error("خطأ في إعادة الحساب:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إعادة الحساب",
      error: error.message,
    });
  }
};

module.exports = exports;
