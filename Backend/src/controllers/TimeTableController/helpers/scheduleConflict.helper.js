// ============================================
// SCHEDULE CONFLICT HELPER - V3 High Performance
// ============================================
// فحص تعارض المواعيد مع Redis Cache والفجوة الإلزامية
// ⚠️ مهم: التعارض يعتمد على التاريخ المحدد وليس اليوم
// ✅ فجوة 30 دقيقة إلزامية بين الجلسات

const TimeTable = require("../../../schema/TimeTable");
const mongoose = require("mongoose");
const { timeToMinutes, minutesToTime, hasTimeOverlap, WORKING_HOURS } = require("./dateTime.helper");
const { TIMEZONE } = require('../../../config/timezone');
const { createLogger } = require('../../../utils/logger');
const { cache } = require('../../../config/redis');

const logger = createLogger('ScheduleConflict');

// ========== CONSTANTS ==========
const REQUIRED_GAP_MINUTES = 30; // الفجوة الإلزامية بين الجلسات
const WORK_START = WORKING_HOURS.start * 60; // 11:00 AM = 660
const WORK_END = WORKING_HOURS.end * 60;     // 8:00 PM = 1200
const CACHE_TTL = 60; // 60 ثانية للـ cache

// ========== CACHE HELPERS ==========
/**
 * مفتاح Cache للمعلم/التاريخ
 */
const getCacheKey = (teacherId, date) => {
  const dateStr = normalizeDate(date)?.toISOString?.()?.split('T')[0] || date;
  return `timetable:teacher:${teacherId}:${dateStr}`;
};

/**
 * مسح Cache للمعلم/التاريخ
 */
const invalidateCache = async (teacherId, date) => {
  if (!teacherId || !date) return;
  const key = getCacheKey(teacherId, date);
  try {
    await cache.del(key);
    logger.debug(`🗑️ Cache invalidated: ${key}`);
  } catch (error) {
    logger.warn("Redis del error:", error.message);
  }
};

// Alias لسهولة الاستخدام في بقية الملفات
const invalidateTeacherCache = invalidateCache;

/**
 * مسح Cache لعدة تواريخ
 */
const invalidateCacheMultiple = async (teacherId, dates) => {
  if (!teacherId || !Array.isArray(dates)) return;
  const keys = dates.map(d => getCacheKey(teacherId, d));
  try {
    await cache.delMany(keys);
    logger.debug(`🗑️ Cache invalidated: ${keys.length} keys`);
  } catch (error) {
    logger.warn("Redis delMany error:", error.message);
  }
};

/**
 * تطبيع التاريخ (بدون الوقت) للمقارنة
 * ⚠️ يحول أي تاريخ لـ UTC midnight
 * @param {Date|String} date 
 * @returns {Date}
 */
const normalizeDate = (date) => {
  // إذا كان string بصيغة YYYY-MM-DD، نستخرج الأجزاء مباشرة
  if (typeof date === 'string') {
    // YYYY-MM-DD أو ISO format
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // months are 0-indexed
      const day = parseInt(match[3], 10);
      return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    }
  }
  
  // تحويل لـ Date object
  const d = new Date(date);
  
  // استخراج السنة والشهر واليوم بالتوقيت المحلي
  // ⚠️ هذا صحيح للتواريخ المحلية (من DatePicker)
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  
  // إنشاء تاريخ بداية اليوم بـ UTC
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
};

/**
 * تطبيع التاريخ لليوم التالي (UTC)
 * @param {Date|String} date 
 * @returns {Date}
 */
const normalizeNextDay = (date) => {
  const d = normalizeDate(date);
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
};

/**
 * فحص إذا كان تاريخين نفس اليوم التقويمي
 * @param {Date|String} date1 
 * @param {Date|String} date2 
 * @returns {Boolean}
 */
const isSameDate = (date1, date2) => {
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);
  return d1.getTime() === d2.getTime();
};

/**
 * التحقق من صحة التاريخ
 * @param {Date|String} date 
 * @returns {Boolean}
 */
const isValidDate = (date) => {
  if (!date) return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
};

/**
 * فحص التعارض الرئيسي - مع الفجوة الإلزامية 30 دقيقة
 * ⚠️ التعارض يحدث فقط إذا كان نفس التاريخ بالضبط
 * 
 * @param {Object} options
 * @param {String} options.teacherId - معرف المعلم
 * @param {Date} options.sessionDate - التاريخ المحدد (مطلوب!)
 * @param {String} options.startHour - وقت البداية
 * @param {String} options.endHour - وقت النهاية
 * @param {String} options.excludeId - استثناء موعد (للتحديث)
 * @returns {Promise<Object>} - {hasConflict, conflictType, message, conflictWith, suggestion}
 */
const checkTimeConflict = async (options) => {
  try {
    const { teacherId, sessionDate, startHour, endHour, excludeId } = options;

    // ⚠️ التاريخ مطلوب - بدون تاريخ لا يمكن فحص التعارض
    if (!sessionDate) {
      logger.warn("checkTimeConflict: sessionDate مطلوب للتحقق من التعارض");
      return { hasConflict: false, message: "لم يتم تحديد تاريخ" };
    }

    // التحقق من صحة التاريخ
    if (!isValidDate(sessionDate)) {
      logger.warn("checkTimeConflict: تاريخ غير صالح:", sessionDate);
      return { hasConflict: false, message: "تاريخ غير صالح" };
    }

    if (!teacherId || !startHour || !endHour) {
      logger.warn("checkTimeConflict: بيانات ناقصة:", { teacherId, startHour, endHour });
      return { hasConflict: false, message: "بيانات ناقصة" };
    }

    // التحقق من صحة الأوقات
    const startMinutes = timeToMinutes(startHour);
    const endMinutes = timeToMinutes(endHour);
    
    if (startMinutes < 0 || endMinutes < 0) {
      return { 
        hasConflict: true, 
        conflictType: 'INVALID_TIME',
        message: 'صيغة الوقت غير صحيحة' 
      };
    }
    
    if (startMinutes >= endMinutes) {
      return { 
        hasConflict: true, 
        conflictType: 'INVALID_RANGE',
        message: `وقت البداية (${startHour}) يجب أن يكون قبل وقت النهاية (${endHour})` 
      };
    }
    
    // التحقق من ساعات العمل
    if (startMinutes < WORK_START || endMinutes > WORK_END) {
      return { 
        hasConflict: true, 
        conflictType: 'OUT_OF_HOURS',
        message: `الوقت يجب أن يكون بين ${minutesToTime(WORK_START)} و ${minutesToTime(WORK_END)}` 
      };
    }

    // تطبيع التاريخ للبحث (UTC)
    const targetDate = normalizeDate(sessionDate);
    const nextDay = normalizeNextDay(sessionDate);
    
    logger.debug("🔍 checkTimeConflict:", {
      sessionDate,
      targetDate: targetDate.toISOString(),
      startHour,
      endHour,
      excludeId
    });

    // ✅ جلب الجلسات من Cache أو DB
    const existingSessions = await getTeacherSessionsOnDateCached(teacherId, sessionDate, excludeId);

    // فحص التعارض مع كل موعد
    for (const session of existingSessions) {
      const existStart = timeToMinutes(session.startHour);
      const existEnd = timeToMinutes(session.endHour);
      const groupName = session.groupId?.name || session.note || 'غير محدد';
      
      // 1. فحص التداخل المباشر
      if (hasTimeOverlap(startHour, endHour, session.startHour, session.endHour)) {
        const dateStr = targetDate.toLocaleDateString('ar-SA', { timeZone: TIMEZONE });
        return {
          hasConflict: true,
          conflictType: 'OVERLAP',
          message: `تداخل مباشر في ${dateStr} مع "${groupName}" (${session.startHour} - ${session.endHour})`,
          conflictWith: {
            _id: session._id,
            note: session.note,
            groupName,
            startHour: session.startHour,
            endHour: session.endHour
          }
        };
      }
      
      // 2. فحص الفجوة الإلزامية (30 دقيقة)
      // الجلسة الجديدة تنتهي قبل الموجودة
      if (endMinutes <= existStart) {
        const gapBefore = existStart - endMinutes;
        if (gapBefore < REQUIRED_GAP_MINUTES) {
          const requiredEndTime = existStart - REQUIRED_GAP_MINUTES;
          return {
            hasConflict: true,
            conflictType: 'GAP_BEFORE',
            message: `يجب ترك ${REQUIRED_GAP_MINUTES} دقيقة فجوة قبل جلسة "${groupName}" (${session.startHour})`,
            conflictWith: {
              _id: session._id,
              groupName,
              startHour: session.startHour,
              endHour: session.endHour
            },
            suggestion: `انتهِ قبل ${minutesToTime(requiredEndTime)}`,
            currentGap: gapBefore,
            requiredGap: REQUIRED_GAP_MINUTES
          };
        }
      }
      
      // الجلسة الجديدة تبدأ بعد الموجودة
      if (startMinutes >= existEnd) {
        const gapAfter = startMinutes - existEnd;
        if (gapAfter < REQUIRED_GAP_MINUTES) {
          const requiredStartTime = existEnd + REQUIRED_GAP_MINUTES;
          return {
            hasConflict: true,
            conflictType: 'GAP_AFTER',
            message: `يجب ترك ${REQUIRED_GAP_MINUTES} دقيقة فجوة بعد جلسة "${groupName}" (${session.endHour})`,
            conflictWith: {
              _id: session._id,
              groupName,
              startHour: session.startHour,
              endHour: session.endHour
            },
            suggestion: `ابدأ من ${minutesToTime(requiredStartTime)} أو بعد`,
            currentGap: gapAfter,
            requiredGap: REQUIRED_GAP_MINUTES
          };
        }
      }
    }

    return { hasConflict: false, conflictType: null, message: 'الوقت متاح' };

  } catch (error) {
    logger.error("Error checking conflict:", error);
    throw error;
  }
};

/**
 * فحص التعارض للحلقة (نفس الحلقة في نفس التاريخ)
 * ⚠️ التعارض يحدث فقط إذا كان نفس التاريخ بالضبط
 */
const checkGroupConflict = async (options) => {
  try {
    const { groupId, sessionDate, startHour, endHour, excludeId } = options;

    // ⚠️ التاريخ مطلوب
    if (!sessionDate) {
      logger.warn("checkGroupConflict: sessionDate مطلوب للتحقق من التعارض");
      return { hasConflict: false };
    }

    // التحقق من صحة التاريخ
    if (!isValidDate(sessionDate)) {
      logger.warn("checkGroupConflict: تاريخ غير صالح:", sessionDate);
      return { hasConflict: false };
    }

    if (!groupId) {
      return { hasConflict: false };
    }

    // تطبيع التاريخ (UTC)
    const targetDate = normalizeDate(sessionDate);
    const nextDay = normalizeNextDay(sessionDate);

    // البحث بالتاريخ المحدد فقط
    let query = { 
      groupId,
      sessionDate: { $gte: targetDate, $lt: nextDay }
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await TimeTable.find(query).lean();

    for (const session of existing) {
      if (hasTimeOverlap(startHour, endHour, session.startHour, session.endHour)) {
        const dateStr = targetDate.toLocaleDateString('ar-SA', { timeZone: TIMEZONE });
        return {
          hasConflict: true,
          message: `الحلقة لديها موعد آخر في ${dateStr} من ${session.startHour} إلى ${session.endHour}`,
          conflictWith: session
        };
      }
    }

    return { hasConflict: false };

  } catch (error) {
    logger.error("Error checking group conflict:", error);
    throw error;
  }
};

/**
 * الحصول على مواعيد معلم في تاريخ محدد (من DB مباشرة)
 * @param {String} teacherId 
 * @param {Date} date - التاريخ المحدد
 * @returns {Promise<Array>}
 */
const getTeacherSessionsOnDate = async (teacherId, date) => {
  if (!teacherId || !date) return [];
  if (!isValidDate(date)) return [];

  const targetDate = normalizeDate(date);
  const nextDay = normalizeNextDay(date);

  return await TimeTable.find({
    teacherId,
    sessionDate: { $gte: targetDate, $lt: nextDay }
  })
  .select('startHour endHour groupId note')
  .populate('groupId', 'name')
  .sort({ startHour: 1 })
  .lean();
};

/**
 * ✅ الحصول على مواعيد معلم في تاريخ محدد مع Redis Cache
 * @param {String} teacherId 
 * @param {Date} date - التاريخ المحدد
 * @param {String} excludeId - استثناء موعد معين
 * @returns {Promise<Array>}
 */
const getTeacherSessionsOnDateCached = async (teacherId, date, excludeId = null) => {
  if (!teacherId || !date) return [];
  if (!isValidDate(date)) return [];

  const cacheKey = getCacheKey(teacherId, date);
  
  try {
    // محاولة جلب من Cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.debug(`📦 Cache HIT: ${cacheKey}`);
      let sessions = cached;
      
      // استثناء موعد إذا مطلوب
      if (excludeId) {
        sessions = sessions.filter(s => s._id.toString() !== excludeId.toString());
      }
      return sessions;
    }
    
    logger.debug(`🔍 Cache MISS: ${cacheKey}`);
  } catch (cacheError) {
    logger.warn("Redis get error, falling back to DB:", cacheError.message);
  }

  // جلب من DB
  const targetDate = normalizeDate(date);
  const nextDay = normalizeNextDay(date);

  const sessions = await TimeTable.find({
    teacherId,
    sessionDate: { $gte: targetDate, $lt: nextDay }
  })
  .select('_id startHour endHour groupId note sessionDate')
  .populate('groupId', 'name')
  .sort({ startHour: 1 })
  .lean();

  // حفظ في Cache
  try {
    await cache.set(cacheKey, sessions, CACHE_TTL);
    logger.debug(`💾 Cached: ${cacheKey} (${sessions.length} sessions)`);
  } catch (cacheError) {
    logger.warn("Redis set error:", cacheError.message);
  }

  // استثناء موعد إذا مطلوب
  if (excludeId) {
    return sessions.filter(s => s._id.toString() !== excludeId.toString());
  }
  
  return sessions;
};

/**
 * ✅ حساب الفترات المتاحة لمعلم في تاريخ محدد (مع الفجوة)
 * @param {String} teacherId 
 * @param {Date} date - التاريخ المحدد
 * @returns {Promise<Array>} - [{startHour, endHour, durationMinutes}]
 */
const getAvailableSlotsForTeacher = async (teacherId, date) => {
  if (!teacherId || !date) return [];
  if (!isValidDate(date)) return [];

  // جلب الجلسات الموجودة
  const sessions = await getTeacherSessionsOnDateCached(teacherId, date);
  
  // ترتيب حسب الوقت
  const sorted = [...sessions].sort((a, b) => 
    timeToMinutes(a.startHour) - timeToMinutes(b.startHour)
  );

  const availableSlots = [];
  let currentStart = WORK_START;

  for (const session of sorted) {
    const sessionStart = timeToMinutes(session.startHour);
    const sessionEnd = timeToMinutes(session.endHour);
    
    // الفترة المتاحة قبل هذه الجلسة (مع خصم الفجوة)
    const availableEnd = sessionStart - REQUIRED_GAP_MINUTES;
    
    if (availableEnd > currentStart) {
      const duration = availableEnd - currentStart;
      if (duration >= 30) { // على الأقل 30 دقيقة للجلسة
        availableSlots.push({
          startHour: minutesToTime(currentStart),
          endHour: minutesToTime(availableEnd),
          durationMinutes: duration
        });
      }
    }
    
    // الوقت التالي المتاح (بعد الجلسة + الفجوة)
    currentStart = sessionEnd + REQUIRED_GAP_MINUTES;
  }

  // الفترة المتبقية حتى نهاية الدوام
  if (currentStart < WORK_END) {
    const duration = WORK_END - currentStart;
    if (duration >= 30) {
      availableSlots.push({
        startHour: minutesToTime(currentStart),
        endHour: minutesToTime(WORK_END),
        durationMinutes: duration
      });
    }
  }

  return availableSlots;
};

/**
 * الحصول على مواعيد حلقة في تاريخ محدد
 * @param {String} groupId 
 * @param {Date} date - التاريخ المحدد
 * @returns {Promise<Array>}
 */
const getGroupSessionsOnDate = async (groupId, date) => {
  if (!groupId || !date) return [];
  if (!isValidDate(date)) return [];

  const targetDate = normalizeDate(date);
  const nextDay = normalizeNextDay(date);

  return await TimeTable.find({
    groupId,
    sessionDate: { $gte: targetDate, $lt: nextDay }
  })
  .select('startHour endHour teacherId note')
  .populate('teacherId', 'name')
  .sort({ startHour: 1 })
  .lean();
};

module.exports = {
  hasTimeOverlap,
  normalizeDate,
  normalizeNextDay,
  isSameDate,
  isValidDate,
  checkTimeConflict,
  checkGroupConflict,
  getTeacherSessionsOnDate,
  getTeacherSessionsOnDateCached,
  getGroupSessionsOnDate,
  getAvailableSlotsForTeacher,
  invalidateTeacherCache,
  invalidateCacheMultiple,
  // Constants
  REQUIRED_GAP_MINUTES,
  WORK_START,
  WORK_END,
  CACHE_TTL
};
