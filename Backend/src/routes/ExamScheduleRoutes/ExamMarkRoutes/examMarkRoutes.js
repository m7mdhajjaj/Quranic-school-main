const express = require("express");
const router = express.Router();
const { protect } = require("../../../middleware/auth");
const examMarkController = require("../../../controllers/ExamShedule/Mark");
const { validateExamMarkData } = require("../../../Validation/ExamSchedule/ExamMarkValidation");
const { getGroupsByTeacherIdWithFilters } = require("../../../controllers/basicController/groupController/getGroups");

// حلقات المعلم مع الطلاب لإدارة العلامات (استخدام controller موجود)
router.get("/teacher-groups", protect, async (req, res) => {
  // تمرير teacherId من المستخدم المسجل
  req.params.teacherId = req.user.id;
  req.query.includeStudents = 'true'; // جلب الطلاب دائماً
  return getGroupsByTeacherIdWithFilters(req, res);
});

// علامات طالب واحد
router.get("/student/:studentId", protect, examMarkController.getStudentMarks);

// علامات امتحان واحد
router.get("/:examId", protect, examMarkController.getExamMarks);

// معدل الامتحان
router.get("/:examId/average", protect, examMarkController.getExamAverage);

// إضافة أو تعديل علامات عدة طلاب دفعة واحدة
router.post("/:examId", protect, validateExamMarkData, examMarkController.setExamMarks);

// تعديل علامة طالب واحد
router.put("/:examId/:studentId", protect, validateExamMarkData, examMarkController.updateStudentMark);

// حذف علامة طالب
router.delete("/:examId/:studentId", protect, examMarkController.deleteStudentMark);

// حذف علامات متعددة (Bulk Delete)
router.post("/bulk-delete", protect, examMarkController.bulkDeleteMarks);

module.exports = router;
