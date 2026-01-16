const express = require('express');
const router = express.Router();
const groupController = require('../../controllers/basicController/groupController');
const authMiddleware = require('../../middleware/auth');
const {
  createGroupValidation,
  updateGroupValidation,
  deleteGroupValidation,
  getGroupByIdValidation,
  getGroupStudentsValidation,
  renameGroupValidation,
  getGroupsByTeacherIdValidation,
} = require('../../Validation/Group/groupValidators');

// 🆕 الحصول على إحصائيات الحلقات - متاح للجميع المسجلين
router.get('/stats/overview', authMiddleware.protect, groupController.getGroupsStats);

// 🆕 تصدير الحلقات إلى CSV - إداري أو سكرتير لديه صلاحية إدارة
router.get('/export', authMiddleware.secretaryGroupsAccess('manage'), groupController.exportGroupsToCSV);

// 🆕 فحص تكرار اسم الحلقة - إداري أو سكرتير لديه صلاحية إدارة
// Query params: field=name, value=<group_name>, excludeId=<group_id> (optional)
router.get('/check-duplicate', authMiddleware.secretaryGroupsAccess('manage'), groupController.checkDuplicateGroupName);

// الحصول على جميع الحلقات مع فلترة وترتيب - إداري أو سكرتير لديه صلاحية عرض على الأقل
// Query params: search, teacher, capacity, status, occupancy, day, time, sortBy, sortOrder, page, limit
router.get('/', authMiddleware.secretaryGroupsAccess('view'), groupController.getAllGroups);

// باقي routes تحتاج إلى مصادقة الإداري أو سكرتير لديه صلاحية إدارة
// إنشاء حلقة جديدة
router.post(
  '/',
  authMiddleware.secretaryGroupsAccess('manage'),
  createGroupValidation,
  groupController.createGroup
);

// الحصول على حلقة بالمعرف - إداري أو سكرتير لديه صلاحية عرض على الأقل
router.get('/:id', authMiddleware.secretaryGroupsAccess('view'), getGroupByIdValidation, groupController.getGroupById);

// 🆕 جلب طلاب حلقة معينة - إداري أو سكرتير لديه صلاحية عرض على الأقل
router.get('/:id/students', authMiddleware.secretaryGroupsAccess('view'), getGroupStudentsValidation, groupController.getGroupStudents);

// الحصول على حلقات المعلم - متاح للجميع المسجلين
router.get(
  '/teacher/:teacher',
  authMiddleware.protect,
  groupController.getGroupsByTeacher
);

// 🆕 الحصول على حلقات المعلم بفلاتر مرنة (بواسطة ID)
// Query params: filter=all|withStudents|withoutStudents, includeStudents=true|false
router.get(
  '/teacher-id/:teacherId/filtered',
  authMiddleware.protect,
  getGroupsByTeacherIdValidation,
  groupController.getGroupsByTeacherIdWithFilters
);

// تحديث حلقة - إداري أو سكرتير لديه صلاحية إدارة
router.put(
  '/:id',
  authMiddleware.secretaryGroupsAccess('manage'),
  updateGroupValidation,
  groupController.updateGroup
);

// حذف حلقة - إداري أو سكرتير لديه صلاحية إدارة
router.delete('/:id', authMiddleware.secretaryGroupsAccess('manage'), deleteGroupValidation, groupController.deleteGroup);

// إعادة تسمية مجموعة - إداري أو سكرتير لديه صلاحية إدارة
router.post(
  '/rename',
  authMiddleware.secretaryGroupsAccess('manage'),
  renameGroupValidation,
  groupController.renameGroup
);

// الحصول على إحصائيات الحلقات الشهرية - متاح للجميع المسجلين
router.get(
  '/stats/monthly',
  authMiddleware.protect,
  groupController.getGroupsMonthlyStats
);

module.exports = router;
