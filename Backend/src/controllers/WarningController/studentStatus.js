// ============================================================================
// WarningController/studentStatus.js - Student Status Check Operations
// ============================================================================

const Warning = require("../../schema/Warning");

/**
 * التحقق من حالة الطالب (مفصول أم لا)
 * @route GET /api/warnings/status/:studentId
 */
exports.checkStudentStatus = async (req, res) => {
  try {
    const { studentId } = req.params;

    // البحث عن إنذار فصل نهائي (يجب أن يكون نشطاً)
    const expulsion = await Warning.findOne({
      studentId,
      type: "expulsion",
      status: "active"
    });

    // البحث عن إنذارات فصل نشطة (الإنذار الثالث يعتبر فصل)
    const activeSuspension = await Warning.findOne({
      studentId,
      type: { $in: ["third"] }, // الثالث يعتبر فصل
      status: "active"
    });

    // البحث عن حظر دائم من الأنشطة
    const permanentBan = await Warning.findOne({
      studentId,
      $or: [{ type: "third" }, { type: "expulsion" }],
      status: "active"
    });

    // حساب حظر مؤقت من الأنشطة (مثلاً الإنذار الثاني)
    const temporaryBan = await Warning.findOne({
      studentId,
      type: "second",
      status: "active"
    });

    let activitiesBanEndDate = null;
    if (temporaryBan) {
      const banEndDate = new Date(temporaryBan.createdAt); // استخدام createdAt
      banEndDate.setMonth(banEndDate.getMonth() + 1); // شهر واحد
      if (banEndDate > new Date()) {
        activitiesBanEndDate = banEndDate;
      }
    }

    res.json({
      isPermanentlyExpelled: !!expulsion,
      isTemporarilySuspended: !!activeSuspension,
      suspensionEndDate: null, // لم يعد لدينا endDate محدد في السكيما، الفصل مفتوح حتى الإعادة
      isPermanentlyBannedFromActivities: !!permanentBan,
      isTemporarilyBannedFromActivities: !!activitiesBanEndDate,
      activitiesBanEndDate,
    });
  } catch (error) {
    console.error("Error checking student status:", error);
    res.status(500).json({ message: "حدث خطأ أثناء التحقق من حالة الطالب" });
  }
};
