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
} = require('./getGroups');
const { updateGroup, renameGroup } = require('./updateGroup');
const { deleteGroup } = require('./deleteGroup');
const { invalidateStudentCountsCache } = require('./cache');

module.exports = {
  // Create operations
  createGroup,

  // Read operations
  getAllGroups,
  getGroupById,
  getGroupsByTeacher,
  getGroupsMonthlyStats,

  // Update operations
  updateGroup,
  renameGroup,

  // Delete operations
  deleteGroup,

  // Cache utilities
  invalidateStudentCountsCache,
};
