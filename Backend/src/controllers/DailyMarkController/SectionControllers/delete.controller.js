// ============================================================================
// Delete Section Controller
// ============================================================================
const Section = require("../../../schema/DailyMark/Section");
const DailyMark = require("../../../schema/DailyMark/DailyMark");
const { notifySectionDeleted } = require("../../../Notifications");
const {
  sendSuccess,
  sendError,
  sendNotFound,
} = require("../utils/responseHelpers");

/**
 * Delete a section
 */
exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return sendNotFound(res, "المقطع");
    }

    // إرسال إشعارات قبل الحذف
    const io = req.app.get("io");
    if (io && section.group) {
      await notifySectionDeleted(section, io);
    }

    // Delete all marks for this section
    await DailyMark.deleteMany({ sectionId: req.params.id });

    // Delete the section
    await Section.findByIdAndDelete(req.params.id);

    sendSuccess(res, { deletedId: req.params.id }, "تم حذف المقطع وجميع علاماته بنجاح");
  } catch (error) {
    sendError(res, error.message, 500, error);
  }
};
