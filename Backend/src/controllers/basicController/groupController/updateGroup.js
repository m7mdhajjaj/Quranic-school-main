// ============================================
// UPDATE GROUP OPERATIONS
// ============================================

const Group = require("../../../schema/Group");
const Teacher = require("../../../schema/Teacher");
const Student = require("../../../schema/Student");
const { findTeacherByIdOrName } = require("./helpers");
const { invalidateStudentCountsCache } = require("./cache");
const { successResponse, notFoundResponse, handleError, emitSocketEvent } = require("./utils");
const { checkDuplicateGroupName } = require("../../../Validation/validators/duplicateChecker");

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
    let newTeacherDoc = null;
    if (updates.teacher) {
      const teacherExists = await findTeacherByIdOrName(updates.teacher);
      if (!teacherExists) {
        return notFoundResponse(res, "المعلم المحدد غير موجود في النظام");
      }
      updates.teacher = teacherExists._id;
      newTeacherDoc = teacherExists;
    }

    const group = await Group.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    // ✅ FIX: معالجة نقل الحلقة بين المعلمين
    // إذا تغير المعلم، يجب تحديث سجلات المعلم القديم والجديد والطلاب
    if (newTeacherDoc && oldGroup.teacher && oldGroup.teacher.toString() !== newTeacherDoc._id.toString()) {
        try {
            // 1. إزالة الحلقة من المعلم القديم
            await Teacher.findByIdAndUpdate(oldGroup.teacher, {
                $pull: { groups: { id: oldGroup._id } }
            });

            // 2. إضافة الحلقة للمعلم الجديد
            // نتأكد أولاً أنها ليست مضافة بالفعل
            // نستخدم newTeacherDoc الذي جلبناه سابقاً، لكن قد نحتاج لإعادة جلبه لضمان تحديث الـ groups إذا كانت هناك عمليات متزامنة
            // لكن للسرعة سنستخدم ما لدينا
            const currentGroups = newTeacherDoc.groups || [];
            const isAlreadyAdded = currentGroups.some(g => g.id.toString() === group._id.toString());
            
            if (!isAlreadyAdded) {
                // نستخدم الاسم الجديد إذا تم تحديثه، وإلا الاسم القديم
                const groupName = updates.name || oldGroup.name;
                
                await Teacher.findByIdAndUpdate(newTeacherDoc._id, {
                    $push: { 
                        groups: {
                            id: group._id,
                            name: groupName,
                            number: currentGroups.length + 1
                        }
                    }
                });
            }

            // 3. تحديث معلم الطلاب في هذه الحلقة
            // Student schema uses 'teacher' as String field storing the name
            const newTeacherName = `${newTeacherDoc.firstName} ${newTeacherDoc.lastName}`;
            await Student.updateMany(
                { group: group.name },
                { teacher: newTeacherName }
            );
            
            console.log(`✅ تم نقل الحلقة "${group.name}" من المعلم ${oldGroup.teacher} إلى ${newTeacherName}`);
            
        } catch (transferError) {
             console.error("❌ خطأ في نقل الحلقة بين المعلمين:", transferError);
        }
    }

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
          // إشعار تحديث عادي للمعلم الحالي (عند تغيير الاسم أو الوصف مثلاً)
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

    // 🔔 إرسال إشعار بتغيير اسم الحلقة
    try {
      const notificationService = req.app.get('notificationService');
      if (notificationService) {
        const adminName = req.user ? `${req.user.firstName} ${req.user.lastName}` : "الإدارة";
        
        // جلب الطلاب لإشعارهم
        const students = await Student.find({ group: newName }).select('_id');
        const studentIds = students.map(s => s._id);

        await notificationService.notifyGroupRenamed(
          group.teacher,
          studentIds,
          oldName,
          newName,
          adminName
        );
      }
    } catch (notifyError) {
      console.error("❌ فشل إرسال إشعار تغيير اسم الحلقة:", notifyError);
    }

    return successResponse(res, { updatedStudents: updateResult.modifiedCount, updatedTeachers: teacherUpdateResult.modifiedCount }, `تم تحديث اسم المجموعة من "${oldName}" إلى "${newName}"`);
  } catch (error) {
    return handleError(res, error, "إعادة تسمية المجموعة");
  }
};
