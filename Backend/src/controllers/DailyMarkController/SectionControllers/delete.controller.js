// ============================================================================
// Delete Section Controller
// ============================================================================
const Section = require("../../../schema/DailyMark/Section");
const DailyMark = require("../../../schema/DailyMark/DailyMark");
const TimeTable = require("../../../schema/TimeTable");
const { notifySectionDeleted } = require("../../../Notifications");
const smartScheduler = require("../../../services/DailyMark/SmartSchedulerService");
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

    // ✅ حذف TimeTable المرتبط (إذا وجد)
    if (section.timetableId) {
      await TimeTable.findByIdAndDelete(section.timetableId);
      console.log(`🗑️ تم حذف TimeTable المرتبط: ${section.timetableId}`);
    }

    // إرسال إشعارات في الخلفية
    const io = req.app.get("io");
    if (io && section.group) {
      notifySectionDeleted(section, io).catch(err => 
        console.error("⚠️ Error sending delete notification:", err)
      );
    }

    // تنفيذ عمليات الحذف
    await Promise.all([
      DailyMark.deleteMany({ sectionId: req.params.id }),
      Section.findByIdAndDelete(req.params.id)
    ]);

    sendSuccess(res, { 
        deletedId: req.params.id
    }, "تم حذف المقطع بنجاح.");
  } catch (error) {
    sendError(res, error.message, 500, error);
  }
};
