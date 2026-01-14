// ============================================================================
// config/timezone.js - إعدادات التوقيت الموحدة
// ============================================================================
// 
// توقيت فلسطين (الضفة الغربية - نابلس)
// Asia/Hebron: UTC+2 (شتاء) / UTC+3 (صيف) - يتبع التوقيت الصيفي
//
// ============================================================================

/**
 * التوقيت الافتراضي للتطبيق
 * @type {string}
 */
const TIMEZONE = "Asia/Hebron";

/**
 * إحداثيات الموقع الافتراضي (نابلس، فلسطين)
 * تستخدم لحساب أوقات الصلاة
 */
const COORDINATES = {
  latitude: 32.2211,
  longitude: 35.2544,
  city: "نابلس",
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

module.exports = {
  TIMEZONE,
  COORDINATES,
  toDateKey,
  getStartOfDay,
  getEndOfDay,
  getCurrentTimeString,
  isSameDay
};
