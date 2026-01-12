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
    const targetDate = updateData.date || section.date;
    const targetGroup = updateData.group || section.group;
    
    if (targetGroup) {
         // 0.5 Check Weekly Quota (If date changes)
         if (updateData.date && new Date(updateData.date).getTime() !== new Date(section.date).getTime()) {
             const weeklyCheck = await sequenceService.checkWeeklyQuota(
                 targetGroup,
                 targetDate,
                 section._id.toString()
             );
             if (!weeklyCheck.isValid) {
                 return sendValidationError(res, weeklyCheck.message);
             }
         }

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

    // ✅ Auto-sync TimeTable if linked
    if (updatedSection.timetableId) {
      const timetableUpdates = {};
      
      // 1. Sync date if changed
      if (updateData.date && new Date(updateData.date).getTime() !== new Date(oldSection.date).getTime()) {
        timetableUpdates.sessionDate = updatedSection.date;
      }
      
      // 2. Auto-sync sessionType based on section content
      const hasMem = (updateData.memorizationMeta || section.memorizationMeta)?.length > 0;
      const hasRev = (updateData.reviewMeta || section.reviewMeta)?.length > 0;
      
      let newSessionType;
      if (hasMem && hasRev) {
        newSessionType = 'both';
      } else if (hasMem) {
        newSessionType = 'hifz';
      } else if (hasRev) {
        newSessionType = 'murajaah';
      }
      
      if (newSessionType) {
        timetableUpdates.sessionType = newSessionType;
      }
      
      // Apply updates if any
      if (Object.keys(timetableUpdates).length > 0) {
        TimeTable.findByIdAndUpdate(
          typeof updatedSection.timetableId === 'object' ? updatedSection.timetableId._id : updatedSection.timetableId,
          timetableUpdates
        ).catch(err => console.error("Timetable sync error:", err));
      }
    }

    // إرسال إشعارات لجميع طلاب الحلقة (Fire-and-forget)
    const io = req.app.get("io");
    if (io && updatedSection.group) {
       notifySectionUpdated(updatedSection, oldSection, io)
        .catch(err => console.error("Notification Error (Async):", err));
    }
 
    // Check for completed Surahs from the UPDATE data
    const completedMem = sequenceService.detectCompletedSurahs(updateData.memorizationMeta, 'memorization');
    const completedRev = sequenceService.detectCompletedSurahs(updateData.reviewMeta, 'review');
    const allCompleted = [...completedMem, ...completedRev];

    // manual sendSuccess to include meta
    res.status(200).json({
      success: true,
      message: "تم تحديث المقطع بنجاح",
      data: updatedSection,
      meta: {
          completedSurahs: allCompleted
      }
    });

  } catch (error) {
    sendError(res, error.message, 400, error);
  }
};
