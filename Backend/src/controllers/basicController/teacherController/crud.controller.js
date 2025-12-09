const Teacher = require("../../../schema/Teacher");
const Group = require("../../../schema/Group");
const Student = require("../../../schema/Student");
const bcrypt = require("bcryptjs");
const { calculateAge, generateTeacherId } = require("./utils.controller");

/**
 * جلب جميع المعلمين مع حلقاتهم (محسّن)
 */
exports.getAllTeachers = async (req, res) => {
  try {
    // جلب جميع المعلمين والحلقات في استعلامين فقط
    const [teachers, allGroups] = await Promise.all([
      Teacher.find({}).select("-password").lean(),
      Group.find({}).select("name teacher _id").lean()
    ]);

    // إنشاء Map للحلقات حسب المعلم (للبحث السريع)
    const groupsByTeacher = new Map();
    allGroups.forEach(group => {
      const teacherId = group.teacher?.toString();
      if (teacherId) {
        if (!groupsByTeacher.has(teacherId)) {
          groupsByTeacher.set(teacherId, []);
        }
        groupsByTeacher.get(teacherId).push({
          name: group.name,
          id: group._id,
        });
      }
    });

    // إضافة الحلقات لكل معلم
    const teachersWithGroups = teachers.map(teacher => {
      const teacherId = teacher._id.toString();
      const groups = groupsByTeacher.get(teacherId) || teacher.groups || [];
      
      return {
        ...teacher,
        groups: groups.map((g, index) => ({
          ...g,
          number: index + 1
        }))
      };
    });

    return res.status(200).json({ success: true, data: teachersWithGroups });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return res
      .status(500)
      .json({ success: false, message: "حدث خطأ أثناء جلب المعلمين" });
  }
};

/**
 * جلب معلم واحد بواسطة ID
 */
exports.getTeacherById = async (req, res) => {
  try {
    console.log('🔍 getTeacherById - ID:', req.params.id);
    const teacher = await Teacher.findById(req.params.id).select("-password");
    console.log('🔍 getTeacherById - Teacher found:', teacher ? 'Yes' : 'No');
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "المعلم غير موجود" });
    }
    return res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return res
      .status(500)
      .json({ success: false, message: "حدث خطأ أثناء جلب المعلم" });
  }
};

/**
 * إنشاء معلم جديد
 * البيانات تأتي مُتحققة من middleware (validateTeacherData)
 */
exports.createTeacher = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      fatherName,
      grandFatherName,
      motherName,
      idNumber,
      birthDate,
      gender,
      residence,
      groups = [],
      yearsOfExperience = 0,
      role = "teacher",
      password,
    } = req.body;

    // teacherId + password
    let teacherId;
    try {
      teacherId = await generateTeacherId();
      console.log(`✅ Generated sequential teacherId: ${teacherId}`);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "خطأ في إنشاء رقم المعلم",
      });
    }

    const rawPass = password || String(teacherId);
    const hashed = await bcrypt.hash(rawPass, 10);

    // age
    const age = calculateAge(birthDate);

    // التحقق من أن الحلقات المضافة للمعلم الجديد لا تحتوي على معلمين آخرين
    if (Array.isArray(groups) && groups.length > 0) {
      for (const groupItem of groups) {
        const groupName =
          typeof groupItem === "string" ? groupItem : groupItem.name;

        // التحقق من وجود الحلقة مع معلم آخر
        const existingGroup = await Group.findOne({
          name: groupName,
          teacher: { $exists: true, $ne: null, $ne: "" },
        });

        if (existingGroup) {
          return res.status(400).json({
            success: false,
            message: `الحلقة "${groupName}" مرتبطة بالفعل بمعلم آخر. لا يمكن للحلقة الواحدة أن يكون لها أكثر من معلم.`,
            field: "groups",
          });
        }
      }
    }

    const doc = await Teacher.create({
      teacherId,
      password: hashed,
      firstName,
      lastName,
      fatherName,
      grandFatherName,
      motherName,
      idNumber,
      birthDate,
      age,
      gender,
      residence,
      email,
      phoneNumber,
      groups: Array.isArray(groups)
        ? groups.map((group) => {
            // دعم البيانات القديمة والجديدة
            if (typeof group === "string") {
              return {
                id: null,
                name: group,
                number: 1,
              };
            }
            return group;
          })
        : [],
      yearsOfExperience,
      role,
    });

    console.log("Teacher created successfully:", doc._id);

    // تحديث الحلقات لربطها بالمعلم الجديد
    if (Array.isArray(groups) && groups.length > 0) {
      const teacherFullName = `${firstName} ${lastName}`;

      for (const groupItem of groups) {
        const groupId = typeof groupItem === "object" ? groupItem.id : null;

        if (groupId) {
          await Group.findByIdAndUpdate(groupId, {
            teacher: doc._id,
            teacherName: teacherFullName,
          });
          console.log(
            `✅ تم ربط الحلقة ${groupId} بالمعلم ${doc._id} (${teacherFullName})`
          );
        }
      }
    }

    // Emit socket event for real-time update
    if (global.io) {
      global.io.emit("teacherCreated", doc);
      console.log("📡 Teacher created event emitted via socket");
    }

    return res
      .status(201)
      .json({ success: true, message: "تم إنشاء المعلم بنجاح", data: doc });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return handleTeacherError(error, res, "إنشاء");
  }
};

/**
 * تحديث بيانات معلم
 * البيانات تأتي مُتحققة من middleware (validateTeacherData)
 */
exports.updateTeacher = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = { ...req.body };

    // معالجة كلمة المرور
    if (!updates.password || updates.password.trim() === "") {
      delete updates.password;
    } else {
      // Check if already hashed
      if (!updates.password.startsWith('$2')) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }
    }

    // Handle age calculation
    if (updates.birthDate) {
      updates.age = calculateAge(updates.birthDate);
    }

    // --- إدارة الحلقات ---
    const currentTeacher = await Teacher.findById(id);
    if (!currentTeacher) {
      return res
        .status(404)
        .json({ success: false, message: "المعلم غير موجود" });
    }
    const teacherFullName = `${currentTeacher.firstName} ${currentTeacher.lastName}`;

    // 1. جلب الحلقات الحالية للمعلم
    const currentGroupIds = currentTeacher.groups.map((g) => g.id);

    // 2. جلب الحلقات الجديدة من الطلب
    const newGroupIds = Array.isArray(updates.groups)
      ? updates.groups.map((g) => g.id)
      : [];

    // 3. تحديد الحلقات التي يجب إزالة المعلم منها
    const groupsToRemove = currentGroupIds.filter(
      (id) => !newGroupIds.includes(id)
    );
    if (groupsToRemove.length > 0) {
      await Group.updateMany(
        { _id: { $in: groupsToRemove } },
        { $unset: { teacher: "" } }
      );
    }

    // 4. التحقق من الحلقات الجديدة وتعيينها
    if (Array.isArray(updates.groups)) {
      for (const groupItem of updates.groups) {
        const group = await Group.findById(groupItem.id);
        if (
          group &&
          group.teacher &&
          group.teacher.toString() !== currentTeacher._id.toString()
        ) {
          return res.status(400).json({
            success: false,
            message: `الحلقة "${group.name}" مرتبطة بالفعل بمعلم آخر.`,
            field: "groups",
          });
        }
        await Group.updateOne(
          { _id: groupItem.id },
          {
            teacher: currentTeacher._id,
            teacherName: teacherFullName,
          }
        );
      }
    }

    const updated = await Teacher.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "المعلم غير موجود" });
    }

    // Emit socket event for real-time update
    const io = req.app.get("io");
    if (io) {
      io.to("profile").emit("profileUpdated", {
        user: updated,
        userId: req.params.id,
        userRole: "teacher",
        timestamp: Date.now(),
      });
      console.log("📡 Profile updated event emitted via socket (teacher)");
    }

    return res.status(200).json({
      success: true,
      message: "تم تحديث بيانات المعلم بنجاح",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating teacher:", error);
    return handleTeacherError(error, res, "تحديث");
  }
};

/**
 * حذف معلم (حذف نهائي)
 */
exports.deleteTeacher = async (req, res) => {
  try {
    const id = req.params.id;
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "المعلم غير موجود" });
    }

    const teacherName = `${teacher.firstName} ${teacher.lastName}`;
    console.log(`🗑️ جاري حذف المعلم: ${teacherName}`);

    // 1. إزالة المعلم من الحلقات
    const relatedGroups = await Group.find({
      $or: [
        { teacher: teacherName },
        { teacherName: teacherName },
        { teacher: teacher._id },
        { teacher: teacher._id.toString() },
      ],
    });

    if (relatedGroups.length > 0) {
      await Group.updateMany(
        {
          $or: [
            { teacher: teacherName },
            { teacherName: teacherName },
            { teacher: teacher._id },
            { teacher: teacher._id.toString() },
          ],
        },
        {
          $unset: { teacher: "", teacherName: "" },
        }
      );
      console.log(`✅ تم إزالة المعلم من ${relatedGroups.length} حلقة`);
    }

    // 2. إزالة المعلم من الطلاب
    const relatedStudents = await Student.find({
      teacher: teacherName,
    });

    if (relatedStudents.length > 0) {
      await Student.updateMany(
        { teacher: teacherName },
        { $unset: { teacher: "" } }
      );
      console.log(`✅ تم إزالة المعلم من ${relatedStudents.length} طالب`);
    }

    // 3. حذف المعلم نهائياً
    await Teacher.findByIdAndDelete(id);
    console.log(`🗑️ تم حذف المعلم ${teacherName} نهائياً من قاعدة البيانات`);

    // Emit socket event
    if (global.io) {
      global.io.emit("teacherDeleted", { _id: id, teacherName });
      console.log("📡 Teacher deleted event emitted via socket");
    }

    return res.status(200).json({
      success: true,
      message: `تم حذف المعلم بنجاح. تم إزالته من ${relatedGroups.length} حلقة و ${relatedStudents.length} طالب.`,
      details: {
        groupsUpdated: relatedGroups.length,
        studentsUpdated: relatedStudents.length,
      },
    });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف المعلم",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * معالجة أخطاء المعلمين (دالة مساعدة)
 */
function handleTeacherError(error, res, operation) {
  if (error.name === "ValidationError") {
    const validationErrors = {};
    const errorMessages = [];

    Object.keys(error.errors).forEach((field) => {
      const fieldError = error.errors[field];
      validationErrors[field] = fieldError.message;

      if (field === "idNumber") {
        errorMessages.push("رقم الهوية يجب أن يتكون من 9 أرقام فقط");
      } else if (field === "phoneNumber") {
        errorMessages.push("رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام");
      } else if (field === "email") {
        errorMessages.push("البريد الإلكتروني غير صحيح");
      } else {
        errorMessages.push(`${field}: ${fieldError.message}`);
      }
    });

    return res.status(400).json({
      success: false,
      message: `خطأ في التحقق من البيانات: ${errorMessages.join(", ")}`,
      errors: validationErrors,
      validationErrors: errorMessages,
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const arabicFields = {
      idNumber: "رقم الهوية",
      phoneNumber: "رقم الهاتف",
      email: "البريد الإلكتروني"
    };

    return res.status(400).json({
      success: false,
      message: `${arabicFields[field] || field} موجود بالفعل في النظام`,
      field: field,
    });
  }

  return res.status(500).json({
    success: false,
    message: `حدث خطأ غير متوقع أثناء ${operation} بيانات المعلم`,
    error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
  });
}

/**
 * جلب المعلم مع جميع حلقاته وطلابه مع إحصائيات الغياب
 * هذا endpoint محسّن خصيصاً لصفحة الحضور والغياب
 * يستخدم الـ functions الموجودة في studentController
 */
exports.getTeacherWithGroupsAndStudents = async (req, res) => {
  try {
    const { id: teacherId } = req.params;
    console.log(`⚡ جلب بيانات المعلم مع الحلقات والطلاب - ID: ${teacherId}`);
    const startTime = Date.now();

    // 1. جلب المعلم
    const teacher = await Teacher.findById(teacherId).select(
      "teacherId firstName lastName fatherName groups"
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "المعلم غير موجود",
      });
    }

    const teacherFullName = `${teacher.firstName} ${teacher.lastName}`;
    console.log(`👨‍🏫 المعلم: ${teacherFullName}`);

    // 2. جلب جميع حلقات المعلم من جدول Group
    const groups = await Group.find({
      $or: [
        { teacher: teacher._id },
        { teacher: teacher._id.toString() },
        { teacherName: teacherFullName },
      ],
    })
      .select("name _id")
      .lean();

    console.log(`📚 عدد الحلقات: ${groups.length}`);
    if (groups.length > 0) {
      console.log(`   الحلقات: ${groups.map((g) => g.name).join(", ")}`);
    }

    // 3. استخدام الـ function الموجودة في studentController للحصول على الطلاب مع إحصائيات الغياب
    const { getStudentsWithAbsenceStats } = require("../studentController/absence.controller");
    
    // محاكاة request object
    const mockReq = {
      query: {
        teacher: teacherFullName,
      },
    };

    // محاكاة response object
    let studentsWithStats = [];
    const mockRes = {
      json: (data) => {
        studentsWithStats = data;
        return mockRes;
      },
      status: (code) => mockRes,
    };

    // استدعاء الـ function الموجودة
    await getStudentsWithAbsenceStats(mockReq, mockRes);

    const duration = Date.now() - startTime;
    console.log(
      `✅ تم جلب بيانات المعلم مع ${groups.length} حلقة و ${studentsWithStats.length} طالب في ${duration}ms`
    );

    res.json({
      success: true,
      data: {
        teacher: {
          _id: teacher._id,
          teacherId: teacher.teacherId,
          name: teacherFullName,
        },
        groups: groups.map((g) => ({ _id: g._id, name: g.name })),
        students: studentsWithStats,
      },
    });
  } catch (error) {
    console.error("❌ خطأ في جلب بيانات المعلم مع الحلقات والطلاب:", error);
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء جلب البيانات",
    });
  }
};

// ❌ تم حذف getStudentsByTeacherId - مكرر!
// استخدم بدلاً منه: GET /api/students/teacher/:teacher من Student Controller

