const Section = require("../../../schema/DailyMark/Section");
const { notifySectionAdded } = require("../../../Notifications");
const { updateSectionMarksStatus } = require("./sectionMarksStatus");
const sequenceService = require("../../../services/DailyMark/SectionSequenceService"); // Import New Service
const {
  sendCreated,
  sendError,
  sendValidationError,
} = require("../utils/responseHelpers");

// Legacy checker removed
// const { checkSectionOverlaps, checkSequenceGap } = require("./utils/overlapChecker");

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
    console.log(" Creating section with original data:", req.body);
    console.log(" Using validated data:", req.validatedData);

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

    // ============================================
    // 🛡️ Advanced Conflict Check (Group Level) - Using Centralized Service
    // ============================================
    if (sectionData.group) {
        
        // 1. Check Memorization Sequence & Overlaps
        // (Strict No-Overlap + Strict No-Gaps)
        const memValidation = await sequenceService.validateSequence(
            sectionData.memorizationMeta,
            sectionData.group,
            'memorization',
            sectionData.date // NEW: Pass date for context
        );
        
        if (!memValidation.isValid) {
            return sendValidationError(res, memValidation.message);
        }

        // 2. Check Review Overlaps
        // (Prevents Same-Day Duplicates)
        const revValidation = await sequenceService.validateSequence(
             sectionData.reviewMeta,
             sectionData.group,
             'review',
             sectionData.date // NEW: Pass date for duplicate check
        );

        if (!revValidation.isValid) {
             return sendValidationError(res, revValidation.message);
        }

        // 3. Check Consistency (Internal Consistency)
        // (Review must be strictly BEFORE Memorization for same Surah)
        const consistencyValidation = sequenceService.validateConsistency(
            sectionData.memorizationMeta,
            sectionData.reviewMeta
        );

        if (!consistencyValidation.isValid) {
            return sendValidationError(res, consistencyValidation.message);
        }
    }

    const section = new Section(sectionData);

    console.log(" Section object created:", section);
    const newSection = await section.save();
    console.log(" Section saved successfully:", newSection);
    
    // تحديث حالة علامات المقطع (سيكون not_started لأنه جديد)
    try {
      await updateSectionMarksStatus(newSection._id.toString(), newSection.group);
      console.log("✅ تم تحديث حالة علامات المقطع الجديد");
    } catch (statusError) {
      console.error("⚠️ خطأ في تحديث حالة علامات المقطع:", statusError);
    }
    
    // إرسال إشعار للطلاب المعنيين
    const io = req.app.get("io");
    if (io && newSection.group) {
      await notifySectionAdded(newSection, io);
    }
    
    // إعادة جلب المقطع مع الحالة المحدثة
    const sectionWithStatus = await Section.findById(newSection._id).lean();
    
    // sendCreated(res, sectionWithStatus, "تم إنشاء المقطع بنجاح");
    res.status(201).json({
      success: true,
      message: "تم إنشاء المقطع بنجاح. هل تريد تحديد موعد لهذا المقطع؟",
      data: sectionWithStatus,
      meta: {
        askForSchedule: true, // ✅ إشارة للفرونت إند بطلب تحديد موعد
      }
    });
  } catch (error) {
    console.error(" Error creating section:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors)
        .map((field) => `${field}: ${error.errors[field].message}`)
        .join(", ");

      return sendValidationError(res, `خطأ في التحقق من البيانات: ${validationErrors}`);
    }

    sendError(res, error.message, 400, error);
  }
};
