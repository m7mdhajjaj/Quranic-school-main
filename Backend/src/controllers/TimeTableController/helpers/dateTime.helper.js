// ============================================
// DATE TIME HELPER - OPTIMIZED VERSION
// ============================================
// دوال مساعدة للتاريخ والوقت - نسخة محسّنة
// ✅ يستخدم توقيت Asia/Jerusalem (القدس، فلسطين)

const { TIMEZONE, toDateKey } = require('../../../config/timezone');
const { createLogger } = require('../../../utils/logger');

const logger = createLogger('DateTimeHelper');

// ========== CONSTANTS ==========
// ⚠️ ترتيب الأيام: السبت = 0 (بداية الأسبوع) إلى الجمعة = 6
const ARABIC_DAYS_SATURDAY_START = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
// ترتيب JavaScript: الأحد = 0 إلى السبت = 6 (لـ getDay())
const ARABIC_DAYS_JS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAYS_MAP = {
  'السبت': 0, 'الأحد': 1, 'الاثنين': 2,
  'الثلاثاء': 3, 'الأربعاء': 4, 'الخميس': 5, 'الجمعة': 6
};

// ========== WORKING HOURS ==========
// ✅ أوقات العمل الموحدة: 11:00 AM - 8:00 PM
// التحويل الصيفي/الشتوي يتم تلقائياً عبر timezone (Asia/Jerusalem)
// لا حاجة لمنطق isSummerTime بعد الآن

const WORKING_HOURS = {
  start: 11, // 11:00 AM
  end: 20,   // 8:00 PM (20:00)
  startTime: "11:00 AM",
  endTime: "8:00 PM"
};

// ========== TIME CONVERSION (CORE) ==========
/**
 * ✅ تحويل الوقت إلى دقائق منذ منتصف الليل
 * @param {String} timeStr - "1:30 PM" or "13:30"
 * @returns {Number} - دقائق (0-1439) أو -1 إذا غير صالح
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return -1;
  
  const clean = String(timeStr).trim().toUpperCase();
  
  // استخراج AM/PM
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const has12Hour = isPM || isAM;
  
  // استخراج الأرقام فقط
  const numericPart = clean.replace(/[^0-9:]/g, '');
  const parts = numericPart.split(':');
  
  if (parts.length < 2) return -1;
  
  let hours = parseInt(parts[0]) || 0;
  const minutes = parseInt(parts[1]) || 0;
  
  // تحويل لـ 24-hour format
  if (has12Hour) {
    if (isPM && hours !== 12) hours += 12;
    else if (isAM && hours === 12) hours = 0;
  }
  
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return -1;
  
  return hours * 60 + minutes;
};

/**
 * ✅ تحويل الدقائق إلى وقت بصيغة 12-hour
 * @param {Number} totalMinutes 
 * @returns {String} - "1:30 PM"
 */
const minutesToTime = (totalMinutes) => {
  if (totalMinutes < 0 || totalMinutes >= 1440) return '';
  
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const period = hours >= 12 ? 'PM' : 'AM';
  
  // تحويل لـ 12-hour
  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;
  
  return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * ✅ توحيد صيغة الوقت
 * @param {String} timeStr 
 * @returns {String} - "1:30 PM" (normalized)
 */
const normalizeTimeFormat = (timeStr) => {
  const minutes = timeToMinutes(timeStr);
  return minutes >= 0 ? minutesToTime(minutes) : '';
};

// ========== TIME COMPARISON ==========
/**
 * ✅ البحث عن وقت في قائمة
 * @param {Array<String>} timeList - قائمة الأوقات
 * @param {String} time - الوقت للبحث عنه
 * @returns {Number} - الـ index أو -1
 */
const findTimeIndex = (timeList, time) => {
  const targetMin = timeToMinutes(time);
  if (targetMin < 0) return -1;
  return timeList.findIndex(t => timeToMinutes(t) === targetMin);
};

/**
 * ✅ فحص تداخل وقتين
 * @returns {Boolean} - true إذا يوجد تداخل
 */
const hasTimeOverlap = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  
  if (s1 < 0 || e1 < 0 || s2 < 0 || e2 < 0) return false;
  
  // تداخل إذا: بداية1 < نهاية2 AND نهاية1 > بداية2
  return s1 < e2 && e1 > s2;
};

// ========== AVAILABLE HOURS GENERATION ==========
/**
 * ✅ توليد الأوقات المتاحة - موحدة 11:00 AM - 8:00 PM
 * التحويل الصيفي/الشتوي يتم تلقائياً عبر timezone
 * @returns {Array<String>} - ["11:00 AM", "11:30 AM", ...]
 */
const generateAvailableHours = () => {
  // أوقات العمل الموحدة: 11:00 AM - 8:00 PM
  const startMinutes = WORKING_HOURS.start * 60; // 11:00 AM = 660 دقيقة
  const endMinutes = WORKING_HOURS.end * 60;     // 8:00 PM = 1200 دقيقة
  
  const hours = [];
  for (let m = startMinutes; m <= endMinutes; m += 30) {
    hours.push(minutesToTime(m));
  }
  
  return hours;
};

/**
 * ✅ الحصول على الأوقات المحجوزة من جلسة
 * @param {Object} session - {startHour, endHour}
 * @param {Array<String>} allHours - كل الأوقات المتاحة
 * @returns {Array<String>} - الأوقات المحجوزة
 */
const getBookedHoursFromSession = (session, allHours) => {
  const { startHour, endHour } = session;
  const startMin = timeToMinutes(startHour);
  const endMin = timeToMinutes(endHour);
  
  if (startMin < 0 || endMin < 0) return [];
  
  return allHours.filter(hour => {
    const hourMin = timeToMinutes(hour);
    return hourMin >= startMin && hourMin < endMin;
  });
};

/**
 * ✅ الحصول على كل الأوقات المحجوزة من عدة جلسات
 * @param {Array<Object>} sessions - [{startHour, endHour}, ...]
 * @param {Array<String>} allHours - كل الأوقات المتاحة
 * @returns {Set<String>} - Set من الأوقات المحجوزة
 */
const getAllBookedHours = (sessions, allHours) => {
  const bookedSet = new Set();
  
  for (const session of sessions) {
    const sessionBooked = getBookedHoursFromSession(session, allHours);
    sessionBooked.forEach(h => bookedSet.add(h));
  }
  
  return bookedSet;
};

// ========== VALIDATION ==========
/**
 * ✅ التحقق من صحة صيغة الوقت
 */
const validateTimeFormat = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') {
    return { valid: false, error: "الوقت مطلوب" };
  }

  const minutes = timeToMinutes(timeStr.trim());
  
  if (minutes < 0) {
    return { valid: false, error: `صيغة الوقت غير صحيحة: ${timeStr}` };
  }

  return { valid: true, minutes, normalized: minutesToTime(minutes) };
};

/**
 * ✅ التحقق من نطاق الوقت
 */
const validateTimeRange = (startHour, endHour, options = {}) => {
  const { minDuration = 30, maxDuration = 240 } = options;
  
  const startVal = validateTimeFormat(startHour);
  if (!startVal.valid) return { valid: false, error: `وقت البداية: ${startVal.error}` };
  
  const endVal = validateTimeFormat(endHour);
  if (!endVal.valid) return { valid: false, error: `وقت النهاية: ${endVal.error}` };
  
  const duration = endVal.minutes - startVal.minutes;
  
  if (duration <= 0) {
    return { valid: false, error: `وقت البداية (${startHour}) يجب أن يكون قبل وقت النهاية (${endHour})` };
  }
  
  if (duration < minDuration) {
    return { valid: false, error: `مدة الحلقة يجب أن تكون ${minDuration} دقيقة على الأقل` };
  }
  
  if (duration > maxDuration) {
    return { valid: false, error: `مدة الحلقة لا يمكن أن تتجاوز ${maxDuration / 60} ساعات` };
  }

  return { 
    valid: true, 
    duration,
    startNormalized: startVal.normalized,
    endNormalized: endVal.normalized
  };
};

// ========== DATE HELPERS ==========
/**
 * ✅ اشتقاق اليوم بالعربية من التاريخ
 * @param {Date} date - التاريخ
 * @returns {String} - اسم اليوم بالعربية
 */
const getArabicDayFromDate = (date) => {
  // getDay() يعطي: 0=الأحد, 6=السبت
  return ARABIC_DAYS_JS[new Date(date).getDay()];
};

/**
 * ✅ الحصول على يوم الأسبوع بتوقيت فلسطين (0=الأحد, 6=السبت)
 */
const getDayInTimezone = (date = new Date()) => {
  const options = { timeZone: TIMEZONE, weekday: 'short' };
  const dayStr = new Intl.DateTimeFormat('en-US', options).format(date);
  const dayMap = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
  return dayMap[dayStr] ?? new Date(date).getDay();
};

/**
 * ✅ حساب نطاق الأسبوع (السبت - الجمعة) - بتوقيت فلسطين (Asia/Jerusalem)
 */
const getWeekRange = (date = new Date()) => {
  // ✅ الحصول على التاريخ الحالي بتوقيت فلسطين
  const dateKey = toDateKey(date); // YYYY-MM-DD بتوقيت فلسطين
  const localDate = new Date(dateKey + 'T12:00:00'); // منتصف النهار لتجنب مشاكل الـ timezone
  
  const currentDay = getDayInTimezone(date); // يوم الأسبوع بتوقيت فلسطين
  const daysToSaturday = currentDay === 6 ? 0 : currentDay + 1;
  
  const startOfWeek = new Date(localDate);
  startOfWeek.setDate(localDate.getDate() - daysToSaturday);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  logger.debug('📅 [getWeekRange] Calculated:', {
    inputDate: date.toISOString(),
    dateKeyPalestine: dateKey,
    dayInPalestine: currentDay,
    startOfWeek: toDateKey(startOfWeek),
    endOfWeek: toDateKey(endOfWeek),
  });
  
  return { startOfWeek, endOfWeek };
};

/**
 * ✅ الحصول على تاريخ يوم معين في الأسبوع - بتوقيت فلسطين
 */
const getDateForDayInWeek = (dayName, weekStart = null) => {
  const dayIndex = DAYS_MAP[dayName];
  if (dayIndex === undefined) return null;
  
  const { startOfWeek } = weekStart ? { startOfWeek: new Date(weekStart) } : getWeekRange();
  
  const targetDate = new Date(startOfWeek);
  targetDate.setDate(startOfWeek.getDate() + dayIndex);
  
  return targetDate;
};

/**
 * ✅ تنسيق التاريخ بالعربية
 */
const formatDateArabic = (date) => {
  return new Date(date).toLocaleDateString('ar-SA', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: TIMEZONE
  });
};

const formatDateShort = (date) => {
  return new Date(date).toLocaleDateString('ar-SA', { timeZone: TIMEZONE });
};

/**
 * ✅ استخراج معلومات اليوم
 */
const extractDayInfo = (date) => {
  const d = new Date(date);
  const jsDay = d.getDay(); // 0=الأحد, 6=السبت
  return {
    dayName: ARABIC_DAYS_JS[jsDay],
    dayIndex: jsDay,
    dateFormatted: formatDateArabic(d),
    dateShort: formatDateShort(d)
  };
};

// ========== EXPORTS ==========
module.exports = {
  // Constants
  ARABIC_DAYS: ARABIC_DAYS_SATURDAY_START, // السبت = 0 (لترتيب الأسبوع)
  ARABIC_DAYS_JS, // الأحد = 0 (لـ getDay())
  DAYS_MAP,
  WORKING_HOURS, // ✅ أوقات العمل الموحدة
  
  // Time conversion (core)
  timeToMinutes,
  minutesToTime,
  normalizeTimeFormat,
  
  // Time comparison
  findTimeIndex,
  hasTimeOverlap,
  
  // Available hours
  generateAvailableHours,
  getBookedHoursFromSession,
  getAllBookedHours,
  
  // Validation
  validateTimeFormat,
  validateTimeRange,
  
  // Date helpers
  getArabicDayFromDate,
  getWeekRange,
  getDateForDayInWeek,
  formatDateArabic,
  formatDateShort,
  extractDayInfo
};
