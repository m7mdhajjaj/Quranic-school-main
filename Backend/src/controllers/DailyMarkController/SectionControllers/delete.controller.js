// ============================================================================
// Delete Section Controller (V7)
// ============================================================================
const Section = require("../../../schema/DailyMark/Section");
const DailyMark = require("../../../schema/DailyMark/DailyMark");
const TimeTable = require("../../../schema/TimeTable");
const Group = require("../../../schema/Group");
const { notifySectionDeleted } = require("../../../Notifications");
const { createLogger } = require("../../../utils/logger");
const { getSurahByNumber } = require("../../../utils/Quran/dailyMarkQuranMetadata");
const {
  sendSuccess,
  sendError,
  sendNotFound,
} = require("../utils/responseHelpers");

const logger = createLogger('SectionDelete');

/**
 * ============================================================================
 * إعادة حساب السورة الفعالة بعد حذف مقطع
 * ============================================================================
 * عند حذف مقطع، يجب إعادة حساب:
 * 1. آخر آية تم الوصول إليها (lastAyahEnd)
 * 2. حالة الإكمال (isCompleted) - تعود إلى false إذا لم نعد عند آخر آية
 * 3. إذا لم تعد هناك مقاطع للسورة، يتم مسحها
 */
async function recalculateActiveSurah(groupId, type) {
  try {
    const group = await Group.findById(groupId);
    if (!group) return;

    const activeSurah = type === 'memorization' 
      ? group.activeMemorizationSurah 
      : group.activeReviewSurah;

    if (!activeSurah || !activeSurah.surahNumber) return;

    const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';
    
    // البحث عن جميع المقاطع المتبقية لهذه السورة
    const remainingSections = await Section.find({
      groupId: groupId,
      [`${metaField}.surahNumber`]: activeSurah.surahNumber
    }).select(metaField);

    // إذا لم تعد هناك مقاطع، مسح السورة الفعالة
    if (remainingSections.length === 0) {
      const updateField = type === 'memorization' 
        ? 'activeMemorizationSurah' 
        : 'activeReviewSurah';
      
      await Group.findByIdAndUpdate(groupId, {
        [updateField]: {
          surahNumber: null,
          surahName: null,
          startedAt: null,
          lastAyahEnd: 0,
          isCompleted: false,
          completedAt: null,
        }
      });
      
      logger.success(`🧹 [${type}] تم مسح السورة ${activeSurah.surahNumber} - لا توجد مقاطع متبقية`);
      return;
    }

    // حساب آخر آية من جميع المقاطع المتبقية
    let maxAyahEnd = 0;
    for (const section of remainingSections) {
      const segments = section[metaField] || [];
      for (const seg of segments) {
        if (seg.surahNumber === activeSurah.surahNumber && seg.ayahEnd > maxAyahEnd) {
          maxAyahEnd = seg.ayahEnd;
        }
      }
    }

    // ✅ V8: التحقق من حالة الإكمال
    const surahInfo = getSurahByNumber(activeSurah.surahNumber);
    const totalAyahs = surahInfo?.ayahCount || 0;
    const isCompleted = totalAyahs > 0 && maxAyahEnd >= totalAyahs;

    // تحديث lastAyahEnd و isCompleted
    const updateField = type === 'memorization' 
      ? 'activeMemorizationSurah' 
      : 'activeReviewSurah';
    
    await Group.findByIdAndUpdate(groupId, {
      [`${updateField}.lastAyahEnd`]: maxAyahEnd,
      [`${updateField}.isCompleted`]: isCompleted,
      [`${updateField}.completedAt`]: isCompleted ? activeSurah.completedAt || new Date() : null,
    });
    
    logger.info(`📊 [${type}] تم تحديث السورة ${activeSurah.surahNumber} - آخر آية: ${maxAyahEnd}/${totalAyahs} (مكتملة: ${isCompleted})`);
  } catch (error) {
    logger.error(`❌ خطأ في إعادة حساب السورة الفعالة (${type}):`, error);
  }
}

/**
 * Delete a section
 * V7: يعيد حساب السورة الفعالة بعد الحذف
 */
exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return sendNotFound(res, "المقطع");
    }

    const groupId = section.groupId;
    const hasMemorization = section.memorizationMeta && section.memorizationMeta.length > 0;
    const hasReview = section.reviewMeta && section.reviewMeta.length > 0;

    // ✅ حذف TimeTable المرتبط (إذا وجد)
    if (section.timetableId) {
      await TimeTable.findByIdAndDelete(section.timetableId);
      logger.debug(`تم حذف TimeTable المرتبط: ${section.timetableId}`);
    }

    // إرسال إشعارات في الخلفية
    const io = req.app.get("io");
    if (io && section.group) {
      notifySectionDeleted(section, io).catch(err => 
        logger.warn("Error sending delete notification:", err)
      );
    }

    // تنفيذ عمليات الحذف
    await Promise.all([
      DailyMark.deleteMany({ sectionId: req.params.id }),
      Section.findByIdAndDelete(req.params.id)
    ]);

    // ✅ V7: إعادة حساب السور الفعالة بعد الحذف
    if (groupId) {
      if (hasMemorization) {
        await recalculateActiveSurah(groupId, 'memorization');
      }
      if (hasReview) {
        await recalculateActiveSurah(groupId, 'review');
      }
    }

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
 * V7: يعيد حساب السور الفعالة لكل حلقة متأثرة
 */
exports.bulkDeleteSections = async (req, res) => {
  try {
    const { sectionIds } = req.body;

    if (!sectionIds || !Array.isArray(sectionIds) || sectionIds.length === 0) {
      return sendError(res, "يجب توفير قائمة بمعرفات المقاطع", 400);
    }

    logger.debug(`بدء حذف ${sectionIds.length} مقطع...`);

    // جلب المقاطع للحصول على timetableIds و groupIds
    const sections = await Section.find({ _id: { $in: sectionIds } })
      .select('timetableId group groupId memorizationMeta reviewMeta');
    
    // جمع الحلقات المتأثرة
    const affectedGroups = new Map(); // groupId -> { hasMemorization, hasReview }
    
    for (const section of sections) {
      if (section.groupId) {
        const groupId = section.groupId.toString();
        const existing = affectedGroups.get(groupId) || { hasMemorization: false, hasReview: false };
        
        if (section.memorizationMeta && section.memorizationMeta.length > 0) {
          existing.hasMemorization = true;
        }
        if (section.reviewMeta && section.reviewMeta.length > 0) {
          existing.hasReview = true;
        }
        
        affectedGroups.set(groupId, existing);
      }
    }
    
    // جمع timetableIds المرتبطة
    const timetableIds = sections
      .filter(s => s.timetableId)
      .map(s => s.timetableId);

    // حذف TimeTables المرتبطة
    if (timetableIds.length > 0) {
      await TimeTable.deleteMany({ _id: { $in: timetableIds } });
      logger.debug(`تم حذف ${timetableIds.length} TimeTable مرتبط`);
    }

    // إرسال إشعارات في الخلفية
    const io = req.app.get("io");
    for (const section of sections) {
      if (io && section.group) {
        notifySectionDeleted(section, io).catch(err => 
          logger.warn("Error sending delete notification:", err)
        );
      }
    }

    // حذف العلامات المرتبطة
    const marksResult = await DailyMark.deleteMany({ sectionId: { $in: sectionIds } });
    logger.debug(`تم حذف ${marksResult.deletedCount} علامة مرتبطة`);

    // حذف المقاطع
    const sectionsResult = await Section.deleteMany({ _id: { $in: sectionIds } });
    logger.success(`تم حذف ${sectionsResult.deletedCount} مقطع`);

    // ✅ V7: إعادة حساب السور الفعالة لكل حلقة متأثرة
    for (const [groupId, types] of affectedGroups) {
      if (types.hasMemorization) {
        await recalculateActiveSurah(groupId, 'memorization');
      }
      if (types.hasReview) {
        await recalculateActiveSurah(groupId, 'review');
      }
    }

    sendSuccess(res, { 
      deletedCount: sectionsResult.deletedCount,
      deletedSectionIds: sectionIds,
      deletedTimeTables: timetableIds.length,
      deletedMarks: marksResult.deletedCount,
      recalculatedGroups: affectedGroups.size
    }, `تم حذف ${sectionsResult.deletedCount} مقطع بنجاح.`);
  } catch (error) {
    logger.error("Error in bulkDeleteSections:", error);
    sendError(res, error.message, 500, error);
  }
};

