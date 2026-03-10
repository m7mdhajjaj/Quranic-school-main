const Section = require("../../../schema/DailyMark/Section");
const Group = require("../../../schema/Group");
const Teacher = require("../../../schema/Teacher");
const { notifySectionAdded } = require("../../../Notifications");
const { updateSectionMarksStatus } = require("./sectionMarksStatus");
const sequenceService = require("../../../services/DailyMark/SectionSequenceService");
const activeSurahService = require("../../../services/DailyMark/GroupActiveSurahService");
const { createLogger } = require("../../../utils/logger");
const {
  getSurahByNumber,
} = require("../../../utils/Quran/dailyMarkQuranMetadata");
const {
  sendCreated,
  sendError,
  sendValidationError,
} = require("../utils/responseHelpers");

const logger = createLogger("SectionCreate");

/**
 * Create a new section
 *
 * Validation Rules:
 * - Date must be today or in the future (cannot create sections with past dates)
 * - Review section and memorization section are required
 * - Group and teacher are optional
 */
exports.createSection = async (req, res) => {
  try {
    logger.debug("Creating section with original data:", req.body);
    logger.debug("Using validated data:", req.validatedData);

    // Use validated data from middleware
    const sectionData = req.validatedData || {
      date: req.body.date,
      reviewSection: req.body.reviewSection,
      memorizationSection: req.body.memorizationSection,
      group: req.body.group,
      teacher: req.body.teacher,
      memorizationMeta: req.body.memorizationMeta,
      reviewMeta: req.body.reviewMeta,
    };

    // ✅ جلب groupId من اسم الحلقة (إذا لم يكن موجود)
    if (sectionData.group && !sectionData.groupId) {
      const groupDoc = await Group.findOne({ name: sectionData.group.trim() });
      if (groupDoc) {
        sectionData.groupId = groupDoc._id;
        logger.debug(`تم ربط Section بـ Group: ${groupDoc._id}`);
      }
    }

    // ✅ جلب teacherId من اسم المعلم (إذا لم يكن موجود)
    if (sectionData.teacher && !sectionData.teacherId) {
      // البحث عن المعلم بالاسم الكامل أو جزء منه
      const nameParts = sectionData.teacher.trim().split(" ");
      let teacherDoc = null;

      if (nameParts.length >= 2) {
        teacherDoc = await Teacher.findOne({
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(" "),
        });
      }

      if (!teacherDoc) {
        // محاولة البحث بالاسم الأول فقط
        teacherDoc = await Teacher.findOne({
          $or: [
            { firstName: sectionData.teacher.trim() },
            { lastName: sectionData.teacher.trim() },
          ],
        });
      }

      if (teacherDoc) {
        sectionData.teacherId = teacherDoc._id;
        logger.debug(`تم ربط Section بـ Teacher: ${teacherDoc._id}`);
      }
    }

    // ============================================
    // Validation checks skipped - free text mode
    // ============================================

    const section = new Section(sectionData);

    logger.debug("Section object created:", section);
    let newSection = await section.save();
    logger.success("Section saved successfully:", newSection);

    // ✅ Populate timetableId for complete response
    newSection = await Section.findById(newSection._id)
      .populate("timetableId", "day startHour endHour sessionType")
      .lean();

    // ============================================
    // 🔄 V15: SYNC ACTIVE SURAH - مزامنة السورة الفعالة من جميع المقاطع
    // ✅ الآن يحسب lastAyahEnd من جميع مقاطع نفس السورة في DB
    // ============================================
    if (sectionData.groupId) {
      try {
        await activeSurahService.syncActiveSurahsFromSections(
          sectionData.groupId,
        );
        logger.debug(
          `✅ تمت مزامنة السورة الفعالة للحلقة ${sectionData.group}`,
        );
      } catch (syncError) {
        logger.warn(`⚠️ خطأ في مزامنة السورة الفعالة:`, syncError);
      }
    }
    // ============================================

    // Fire-and-forget: Status Update (Background)
    updateSectionMarksStatus(newSection._id.toString(), newSection.group)
      .then(() => logger.debug("Status updated in background"))
      .catch((err) => logger.warn("Async Status Update Error:", err));

    // Fire-and-forget: Notification (Background)
    const io = req.app.get("io");
    if (io && newSection.group) {
      notifySectionAdded(newSection, io).catch((err) =>
        logger.warn("Async Notification Error:", err),
      );
    }

    // Check for completed Surahs
    const completedMem = sequenceService.detectCompletedSurahs(
      sectionData.memorizationMeta,
      "memorization",
    );
    const completedRev = sequenceService.detectCompletedSurahs(
      sectionData.reviewMeta,
      "review",
    );
    const allCompleted = [...completedMem, ...completedRev];

    // ✅ تحديد نوع الجلسة تلقائياً بناءً على المحتوى
    const hasMem = sectionData.memorizationMeta?.length > 0;
    const hasRev = sectionData.reviewMeta?.length > 0;
    let suggestedSessionType = "both";
    if (hasMem && !hasRev) suggestedSessionType = "hifz";
    else if (!hasMem && hasRev) suggestedSessionType = "murajaah";

    res.status(201).json({
      success: true,
      message: "تم إنشاء المقطع بنجاح. هل تريد تحديد موعد لهذا المقطع؟",
      data: newSection,
      meta: {
        askForSchedule: true,
        sectionId: newSection._id,
        groupId: newSection.groupId,
        teacherId: newSection.teacherId,
        suggestedSessionType, // ✅ نوع الجلسة المقترح
        completedSurahs: allCompleted,
      },
    });
  } catch (error) {
    logger.error("Error creating section:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors)
        .map((field) => `${field}: ${error.errors[field].message}`)
        .join(", ");

      return sendValidationError(
        res,
        `خطأ في التحقق من البيانات: ${validationErrors}`,
      );
    }

    sendError(res, error.message, 400, error);
  }
};
