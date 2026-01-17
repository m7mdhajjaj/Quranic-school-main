// ============================================
// CREATE TIMETABLE CONTROLLER (NEW)
// ============================================
// إنشاء مواعيد جديدة مع ربط مباشر بالمقاطع
// ⚠️ التعارض يعتمد على التاريخ المحدد (12/1 ≠ 19/1)

const TimeTable = require("../../schema/TimeTable");
const Section = require("../../schema/DailyMark/Section");
const Group = require("../../schema/Group");
const { checkTimeConflict, normalizeDate } = require("./helpers/scheduleConflict.helper");
const { getArabicDayFromDate, extractDayInfo, validateTimeRange, normalizeTimeFormat } = require("./helpers/dateTime.helper");
const { notifyTimetableCreated } = require("../../Notifications");

/**
 * إنشاء موعد جديد
 * @route POST /api/timetable
 * @body {Date} sessionDate - التاريخ المحدد (مطلوب)
 * @body {String} startHour - وقت البداية
 * @body {String} endHour - وقت النهاية
 * @body {String} teacherId - معرف المعلم
 * @body {String} groupId - معرف الحلقة (اختياري)
 * @body {String} sectionId - معرف المقطع (اختياري)
 */
exports.createTimetable = async (req, res) => {
  try {
    const data = req.validatedData || req.body;
    const { 
      startHour, 
      endHour, 
      teacherId, 
      groupId, 
      sectionId,
      sessionType,
      note,
      description 
    } = data;

    // ✅ 1. التحقق من الصلاحيات (المعلم يضيف لنفسه فقط)
    const user = req.user;
    if (user?.role === 'teacher' && teacherId !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "يمكنك إضافة مواعيد لنفسك فقط"
      });
    }

    // ✅ 2. جلب معلومات Section إذا موجود
    let section = null;
    let sessionDate = data.sessionDate ? new Date(data.sessionDate) : null;
    let finalGroupId = groupId;
    let finalNote = note;
    let finalSessionType = sessionType;

    if (sectionId) {
      section = await Section.findById(sectionId)
        .populate('groupId', 'name');
      
      if (!section) {
        return res.status(404).json({
          success: false,
          message: "المقطع غير موجود"
        });
      }

      // نسخ البيانات من Section - التاريخ من المقطع
      sessionDate = section.date;
      finalGroupId = finalGroupId || section.groupId?._id;
      finalNote = finalNote || section.group;
      
      // ✅ تحديد sessionType تلقائياً من المقطع إذا لم يكن محدداً
      if (!finalSessionType) {
        const hasMemorization = !!(
          section.memorizationSection || 
          (section.memorizationMeta && section.memorizationMeta.length > 0)
        );
        const hasReview = !!(
          section.reviewSection || 
          (section.reviewMeta && section.reviewMeta.length > 0)
        );
        
        if (hasMemorization && hasReview) {
          finalSessionType = 'both';
        } else if (hasMemorization) {
          finalSessionType = 'hifz';
        } else if (hasReview) {
          finalSessionType = 'murajaah';
        } else {
          finalSessionType = 'both'; // افتراضي
        }
        
        console.log('📚 Auto-detected sessionType from section:', {
          sectionId,
          hasMemorization,
          hasReview,
          sessionType: finalSessionType
        });
      }
    }

    // ✅ 3. التحقق من وجود التاريخ (مطلوب!)
    if (!sessionDate) {
      return res.status(400).json({
        success: false,
        message: "التاريخ مطلوب (sessionDate)"
      });
    }

    // ✅ 3.5. التحقق من صحة الأوقات
    const timeValidation = validateTimeRange(startHour, endHour);
    if (!timeValidation.valid) {
      return res.status(400).json({
        success: false,
        message: timeValidation.error
      });
    }
    console.log(`⏰ Time validation passed: ${startHour} - ${endHour} (${timeValidation.duration} min)`);

    // ✅ تطبيع التاريخ ليكون UTC midnight دائماً
    sessionDate = normalizeDate(sessionDate);
    console.log("📅 Normalized sessionDate:", sessionDate.toISOString());

    // اشتقاق اليوم من التاريخ
    const dayInfo = extractDayInfo(sessionDate);
    const finalDay = dayInfo.dayName;

    // ✅ 4. فحص التعارض (بناءً على التاريخ المحدد)
    const conflict = await checkTimeConflict({
      teacherId,
      sessionDate, // ⚠️ التعارض على نفس التاريخ فقط
      startHour,
      endHour
    });

    if (conflict.hasConflict) {
      return res.status(409).json({
        success: false,
        message: `تعارض: ${conflict.message}`,
        conflictWith: conflict.conflictWith
      });
    }

    // ✅ 5. إنشاء الموعد (مع تطبيع الأوقات للتخزين الموحد)
    const normalizedStartHour = normalizeTimeFormat(startHour);
    const normalizedEndHour = normalizeTimeFormat(endHour);
    
    const timetable = new TimeTable({
      day: finalDay,
      startHour: normalizedStartHour,
      endHour: normalizedEndHour,
      teacherId,
      groupId: finalGroupId,
      note: finalNote || "",
      description: description || "",
      sessionType: finalSessionType || "both", // استخدام القيمة المحددة تلقائياً أو الافتراضية
      sectionId: sectionId || null,
      sessionDate: sessionDate, // ⚠️ التاريخ المحدد
      isRecurring: false // دائماً غير متكرر - كل تاريخ منفصل
    });

    await timetable.save();

    // ✅ 6. تحديث Section إذا موجود
    if (section) {
      await Section.findByIdAndUpdate(sectionId, {
        timetableId: timetable._id,
        hasSchedule: true,
        scheduleStatus: "scheduled",
        scheduleInfo: {
          day: finalDay,
          startHour,
          endHour,
          sessionDate: sessionDate
        }
      });
    }

    // ✅ 7. إرجاع النتيجة مع populate
    const result = await TimeTable.findById(timetable._id)
      .populate('teacherId', 'firstName lastName')
      .populate('groupId', 'name')
      .populate('sectionId', 'date group memorizationSection reviewSection marksStatus');

    // ✅ 8. إرسال إشعارات للطلاب (في الخلفية)
    const io = req.app.get("io");
    notifyTimetableCreated(result, io).catch(err => 
      console.error("⚠️ Error sending timetable notification:", err)
    );

    console.log(`📅 Timetable created: ${result._id} for group "${finalNote}" on ${sessionDate.toISOString().split('T')[0]}`);

    res.status(201).json({
      success: true,
      message: "تم إنشاء الموعد بنجاح",
      data: result
    });

  } catch (error) {
    console.error("❌ Error creating timetable:", error);
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء إنشاء الموعد"
    });
  }
};

/**
 * إنشاء موعد لمقطع محدد (طريقة مختصرة)
 * @route POST /api/timetable/section/:sectionId
 * @note اليوم والتاريخ يُشتقان تلقائياً من المقطع
 */
exports.createTimetableForSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { startHour, endHour, teacherId, sessionType } = req.validatedData || req.body;

    // ✅ 1. جلب المقطع
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "المقطع غير موجود"
      });
    }

    // ✅ 2. التحقق من عدم وجود موعد للمقطع
    if (section.timetableId) {
      return res.status(400).json({
        success: false,
        message: "هذا المقطع لديه موعد بالفعل",
        existingTimetableId: section.timetableId
      });
    }

    // ✅ 3. التاريخ واليوم من المقطع (الأساس هو التاريخ)
    // ✅ تطبيع التاريخ ليكون UTC midnight دائماً
    const sessionDate = normalizeDate(section.date);
    const dayInfo = extractDayInfo(sessionDate);
    const day = dayInfo.dayName;
    
    console.log("📅 Section sessionDate normalized:", sessionDate.toISOString());

    // ✅ 4. تحديد teacherId
    let finalTeacherId = teacherId;
    if (!finalTeacherId && section.teacherId) {
      finalTeacherId = section.teacherId;
    }
    if (!finalTeacherId && req.user?.role === 'teacher') {
      finalTeacherId = req.user._id;
    }

    // ✅ 5. فحص التعارض (بناءً على التاريخ المحدد)
    const conflict = await checkTimeConflict({
      teacherId: finalTeacherId,
      sessionDate: sessionDate, // ⚠️ التعارض على نفس التاريخ فقط
      startHour,
      endHour
    });

    if (conflict.hasConflict) {
      return res.status(409).json({
        success: false,
        message: `تعارض: ${conflict.message}`,
        conflictWith: conflict.conflictWith,
        dateInfo: dayInfo // معلومات التاريخ للتوضيح
      });
    }

    // ✅ 6. تحديد نوع الجلسة تلقائياً
    let finalSessionType = sessionType;
    if (!finalSessionType) {
      const hasMem = section.memorizationMeta?.length > 0;
      const hasRev = section.reviewMeta?.length > 0;
      if (hasMem && hasRev) finalSessionType = 'both';
      else if (hasMem) finalSessionType = 'hifz';
      else if (hasRev) finalSessionType = 'murajaah';
      else finalSessionType = 'both';
    }

    // ✅ 7. إنشاء الموعد
    const timetable = new TimeTable({
      day,
      startHour,
      endHour,
      teacherId: finalTeacherId,
      groupId: section.groupId,
      note: section.group || "",
      sessionType: finalSessionType,
      sectionId: section._id,
      sessionDate: sessionDate, // ⚠️ التاريخ المحدد من المقطع
      isRecurring: false,
      sectionInfo: {
        memorizationSection: section.memorizationSection,
        reviewSection: section.reviewSection,
        marksStatus: section.marksStatus
      }
    });

    await timetable.save();

    // ✅ 8. تحديث المقطع
    await Section.findByIdAndUpdate(sectionId, {
      timetableId: timetable._id,
      hasSchedule: true,
      scheduleStatus: "scheduled",
      scheduleInfo: {
        day,
        startHour,
        endHour,
        sessionDate: sessionDate
      }
    });

    // ✅ 9. إرجاع النتيجة
    const result = await TimeTable.findById(timetable._id)
      .populate('teacherId', 'firstName lastName')
      .populate('groupId', 'name')
      .populate('sectionId', 'date group memorizationSection reviewSection marksStatus');

    res.status(201).json({
      success: true,
      message: `تم إنشاء موعد للمقطع بتاريخ ${dayInfo.dateFormatted} (${day})`,
      data: result,
      dateInfo: dayInfo
    });

  } catch (error) {
    console.error("❌ Error creating timetable for section:", error);
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ"
    });
  }
};
