// ============================================================================
// Timetable Utils - Index
// ============================================================================
// ملف مركزي لتصدير جميع دوال المساعدة
// ⚠️ النظام الجديد: يعتمد على sessionDate (التاريخ المحدد)

// Duration helpers
export {
  calculateDuration,
  formatDuration,
  calculateTotalDuration,
} from './durationHelpers';

// Session organizer
export {
  organizeSessionsByDay,
  filterSessions,
  searchSessions,
  getSessionsStats,
} from './sessionOrganizer';

// Re-export validation from main Validation folder
export { validateTimetableData } from '@/Validation/timetableValidation';

// Re-export API functions
export { getGroupsByTeacherIdWithFilters } from '@/Api/groupApi';

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
