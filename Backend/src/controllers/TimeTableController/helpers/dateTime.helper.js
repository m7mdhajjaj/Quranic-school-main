// ============================================
// DATE TIME HELPER - OPTIMIZED VERSION
// ============================================
// دوال مساعدة للتاريخ والوقت - نسخة محسّنة

// ========== CONSTANTS ==========
const ARABIC_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAYS_MAP = {
  'السبت': 0, 'الأحد': 1, 'الاثنين': 2,
  'الثلاثاء': 3, 'الأربعاء': 4, 'الخميس': 5, 'الجمعة': 6
};

// ========== SEASON DETECTION ==========
/**
 * تحديد الموسم (صيفي/شتوي)
 * صيفي: مايو (5) - سبتمبر (9)
 * @param {Date} date - التاريخ (اختياري)
 * @returns {Boolean}
 */
const isSummerTime = (date = new Date()) => {
  const month = new Date(date).getMonth() + 1;
  return month >= 5 && month <= 9;
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
 * ✅ مقارنة وقتين
 */
const areTimesEqual = (time1, time2) => {
  const m1 = timeToMinutes(time1);
  const m2 = timeToMinutes(time2);
  if (m1 < 0 || m2 < 0) return false;
  return m1 === m2;
};

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
 * ✅ التحقق من وجود وقت في قائمة
 */
const isTimeInList = (time, timeList) => {
  return findTimeIndex(timeList, time) !== -1;
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

/**
 * ✅ فحص إذا كان الوقت ضمن نطاق
 */
const isTimeInRange = (time, start, end) => {
  const t = timeToMinutes(time);
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  if (t < 0 || s < 0 || e < 0) return false;
  return t >= s && t < e;
};

// ========== AVAILABLE HOURS GENERATION ==========
/**
 * ✅ توليد الأوقات المتاحة حسب الموسم
 * @param {Date} date - التاريخ لتحديد الموسم
 * @returns {Array<String>} - ["11:00 AM", "11:30 AM", ...]
 */
const generateAvailableHours = (date = new Date()) => {
  const summer = isSummerTime(date);
  
  // تحديد النطاق بالدقائق
  const startMinutes = summer ? 12 * 60 : 11 * 60; // 12:00 PM or 11:00 AM
  const endMinutes = summer ? 21 * 60 : 20 * 60;   // 9:00 PM or 8:00 PM
  
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

/**
 * ✅ التحقق من ساعات العمل
 */
const validateWorkingHours = (startHour, endHour, date = new Date()) => {
  const availableHours = generateAvailableHours(date);
  const startMin = timeToMinutes(startHour);
  const endMin = timeToMinutes(endHour);
  
  if (startMin < 0 || endMin < 0) {
    return { valid: false, error: "صيغة الوقت غير صحيحة" };
  }
  
  const firstMin = timeToMinutes(availableHours[0]);
  const lastMin = timeToMinutes(availableHours[availableHours.length - 1]) + 30;
  
  if (startMin < firstMin || startMin > lastMin) {
    return { valid: false, error: `وقت البداية (${startHour}) خارج ساعات العمل` };
  }
  
  if (endMin > lastMin) {
    return { valid: false, error: `وقت النهاية (${endHour}) يتجاوز ساعات العمل` };
  }
  
  return { valid: true };
};

// ========== DATE HELPERS ==========
/**
 * ✅ اشتقاق اليوم بالعربية
 */
const getArabicDayFromDate = (date) => {
  return ARABIC_DAYS[new Date(date).getDay()];
};

/**
 * ✅ حساب نطاق الأسبوع (السبت - الجمعة)
 */
const getWeekRange = (date = new Date()) => {
  const d = new Date(date);
  const currentDay = d.getUTCDay();
  const daysToSaturday = currentDay === 6 ? 0 : currentDay + 1;
  
  const startOfWeek = new Date(d);
  startOfWeek.setUTCDate(d.getUTCDate() - daysToSaturday);
  startOfWeek.setUTCHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
  endOfWeek.setUTCHours(23, 59, 59, 999);
  
  return { startOfWeek, endOfWeek };
};

/**
 * ✅ الحصول على تاريخ يوم معين في الأسبوع
 */
const getDateForDayInWeek = (dayName, weekStart = null) => {
  const dayIndex = DAYS_MAP[dayName];
  if (dayIndex === undefined) return null;
  
  const { startOfWeek } = weekStart ? { startOfWeek: new Date(weekStart) } : getWeekRange();
  
  const targetDate = new Date(startOfWeek);
  targetDate.setUTCDate(startOfWeek.getUTCDate() + dayIndex);
  
  return targetDate;
};

/**
 * ✅ تنسيق التاريخ بالعربية
 */
const formatDateArabic = (date) => {
  return new Date(date).toLocaleDateString('ar-SA', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
};

const formatDateShort = (date) => {
  return new Date(date).toLocaleDateString('ar-SA');
};

/**
 * ✅ استخراج معلومات اليوم
 */
const extractDayInfo = (date) => {
  const d = new Date(date);
  return {
    dayName: ARABIC_DAYS[d.getDay()],
    dayIndex: d.getDay(),
    dateFormatted: formatDateArabic(d),
    dateShort: formatDateShort(d)
  };
};

// ========== EXPORTS ==========
module.exports = {
  // Constants
  ARABIC_DAYS,
  DAYS_MAP,
  
  // Season
  isSummerTime,
  
  // Time conversion (core)
  timeToMinutes,
  minutesToTime,
  normalizeTimeFormat,
  
  // Time comparison
  areTimesEqual,
  findTimeIndex,
  isTimeInList,
  hasTimeOverlap,
  isTimeInRange,
  
  // Available hours
  generateAvailableHours,
  getBookedHoursFromSession,
  getAllBookedHours,
  
  // Validation
  validateTimeFormat,
  validateTimeRange,
  validateWorkingHours,
  
  // Date helpers
  getArabicDayFromDate,
  getWeekRange,
  getDateForDayInWeek,
  formatDateArabic,
  formatDateShort,
  extractDayInfo
};
