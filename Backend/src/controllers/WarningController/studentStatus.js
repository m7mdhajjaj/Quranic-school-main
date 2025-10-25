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

    // البحث عن إنذار فصل نهائي
    const expulsion = await Warning.findOne({
      studentId,
      type: "expulsion",
    });

    // البحث عن إنذارات فصل مؤقت نشطة
    const activeSuspension = await Warning.findOne({
      studentId,
      type: { $in: ["first", "second", "third"] },
      isActive: true,
      endDate: { $gt: new Date() },
    });

    // البحث عن حظر دائم من الأنشطة
    const permanentBan = await Warning.findOne({
      studentId,
      $or: [{ type: "third" }, { type: "expulsion" }],
    });

    // حساب حظر مؤقت من الأنشطة
    const temporaryBan = await Warning.findOne({
      studentId,
      type: "second",
      isActive: true,
    });

    let activitiesBanEndDate = null;
    if (temporaryBan) {
      const banEndDate = new Date(temporaryBan.startDate);
      banEndDate.setMonth(banEndDate.getMonth() + 1); // شهر واحد
      if (banEndDate > new Date()) {
        activitiesBanEndDate = banEndDate;
      }
    }

    res.json({
      isPermanentlyExpelled: !!expulsion,
      isTemporarilySuspended: !!activeSuspension,
      suspensionEndDate: activeSuspension?.endDate || null,
      isPermanentlyBannedFromActivities: !!permanentBan,
      isTemporarilyBannedFromActivities: !!activitiesBanEndDate,
      activitiesBanEndDate,
    });
  } catch (error) {
    console.error("Error checking student status:", error);
    res.status(500).json({ message: "حدث خطأ أثناء التحقق من حالة الطالب" });
  }
};
