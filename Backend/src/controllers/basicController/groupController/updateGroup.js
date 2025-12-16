// ============================================
// UPDATE GROUP OPERATIONS
// ============================================

const Group = require("../../../schema/Group");
const Teacher = require("../../../schema/Teacher");
const Student = require("../../../schema/Student");
const { findTeacherByIdOrName } = require("./helpers");
const { invalidateStudentCountsCache } = require("./cache");
const { successResponse, notFoundResponse, handleError, emitSocketEvent } = require("./utils");
const { checkDuplicateGroupName } = require("../../../utils/validators/duplicateChecker");

/**
 * تحديث حلقة
 */
exports.updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // جلب الحلقة القديمة للتحقق من التغييرات (مثل تغيير المعلم)
    const oldGroup = await Group.findById(id);
    if (!oldGroup) {
      return notFoundResponse(res, "الحلقة غير موجودة");
    }

    // التحقق من تفرد اسم الحلقة إذا تم تغييره
    if (updates.name) {
      const duplicateError = await checkDuplicateGroupName(updates.name, id);
      if (duplicateError) {
        return res.status(400).json({ 
          success: false, 
          message: duplicateError.message 
        });
      }
    }

    // التحقق من صحة المعلم إذا تم تغييره
    if (updates.teacher) {
      const teacherExists = await findTeacherByIdOrName(updates.teacher);
      if (!teacherExists) {
        return notFoundResponse(res, "المعلم المحدد غير موجود في النظام");
      }
      updates.teacher = teacherExists._id;
    }

    const group = await Group.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    emitSocketEvent("groupUpdated", group);

    // 🔔 إرسال إشعار للمعلم
    try {
      const notificationService = req.app.get('notificationService');
      if (notificationService) {
        const adminName = req.user ? `${req.user.firstName} ${req.user.lastName}` : "الإدارة";
        
        // التحقق مما إذا تم تغيير المعلم
        if (updates.teacher && oldGroup.teacher.toString() !== updates.teacher.toString()) {
          // إشعار للمعلم القديم (تم نقل الحلقة منه)
          await notificationService.notifyGroupTransferredFrom(
            oldGroup.teacher,
            oldGroup.name,
            adminName
          );
          
          // إشعار للمعلم الجديد (تم نقل الحلقة إليه)
          await notificationService.notifyGroupTransferredTo(
            group.teacher,
            group.name,
            adminName
          );
        } else {
          // إشعار تحديث عادي للمعلم الحالي
          await notificationService.notifyGroupUpdated(
            group.teacher,
            group.name,
            adminName
          );
        }
      }
    } catch (notifyError) {
      console.error("❌ فشل إرسال إشعار تحديث الحلقة:", notifyError);
    }

    return successResponse(res, group, "تم تحديث الحلقة بنجاح");
  } catch (error) {
    return handleError(res, error, "تحديث الحلقة");
  }
};

/**
 * دالة لإعادة تسمية مجموعة وتحديث جميع الطلاب المرتبطين بها
 */
exports.renameGroup = async (req, res) => {
  try {
    const { oldName, newName } = req.body;

    const group = await Group.findOne({ name: oldName });
    if (!group) {
      return notFoundResponse(res, `المجموعة "${oldName}" غير موجودة`);
    }

    // التحقق من تفرد الاسم الجديد باستخدام الدالة الموحدة
    const duplicateError = await checkDuplicateGroupName(newName, group._id);
    if (duplicateError) {
      return res.status(400).json({ 
        success: false, 
        message: duplicateError.message 
      });
    }

    // تحديث اسم المجموعة
    await Group.findByIdAndUpdate(group._id, { name: newName });

    // تحديث جميع الطلاب الذين ينتمون للمجموعة القديمة
    const updateResult = await Student.updateMany(
      { group: oldName },
      { group: newName }
    );

    // تحديث اسم الحلقة في Teacher.groups array
    const teacherUpdateResult = await Teacher.updateMany(
      { "groups.name": oldName },
      { $set: { "groups.$[elem].name": newName } },
      { arrayFilters: [{ "elem.name": oldName }] }
    );

    invalidateStudentCountsCache();

    return successResponse(res, { updatedStudents: updateResult.modifiedCount, updatedTeachers: teacherUpdateResult.modifiedCount }, `تم تحديث اسم المجموعة من "${oldName}" إلى "${newName}"`);
  } catch (error) {
    return handleError(res, error, "إعادة تسمية المجموعة");
  }
};
