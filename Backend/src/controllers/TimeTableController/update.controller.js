// ============================================
// UPDATE TIMETABLE CONTROLLER (NEW)
// ============================================
// تحديث المواعيد مع مزامنة المقاطع
// ✅ تم إضافة: الفجوة الإلزامية 30 دقيقة + Redis Cache Invalidation

const TimeTable = require("../../schema/TimeTable");
const Section = require("../../schema/DailyMark/Section");
const Group = require("../../schema/Group");
const { 
  checkTimeConflict, 
  normalizeDate,
  invalidateTeacherCache,
  invalidateCacheMultiple,
  REQUIRED_GAP_MINUTES 
} = require("./helpers/scheduleConflict.helper");
const { getArabicDayFromDate, normalizeTimeFormat } = require("./helpers/dateTime.helper");
const { notifyTimetableUpdated } = require("../../Notifications");
const { createLogger } = require("../../utils/logger");

const logger = createLogger('TimetableUpdate');

/**
 * تحديث موعد كامل
 * @route PUT /api/timetable/:id
 */
exports.updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.validatedData || req.body;
    const user = req.user;

    // ✅ 1. جلب الموعد الحالي
    const timetable = await TimeTable.findById(id);
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "الموعد غير موجود"
      });
    }

    // ✅ 2. التحقق من الصلاحيات
    if (user?.role === 'teacher') {
      if (timetable.teacherId?.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "يمكنك تعديل مواعيدك فقط"
        });
      }
      // منع المعلم من تغيير teacherId
      if (data.teacherId && data.teacherId !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "لا يمكنك تغيير المعلم المسؤول"
        });
      }
    }

    // ✅ 3. تجهيز البيانات للتحديث (مع تطبيع الأوقات)
    const updateData = {};
    const fieldsToUpdate = ['day', 'note', 'description', 'sessionType'];
    
    for (const field of fieldsToUpdate) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }
    
    // ✅ تطبيع الأوقات قبل الحفظ
    if (data.startHour !== undefined) {
      updateData.startHour = normalizeTimeFormat(data.startHour);
    }
    if (data.endHour !== undefined) {
      updateData.endHour = normalizeTimeFormat(data.endHour);
    }
    
    // ✅ 3.5. تحديث sessionType تلقائياً من Section إذا كان sectionId موجود ولم يُحدد sessionType
    if (timetable.sectionId && !data.sessionType) {
      const section = await Section.findById(timetable.sectionId);
      if (section) {
        const hasMemorization = !!(
          section.memorizationSection || 
          (section.memorizationMeta && section.memorizationMeta.length > 0)
        );
        const hasReview = !!(
          section.reviewSection || 
          (section.reviewMeta && section.reviewMeta.length > 0)
        );
        
        let autoSessionType;
        if (hasMemorization && hasReview) {
          autoSessionType = 'both';
        } else if (hasMemorization) {
          autoSessionType = 'hifz';
        } else if (hasReview) {
          autoSessionType = 'murajaah';
        }
        
        if (autoSessionType && autoSessionType !== timetable.sessionType) {
          updateData.sessionType = autoSessionType;
          logger.debug('📚 Auto-updating sessionType from section:', {
            timetableId: id,
            sectionId: timetable.sectionId,
            hasMemorization,
            hasReview,
            sessionType: autoSessionType
          });
        }
      }
    }

    // ✅ 4. تحديث groupId إذا تغير note
    if (data.note && data.note !== timetable.note) {
      const group = await Group.findOne({ name: data.note.trim() });
      if (group) {
        updateData.groupId = group._id;
      }
    }

    // ✅ 5. تحديث teacherId (للإداري فقط)
    if (data.teacherId && user?.role !== 'teacher') {
      updateData.teacherId = data.teacherId;
    }

    // ✅ 6. فحص التعارض إذا تغير الوقت
    const newDay = updateData.day || timetable.day;
    const newStartHour = updateData.startHour || timetable.startHour;
    const newEndHour = updateData.endHour || timetable.endHour;
    const newTeacherId = updateData.teacherId || timetable.teacherId;

    if (updateData.day || updateData.startHour || updateData.endHour) {
      const conflict = await checkTimeConflict({
        teacherId: newTeacherId,
        day: newDay,
        startHour: newStartHour,
        endHour: newEndHour,
        sessionDate: timetable.sessionDate,
        excludeId: id
      });

      if (conflict.hasConflict) {
        // ✅ رسالة خطأ مفصلة حسب نوع التعارض
        let userMessage = conflict.message;
        if (conflict.conflictType === 'GAP_BEFORE' || conflict.conflictType === 'GAP_AFTER') {
          userMessage = `${conflict.message}. ${conflict.suggestion || ''}`;
        }
        
        return res.status(409).json({
          success: false,
          message: userMessage,
          conflictType: conflict.conflictType,
          conflictWith: conflict.conflictWith,
          suggestion: conflict.suggestion,
          gapInfo: conflict.currentGap !== undefined ? {
            currentGap: conflict.currentGap,
            requiredGap: conflict.requiredGap || REQUIRED_GAP_MINUTES
          } : null
        });
      }
    }

    // ✅ 7. تحديث الموعد
    const updated = await TimeTable.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('teacherId', 'firstName lastName')
      .populate('groupId', 'name')
      .populate('sectionId', 'date group memorizationSection reviewSection marksStatus');

    // ✅ إبطال الـ Cache للمعلم في هذا التاريخ
    await invalidateTeacherCache(newTeacherId, timetable.sessionDate);
    logger.debug(`🗑️ Cache invalidated for teacher ${newTeacherId} on ${timetable.sessionDate?.toISOString()?.split('T')[0]}`);

    // ✅ 8. مزامنة مع Section إذا موجود
    if (updated.sectionId) {
      const sectionUpdate = {
        scheduleInfo: {
          day: updated.day,
          startHour: updated.startHour,
          endHour: updated.endHour
        }
      };

      if (updateData.note) {
        sectionUpdate.group = updateData.note;
      }

      await Section.findByIdAndUpdate(updated.sectionId, sectionUpdate);
    }

    // ✅ 9. إرسال إشعارات للطلاب (في الخلفية)
    const io = req.app.get("io");
    notifyTimetableUpdated(updated, updateData, io).catch(err => 
      logger.error("⚠️ Error sending timetable update notification:", err)
    );

    logger.info(`✏️ Timetable updated: ${updated._id} - Changes:`, Object.keys(updateData));

    res.json({
      success: true,
      message: "تم تحديث الموعد بنجاح",
      data: updated
    });

  } catch (error) {
    logger.error("❌ Error updating timetable:", error);
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ"
    });
  }
};

/**
 * تحديث الوقت فقط (طريقة مختصرة)
 * @route PATCH /api/timetable/:id/time
 */
exports.updateTimetableTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { startHour, endHour } = req.body;
    const user = req.user;

    if (!startHour || !endHour) {
      return res.status(400).json({
        success: false,
        message: "startHour و endHour مطلوبان"
      });
    }

    // ✅ 1. جلب الموعد
    const timetable = await TimeTable.findById(id);
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "الموعد غير موجود"
      });
    }

    // ✅ 2. التحقق من الصلاحيات
    if (user?.role === 'teacher' && timetable.teacherId?.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "يمكنك تعديل مواعيدك فقط"
      });
    }

    // ✅ 3. فحص التعارض
    const conflict = await checkTimeConflict({
      teacherId: timetable.teacherId,
      day: timetable.day,
      startHour,
      endHour,
      sessionDate: timetable.sessionDate,
      excludeId: id
    });

    if (conflict.hasConflict) {
      // ✅ رسالة خطأ مفصلة حسب نوع التعارض
      let userMessage = conflict.message;
      if (conflict.conflictType === 'GAP_BEFORE' || conflict.conflictType === 'GAP_AFTER') {
        userMessage = `${conflict.message}. ${conflict.suggestion || ''}`;
      }
      
      return res.status(409).json({
        success: false,
        message: userMessage,
        conflictType: conflict.conflictType,
        conflictWith: conflict.conflictWith,
        suggestion: conflict.suggestion
      });
    }

    // ✅ 4. تحديث
    const updated = await TimeTable.findByIdAndUpdate(
      id,
      { startHour, endHour },
      { new: true }
    ).populate('teacherId', 'firstName lastName');
    
    // ✅ إبطال الـ Cache للمعلم في هذا التاريخ
    await invalidateTeacherCache(timetable.teacherId, timetable.sessionDate);
    logger.debug(`🗑️ Cache invalidated for teacher ${timetable.teacherId}`);

    // ✅ 5. مزامنة Section
    if (updated.sectionId) {
      await Section.findByIdAndUpdate(updated.sectionId, {
        'scheduleInfo.startHour': startHour,
        'scheduleInfo.endHour': endHour
      });
    }

    res.json({
      success: true,
      message: "تم تحديث الوقت بنجاح",
      data: updated
    });

  } catch (error) {
    logger.error("Error updating timetable time:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ"
    });
  }
};

/**
 * ربط موعد موجود بمقطع
 * @route POST /api/timetable/:id/link/:sectionId
 */
exports.linkTimetableToSection = async (req, res) => {
  try {
    const { id, sectionId } = req.params;

    // ✅ 1. التحقق من وجود الموعد والمقطع
    const [timetable, section] = await Promise.all([
      TimeTable.findById(id),
      Section.findById(sectionId)
    ]);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "الموعد غير موجود"
      });
    }

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "المقطع غير موجود"
      });
    }

    // ✅ 2. التحقق من عدم وجود ربط سابق
    if (section.timetableId) {
      return res.status(400).json({
        success: false,
        message: "هذا المقطع مرتبط بموعد آخر بالفعل"
      });
    }

    if (timetable.sectionId) {
      return res.status(400).json({
        success: false,
        message: "هذا الموعد مرتبط بمقطع آخر بالفعل"
      });
    }

    // ✅ 3. إجراء الربط
    // ✅ تطبيع التاريخ ليكون UTC midnight
    const normalizedSessionDate = normalizeDate(section.date);
    
    await Promise.all([
      TimeTable.findByIdAndUpdate(id, {
        sectionId: section._id,
        sessionDate: normalizedSessionDate,
        isRecurring: false,
        sectionInfo: {
          memorizationSection: section.memorizationSection,
          reviewSection: section.reviewSection,
          marksStatus: section.marksStatus
        }
      }),
      Section.findByIdAndUpdate(sectionId, {
        timetableId: timetable._id,
        hasSchedule: true,
        scheduleStatus: "scheduled",
        scheduleInfo: {
          day: timetable.day,
          startHour: timetable.startHour,
          endHour: timetable.endHour
        }
      })
    ]);

    // ✅ 4. إرجاع النتيجة
    const result = await TimeTable.findById(id)
      .populate('teacherId', 'firstName lastName')
      .populate('groupId', 'name')
      .populate('sectionId', 'date group memorizationSection reviewSection marksStatus');

    res.json({
      success: true,
      message: "تم ربط الموعد بالمقطع بنجاح",
      data: result
    });

  } catch (error) {
    logger.error("Error linking timetable to section:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ"
    });
  }
};
