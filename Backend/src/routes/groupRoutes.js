const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateGroupData } = require("../Validation/GroupValidation");

// الحصول على جميع الحلقات - متاح للجميع المسجلين (معلمين وإداريين)
router.get("/", authMiddleware.protect, groupController.getAllGroups);

// باقي routes تحتاج إلى مصادقة الإداري
// إنشاء حلقة جديدة
router.post(
  "/",
  authMiddleware.adminProtect,
  validateGroupData,
  groupController.createGroup
);

// الحصول على حلقة بالمعرف - متاح للجميع المسجلين
router.get("/:id", authMiddleware.protect, groupController.getGroupById);

// الحصول على حلقات المعلم - متاح للجميع المسجلين
router.get(
  "/teacher/:teacher",
  authMiddleware.protect,
  groupController.getGroupsByTeacher
);

// تحديث حلقة - إداري فقط
router.put(
  "/:id",
  authMiddleware.adminProtect,
  validateGroupData,
  groupController.updateGroup
);

// حذف حلقة - إداري فقط
router.delete("/:id", authMiddleware.adminProtect, groupController.deleteGroup);

// إعادة تسمية مجموعة - إداري فقط
router.post(
  "/rename",
  authMiddleware.adminProtect,
  groupController.renameGroup
);

// الحصول على إحصائيات الحلقات الشهرية - متاح للجميع المسجلين
router.get(
  "/stats/monthly",
  authMiddleware.protect,
  groupController.getGroupsMonthlyStats
);

module.exports = router;
