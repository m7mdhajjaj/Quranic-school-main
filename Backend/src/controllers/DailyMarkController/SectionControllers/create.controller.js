const Section = require("../../../schema/DailyMark/Section");
const { notifySectionAdded } = require("../../../Notifications/handlers/DailyMarks/sectionNotifications");
const { updateSectionMarksStatus } = require("./sectionMarksStatus");
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
    };

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
    
    sendCreated(res, sectionWithStatus, "تم إنشاء المقطع بنجاح");
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
