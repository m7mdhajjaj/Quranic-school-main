const Section = require("../../../schema/DailyMark/Section");
const Group = require("../../../schema/Group");
const Teacher = require("../../../schema/Teacher");
const { notifySectionAdded } = require("../../../Notifications");
const { updateSectionMarksStatus } = require("./sectionMarksStatus");
const sequenceService = require("../../../services/DailyMark/SectionSequenceService");
const { createLogger } = require("../../../utils/logger");
const { getSurahByNumber } = require("../../../utils/Quran/dailyMarkQuranMetadata");
const {
  sendCreated,
  sendError,
  sendValidationError,
} = require("../utils/responseHelpers");

const logger = createLogger('SectionCreate');

/**
 * Create a new section
 * 
 * Validation Rules:
 * - Date must be today or in the future (cannot create sections with past dates)
 * - Review section and memorization section are required
 * - Group and teacher are optional
 */
exports.createSection = async (req, res) => {
  try {
    logger.debug("Creating section with original data:", req.body);
    logger.debug("Using validated data:", req.validatedData);

    // Use validated data from middleware
    const sectionData = req.validatedData || {
      date: req.body.date,
      reviewSection: req.body.reviewSection,
      memorizationSection: req.body.memorizationSection,
      group: req.body.group,
      teacher: req.body.teacher,
      memorizationMeta: req.body.memorizationMeta,
      reviewMeta: req.body.reviewMeta,
    };

    // ✅ جلب groupId من اسم الحلقة (إذا لم يكن موجود)
    if (sectionData.group && !sectionData.groupId) {
      const groupDoc = await Group.findOne({ name: sectionData.group.trim() });
      if (groupDoc) {
        sectionData.groupId = groupDoc._id;
        logger.debug(`تم ربط Section بـ Group: ${groupDoc._id}`);
      }
    }

    // ✅ جلب teacherId من اسم المعلم (إذا لم يكن موجود)
    if (sectionData.teacher && !sectionData.teacherId) {
      // البحث عن المعلم بالاسم الكامل أو جزء منه
      const nameParts = sectionData.teacher.trim().split(' ');
      let teacherDoc = null;
      
      if (nameParts.length >= 2) {
        teacherDoc = await Teacher.findOne({
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' ')
        });
      }
      
      if (!teacherDoc) {
        // محاولة البحث بالاسم الأول فقط
        teacherDoc = await Teacher.findOne({
          $or: [
            { firstName: sectionData.teacher.trim() },
            { lastName: sectionData.teacher.trim() }
          ]
        });
      }
      
      if (teacherDoc) {
        sectionData.teacherId = teacherDoc._id;
        logger.debug(`تم ربط Section بـ Teacher: ${teacherDoc._id}`);
      }
    }

    // ============================================
    // 🛡️ Advanced Conflict Check (Group Level) - V3: Date-Aware + Backfilling
    // ============================================
    if (sectionData.group) {
        
        // ✅ V7: Current Week Only Check (أول فحص)
        const currentWeekCheck = sequenceService.checkCurrentWeekOnly(sectionData.date);
        if (!currentWeekCheck.isValid) {
             logger.warn("currentWeekCheck failed:", currentWeekCheck.message);
             return sendError(res, currentWeekCheck.message, 400);
        }

        // 0. Daily Limit Check (One Section Per Day)
        const dailyCheck = await sequenceService.checkDailyQuota(
            sectionData.group,
            sectionData.date
        );
        if (!dailyCheck.isValid && dailyCheck.isBlocked) {
             logger.warn("dailyCheck failed:", dailyCheck.message);
             return sendError(res, dailyCheck.message, 400); 
        }

        // 0.5 Weekly Limit Check (Max 3 sections per week)
        const weeklyCheck = await sequenceService.checkWeeklyQuota(
            sectionData.group,
            sectionData.date
        );
        if (!weeklyCheck.isValid) {
             logger.warn("weeklyCheck failed:", weeklyCheck.message);
             return sendError(res, weeklyCheck.message, 400);
        }

        // ============================================
        // 🔒 ACTIVE SURAH VALIDATION - منع البدء بسورة جديدة قبل إكمال الحالية
        // ============================================
        if (sectionData.groupId) {
          // التحقق من مقاطع الحفظ
          if (sectionData.memorizationMeta && sectionData.memorizationMeta.length > 0) {
            const memSurahNumber = sectionData.memorizationMeta[0].surahNumber;
            const canAddMem = await Group.canAddSegment(sectionData.groupId, memSurahNumber, 'memorization');
            
            if (!canAddMem.allowed) {
              logger.warn("Active Surah Check (Memorization) failed:", canAddMem.reason);
              return sendError(res, canAddMem.reason, 400);
            }
          }

          // التحقق من مقاطع المراجعة
          if (sectionData.reviewMeta && sectionData.reviewMeta.length > 0) {
            const revSurahNumber = sectionData.reviewMeta[0].surahNumber;
            const canAddRev = await Group.canAddSegment(sectionData.groupId, revSurahNumber, 'review');
            
            if (!canAddRev.allowed) {
              logger.warn("Active Surah Check (Review) failed:", canAddRev.reason);
              return sendError(res, canAddRev.reason, 400);
            }
          }
        }
        // ============================================

        // 1. Check Memorization Sequence (Date-Aware with Neighbors)
        const memValidation = await sequenceService.validateSequence(
            sectionData.memorizationMeta,
            sectionData.group,
            'memorization',
            sectionData.date // ✅ V3: Date for neighbor queries
        );
        
        if (!memValidation.isValid) {
            logger.warn("memValidation failed:", memValidation.message);
            return sendValidationError(res, memValidation.message);
        }

        // 2. Check Review (Exact Match + Same-Day Duplicates with dateKey)
        const revValidation = await sequenceService.validateSequence(
             sectionData.reviewMeta,
             sectionData.group,
             'review',
             sectionData.date, // ✅ V3: Date for dateKey comparison
             null, // No exclude (new section)
             sectionData.memorizationMeta // Pass sibling memorization
        );

        if (!revValidation.isValid) {
             return sendValidationError(res, revValidation.message);
        }

        // 3. Check Consistency (Internal Consistency)
        const consistencyValidation = sequenceService.validateConsistency(
            sectionData.memorizationMeta,
            sectionData.reviewMeta
        );

        if (!consistencyValidation.isValid) {
            return sendValidationError(res, consistencyValidation.message);
        }
    }

    const section = new Section(sectionData);

    logger.debug("Section object created:", section);
    let newSection = await section.save();
    logger.success("Section saved successfully:", newSection);
    
    // ✅ Populate timetableId for complete response
    newSection = await Section.findById(newSection._id)
      .populate('timetableId', 'day startHour endHour sessionType')
      .lean();
    
    // ============================================
    // 🔄 UPDATE ACTIVE SURAH - تحديث السورة الفعالة
    // ============================================
    if (sectionData.groupId) {
      // تحديث السورة الفعالة للحفظ
      if (sectionData.memorizationMeta && sectionData.memorizationMeta.length > 0) {
        const memSegment = sectionData.memorizationMeta[0];
        const activeSurahs = await Group.getActiveSurahs(sectionData.groupId);
        const maxAyahEnd = Math.max(...sectionData.memorizationMeta.map(s => s.ayahEnd));
        const surahInfo = getSurahByNumber(memSegment.surahNumber);
        const totalAyahs = surahInfo?.ayahCount || 0;
        
        if (!activeSurahs?.memorization?.surahNumber || activeSurahs.memorization.isCompleted) {
          // تفعيل سورة جديدة
          await Group.activateSurah(
            sectionData.groupId,
            memSegment.surahNumber,
            memSegment.surahNameCanonical || memSegment.surahNameInput,
            maxAyahEnd,
            'memorization'
          );
          
          // ✅ التحقق من إكمال السورة تلقائياً (إذا وصلنا لآخر آية)
          if (totalAyahs > 0 && maxAyahEnd >= totalAyahs) {
            await Group.checkAndCompleteSurah(sectionData.groupId, maxAyahEnd, totalAyahs, 'memorization');
            logger.info(`🎉 سورة ${surahInfo.name} مكتملة الحفظ! (${maxAyahEnd}/${totalAyahs})`);
          }
        } else {
          // تحديث آخر آية والتحقق من الإكمال
          await Group.updateLastAyah(sectionData.groupId, maxAyahEnd, 'memorization');
          
          // ✅ التحقق من إكمال السورة تلقائياً
          if (totalAyahs > 0 && maxAyahEnd >= totalAyahs) {
            await Group.checkAndCompleteSurah(sectionData.groupId, maxAyahEnd, totalAyahs, 'memorization');
            logger.info(`🎉 سورة ${surahInfo.name} مكتملة الحفظ! (${maxAyahEnd}/${totalAyahs})`);
          }
        }
      }

      // تحديث السورة الفعالة للمراجعة
      if (sectionData.reviewMeta && sectionData.reviewMeta.length > 0) {
        const revSegment = sectionData.reviewMeta[0];
        const activeSurahs = await Group.getActiveSurahs(sectionData.groupId);
        const maxRevAyahEnd = Math.max(...sectionData.reviewMeta.map(s => s.ayahEnd));
        const revSurahInfo = getSurahByNumber(revSegment.surahNumber);
        const revTotalAyahs = revSurahInfo?.ayahCount || 0;
        
        if (!activeSurahs?.review?.surahNumber || activeSurahs.review.isCompleted) {
          // تفعيل سورة جديدة
          await Group.activateSurah(
            sectionData.groupId,
            revSegment.surahNumber,
            revSegment.surahNameCanonical || revSegment.surahNameInput,
            maxRevAyahEnd,
            'review'
          );
          
          // ✅ التحقق من إكمال السورة تلقائياً (إذا وصلنا لآخر آية)
          if (revTotalAyahs > 0 && maxRevAyahEnd >= revTotalAyahs) {
            await Group.checkAndCompleteSurah(sectionData.groupId, maxRevAyahEnd, revTotalAyahs, 'review');
            logger.info(`🎉 سورة ${revSurahInfo.name} مكتملة المراجعة! (${maxRevAyahEnd}/${revTotalAyahs})`);
          }
        } else {
          // تحديث آخر آية والتحقق من الإكمال
          await Group.updateLastAyah(sectionData.groupId, maxRevAyahEnd, 'review');
          
          // ✅ التحقق من إكمال السورة تلقائياً
          if (revTotalAyahs > 0 && maxRevAyahEnd >= revTotalAyahs) {
            await Group.checkAndCompleteSurah(sectionData.groupId, maxRevAyahEnd, revTotalAyahs, 'review');
            logger.info(`🎉 سورة ${revSurahInfo.name} مكتملة المراجعة! (${maxRevAyahEnd}/${revTotalAyahs})`);
          }
        }
      }
    }
    // ============================================
    
    // Fire-and-forget: Status Update (Background)
    updateSectionMarksStatus(newSection._id.toString(), newSection.group)
      .then(() => logger.debug("Status updated in background"))
      .catch(err => logger.warn("Async Status Update Error:", err));

    // Fire-and-forget: Notification (Background)
    const io = req.app.get("io");
    if (io && newSection.group) {
      notifySectionAdded(newSection, io)
        .catch(err => logger.warn("Async Notification Error:", err));
    }

    // Check for completed Surahs
    const completedMem = sequenceService.detectCompletedSurahs(sectionData.memorizationMeta, 'memorization');
    const completedRev = sequenceService.detectCompletedSurahs(sectionData.reviewMeta, 'review');
    const allCompleted = [...completedMem, ...completedRev];

    // ✅ تحديد نوع الجلسة تلقائياً بناءً على المحتوى
    const hasMem = sectionData.memorizationMeta?.length > 0;
    const hasRev = sectionData.reviewMeta?.length > 0;
    let suggestedSessionType = 'both';
    if (hasMem && !hasRev) suggestedSessionType = 'hifz';
    else if (!hasMem && hasRev) suggestedSessionType = 'murajaah';

    res.status(201).json({
      success: true,
      message: "تم إنشاء المقطع بنجاح. هل تريد تحديد موعد لهذا المقطع؟",
      data: newSection,
      meta: {
        askForSchedule: true,
        sectionId: newSection._id,
        groupId: newSection.groupId,
        teacherId: newSection.teacherId,
        suggestedSessionType, // ✅ نوع الجلسة المقترح
        completedSurahs: allCompleted 
      }
    });

  } catch (error) {
    logger.error("Error creating section:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors)
        .map((field) => `${field}: ${error.errors[field].message}`)
        .join(", ");

      return sendValidationError(res, `خطأ في التحقق من البيانات: ${validationErrors}`);
    }

    sendError(res, error.message, 400, error);
  }
};
