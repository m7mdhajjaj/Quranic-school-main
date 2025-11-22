// ============================================================================
// dailyPointsController - إدارة النقاط اليومية
// ============================================================================

const DailyPoints = require("../../schema/DailyPoints");
const Student = require("../../schema/Student");
const { updateBadgeProgress } = require("../../services/PointsGameService/badgeService");
const { updateMonthlyPoints } = require("../../services/PointsGameService/monthlyPointsService");

/**
 * @desc    حفظ النقاط اليومية للطالب
 * @route   POST /api/points-game/daily
 * @access  Private (Student)
 */
exports.saveDailyPoints = async (req, res) => {
  try {
    const studentId = req.user._id;
    const {
      prayers,
      nawafel,
      parentRespect,
      schoolAttendance,
      dailyStudy,
      adhkar,
      halaqah,
      date,
    } = req.body;

    // الحصول على معلومات الطالب
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    // تحديد تاريخ اليوم (بدون الوقت)
    const today = date ? new Date(date) : new Date();
    today.setHours(0, 0, 0, 0);

    // البحث عن سجل موجود لنفس اليوم
    let dailyPoints = await DailyPoints.findOne({
      studentId,
      date: today,
    });

    if (dailyPoints) {
      // تحديث السجل الموجود
      dailyPoints.prayers = prayers;
      dailyPoints.nawafel = nawafel;
      dailyPoints.parentRespect = parentRespect;
      dailyPoints.schoolAttendance = schoolAttendance;
      dailyPoints.dailyStudy = dailyStudy;
      dailyPoints.adhkar = adhkar;
      dailyPoints.halaqah = halaqah;
    } else {
      // إنشاء سجل جديد
      dailyPoints = new DailyPoints({
        studentId,
        date: today,
        prayers,
        nawafel,
        parentRespect,
        schoolAttendance,
        dailyStudy,
        adhkar,
        halaqah,
        group: student.group,
        teacher: student.teacher,
      });
    }

    await dailyPoints.save();

    // تحديث التقدم نحو الشارات
    await updateBadgeProgress(studentId, dailyPoints, student);

    // تحديث نقاط الشهر الحالي
    await updateMonthlyPoints(studentId, dailyPoints, student);

    res.status(200).json({
      success: true,
      message: "تم حفظ النقاط بنجاح",
      data: dailyPoints,
    });
  } catch (error) {
    console.error("خطأ في حفظ النقاط:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حفظ النقاط",
      error: error.message,
    });
  }
};

/**
 * @desc    الحصول على النقاط اليومية للطالب
 * @route   GET /api/points-game/daily/:date?
 * @access  Private (Student)
 */
exports.getDailyPoints = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { date } = req.params;

    // تحديد التاريخ
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const dailyPoints = await DailyPoints.findOne({
      studentId,
      date: targetDate,
    });

    if (!dailyPoints) {
      return res.status(200).json({
        success: true,
        message: "لا توجد نقاط لهذا اليوم",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: dailyPoints,
    });
  } catch (error) {
    console.error("خطأ في جلب النقاط:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب النقاط",
      error: error.message,
    });
  }
};

module.exports = exports;
