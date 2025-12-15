const Section = require("../../../schema/DailyMark/Section");
const { notifySectionUpdated } = require("../../../Notifications/handlers/DailyMarks/sectionNotifications");
const {
  sendSuccess,
  sendError,
  sendNotFound,
} = require("../utils/responseHelpers");

/**
 * Update a section
 */
exports.updateSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return sendNotFound(res, "المقطع");
    }

    // Use validated data from middleware
    const updateData = req.validatedData || req.body;

    // حفظ المقطع القديم للمقارنة
    const oldSection = { ...section.toObject() };

    const updatedSection = await Section.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // إرسال إشعارات لجميع طلاب الحلقة
    const io = req.app.get("io");
    if (io && updatedSection.group) {
      await notifySectionUpdated(updatedSection, oldSection, io);
    }
 
    sendSuccess(res, updatedSection, "تم تحديث المقطع بنجاح");
  } catch (error) {
    sendError(res, error.message, 400, error);
  }
};
