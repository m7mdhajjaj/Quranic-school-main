// ============================================
// UPDATE GROUP OPERATIONS
// ============================================

const Group = require("../../schema/Group");
const Teacher = require("../../schema/Teacher");
const Student = require("../../schema/Student");
const { findTeacherByIdOrName } = require("./helpers");
const { invalidateStudentCountsCache } = require("./cache");

/**
 * تحديث حلقة
 */
exports.updateGroup = async (req, res) => {
  try {
    console.log("🔄 طلب تحديث حلقة");
    console.log("📋 معرف الحلقة:", req.params.id);
    console.log("📝 البيانات الأصلية:", req.body);
    console.log("✅ البيانات المتحقق منها:", req.validatedData);

    const { id } = req.params;
    const updates = req.validatedData || req.body;

    // التأكد من تحويل capacity إلى رقم إذا كان موجود
    if (updates.capacity) {
      updates.capacity = parseInt(updates.capacity);
      console.log("🔢 تحويل السعة إلى رقم:", updates.capacity);
    }

    // إذا كان التحديث يشمل المعلم أو اسم الحلقة، نحتاج للتحقق من القيود
    if (updates.teacher || updates.name) {
      const currentGroup = await Group.findById(id);
      if (!currentGroup) {
        return res.status(404).json({
          success: false,
          message: "الحلقة غير موجودة",
        });
      }

      const groupName = updates.name || currentGroup.name;
      const teacherToCheck = updates.teacher || currentGroup.teacher;

      if (teacherToCheck) {
        // التحقق من أن الحلقة لن تكون لها أكثر من معلم واحد
        const teacherExists = await findTeacherByIdOrName(teacherToCheck);

        if (teacherExists) {
          const teacherFullName = `${teacherExists.firstName} ${teacherExists.lastName}`;

          // التحقق من عدم وجود حلقة بنفس الاسم مع معلم مختلف
          const conflictingGroup = await Group.findOne({
            name: groupName,
            _id: { $ne: id }, // استثناء الحلقة الحالية
            $and: [
              { teacher: { $ne: teacherToCheck } },
              { teacher: { $ne: teacherExists._id.toString() } },
              { teacher: { $ne: teacherFullName } },
              { teacher: { $exists: true, $ne: null, $ne: "" } },
            ],
          });

          if (conflictingGroup) {
            return res.status(400).json({
              success: false,
              message: `الحلقة "${groupName}" مرتبطة بالفعل بمعلم آخر. لا يمكن للحلقة الواحدة أن يكون لها أكثر من معلم.`,
            });
          }
        }
      }
    }

    const group = await Group.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!group) {
      console.log("❌ الحلقة غير موجودة");
      return res.status(404).json({
        success: false,
        message: "الحلقة غير موجودة",
      });
    }

    console.log("✅ تم تحديث الحلقة بنجاح:", group);

    // Emit socket event for real-time updates
    if (global.io) {
      console.log("📡 Broadcasting group updated event");
      global.io.emit("groupUpdated", group);
    }

    res.status(200).json({
      success: true,
      message: "تم تحديث الحلقة بنجاح",
      data: group,
    });
  } catch (error) {
    console.error("❌ خطأ في تحديث الحلقة:", error);
    console.error("📋 تفاصيل الخطأ:", error.message);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث الحلقة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * دالة لإعادة تسمية مجموعة وتحديث جميع الطلاب المرتبطين بها
 */
exports.renameGroup = async (req, res) => {
  try {
    const { oldName, newName } = req.body;

    // العثور على المجموعة
    const group = await Group.findOne({ name: oldName });
    if (!group) {
      return res.status(404).json({
        success: false,
        message: `المجموعة "${oldName}" غير موجودة`,
      });
    }

    // التحقق من عدم وجود مجموعة أخرى بالاسم الجديد
    const existingGroup = await Group.findOne({ name: newName });
    if (
      existingGroup &&
      existingGroup._id.toString() !== group._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: `يوجد مجموعة أخرى بالاسم "${newName}" بالفعل`,
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

    console.log(`✅ تم تحديث اسم المجموعة من "${oldName}" إلى "${newName}"`);
    console.log(`✅ تم تحديث ${updateResult.modifiedCount} طالب`);
    console.log(`✅ تم تحديث ${teacherUpdateResult.modifiedCount} معلم`);

    // إبطال cache عدد الطلاب
    invalidateStudentCountsCache();

    res.status(200).json({
      success: true,
      message: `تم تحديث اسم المجموعة بنجاح من "${oldName}" إلى "${newName}"`,
      updatedStudents: updateResult.modifiedCount,
    });
  } catch (error) {
    console.error("Error renaming group:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إعادة تسمية المجموعة",
    });
  }
};
