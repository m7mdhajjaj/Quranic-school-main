// ============================================
// CREATE GROUP OPERATIONS
// ============================================

const Group = require("../../../schema/Group");
const Teacher = require("../../../schema/Teacher");
const { findTeacherByIdOrName } = require("./helpers");
const { successResponse, notFoundResponse, handleError, emitSocketEvent } = require("./utils");
const { checkDuplicateGroupName } = require("../../../utils/validators/duplicateChecker");

/**
 * إنشاء حلقة جديدة
 */
exports.createGroup = async (req, res) => {
  try {
    console.log("🚀 إنشاء حلقة جديدة:", req.body.name);

    const { name, teacher, description, capacity, schedule } = req.body;

    // التحقق من تفرد اسم الحلقة باستخدام الدالة الموحدة
    const duplicateError = await checkDuplicateGroupName(name);
    if (duplicateError) {
      return res.status(400).json({ 
        success: false, 
        message: duplicateError.message 
      });
    }

    // التحقق من وجود المعلم (مطلوب)
    if (!teacher) {
      return res.status(400).json({ success: false, message: "معرف المعلم مطلوب" });
    }

    const teacherExists = await findTeacherByIdOrName(teacher);
    if (!teacherExists) {
      return notFoundResponse(res, "المعلم المحدد غير موجود في النظام");
    }

    // إنشاء الحلقة (activeStatus = false لأنه لا يوجد طلاب بعد)
    const group = await Group.create({
      name,
      teacher: teacherExists._id,
      description: description || '',
      capacity: capacity || 30,
      schedule: schedule || '',
      activeStatus: false, // دائماً false عند الإنشاء
    });

    // تحديث قائمة حلقات المعلم
    const teacherGroups = teacherExists.groups || [];
    teacherGroups.push({
      id: group._id,
      name: group.name,
      number: teacherGroups.length + 1,
    });

    await Teacher.findByIdAndUpdate(teacherExists._id, { groups: teacherGroups });
    console.log(`✅ تم ربط الحلقة بالمعلم ${teacherExists.firstName} ${teacherExists.lastName} (ID: ${teacherExists._id})`);

    // Socket event
    emitSocketEvent("groupCreated", group);

    // 🔔 إرسال إشعار للمعلم
    try {
      const notificationService = req.app.get('notificationService');
      if (notificationService) {
        const adminName = req.user ? `${req.user.firstName} ${req.user.lastName}` : "الإدارة";
        await notificationService.notifyGroupAssigned(
          teacherExists._id,
          group.name,
          adminName
        );
      }
    } catch (notifyError) {
      console.error("❌ فشل إرسال إشعار تعيين الحلقة:", notifyError);
    }

    return successResponse(res, group, "تم إنشاء الحلقة بنجاح", 201);
  } catch (error) {
    return handleError(res, error, "إنشاء الحلقة");
  }
};
