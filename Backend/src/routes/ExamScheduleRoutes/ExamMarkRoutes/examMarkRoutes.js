const express = require("express");
const router = express.Router();
const { protect } = require("../../../middleware/auth");
const examMarkController = require("../../../controllers/ExamShedule/Mark");
const {
  validateExamMarkData,
} = require("../../../Validation/ExamSchedule/ExamMarkValidation");
const {
  getGroupsByTeacherIdWithFilters,
} = require("../../../controllers/basicController/groupController/getGroups");
const Student = require("../../../schema/Student/Student");

// حلقات المعلم مع الطلاب لإدارة العلامات
router.get("/teacher-groups", protect, async (req, res) => {
  try {
    console.log("🎯 [teacher-groups] Route called");
    console.log("🎯 [teacher-groups] User ID:", req.user.id);

    // جلب الحلقات مع الطلاب مباشرة
    const Group = require("../../../schema/Group");
    const ExamSchedule = require("../../../schema/ExamSchedule");
    const Teacher = require("../../../schema/Teacher");

    const teacherId = req.user.id;

    // 1. جلب المعلم
    const teacher = await Teacher.findById(teacherId).select(
      "firstName lastName"
    );
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "المعلم غير موجود" });
    }

    // 2. جلب حلقات المعلم
    const groups = await Group.find({ teacher: teacherId })
      .select("name _id capacity description")
      .lean()
      .sort({ name: 1 });

    console.log(`🎯 [teacher-groups] Found ${groups.length} groups`);

    // 3. جلب الطلاب والامتحانات لكل حلقة
    const groupsWithData = await Promise.all(
      groups.map(async (group) => {
        // جلب الطلاب
        const students = await Student.find({ group: group.name })
          .select("_id studentId firstName lastName phoneNumber gender")
          .lean()
          .sort({ firstName: 1 });

        console.log(
          `🎯 [teacher-groups] Group "${group.name}": ${students.length} students`
        );

        // جلب عدد الامتحانات
        const examCount = await ExamSchedule.countDocuments({
          group: group.name,
        });

        return {
          ...group,
          students: students.map((s) => ({
            _id: s._id,
            studentId: s.studentId,
            name: `${s.firstName} ${s.lastName}`,
            firstName: s.firstName,
            lastName: s.lastName,
            phoneNumber: s.phoneNumber,
            gender: s.gender === "ذكر" ? "male" : "female",
          })),
          totalStudents: students.length,
          examCount,
          hasStudents: students.length > 0,
        };
      })
    );

    console.log(
      `🎯 [teacher-groups] Sending response with ${groupsWithData.length} groups`
    );

    res.json({
      success: true,
      data: {
        teacher: {
          _id: teacher._id,
          name: `${teacher.firstName} ${teacher.lastName}`,
        },
        groups: groupsWithData,
        summary: {
          totalGroups: groupsWithData.length,
          totalStudents: groupsWithData.reduce(
            (sum, g) => sum + g.totalStudents,
            0
          ),
        },
      },
    });
  } catch (error) {
    console.error("❌ [teacher-groups] Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// علامات طالب واحد
router.get("/student/:studentId", protect, examMarkController.getStudentMarks);

// علامات امتحان واحد
router.get("/:examId", protect, examMarkController.getExamMarks);

// معدل الامتحان
router.get("/:examId/average", protect, examMarkController.getExamAverage);

// إضافة أو تعديل علامات عدة طلاب دفعة واحدة
router.post(
  "/:examId",
  protect,
  validateExamMarkData,
  examMarkController.setExamMarks
);

// تعديل علامة طالب واحد
router.put(
  "/:examId/:studentId",
  protect,
  validateExamMarkData,
  examMarkController.updateStudentMark
);

// حذف علامة طالب
router.delete(
  "/:examId/:studentId",
  protect,
  examMarkController.deleteStudentMark
);

// حذف علامات متعددة (Bulk Delete)
router.post("/bulk-delete", protect, examMarkController.bulkDeleteMarks);

module.exports = router;
