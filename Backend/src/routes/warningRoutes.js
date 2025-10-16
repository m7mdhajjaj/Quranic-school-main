const express = require("express");
const router = express.Router();
const warningController = require("../controllers/warningController");
const { protect } = require("../middleware/authMiddleware");

// جلب إحصائيات الإنذارات (للمدير) - يجب أن يكون قبل الـ routes الديناميكية
router.get("/statistics/all", protect, warningController.getWarningsStatistics);

// التحقق من حالة الطالب (مفصول أم لا)
router.get("/status/:studentId", protect, warningController.checkStudentStatus);

// جلب إنذارات طالب معين
router.get(
  "/student/:studentId",
  protect,
  warningController.getStudentWarnings
);

// جلب طلاب الحلقة مع عدد الإنذارات
router.get(
  "/group/:groupId/students",
  protect,
  warningController.getGroupStudentsWithWarnings
);

// جلب إنذارات حلقة معينة (للمعلم فقط)
router.get("/group/:groupId", protect, warningController.getGroupWarnings);

// إنشاء إنذار جديد (للمعلم فقط)
router.post("/", protect, warningController.createWarning);

// حذف إنذار (للمدير فقط)
router.delete("/:warningId", protect, warningController.deleteWarning);

module.exports = router;
