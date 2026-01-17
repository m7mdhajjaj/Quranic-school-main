// ============================================
// SCHEDULE CONFLICT HELPER
// ============================================
// فحص تعارض المواعيد
// ⚠️ مهم: التعارض يعتمد على التاريخ المحدد وليس اليوم
// مثال: 12 يناير (اثنين) ≠ 19 يناير (اثنين) - لا تعارض بينهما

const TimeTable = require("../../../schema/TimeTable");
const mongoose = require("mongoose");
const { timeToMinutes, hasTimeOverlap } = require("./dateTime.helper");
const { TIMEZONE } = require('../../../config/timezone');
const { createLogger } = require('../../../utils/logger');

const logger = createLogger('ScheduleConflict');

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
 * فحص التعارض الرئيسي
 * ⚠️ التعارض يحدث فقط إذا كان نفس التاريخ بالضبط
 * 
 * @param {Object} options
 * @param {String} options.teacherId - معرف المعلم
 * @param {Date} options.sessionDate - التاريخ المحدد (مطلوب!)
 * @param {String} options.startHour - وقت البداية
 * @param {String} options.endHour - وقت النهاية
 * @param {String} options.excludeId - استثناء موعد (للتحديث)
 * @returns {Promise<Object>} - {hasConflict, message, conflictWith}
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
    if (startMinutes >= endMinutes) {
      return { 
        hasConflict: true, 
        message: `وقت البداية (${startHour}) يجب أن يكون قبل وقت النهاية (${endHour})` 
      };
    }

    // تطبيع التاريخ للبحث (UTC)
    const targetDate = normalizeDate(sessionDate);
    const nextDay = normalizeNextDay(sessionDate);
    
    logger.debug("🔍 checkTimeConflict:", {
      sessionDate,
      targetDate: targetDate.toISOString(),
      nextDay: nextDay.toISOString(),
      teacherId,
      startHour,
      endHour,
      excludeId
    });

    // بناء Query - البحث بالتاريخ المحدد فقط
    let query = { 
      teacherId,
      sessionDate: { $gte: targetDate, $lt: nextDay }
    };

    // استثناء موعد (للتحديث)
    if (excludeId) {
      try {
        query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
      } catch (e) {
        query._id = { $ne: excludeId };
      }
    }

    // البحث عن المواعيد في نفس التاريخ فقط
    const existingSessions = await TimeTable.find(query)
      .select('startHour endHour note groupId sessionDate')
      .populate('groupId', 'name')
      .lean();

    // فحص التعارض مع كل موعد
    for (const session of existingSessions) {
      if (hasTimeOverlap(startHour, endHour, session.startHour, session.endHour)) {
        const groupName = session.groupId?.name || session.note || 'غير محدد';
        const dateStr = targetDate.toLocaleDateString('ar-SA', { timeZone: TIMEZONE });
        return {
          hasConflict: true,
          message: `يوجد تعارض في ${dateStr} مع حلقة "${groupName}" من ${session.startHour} إلى ${session.endHour}`,
          conflictWith: {
            _id: session._id,
            note: session.note,
            groupName,
            startHour: session.startHour,
            endHour: session.endHour,
            sessionDate: session.sessionDate
          }
        };
      }
    }

    return { hasConflict: false };

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
 * الحصول على مواعيد معلم في تاريخ محدد
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
  getGroupSessionsOnDate
};
