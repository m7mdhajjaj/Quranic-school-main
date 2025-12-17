// ============================================================================
// Monthly Points Service - خدمات إدارة النقاط الشهرية
// ============================================================================

const MonthlyPoints = require("../../schema/MonthlyPoints");
const DailyPoints = require("../../schema/DailyPoints");
const { getCurrentMonth, getMonthRange } = require("../../utils/helpers/dateHelpers");

/**
 * تحديث نقاط الشهر الحالي للطالب
 */
async function updateMonthlyPoints(studentId, dailyPoints, student) {
  try {
    const { month, year } = getCurrentMonth();

    // البحث عن سجل الشهر الحالي أو إنشاء واحد جديد
    let monthlyPoints = await MonthlyPoints.findOne({
      studentId,
      month,
      year,
    });

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
      // ✅ حافظ على توافق بيانات المعلم/الحلقة دائماً (حتى لو تغيّرت بيانات الطالب)
      monthlyPoints.teacher = student.teacher;
      monthlyPoints.group = student.group;
    }

    // حساب مجموع نقاط الشهر الحالي
    const { startOfMonth, endOfMonth } = getMonthRange(month, year);

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
    return monthlyPoints;
  } catch (error) {
    console.error("خطأ في تحديث نقاط الشهر:", error);
    throw error;
  }
}

/**
 * إعادة حساب النقاط الشهرية لجميع الطلاب
 */
async function recalculateAllMonthlyPoints(Student) {
  try {
    const { month, year } = getCurrentMonth();
    const { startOfMonth, endOfMonth } = getMonthRange(month, year);

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

    return { created, updated, totalStudents: studentsWithPoints.length };
  } catch (error) {
    console.error("خطأ في إعادة الحساب:", error);
    throw error;
  }
}

module.exports = {
  updateMonthlyPoints,
  recalculateAllMonthlyPoints,
};
