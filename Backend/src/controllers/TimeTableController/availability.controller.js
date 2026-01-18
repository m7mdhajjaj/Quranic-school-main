// ============================================
// AVAILABILITY CONTROLLER - OPTIMIZED VERSION
// ============================================
// الأوقات المتاحة وفحص التعارض مع تفاصيل كاملة
// ⚠️ مهم: التعارض يعتمد على التاريخ المحدد وليس اليوم فقط

const TimeTable = require("../../schema/TimeTable");
const Teacher = require("../../schema/Teacher");
const mongoose = require("mongoose");
const { createLogger } = require("../../utils/logger");
const { 
  checkTimeConflict, 
  normalizeDate, 
  normalizeNextDay,
  isValidDate 
} = require("./helpers/scheduleConflict.helper");
const { 
  generateAvailableHours,
  WORKING_HOURS,
  extractDayInfo,
  formatDateArabic,
  findTimeIndex,
  normalizeTimeFormat,
  timeToMinutes,
  getAllBookedHours
} = require("./helpers/dateTime.helper");

const logger = createLogger('AvailabilityController');

/**
 * التحقق من صحة teacherId
 * @param {string} teacherId - معرف المعلم
 * @returns {Promise<{valid: boolean, teacher?: Object, error?: string}>}
 */
async function validateTeacherId(teacherId) {
  if (!teacherId) {
    return { valid: false, error: "معرف المعلم مطلوب" };
  }

  if (!mongoose.Types.ObjectId.isValid(teacherId)) {
    return { valid: false, error: "معرف المعلم غير صالح" };
  }

  const teacher = await Teacher.findById(teacherId).select('firstName lastName isActive').lean();
  if (!teacher) {
    return { valid: false, error: "المعلم غير موجود" };
  }

  if (teacher.isActive === false) {
    return { valid: false, error: "حساب المعلم غير نشط" };
  }

  return { valid: true, teacher };
}

/**
 * جلب الأوقات المتاحة (عامة)
 * @route GET /api/timetable/available-hours
 */
exports.getAvailableHours = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const hours = generateAvailableHours();

    res.json({
      success: true,
      data: {
        range: `${WORKING_HOURS.startTime} - ${WORKING_HOURS.endTime}`,
        hours,
        totalSlots: hours.length,
        date: targetDate.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    logger.error("Error getting available hours:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ"
    });
  }
};

/**
 * ✅ جلب الأوقات المتاحة لمعلم في تاريخ معين
 * مع تفاصيل كاملة لكل موعد (الحلقة، المقطع، نوع الحصة)
 * @route GET /api/timetable/available-hours/teacher
 */
exports.getTeacherAvailableHours = async (req, res) => {
  try {
    const { teacherId, date, excludeId } = req.query;

    // ⚠️ التاريخ مطلوب!
    if (!teacherId || !date) {
      return res.status(400).json({
        success: false,
        message: "teacherId و date مطلوبان - يجب تحديد التاريخ"
      });
    }

    // ✅ التحقق من صحة teacherId
    const teacherValidation = await validateTeacherId(teacherId);
    if (!teacherValidation.valid) {
      return res.status(400).json({
        success: false,
        message: teacherValidation.error
      });
    }

    // ✅ التحقق من صحة التاريخ
    if (!isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: "التاريخ غير صالح"
      });
    }

    // معلومات التاريخ
    const dateInfo = extractDayInfo(date);

    // ✅ 1. جلب كل الأوقات
    const allHours = generateAvailableHours(new Date(date));

    // ✅ 2. بناء Query للبحث عن المواعيد في نفس التاريخ فقط
    const targetDate = normalizeDate(date);
    const nextDay = normalizeNextDay(date);
    
    logger.debug("🔍 getTeacherAvailableHours:", {
      date,
      targetDate: targetDate.toISOString(),
      nextDay: nextDay.toISOString(),
      teacherId,
      teacherName: `${teacherValidation.teacher.firstName} ${teacherValidation.teacher.lastName}`
    });
    
    let query = { 
      teacherId,
      sessionDate: { $gte: targetDate, $lt: nextDay }
    };

    // استثناء موعد معين (للتعديل) - فقط إذا كان ObjectId صالح
    if (excludeId && !excludeId.startsWith('temp_')) {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(excludeId)) {
        query._id = { $ne: excludeId };
      }
    }

    // ✅ 3. جلب المواعيد المحجوزة مع تفاصيل المقطع والحلقة
    const bookedSessions = await TimeTable.find(query)
      .select('startHour endHour note groupId sessionDate sessionType sectionId sectionInfo')
      .populate('groupId', 'name students')
      .populate({
        path: 'sectionId',
        select: 'memorizationSection reviewSection group date marksStatus'
      })
      .lean();

    logger.debug("📋 bookedSessions found:", bookedSessions.length);

    // ✅ 4. تجميع الأوقات المحجوزة مع تفاصيلها
    const bookedHoursMap = new Map(); // Map<timeSlot, sessionDetails[]>
    const bookedHoursSet = new Set();
    
    const sessionsDetails = bookedSessions.map(session => {
      const normalizedStart = normalizeTimeFormat(session.startHour);
      const normalizedEnd = normalizeTimeFormat(session.endHour);
      
      const startIdx = findTimeIndex(allHours, normalizedStart);
      const endIdx = findTimeIndex(allHours, normalizedEnd);
      
      // إضافة كل الأوقات من البداية للنهاية
      const sessionTimeSlots = [];
      if (startIdx !== -1 && endIdx !== -1) {
        for (let i = startIdx; i < endIdx && i < allHours.length; i++) {
          const timeSlot = allHours[i];
          bookedHoursSet.add(timeSlot);
          sessionTimeSlots.push(timeSlot);
          
          // حفظ تفاصيل الموعد لكل وقت
          if (!bookedHoursMap.has(timeSlot)) {
            bookedHoursMap.set(timeSlot, []);
          }
          
          bookedHoursMap.get(timeSlot).push({
            sessionId: session._id,
            groupName: session.note || session.groupId?.name || 'غير محدد',
            groupId: session.groupId?._id,
            sessionType: session.sessionType,
            sessionTypeAr: session.sessionType === 'hifz' ? 'حفظ' : 
                           session.sessionType === 'murajaah' ? 'مراجعة' : 'حفظ ومراجعة',
            sectionName: session.sectionInfo?.memorizationSection || 
                         session.sectionInfo?.reviewSection || 
                         session.sectionId?.memorizationSection || 
                         session.sectionId?.reviewSection || ''
          });
        }
      } else {
        logger.warn(`Time not found! ${session.startHour} - ${session.endHour}`);
      }
      
      // بناء تفاصيل المقطع
      let sectionDetails = null;
      if (session.sectionId) {
        sectionDetails = {
          _id: session.sectionId._id,
          memorizationSection: session.sectionId.memorizationSection,
          reviewSection: session.sectionId.reviewSection,
          marksStatus: session.sectionId.marksStatus
        };
      } else if (session.sectionInfo) {
        sectionDetails = {
          memorizationSection: session.sectionInfo.memorizationSection,
          reviewSection: session.sectionInfo.reviewSection,
          marksStatus: session.sectionInfo.marksStatus
        };
      }
      
      return {
        _id: session._id,
        startHour: normalizedStart,
        endHour: normalizedEnd,
        groupName: session.note || session.groupId?.name || 'غير محدد',
        groupId: session.groupId?._id,
        studentsCount: session.groupId?.students?.length || 0,
        sessionType: session.sessionType,
        sessionTypeAr: session.sessionType === 'hifz' ? 'حفظ' : 
                       session.sessionType === 'murajaah' ? 'مراجعة' : 'حفظ ومراجعة',
        section: sectionDetails,
        timeSlots: sessionTimeSlots,
        duration: sessionTimeSlots.length * 30 // بالدقائق
      };
    });

    // ✅ 5. الأوقات المتاحة (غير المحجوزة)
    const bookedHours = Array.from(bookedHoursSet);
    const availableHours = allHours.filter(hour => !bookedHoursSet.has(hour));

    // ✅ 6. تفاصيل كل وقت محجوز
    const bookedHoursDetails = {};
    bookedHoursMap.forEach((details, timeSlot) => {
      bookedHoursDetails[timeSlot] = details;
    });

    // ✅ 7. تجميع حسب الحلقة
    const groupedByHalaqah = {};
    sessionsDetails.forEach(session => {
      const groupKey = session.groupId?.toString() || session.groupName || 'other';
      
      if (!groupedByHalaqah[groupKey]) {
        groupedByHalaqah[groupKey] = {
          groupId: session.groupId,
          groupName: session.groupName,
          studentsCount: session.studentsCount,
          sessions: []
        };
      }
      
      groupedByHalaqah[groupKey].sessions.push({
        _id: session._id,
        startHour: session.startHour,
        endHour: session.endHour,
        sessionType: session.sessionType,
        sessionTypeAr: session.sessionTypeAr,
        section: session.section,
        duration: session.duration
      });
    });

    logger.debug(`⏰ Teacher ${teacherId} on ${date}: ${bookedHours.length} booked, ${availableHours.length} available`);

    res.json({
      success: true,
      data: {
        teacherId,
        date: dateInfo.dateFormatted,
        dateShort: dateInfo.dateShort,
        day: dateInfo.dayName,
        
        // الأوقات
        allHours,
        bookedHours,
        availableHours,
        
        // تفاصيل المواعيد
        bookedSessions: sessionsDetails,
        bookedHoursDetails,
        
        // مجمّع حسب الحلقة
        halaqat: Object.values(groupedByHalaqah),
        
        // إحصائيات
        stats: {
          total: allHours.length,
          booked: bookedHours.length,
          available: availableHours.length,
          sessionsCount: sessionsDetails.length,
          halaqatCount: Object.keys(groupedByHalaqah).length
        }
      }
    });

  } catch (error) {
    logger.error("Error getting teacher available hours:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في جلب الأوقات المتاحة",
      error: error.message
    });
  }
};

/**
 * ✅ جلب ملخص مواعيد المعلم لكل حلقاته في تاريخ معين
 * @route GET /api/timetable/day-schedule
 */
exports.getTeacherDaySchedule = async (req, res) => {
  try {
    const { teacherId, date } = req.query;

    if (!teacherId || !date) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تحديد المعلم والتاريخ'
      });
    }

    const targetDate = normalizeDate(date);
    const nextDay = normalizeNextDay(date);
    const dateInfo = extractDayInfo(date);

    // جلب المواعيد مجمعة حسب الحلقة
    const sessions = await TimeTable.find({
      teacherId,
      sessionDate: { $gte: targetDate, $lt: nextDay }
    })
    .populate('groupId', 'name students')
    .populate({
      path: 'sectionId',
      select: 'memorizationSection reviewSection date marksStatus'
    })
    .sort({ startHour: 1 })
    .lean();

    // تجميع حسب الحلقة
    const groupedByHalaqah = {};
    
    sessions.forEach(session => {
      const groupKey = session.groupId?._id?.toString() || session.note || 'other';
      const groupName = session.groupId?.name || session.note || 'بدون حلقة';
      
      if (!groupedByHalaqah[groupKey]) {
        groupedByHalaqah[groupKey] = {
          groupId: session.groupId?._id,
          groupName,
          studentsCount: session.groupId?.students?.length || 0,
          sessions: [],
          totalDuration: 0
        };
      }
      
      const startMin = timeToMinutes(session.startHour);
      const endMin = timeToMinutes(session.endHour);
      const duration = endMin - startMin;
      
      groupedByHalaqah[groupKey].sessions.push({
        _id: session._id,
        startHour: normalizeTimeFormat(session.startHour),
        endHour: normalizeTimeFormat(session.endHour),
        duration,
        sessionType: session.sessionType,
        sessionTypeAr: session.sessionType === 'hifz' ? 'حفظ' : 
                       session.sessionType === 'murajaah' ? 'مراجعة' : 'حفظ ومراجعة',
        section: session.sectionId ? {
          _id: session.sectionId._id,
          memorizationSection: session.sectionId.memorizationSection,
          reviewSection: session.sectionId.reviewSection,
          marksStatus: session.sectionId.marksStatus
        } : null
      });
      
      groupedByHalaqah[groupKey].totalDuration += duration;
    });

    // حساب الإحصائيات
    const halaqat = Object.values(groupedByHalaqah);
    const totalDuration = halaqat.reduce((sum, h) => sum + h.totalDuration, 0);

    res.json({
      success: true,
      data: {
        date: dateInfo.dateFormatted,
        dateShort: dateInfo.dateShort,
        day: dateInfo.dayName,
        teacherId,
        halaqat,
        stats: {
          totalSessions: sessions.length,
          totalHalaqat: halaqat.length,
          totalDuration,
          totalHours: Math.round(totalDuration / 60 * 10) / 10
        }
      }
    });

  } catch (error) {
    logger.error('Error getting teacher day schedule:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب جدول اليوم',
      error: error.message
    });
  }
};

/**
 * فحص التعارض قبل الإنشاء/التحديث
 * @route POST /api/timetable/check-conflict
 */
exports.checkConflict = async (req, res) => {
  try {
    const { teacherId, startHour, endHour, sessionDate, excludeId } = req.body;

    // ⚠️ التاريخ مطلوب!
    if (!sessionDate) {
      return res.status(400).json({
        success: false,
        message: "sessionDate مطلوب - يجب تحديد التاريخ للتحقق من التعارض"
      });
    }

    if (!teacherId || !startHour || !endHour) {
      return res.status(400).json({
        success: false,
        message: "teacherId, startHour, endHour مطلوبة"
      });
    }

    // معلومات التاريخ
    const dateInfo = extractDayInfo(sessionDate);

    const result = await checkTimeConflict({
      teacherId,
      sessionDate,
      startHour,
      endHour,
      excludeId
    });

    res.json({
      success: true,
      data: {
        hasConflict: result.hasConflict,
        message: result.message || `لا يوجد تعارض في ${dateInfo.dateFormatted}`,
        conflictWith: result.conflictWith || null,
        dateInfo: {
          date: dateInfo.dateFormatted,
          day: dateInfo.dayName
        }
      }
    });

  } catch (error) {
    logger.error("Error checking conflict:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ"
    });
  }
};
