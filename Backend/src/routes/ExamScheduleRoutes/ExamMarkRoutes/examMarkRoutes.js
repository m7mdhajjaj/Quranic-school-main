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
    const ExamSchedule = require("../../../schema/ExamShedule/ExamSchedule");
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

// إضافة علامة واحدة لطالب (POST /exam-schedule/marks)
router.post("/", protect, async (req, res) => {
  try {
    const { examId, studentId, mark } = req.body;
    console.log("🎯 [add-mark] Adding mark:", { examId, studentId, mark });

    if (!examId || !studentId) {
      return res.status(400).json({
        success: false,
        message: "examId و studentId مطلوبان",
      });
    }

    const ExamSchedule = require("../../../schema/ExamShedule/ExamSchedule");

    // البحث عن الامتحان
    const exam = await ExamSchedule.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "الامتحان غير موجود",
      });
    }

    // التحقق من وجود علامة سابقة للطالب
    const existingMarkIndex = exam.marks.findIndex(
      (m) => m.student.toString() === studentId.toString()
    );

    const newMark = {
      student: studentId,
      mark: mark || 0,
    };

    if (existingMarkIndex >= 0) {
      // تحديث العلامة الموجودة
      exam.marks[existingMarkIndex] = {
        ...exam.marks[existingMarkIndex],
        ...newMark,
      };
    } else {
      // إضافة علامة جديدة
      exam.marks.push(newMark);
    }

    // تحديث المعدل
    const totalMarks = exam.marks.reduce((sum, m) => sum + (m.mark || 0), 0);
    exam.examAverage =
      exam.marks.length > 0 ? totalMarks / exam.marks.length : 0;

    await exam.save();

    // إرجاع العلامة المضافة
    const addedMark = exam.marks.find(
      (m) => m.student.toString() === studentId.toString()
    );

    console.log("✅ [add-mark] Mark added successfully:", addedMark);

    res.json({
      success: true,
      mark: addedMark,
      message: "تم إضافة العلامة بنجاح",
    });
  } catch (error) {
    console.error("❌ [add-mark] Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// تحديث علامة بواسطة markId (PUT /exam-schedule/marks/:markId)
router.put("/:markId", protect, async (req, res) => {
  try {
    const { markId } = req.params;
    const { mark } = req.body;
    console.log("🎯 [update-mark] Updating mark:", { markId, mark });

    const ExamSchedule = require("../../../schema/ExamShedule/ExamSchedule");

    // البحث عن الامتحان الذي يحتوي على هذه العلامة
    const exam = await ExamSchedule.findOne({ "marks._id": markId });
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "العلامة غير موجودة",
      });
    }

    // تحديث العلامة
    const markIndex = exam.marks.findIndex((m) => m._id.toString() === markId);
    if (markIndex >= 0) {
      exam.marks[markIndex].mark = mark;
    }

    // تحديث المعدل
    const totalMarks = exam.marks.reduce((sum, m) => sum + (m.mark || 0), 0);
    exam.examAverage =
      exam.marks.length > 0 ? totalMarks / exam.marks.length : 0;

    await exam.save();

    console.log("✅ [update-mark] Mark updated successfully");

    res.json({
      success: true,
      message: "تم تحديث العلامة بنجاح",
    });
  } catch (error) {
    console.error("❌ [update-mark] Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// حذف علامة بواسطة markId (DELETE /exam-schedule/marks/:markId) - يجب أن يكون قبل /:examId
router.delete("/:markId", protect, async (req, res) => {
  try {
    const { markId } = req.params;
    console.log("🎯 [delete-mark] Deleting mark:", markId);

    // تجاهل إذا كان markId يبدو كـ examId (24 حرف hex)
    if (markId.length === 24) {
      const ExamSchedule = require("../../../schema/ExamShedule/ExamSchedule");

      // البحث عن الامتحان الذي يحتوي على هذه العلامة
      const exam = await ExamSchedule.findOne({ "marks._id": markId });
      if (exam) {
        // حذف العلامة
        exam.marks = exam.marks.filter((m) => m._id.toString() !== markId);

        // تحديث المعدل
        const totalMarks = exam.marks.reduce(
          (sum, m) => sum + (m.mark || 0),
          0
        );
        exam.examAverage =
          exam.marks.length > 0 ? totalMarks / exam.marks.length : 0;

        await exam.save();

        console.log("✅ [delete-mark] Mark deleted successfully");

        return res.json({
          success: true,
          message: "تم حذف العلامة بنجاح",
        });
      }
    }

    return res.status(404).json({
      success: false,
      message: "العلامة غير موجودة",
    });
  } catch (error) {
    console.error("❌ [delete-mark] Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// علامات طالب واحد
router.get("/student/:studentId", protect, examMarkController.getStudentMarks);

// علامات امتحان واحد
router.get("/:examId", protect, examMarkController.getExamMarks);

// معدل الامتحان
router.get("/:examId/average", protect, examMarkController.getExamAverage);

// إضافة أو تعديل علامات عدة طلاب دفعة واحدة (bulk)
router.post(
  "/bulk/:examId",
  protect,
  validateExamMarkData,
  examMarkController.setExamMarks
);

// تعديل علامة طالب واحد (legacy route)
router.put(
  "/:examId/:studentId",
  protect,
  validateExamMarkData,
  examMarkController.updateStudentMark
);

// حذف علامة طالب (legacy route)
router.delete(
  "/:examId/:studentId",
  protect,
  examMarkController.deleteStudentMark
);

// حذف علامات متعددة (Bulk Delete)
router.post("/bulk-delete", protect, examMarkController.bulkDeleteMarks);

module.exports = router;
