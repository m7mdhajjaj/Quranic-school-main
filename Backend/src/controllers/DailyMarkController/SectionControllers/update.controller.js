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
         if (updateData.memorizationMeta !== undefined) {
             const memValidation = await sequenceService.validateSequence(
                 updateData.memorizationMeta,
                 targetGroup,
                 'memorization',
                 updateData.date || section.date, 
                 section._id 
             );
             
             if (!memValidation.isValid) {
                 return sendValidationError(res, memValidation.message);
             }
         }

         // Check Review
         if (updateData.reviewMeta !== undefined) {
             const revValidation = await sequenceService.validateSequence(
                 updateData.reviewMeta,
                 targetGroup,
                 'review',
                 updateData.date || section.date, 
                 section._id,
                 // Pass sibling memorization if available in this update, or fallback to existing
                 updateData.memorizationMeta !== undefined ? updateData.memorizationMeta : section.memorizationMeta
             );

             if (!revValidation.isValid) {
                 return sendValidationError(res, revValidation.message);
             }
         }

         // Check Consistency (Internal Consistency)
         // Use new data if provided, otherwise fallback to existing meta, but handle empty arrays correctly
         const memMetaToCheck = updateData.memorizationMeta !== undefined ? updateData.memorizationMeta : section.memorizationMeta;
         const revMetaToCheck = updateData.reviewMeta !== undefined ? updateData.reviewMeta : section.reviewMeta;
         
         const consistencyValidation = sequenceService.validateConsistency(
            memMetaToCheck,
            revMetaToCheck
         );

         if (!consistencyValidation.isValid) {
            return sendValidationError(res, consistencyValidation.message);
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
      // Async update
      TimeTable.findByIdAndUpdate(updatedSection.timetableId, {
        sessionDate: updatedSection.date
      }).catch(err => console.error("Timetable sync error:", err));
    }

    // إرسال إشعارات لجميع طلاب الحلقة (Fire-and-forget)
    const io = req.app.get("io");
    if (io && updatedSection.group) {
       notifySectionUpdated(updatedSection, oldSection, io)
        .catch(err => console.error("Notification Error (Async):", err));
    }
 
    sendSuccess(res, updatedSection, "تم تحديث المقطع بنجاح");
  } catch (error) {
    sendError(res, error.message, 400, error);
  }
};
