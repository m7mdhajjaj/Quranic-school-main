// ============================================
// CREATE GROUP OPERATIONS
// ============================================

const Group = require("../../../schema/Group");
const Teacher = require("../../../schema/Teacher");
const { findTeacherByIdOrName } = require("./helpers");
const { successResponse, notFoundResponse, handleError, emitSocketEvent } = require("./utils");

/**
 * إنشاء حلقة جديدة
 */
exports.createGroup = async (req, res) => {
  try {
    console.log("🚀 إنشاء حلقة جديدة:", req.body.name);

    const { name, teacher, description, capacity, schedule } = req.body;

    // التحقق من تفرد اسم الحلقة
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({ success: false, message: "يوجد حلقة بنفس الاسم بالفعل" });
    }

    // التحقق من وجود المعلم (إذا تم تحديده)
    let teacherExists = null;
    if (teacher) {
      teacherExists = await findTeacherByIdOrName(teacher);
      if (!teacherExists) {
        return notFoundResponse(res, "المعلم المحدد غير موجود في النظام");
      }
    }

    const teacherFullName = teacherExists ? `${teacherExists.firstName} ${teacherExists.lastName}` : null;

    // إنشاء الحلقة
    const group = await Group.create({
      name,
      teacher: teacherExists ? teacherExists._id : null,
      teacherName: teacherFullName,
      description: description || '',
      capacity: capacity || 30,
      schedule: schedule || '',
    });

    // تحديث قائمة حلقات المعلم
    if (teacherExists) {
      const teacherGroups = teacherExists.groups || [];
      teacherGroups.push({
        id: group._id,
        name: group.name,
        number: teacherGroups.length + 1,
      });

      await Teacher.findByIdAndUpdate(teacherExists._id, { groups: teacherGroups });
      console.log(`✅ تم ربط الحلقة بالمعلم ${teacherFullName}`);
    }

    // Socket event
    emitSocketEvent("groupCreated", group);

    return successResponse(res, group, "تم إنشاء الحلقة بنجاح", 201);
  } catch (error) {
    return handleError(res, error, "إنشاء الحلقة");
  }
};
