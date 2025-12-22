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

// 🆕 تصدير الحلقات إلى CSV - إداري فقط
router.get('/export', authMiddleware.adminProtect, groupController.exportGroupsToCSV);

// 🆕 فحص تكرار اسم الحلقة - إداري فقط
// Query params: field=name, value=<group_name>, excludeId=<group_id> (optional)
router.get('/check-duplicate', authMiddleware.adminProtect, groupController.checkDuplicateGroupName);

// الحصول على جميع الحلقات مع فلترة وترتيب - متاح للجميع المسجلين (معلمين وإداريين)
// Query params: search, teacher, capacity, status, occupancy, day, time, sortBy, sortOrder, page, limit
router.get('/', authMiddleware.protect, groupController.getAllGroups);

// باقي routes تحتاج إلى مصادقة الإداري
// إنشاء حلقة جديدة
router.post(
  '/',
  authMiddleware.adminProtect,
  createGroupValidation,
  groupController.createGroup
);

// الحصول على حلقة بالمعرف - متاح للجميع المسجلين
router.get('/:id', authMiddleware.protect, getGroupByIdValidation, groupController.getGroupById);

// 🆕 جلب طلاب حلقة معينة - متاح للجميع المسجلين
router.get('/:id/students', authMiddleware.protect, getGroupStudentsValidation, groupController.getGroupStudents);

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

// تحديث حلقة - إداري فقط
router.put(
  '/:id',
  authMiddleware.adminProtect,
  updateGroupValidation,
  groupController.updateGroup
);

// حذف حلقة - إداري فقط
router.delete('/:id', authMiddleware.adminProtect, deleteGroupValidation, groupController.deleteGroup);

// إعادة تسمية مجموعة - إداري فقط
router.post(
  '/rename',
  authMiddleware.adminProtect,
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
