// ============================================
// GROUP CONTROLLER - INDEX FILE
// ============================================
// هذا الملف يجمع جميع عمليات الحلقات من الملفات المنفصلة

const { createGroup } = require('./createGroup');
const {
  getAllGroups,
  getGroupById,
  getGroupsByTeacher,
  getGroupsMonthlyStats,
  getGroupsByTeacherIdWithFilters,
  getGroupStudents,
  getGroupsStats,
} = require('./getGroups');
const { updateGroup, renameGroup } = require('./updateGroup');
const { deleteGroup } = require('./deleteGroup');
const { invalidateStudentCountsCache } = require('./cache');
const { exportGroupsToCSV } = require('./ExportOperation');

module.exports = {
  // Create operations
  createGroup,

  // Read operations
  getAllGroups,
  getGroupById,
  getGroupsByTeacher,
  getGroupsMonthlyStats,
  getGroupsByTeacherIdWithFilters,
  getGroupStudents,
  getGroupsStats,

  // Update operations
  updateGroup,
  renameGroup,

  // Delete operations
  deleteGroup,

  // Export operations
  exportGroupsToCSV,

  // Cache utilities
  invalidateStudentCountsCache,
};
