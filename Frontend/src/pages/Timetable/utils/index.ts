// ============================================================================
// Timetable Utils - Index
// ============================================================================
// ملف مركزي لتصدير جميع دوال المساعدة
// ⚠️ النظام الجديد: يعتمد على sessionDate (التاريخ المحدد)

// Timetable helpers - الكل من نفس المصدر
export {
  generateHours,
  WEEK_DAYS,
  getTeacherPossibleNames,
  isTeacherMatch,
  getCurrentUser,
  getUserRole,
  isValidTime,
  timeToMinutes,
  isTimeInBookedRange,
  // ⏰ دوال تطبيع الأوقات
  normalizeTimeFormat,
  areTimesEqual,
  findTimeIndex,
  isTimeInArray,
  // 📅 دوال التاريخ الجديدة
  getDayNameFromDate,
  formatDateForAPI,
  formatDateForDisplay,
  formatDateShort,
  getTodayDate,
  isSameDay,
  getWeekDates,
  // ✅ Data Validation
  validateSessionData,
  sanitizeSessionData,
} from './timetableHelpers';
