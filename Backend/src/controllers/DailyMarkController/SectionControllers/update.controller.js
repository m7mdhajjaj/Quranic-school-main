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
    // 🛡️ Advanced Conflict Check (Update) - V3: Date-Aware
    // ============================================
    const targetGroup = updateData.group || section.group;
    const targetDate = updateData.date || section.date;
    
    if (targetGroup) {
         // Check Memorization (with excludeSectionId)
         if (updateData.memorizationMeta) {
             const memValidation = await sequenceService.validateSequence(
                 updateData.memorizationMeta,
                 targetGroup,
                 'memorization',
                 targetDate, // ✅ V3: pass date for neighbor queries
                 section._id.toString() // ✅ Exclude self
             );
             
             if (!memValidation.isValid) {
                 return sendValidationError(res, memValidation.message);
             }
         }

         // Check Review (with excludeSectionId)
         if (updateData.reviewMeta) {
             const revValidation = await sequenceService.validateSequence(
                 updateData.reviewMeta,
                 targetGroup,
                 'review',
                 targetDate, // ✅ V3: pass date for dateKey checks
                 section._id.toString(), // ✅ Exclude self
                 updateData.memorizationMeta || section.memorizationMeta // Pass sibling memorization
             );

             if (!revValidation.isValid) {
                 return sendValidationError(res, revValidation.message);
             }
         }

         // Check Consistency (Internal Consistency)
         const memMetaToCheck = updateData.memorizationMeta || section.memorizationMeta;
         const revMetaToCheck = updateData.reviewMeta || section.reviewMeta;
         
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

    // ✅ V3: Use findByIdAndUpdate with runValidators
    const updatedSection = await Section.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true // ✅ Ensure schema validators run (dateKey, canonicalKey auto-generation)
      }
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
