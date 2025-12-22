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
const { getActiveGroups } = require('./getActiveGroups');
const { updateGroup, renameGroup } = require('./updateGroup');
const { deleteGroup } = require('./deleteGroup');
const { invalidateStudentCountsCache } = require('./cache');
const { exportGroupsToCSV } = require('./ExportOperation');
const { validateAndCheckGroupName } = require('../../../Validation/validators/duplicateChecker');
const { updateGroupActiveStatus, updateGroupsActiveStatusOnStudentMove } = require('./updateActiveStatus');

/**
 * Controller wrapper لفحص تكرار اسم الحلقة
 * يستخدم الدالة الموحدة من duplicateChecker
 */
const checkDuplicateGroupName = async (req, res) => {
  try {
    const { field, value, excludeId } = req.query;

    if (!field || !value) {
      return res.status(400).json({
        success: false,
        message: "الحقل والقيمة مطلوبان للفحص",
      });
    }

    if (field !== "name") {
      return res.status(400).json({
        success: false,
        message: "الحقل المطلوب فحصه غير مدعوم",
      });
    }

    return await validateAndCheckGroupName(req, res, value, excludeId);
  } catch (error) {
    console.error("❌ خطأ في فحص تكرار اسم الحلقة:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء التحقق من اسم الحلقة",
      error: error.message,
    });
  }
};

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
  getActiveGroups,

  // Update operations
  updateGroup,
  renameGroup,

  // Delete operations
  deleteGroup,

  // Export operations
  exportGroupsToCSV,

  // Validation operations
  checkDuplicateGroupName,

  // Active Status utilities
  updateGroupActiveStatus,
  updateGroupsActiveStatusOnStudentMove,

  // Cache utilities
  invalidateStudentCountsCache,
};
