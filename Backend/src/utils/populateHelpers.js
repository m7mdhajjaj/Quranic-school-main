// ============================================================================
// Populate Helpers - دوال مساعدة للـ Populate المتكرر
// ============================================================================
// هذا الملف يحتوي على دوال موحدة للـ populate لتجنب التكرار

/**
 * ============================================================================
 * TimeTable Populate Options
 * ============================================================================
 */

/**
 * خيارات Populate الأساسية للـ TimeTable
 * تستخدم في معظم الـ queries
 */
const TIMETABLE_POPULATE_BASIC = [
  { path: 'teacherId', select: 'firstName lastName' },
  { path: 'groupId', select: 'name' }
];

/**
 * خيارات Populate الكاملة للـ TimeTable
 * تشمل معلومات المقطع
 */
const TIMETABLE_POPULATE_FULL = [
  { path: 'teacherId', select: 'firstName lastName' },
  { path: 'groupId', select: 'name' },
  { path: 'sectionId', select: 'date memorizationSection reviewSection marksStatus' }
];

/**
 * تطبيق Populate الأساسي على query
 * @param {Query} query - Mongoose query
 * @returns {Query}
 */
function populateTimetableBasic(query) {
  return query
    .populate('teacherId', 'firstName lastName')
    .populate('groupId', 'name');
}

/**
 * تطبيق Populate الكامل على query
 * @param {Query} query - Mongoose query
 * @returns {Query}
 */
function populateTimetableFull(query) {
  return query
    .populate('teacherId', 'firstName lastName')
    .populate('groupId', 'name')
    .populate('sectionId', 'date memorizationSection reviewSection marksStatus');
}

/**
 * ============================================================================
 * Section Populate Options
 * ============================================================================
 */

/**
 * خيارات Populate الأساسية للـ Section
 */
const SECTION_POPULATE_BASIC = [
  { path: 'timetableId', select: 'day startHour endHour sessionType' },
  { path: 'groupId', select: 'name' },
  { path: 'teacherId', select: 'firstName lastName' }
];

/**
 * تطبيق Populate الأساسي على Section query
 * @param {Query} query - Mongoose query
 * @returns {Query}
 */
function populateSectionBasic(query) {
  return query
    .populate('timetableId', 'day startHour endHour sessionType')
    .populate('groupId', 'name')
    .populate('teacherId', 'firstName lastName');
}

/**
 * ============================================================================
 * Mark Populate Options
 * ============================================================================
 */

/**
 * خيارات Populate الأساسية للـ Mark
 */
const MARK_POPULATE_BASIC = [
  { path: 'studentId', select: 'firstName lastName studentId group' },
  { path: 'sectionId', select: 'date group memorizationSection reviewSection' }
];

/**
 * تطبيق Populate الأساسي على Mark query
 * @param {Query} query - Mongoose query
 * @returns {Query}
 */
function populateMarkBasic(query) {
  return query
    .populate('studentId', 'firstName lastName studentId group')
    .populate('sectionId', 'date group memorizationSection reviewSection');
}

/**
 * ============================================================================
 * Exports
 * ============================================================================
 */

module.exports = {
  // Timetable
  TIMETABLE_POPULATE_BASIC,
  TIMETABLE_POPULATE_FULL,
  populateTimetableBasic,
  populateTimetableFull,
  
  // Section
  SECTION_POPULATE_BASIC,
  populateSectionBasic,
  
  // Mark
  MARK_POPULATE_BASIC,
  populateMarkBasic
};
