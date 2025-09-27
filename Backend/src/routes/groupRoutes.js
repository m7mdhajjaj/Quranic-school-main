const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const authMiddleware = require("../middleware/authMiddleware");

// جميع routes تحتاج إلى مصادقة الإداري
router.use(authMiddleware.adminProtect);

// إنشاء حلقة جديدة
router.post("/", groupController.createGroup);

// الحصول على جميع الحلقات
router.get("/", groupController.getAllGroups);

// الحصول على حلقة بالمعرف
router.get("/:id", groupController.getGroupById);

// تحديث حلقة
router.put("/:id", groupController.updateGroup);

// حذف حلقة
router.delete("/:id", groupController.deleteGroup);

// الحصول على حلقات المعلم
router.get("/teacher/:teacher", groupController.getGroupsByTeacher);

module.exports = router;
