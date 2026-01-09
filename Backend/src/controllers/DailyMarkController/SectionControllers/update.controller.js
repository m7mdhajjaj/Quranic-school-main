const Section = require("../../../schema/DailyMark/Section");
const TimeTable = require("../../../schema/TimeTable");
const { notifySectionUpdated } = require("../../../Notifications");
const sequenceService = require("../../../services/DailyMark/SectionSequenceService");
const {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
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

    // ============================================
    // 🛡️ Advanced Conflict Check (Update)
    // ============================================
    // Ensure we don't create overlap or gaps when updating
    const targetGroup = updateData.group || section.group;
    
    if (targetGroup) {
         // Check Memorization
         if (updateData.memorizationMeta) {
             const memValidation = await sequenceService.validateSequence(
                 updateData.memorizationMeta,
                 targetGroup,
                 'memorization',
                 updateData.date || section.date, // Pass date
                 section._id // Exclude self
             );
             
             if (!memValidation.isValid) {
                 return sendValidationError(res, memValidation.message);
             }
         }

         // Check Review
         if (updateData.reviewMeta) {
             const revValidation = await sequenceService.validateSequence(
                 updateData.reviewMeta,
                 targetGroup,
                 'review',
                 updateData.date || section.date, // Pass date
                 section._id
             );

             if (!revValidation.isValid) {
                 return sendValidationError(res, revValidation.message);
             }
         }
    }

    // حفظ المقطع القديم للمقارنة
    const oldSection = { ...section.toObject() };

    const updatedSection = await Section.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('timetableId', 'day startHour endHour sessionType');

    // ✅ Sync date with TimeTable if linked
    // إذا تغير التاريخ وكان هناك موعد مرتبط، نحدّث تاريخ الموعد أيضاً ليظل متطابقاً
    if (updatedSection.timetableId && updateData.date && 
        new Date(updateData.date).getTime() !== new Date(oldSection.date).getTime()) {
      await TimeTable.findByIdAndUpdate(updatedSection.timetableId, {
        sessionDate: updatedSection.date
      });
      console.log(`🔄 Synced TimeTable date for Section ${updatedSection._id}`);
    }

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
