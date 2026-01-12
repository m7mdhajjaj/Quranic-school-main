// ============================================
// SCHEDULE CONFLICT HELPER
// ============================================
// فحص تعارض المواعيد
// ⚠️ مهم: التعارض يعتمد على التاريخ المحدد وليس اليوم
// مثال: 12 يناير (اثنين) ≠ 19 يناير (اثنين) - لا تعارض بينهما

const TimeTable = require("../../../schema/TimeTable");
const mongoose = require("mongoose");
const { timeToMinutes } = require("./dateTime.helper");

/**
 * فحص تداخل زمني بين موعدين
 */
const hasTimeOverlap = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  
  // تداخل إذا: بداية1 < نهاية2 AND نهاية1 > بداية2
  return s1 < e2 && e1 > s2;
};

/**
 * تطبيع التاريخ (بدون الوقت) للمقارنة
 * @param {Date|String} date 
 * @returns {Date}
 */
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
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
      console.warn("⚠️ checkTimeConflict: sessionDate مطلوب للتحقق من التعارض");
      return { hasConflict: false, message: "لم يتم تحديد تاريخ" };
    }

    if (!teacherId || !startHour || !endHour) {
      return { hasConflict: false };
    }

    // تطبيع التاريخ للبحث
    const targetDate = normalizeDate(sessionDate);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

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
        const dateStr = targetDate.toLocaleDateString('ar-SA');
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
    console.error("❌ Error checking conflict:", error);
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
      console.warn("⚠️ checkGroupConflict: sessionDate مطلوب للتحقق من التعارض");
      return { hasConflict: false };
    }

    if (!groupId) {
      return { hasConflict: false };
    }

    // تطبيع التاريخ
    const targetDate = normalizeDate(sessionDate);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

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
        const dateStr = targetDate.toLocaleDateString('ar-SA');
        return {
          hasConflict: true,
          message: `الحلقة لديها موعد آخر في ${dateStr} من ${session.startHour} إلى ${session.endHour}`,
          conflictWith: session
        };
      }
    }

    return { hasConflict: false };

  } catch (error) {
    console.error("❌ Error:", error);
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

  const targetDate = normalizeDate(date);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

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

  const targetDate = normalizeDate(date);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

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
  isSameDate,
  checkTimeConflict,
  checkGroupConflict,
  getTeacherSessionsOnDate,
  getGroupSessionsOnDate
};
