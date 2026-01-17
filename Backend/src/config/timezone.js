// ============================================================================
// config/timezone.js - إعدادات التوقيت الموحدة
// ============================================================================
// 
// توقيت فلسطين (القدس)
// Asia/Jerusalem: UTC+2 (شتاء) / UTC+3 (صيف) - يتبع التوقيت الصيفي
//
// ============================================================================

/**
 * التوقيت الافتراضي للتطبيق - القدس
 * @type {string}
 */
const TIMEZONE = "Asia/Jerusalem";

/**
 * إحداثيات الموقع الافتراضي (القدس، فلسطين)
 * تستخدم لحساب أوقات الصلاة
 */
const COORDINATES = {
  latitude: 31.7683,
  longitude: 35.2137,
  city: "القدس",
  country: "فلسطين"
};

/**
 * تحويل التاريخ إلى مفتاح YYYY-MM-DD بالتوقيت المحلي
 * @param {Date} date - التاريخ
 * @returns {string} - مفتاح التاريخ
 */
function toDateKey(date) {
  const d = new Date(date);
  // استخدام التوقيت المحلي للحصول على التاريخ الصحيح
  const options = { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' };
  const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(d);
  
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  
  return `${year}-${month}-${day}`;
}

/**
 * الحصول على بداية اليوم بالتوقيت المحلي
 * @param {Date} date - التاريخ
 * @returns {Date} - بداية اليوم
 */
function getStartOfDay(date = new Date()) {
  const dateKey = toDateKey(date);
  // إنشاء تاريخ في منتصف الليل بالتوقيت المحلي
  return new Date(`${dateKey}T00:00:00`);
}

/**
 * الحصول على نهاية اليوم بالتوقيت المحلي
 * @param {Date} date - التاريخ
 * @returns {Date} - نهاية اليوم
 */
function getEndOfDay(date = new Date()) {
  const dateKey = toDateKey(date);
  return new Date(`${dateKey}T23:59:59.999`);
}

/**
 * الحصول على الوقت الحالي بصيغة نصية
 * @returns {string} - الوقت بصيغة عربية
 */
function getCurrentTimeString() {
  return new Date().toLocaleString("ar-PS", { timeZone: TIMEZONE });
}

/**
 * التحقق من أن التاريخين في نفس اليوم
 * @param {Date} date1 
 * @param {Date} date2 
 * @returns {boolean}
 */
function isSameDay(date1, date2) {
  return toDateKey(date1) === toDateKey(date2);
}

/**
 * الحصول على يوم الأسبوع بتوقيت فلسطين (0=الأحد, 6=السبت)
 * @param {Date} date - التاريخ
 * @returns {number} - رقم اليوم
 */
function getDayInTimezone(date = new Date()) {
  const options = { timeZone: TIMEZONE, weekday: 'short' };
  const dayStr = new Intl.DateTimeFormat('en-US', options).format(date);
  const dayMap = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
  return dayMap[dayStr] ?? new Date(date).getDay();
}

/**
 * حساب نطاق الأسبوع (السبت - الجمعة) - بتوقيت فلسطين
 * @param {Date} date - التاريخ المرجعي
 * @returns {{startOfWeek: Date, endOfWeek: Date}} - بداية ونهاية الأسبوع
 */
function getWeekRange(date = new Date()) {
  const dateKey = toDateKey(date);
  const localDate = new Date(dateKey + 'T12:00:00');
  
  const currentDay = getDayInTimezone(date);
  // السبت = 6 في JS، لذا نحسب المسافة من السبت
  const daysToSaturday = currentDay === 6 ? 0 : currentDay + 1;
  
  const startOfWeek = new Date(localDate);
  startOfWeek.setDate(localDate.getDate() - daysToSaturday);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return { startOfWeek, endOfWeek };
}

/**
 * الحصول على مفتاح الأسبوع بصيغة YYYY-WXX
 * @param {Date} date - التاريخ
 * @returns {string} - مفتاح الأسبوع
 */
function getWeekKey(date) {
  const d = new Date(date);
  const dateKey = toDateKey(d);
  const localDate = new Date(dateKey + 'T12:00:00');
  
  const startOfYear = new Date(localDate.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((localDate - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  
  return `${localDate.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

/**
 * إضافة أيام لتاريخ معين
 * @param {Date} date - التاريخ الأصلي
 * @param {number} days - عدد الأيام للإضافة
 * @returns {Date} - التاريخ الجديد
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * تحويل تاريخ YYYY-MM-DD إلى Date مع بداية اليوم
 * @param {string} dateStr - التاريخ بصيغة YYYY-MM-DD
 * @param {boolean} endOfDay - إذا كان true، يرجع نهاية اليوم
 * @returns {Date|null}
 */
function parseDateString(dateStr, endOfDay = false) {
  if (!dateStr) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr));
  if (!match) return null;
  
  const y = Number(match[1]);
  const m = Number(match[2]) - 1;
  const d = Number(match[3]);
  
  if (endOfDay) {
    return new Date(y, m, d, 23, 59, 59, 999);
  }
  return new Date(y, m, d, 0, 0, 0, 0);
}

module.exports = {
  TIMEZONE,
  COORDINATES,
  toDateKey,
  getStartOfDay,
  getEndOfDay,
  getCurrentTimeString,
  isSameDay,
  getDayInTimezone,
  getWeekRange,
  getWeekKey,
  addDays,
  parseDateString
};
