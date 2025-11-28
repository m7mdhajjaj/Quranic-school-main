// ============================================
// CREATE GROUP OPERATIONS
// ============================================

const Group = require("../../../schema/Group");
const Teacher = require("../../../schema/Teacher");
const { findTeacherByIdOrName } = require("./helpers");

/**
 * إنشاء حلقة جديدة
 */
exports.createGroup = async (req, res) => {
  try {
    console.log("🚀 طلب إنشاء حلقة جديدة");
    console.log("📋 البيانات الأصلية:", req.body);
    console.log("✅ البيانات المتحقق منها:", req.validatedData);

    const groupData = req.validatedData || req.body;
    const { name, teacher, description, capacity, schedule } = groupData;

    // التحقق من وجود الحلقة بنفس الاسم
    console.log("🔍 التحقق من تفرد اسم الحلقة:", name);
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      console.log("❌ اسم الحلقة موجود بالفعل");
      return res.status(400).json({
        success: false,
        message: "يوجد حلقة بنفس الاسم بالفعل",
      });
    }
    console.log("✅ اسم الحلقة متاح");

    // التحقق من وجود المعلم
    console.log("🔍 البحث عن المعلم:", teacher);
    const teacherExists = await findTeacherByIdOrName(teacher);

    console.log(
      "✅ نتيجة البحث عن المعلم:",
      teacherExists ? "موجود" : "غير موجود"
    );

    if (!teacherExists) {
      return res.status(400).json({
        success: false,
        message: "المعلم المحدد غير موجود في النظام",
      });
    }

    // التحقق من أن المعلم ليس لديه حلقة أخرى بنفس الاسم
    console.log("🔍 التحقق من تفرد المعلم للحلقة");
    const teacherFullName = `${teacherExists.firstName} ${teacherExists.lastName}`;
    const existingGroupByTeacher = await Group.findOne({
      name: name,
      $or: [
        { teacher: teacher },
        { teacher: teacherExists._id },
        { teacher: teacherExists._id.toString() },
      ],
    });

    if (existingGroupByTeacher) {
      return res.status(400).json({
        success: false,
        message: `الحلقة "${name}" مرتبطة بالفعل بهذا المعلم. لا يمكن للحلقة الواحدة أن يكون لها أكثر من معلم.`,
      });
    }

    // التحقق من أن الحلقة ليس لها معلم آخر
    const existingGroupWithDifferentTeacher = await Group.findOne({
      name: name,
      $and: [
        { teacher: { $ne: teacher } },
        { teacher: { $ne: teacherExists._id } },
        { teacher: { $ne: teacherExists._id.toString() } },
        { teacher: { $exists: true, $ne: null, $ne: "" } },
      ],
    });

    if (existingGroupWithDifferentTeacher) {
      return res.status(400).json({
        success: false,
        message: `الحلقة "${name}" مرتبطة بالفعل بمعلم آخر. لا يمكن للحلقة الواحدة أن يكون لها أكثر من معلم.`,
      });
    }

    // إنشاء حلقة جديدة
    console.log("📝 إنشاء الحلقة في قاعدة البيانات...");

    const group = await Group.create({
      name,
      teacher: teacherExists._id, // حفظ ID المعلم بدلاً من الاسم لتجنب التداخل
      teacherName: teacherFullName, // الاحتفاظ بالاسم للعرض
      description,
      capacity,
      schedule,
    });

    console.log("✨ تم إنشاء الحلقة بنجاح:", group._id);

    // تحديث المعلم لإضافة الحلقة إلى قائمة حلقاته
    if (teacherExists) {
      const teacherGroups = teacherExists.groups || [];

      // التحقق من عدم وجود الحلقة مسبقاً
      const groupExists = teacherGroups.some(
        (g) => g.id && g.id.toString() === group._id.toString()
      );

      if (!groupExists) {
        teacherGroups.push({
          id: group._id,
          name: group.name,
          number: teacherGroups.length + 1,
        });

        await Teacher.findByIdAndUpdate(teacherExists._id, {
          groups: teacherGroups,
        });

        console.log(`✅ تم إضافة الحلقة إلى المعلم ${teacherFullName}`);
      }
    }

    // Emit socket event for real-time updates
    if (global.io) {
      console.log("📡 Broadcasting group created event");
      global.io.emit("groupCreated", group);
    }

    res.status(201).json({
      success: true,
      message: "تم إنشاء الحلقة بنجاح",
      data: group,
    });
  } catch (error) {
    console.error("❌ خطأ في إنشاء الحلقة:", error);
    console.error("📋 تفاصيل الخطأ:", error.message);
    console.error("📚 Stack trace:", error.stack);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء الحلقة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
