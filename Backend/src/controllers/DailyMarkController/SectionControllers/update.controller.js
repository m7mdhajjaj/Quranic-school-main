const Section = require("../../../schema/DailyMark/Section");
const TimeTable = require("../../../schema/TimeTable");
const Group = require("../../../schema/Group");
const Teacher = require("../../../schema/Teacher");
const { notifySectionUpdated } = require("../../../Notifications");
const sequenceService = require("../../../services/DailyMark/SectionSequenceService");
const activeSurahService = require("../../../services/DailyMark/GroupActiveSurahService");
const { createLogger } = require("../../../utils/logger");
const { getSurahByNumber } = require("../../../utils/Quran/dailyMarkQuranMetadata");
const {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} = require("../utils/responseHelpers");

const logger = createLogger('SectionUpdate');

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

    // ✅ جلب groupId من اسم الحلقة (إذا تم تحديث اسم الحلقة)
    if (updateData.group && updateData.group !== section.group) {
      const groupDoc = await Group.findOne({ name: updateData.group.trim() });
      if (groupDoc) {
        updateData.groupId = groupDoc._id;
        logger.debug(`تم تحديث groupId إلى: ${groupDoc._id}`);
      }
    }

    // ✅ جلب teacherId من اسم المعلم (إذا تم تحديث اسم المعلم)
    if (updateData.teacher && updateData.teacher !== section.teacher) {
      const nameParts = updateData.teacher.trim().split(' ');
      let teacherDoc = null;
      
      if (nameParts.length >= 2) {
        teacherDoc = await Teacher.findOne({
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' ')
        });
      }
      
      if (!teacherDoc) {
        teacherDoc = await Teacher.findOne({
          $or: [
            { firstName: updateData.teacher.trim() },
            { lastName: updateData.teacher.trim() }
          ]
        });
      }
      
      if (teacherDoc) {
        updateData.teacherId = teacherDoc._id;
        logger.debug(`تم تحديث teacherId إلى: ${teacherDoc._id}`);
      }
    }

    // ============================================
    // 🛡️ Advanced Conflict Check (Update) - V3: Date-Aware
    // ============================================
    const targetDate = updateData.date || section.date;
    const targetGroup = updateData.group || section.group;
    const targetGroupId = updateData.groupId || section.groupId;
    
    if (targetGroup) {
         // ✅ V7: Current Week Only Check (عند تغيير التاريخ)
         if (updateData.date && new Date(updateData.date).getTime() !== new Date(section.date).getTime()) {
             const currentWeekCheck = sequenceService.checkCurrentWeekOnly(targetDate);
             if (!currentWeekCheck.isValid) {
                 return sendValidationError(res, currentWeekCheck.message);
             }
         }

         // ✅ 0. Check Daily Quota (If date changes)
         if (updateData.date && new Date(updateData.date).getTime() !== new Date(section.date).getTime()) {
             const dailyCheck = await sequenceService.checkDailyQuota(
                 targetGroup,
                 targetDate,
                 section._id.toString() // استثناء المقطع الحالي
             );
             if (dailyCheck.isBlocked) {
                 return sendValidationError(res, dailyCheck.message);
             }
         }
         
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

         // ============================================
         // 🔒 V6: ACTIVE SURAH VALIDATION - منع البدء بسورة جديدة قبل إكمال الحالية
         // ============================================
         if (targetGroupId) {
           // التحقق من مقاطع الحفظ (إذا تم تغيير السورة)
           if (updateData.memorizationMeta && updateData.memorizationMeta.length > 0) {
             const newMemSurah = updateData.memorizationMeta[0].surahNumber;
             const oldMemSurah = section.memorizationMeta?.[0]?.surahNumber;
             
             // فقط إذا تغيرت السورة
             if (newMemSurah !== oldMemSurah) {
               const canAddMem = await Group.canAddSegment(targetGroupId, newMemSurah, 'memorization');
               
               if (!canAddMem.allowed) {
                 logger.warn("Active Surah Check (Memorization) failed:", canAddMem.reason);
                 return sendError(res, canAddMem.reason, 400);
               }
             }
           }

           // التحقق من مقاطع المراجعة (إذا تم تغيير السورة)
           if (updateData.reviewMeta && updateData.reviewMeta.length > 0) {
             const newRevSurah = updateData.reviewMeta[0].surahNumber;
             const oldRevSurah = section.reviewMeta?.[0]?.surahNumber;
             
             // فقط إذا تغيرت السورة
             if (newRevSurah !== oldRevSurah) {
               const canAddRev = await Group.canAddSegment(targetGroupId, newRevSurah, 'review');
               
               if (!canAddRev.allowed) {
                 logger.warn("Active Surah Check (Review) failed:", canAddRev.reason);
                 return sendError(res, canAddRev.reason, 400);
               }
             }
           }
         }
         // ============================================

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
    )
    .populate('timetableId', 'day startHour endHour sessionType')
    .populate('groupId', 'name')
    .populate('teacherId', 'firstName lastName');

    // ✅ Auto-sync TimeTable if linked
    if (updatedSection.timetableId) {
      const timetableUpdates = {};
      
      // 1. Sync date if changed
      if (updateData.date && new Date(updateData.date).getTime() !== new Date(oldSection.date).getTime()) {
        timetableUpdates.sessionDate = updatedSection.date;
      }
      
      // 2. Sync groupId and note if group changed
      if (updateData.groupId || updateData.group) {
        timetableUpdates.groupId = updatedSection.groupId;
        timetableUpdates.note = updatedSection.group;
      }
      
      // 3. Sync teacherId if teacher changed
      if (updateData.teacherId) {
        timetableUpdates.teacherId = updatedSection.teacherId;
      }
      
      // 4. Auto-sync sessionType based on section content
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
      
      // 5. Sync sectionInfo for quick display
      timetableUpdates.sectionInfo = {
        memorizationSection: updatedSection.memorizationSection,
        reviewSection: updatedSection.reviewSection,
        marksStatus: updatedSection.marksStatus,
      };
      
      // Apply updates if any
      if (Object.keys(timetableUpdates).length > 0) {
        TimeTable.findByIdAndUpdate(
          typeof updatedSection.timetableId === 'object' ? updatedSection.timetableId._id : updatedSection.timetableId,
          timetableUpdates
        ).catch(err => logger.warn("Timetable sync error:", err));
        logger.debug(`TimeTable synced with Section ${updatedSection._id}`);
      }
    }

    // إرسال إشعارات لجميع طلاب الحلقة (Fire-and-forget)
    const io = req.app.get("io");
    if (io && updatedSection.group) {
       notifySectionUpdated(updatedSection, oldSection, io)
        .catch(err => logger.warn("Notification Error (Async):", err));
    }
 
    // Check for completed Surahs from the UPDATE data
    const completedMem = sequenceService.detectCompletedSurahs(updateData.memorizationMeta, 'memorization');
    const completedRev = sequenceService.detectCompletedSurahs(updateData.reviewMeta, 'review');
    const allCompleted = [...completedMem, ...completedRev];

    // ============================================
    // 🔄 V15: SYNC ACTIVE SURAH - مزامنة السورة الفعالة من جميع المقاطع
    // ✅ الآن يحسب lastAyahEnd من جميع مقاطع نفس السورة في DB
    // ============================================
    if (targetGroupId) {
      try {
        await activeSurahService.syncActiveSurahsFromSections(targetGroupId);
        logger.debug(`✅ تمت مزامنة السورة الفعالة للحلقة ${targetGroup}`);
      } catch (syncError) {
        logger.warn(`⚠️ خطأ في مزامنة السورة الفعالة:`, syncError);
      }
    }
    // ============================================

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
