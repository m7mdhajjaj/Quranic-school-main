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

/**
 * Bulk delete sections
 * @route DELETE /api/daily-marks/sections/bulk
 * @body { sectionIds: string[] }
 */
exports.bulkDeleteSections = async (req, res) => {
  try {
    const { sectionIds } = req.body;

    if (!sectionIds || !Array.isArray(sectionIds) || sectionIds.length === 0) {
      return sendError(res, "يجب توفير قائمة بمعرفات المقاطع", 400);
    }

    console.log(`🗑️ بدء حذف ${sectionIds.length} مقطع...`);

    // جلب المقاطع للحصول على timetableIds
    const sections = await Section.find({ _id: { $in: sectionIds } }).select('timetableId group');
    
    // جمع timetableIds المرتبطة
    const timetableIds = sections
      .filter(s => s.timetableId)
      .map(s => s.timetableId);

    // حذف TimeTables المرتبطة
    if (timetableIds.length > 0) {
      await TimeTable.deleteMany({ _id: { $in: timetableIds } });
      console.log(`🗑️ تم حذف ${timetableIds.length} TimeTable مرتبط`);
    }

    // إرسال إشعارات في الخلفية
    const io = req.app.get("io");
    for (const section of sections) {
      if (io && section.group) {
        notifySectionDeleted(section, io).catch(err => 
          console.error("⚠️ Error sending delete notification:", err)
        );
      }
    }

    // حذف العلامات المرتبطة
    const marksResult = await DailyMark.deleteMany({ sectionId: { $in: sectionIds } });
    console.log(`🗑️ تم حذف ${marksResult.deletedCount} علامة مرتبطة`);

    // حذف المقاطع
    const sectionsResult = await Section.deleteMany({ _id: { $in: sectionIds } });
    console.log(`🗑️ تم حذف ${sectionsResult.deletedCount} مقطع`);

    sendSuccess(res, { 
      deletedCount: sectionsResult.deletedCount,
      deletedSectionIds: sectionIds,
      deletedTimeTables: timetableIds.length,
      deletedMarks: marksResult.deletedCount
    }, `تم حذف ${sectionsResult.deletedCount} مقطع بنجاح.`);
  } catch (error) {
    console.error("❌ Error in bulkDeleteSections:", error);
    sendError(res, error.message, 500, error);
  }
};

