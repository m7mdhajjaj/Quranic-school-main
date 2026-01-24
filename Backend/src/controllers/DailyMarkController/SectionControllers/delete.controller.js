// ============================================================================
// Delete Section Controller (V8)
// ============================================================================
const Section = require("../../../schema/DailyMark/Section");
const DailyMark = require("../../../schema/DailyMark/DailyMark");
const TimeTable = require("../../../schema/TimeTable");
const Group = require("../../../schema/Group");
const { notifySectionDeleted } = require("../../../Notifications");
const activeSurahService = require("../../../services/DailyMark/GroupActiveSurahService");
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
async function recalculateActiveSurah(groupId, type, groupName = null) {
  try {
    let group;
    
    // محاولة العثور على الحلقة
    if (groupId) {
      group = await Group.findById(groupId);
    } 
    
    if (!group && groupName) {
      group = await Group.findOne({ name: groupName });
    }

    if (!group) return;
    
    // تحديث groupId في حال تم العثور عليه بالاسم
    const validGroupId = group._id;

    const activeSurah = type === 'memorization' 
      ? group.activeMemorizationSurah 
      : group.activeReviewSurah;

    if (!activeSurah || !activeSurah.surahNumber) return;

    const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';
    
    // ✅ البحث عن جميع المقاطع المتبقية (دعم للـ Legacy Data)
    const sectionQuery = {
      $or: [
        { groupId: validGroupId },
        { group: group.name } // Fallback لاسم الحلقة
      ],
      [`${metaField}.surahNumber`]: activeSurah.surahNumber
    };

    const remainingSections = await Section.find(sectionQuery).select(metaField);

    // إذا لم تعد هناك مقاطع، مسح السورة الفعالة
    if (remainingSections.length === 0) {
      const updateField = type === 'memorization' 
        ? 'activeMemorizationSurah' 
        : 'activeReviewSurah';
      
      await Group.findByIdAndUpdate(validGroupId, {
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
    
    await Group.findByIdAndUpdate(validGroupId, {
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
    const groupName = section.group;
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

    // ✅ V8: مزامنة السور الفعالة بعد الحذف باستخدام الـ service
    if (groupId || groupName) {
      try {
        // البحث عن groupId إذا كان لدينا الاسم فقط
        let finalGroupId = groupId;
        if (!finalGroupId && groupName) {
          const group = await Group.findOne({ name: groupName });
          finalGroupId = group?._id;
        }
        
        if (finalGroupId) {
          await activeSurahService.syncActiveSurahsFromSections(finalGroupId);
          logger.debug(`✅ تمت مزامنة السورة الفعالة بعد الحذف للحلقة ${groupName || groupId}`);
        }
      } catch (syncError) {
        logger.warn(`⚠️ خطأ في مزامنة السورة الفعالة بعد الحذف:`, syncError);
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
    // We use a Map where key is ID (if available) or Name (prefixed with 'NAME:')
    const affectedGroups = new Map(); 

    for (const section of sections) {
      let key = null;
      let isName = false;

      if (section.groupId) {
        key = section.groupId.toString();
      } else if (section.group) {
        key = `NAME:${section.group}`; // Prefix to avoid collision with IDs
        isName = true;
      }

      if (key) {
        const existing = affectedGroups.get(key) || { 
          hasMemorization: false, 
          hasReview: false,
          groupId: isName ? null : key,
          groupName: isName ? section.group : null
        };
        
        if (section.memorizationMeta && section.memorizationMeta.length > 0) {
          existing.hasMemorization = true;
        }
        if (section.reviewMeta && section.reviewMeta.length > 0) {
          existing.hasReview = true;
        }
        
        affectedGroups.set(key, existing);
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

    // ✅ V8: مزامنة السور الفعالة لكل حلقة متأثرة باستخدام الـ service
    for (const [key, data] of affectedGroups) {
      try {
        let finalGroupId = data.groupId;
        
        // إذا كان لدينا الاسم فقط، نبحث عن الـ ID
        if (!finalGroupId && data.groupName) {
          const group = await Group.findOne({ name: data.groupName });
          finalGroupId = group?._id;
        }
        
        if (finalGroupId) {
          await activeSurahService.syncActiveSurahsFromSections(finalGroupId);
          logger.debug(`✅ تمت مزامنة السورة الفعالة بعد الحذف للحلقة ${data.groupName || finalGroupId}`);
        }
      } catch (syncError) {
        logger.warn(`⚠️ خطأ في مزامنة السورة الفعالة للحلقة ${key}:`, syncError);
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

