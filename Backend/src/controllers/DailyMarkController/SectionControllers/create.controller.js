const Section = require("../../../schema/DailyMark/Section");
const { notifySectionAdded } = require("../../../Notifications");
const { updateSectionMarksStatus } = require("./sectionMarksStatus");
const sequenceService = require("../../../services/DailyMark/SectionSequenceService"); // Import New Service
const {
  sendCreated,
  sendError,
  sendValidationError,
} = require("../utils/responseHelpers");

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
    // 🛡️ Advanced Conflict Check (Group Level) - V3: Date-Aware + Backfilling
    // ============================================
    if (sectionData.group) {
        
        // 0. Daily Limit Check (One Section Per Day)
        const dailyCheck = await sequenceService.checkDailyQuota(
            sectionData.group,
            sectionData.date
        );
        if (!dailyCheck.isValid && dailyCheck.isBlocked) {
             return sendError(res, dailyCheck.message, 400); 
        }

        // 1. Check Memorization Sequence (Date-Aware with Neighbors)
        const memValidation = await sequenceService.validateSequence(
            sectionData.memorizationMeta,
            sectionData.group,
            'memorization',
            sectionData.date // ✅ V3: Date for neighbor queries
        );
        
        if (!memValidation.isValid) {
            return sendValidationError(res, memValidation.message);
        }

        // 2. Check Review (Exact Match + Same-Day Duplicates with dateKey)
        const revValidation = await sequenceService.validateSequence(
             sectionData.reviewMeta,
             sectionData.group,
             'review',
             sectionData.date, // ✅ V3: Date for dateKey comparison
             null, // No exclude (new section)
             sectionData.memorizationMeta // Pass sibling memorization
        );

        if (!revValidation.isValid) {
             return sendValidationError(res, revValidation.message);
        }

        // 3. Check Consistency (Internal Consistency)
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
    
    // Fire-and-forget: Status Update (Background)
    updateSectionMarksStatus(newSection._id.toString(), newSection.group)
      .then(() => console.log("✅ Status updated in background"))
      .catch(err => console.error("⚠️ Async Status Update Error:", err));

    // Fire-and-forget: Notification (Background)
    const io = req.app.get("io");
    if (io && newSection.group) {
      notifySectionAdded(newSection, io)
        .catch(err => console.error("⚠️ Async Notification Error:", err));
    }

    res.status(201).json({
      success: true,
      message: "تم إنشاء المقطع بنجاح. هل تريد تحديد موعد لهذا المقطع؟",
      data: newSection, // Send created object directly
      meta: {
        askForSchedule: true,
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
