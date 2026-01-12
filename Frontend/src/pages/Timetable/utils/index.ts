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
  isSummerTime,
  isValidTime,
  timeToMinutes,
  isTimeInBookedRange,
  // 📅 دوال التاريخ الجديدة
  getDayNameFromDate,
  formatDateForAPI,
  formatDateForDisplay,
  formatDateShort,
  getTodayDate,
  isSameDay,
  getWeekDates,
} from './timetableHelpers';
