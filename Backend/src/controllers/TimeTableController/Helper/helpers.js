// ============================================
// TIMETABLE HELPERS - ملف مركزي لإعادة التصدير
// ============================================
// هذا الملف يجمع جميع الدوال المساعدة من الملفات المنفصلة
// للحفاظ على التوافق مع الكود القديم

// استيراد عمليات الحلقات
const {
  addTimetableToGroup,
  removeTimetableFromGroup,
  updateTimetableInGroup,
} = require("./groupHelpers");


// استيراد دوال فحص التضارب
const {
  hasTimeConflict,
  checkTimetableConflict,
  checkTeacherTimetableConflict,
  checkSessionConflict,
} = require("./conflictChecker");

// استيراد دوال الوقت
const {
  timeToMinutes,
  isSummerTime,
  generateAllAvailableHours,
  isTimeInBookedRange,
} = require("./timeHelpers");

// إعادة تصدير جميع الدوال
module.exports = {
  // Group operations
  addTimetableToGroup,
  removeTimetableFromGroup,
  updateTimetableInGroup,
  
  // Conflict checking
  hasTimeConflict,
  checkTimetableConflict,
  checkTeacherTimetableConflict,
  checkSessionConflict,
  
  // Time utilities
  timeToMinutes,
  isSummerTime,
  generateAllAvailableHours,
  isTimeInBookedRange,
};
