// ============================================================================
// WarningController/studentStatus.js - Student Status Check Operations
// ============================================================================

const Warning = require("../../schema/Warning");

/**
 * التحقق من حالة الطالب (مفصول أم لا)
 * ✅ OPTIMIZED: استعلام واحد بدلاً من 4 استعلامات
 * @route GET /api/warnings/status/:studentId
 */
exports.checkStudentStatus = async (req, res) => {
  try {
    const { studentId } = req.params;

    // ⚡️ استعلام واحد لجلب جميع الإنذارات النشطة
    const activeWarnings = await Warning.find({
      studentId,
      status: "active"
    }).select('type createdAt').lean();

    // تجميع الإنذارات حسب النوع
    const warningsByType = activeWarnings.reduce((acc, w) => {
      acc[w.type] = w;
      return acc;
    }, {});

    const hasExpulsion = !!warningsByType['expulsion'];
    const hasThird = !!warningsByType['third'];
    const hasSecond = !!warningsByType['second'];

    // حساب حظر مؤقت من الأنشطة (الإنذار الثاني - شهر واحد)
    let activitiesBanEndDate = null;
    if (hasSecond) {
      const banEndDate = new Date(warningsByType['second'].createdAt);
      banEndDate.setMonth(banEndDate.getMonth() + 1);
      if (banEndDate > new Date()) {
        activitiesBanEndDate = banEndDate;
      }
    }

    res.json({
      isPermanentlyExpelled: hasExpulsion,
      isTemporarilySuspended: hasThird,
      suspensionEndDate: null, // الفصل مفتوح حتى الإعادة
      isPermanentlyBannedFromActivities: hasExpulsion || hasThird,
      isTemporarilyBannedFromActivities: !!activitiesBanEndDate,
      activitiesBanEndDate,
    });
  } catch (error) {
    console.error("Error checking student status:", error);
    res.status(500).json({ message: "حدث خطأ أثناء التحقق من حالة الطالب" });
  }
};
