// ============================================
// DELETE GROUP OPERATIONS
// ============================================

const Group = require("../../../schema/Group");
const Teacher = require("../../../schema/Teacher");
const Student = require("../../../schema/Student");
const TimeTable = require("../../../schema/TimeTable");
const DailyPoints = require("../../../schema/DailyPoints");
const ExamSchedule = require("../../../schema/ExamSchedule");
const ExamMark = require("../../../schema/ExamMark");
const Warning = require("../../../schema/Warning");
const Ranking = require("../../../schema/Ranking");
const { invalidateStudentCountsCache } = require("./cache");
const { successResponse, notFoundResponse, handleError, emitSocketEvent } = require("./utils");

/**
 * حذف حلقة (حذف فعلي من قاعدة البيانات)
 */
exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return notFoundResponse(res, "الحلقة غير موجودة");
    }

    // إزالة الحلقة من الطلاب
    const relatedStudents = await Student.find({ group: group.name });
    if (relatedStudents.length > 0) {
      // ✅ إزالة الحلقة والمعلم من الطلاب كما طلب المستخدم
      await Student.updateMany(
        { group: group.name }, 
        { 
          $unset: { group: "", teacher: "" },
          // أو يمكن تعيينها للقيم الافتراضية إذا كان ذلك مفضلاً
          // $set: { group: "غير محدد", teacher: "غير محدد" }
        }
      );
      console.log(`✅ تم إزالة الحلقة والمعلم من ${relatedStudents.length} طالب`);
    }

    // إزالة الحلقة من المعلمين
    await Teacher.updateMany({ "groups.id": id }, { $pull: { groups: { id: id } } });

    // ✅ حذف المواعيد المرتبطة بالحلقة
    await TimeTable.deleteMany({ groupId: id });

    // ✅ حذف النقاط اليومية المرتبطة بالحلقة (باستخدام اسم الحلقة)
    await DailyPoints.deleteMany({ group: group.name });
    console.log(`✅ تم حذف النقاط اليومية للحلقة: ${group.name}`);

    // ✅ حذف الامتحانات وعلاماتها المرتبطة بالحلقة
    const groupExams = await ExamSchedule.find({ group: group.name }).select('_id');
    const examIds = groupExams.map(exam => exam._id);
    if (examIds.length > 0) {
      // حذف العلامات التفصيلية أولاً
      await ExamMark.deleteMany({ exam: { $in: examIds } });
      // حذف جداول الامتحانات
      await ExamSchedule.deleteMany({ _id: { $in: examIds } });
      console.log(`✅ تم حذف ${examIds.length} امتحان وعلاماتها المرتبطة بالحلقة`);
    }

    // ✅ حذف التحذيرات المرتبطة بالحلقة
    await Warning.deleteMany({ groupId: id });
    console.log(`✅ تم حذف التحذيرات المرتبطة بالحلقة`);

    // ✅ حذف التصنيفات المرتبطة بالحلقة
    await Ranking.deleteMany({ group: group.name });
    console.log(`✅ تم حذف التصنيفات المرتبطة بالحلقة`);

    // حذف الحلقة
    await Group.findByIdAndDelete(id);
    invalidateStudentCountsCache();

    emitSocketEvent("groupDeleted", { groupId: id, groupName: group.name });

    // 🔔 إرسال إشعار للمعلم والطلاب
    try {
      const notificationService = req.app.get('notificationService');
      if (notificationService) {
        const adminName = req.user ? `${req.user.firstName} ${req.user.lastName}` : "الإدارة";
        
        // 1. إشعار للمعلم
        await notificationService.notifyGroupDeleted(
          group.teacher,
          group.name,
          adminName
        );

        // 2. إشعار للطلاب
        if (relatedStudents.length > 0) {
          const studentIds = relatedStudents.map(s => s._id);
          await notificationService.notifyGroupDeletedForStudents(
            studentIds,
            group.name,
            adminName
          );
        }
      }
    } catch (notifyError) {
      console.error("❌ فشل إرسال إشعار حذف الحلقة:", notifyError);
    }

    return successResponse(res, { deletedStudentsCount: relatedStudents.length }, "تم حذف الحلقة بنجاح");
  } catch (error) {
    return handleError(res, error, "حذف الحلقة");
  }
};
