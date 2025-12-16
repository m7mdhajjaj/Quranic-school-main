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

    // إرسال إشعارات في الخلفية (بدون انتظار)
    const io = req.app.get("io");
    if (io && section.group) {
      notifySectionDeleted(section, io).catch(err => 
        console.error("⚠️ Error sending delete notification:", err)
      );
    }

    // تنفيذ عمليات الحذف بشكل متوازي لتحسين الأداء
    await Promise.all([
      DailyMark.deleteMany({ sectionId: req.params.id }),
      Section.findByIdAndDelete(req.params.id)
    ]);

    sendSuccess(res, { deletedId: req.params.id }, "تم حذف المقطع وجميع علاماته بنجاح");
  } catch (error) {
    sendError(res, error.message, 500, error);
  }
};
