const Teacher = require("../schema/Teacher");
const Student = require("../schema/Student");
const Admin = require("../schema/Admin");
const Group = require("../schema/Group");
const bcrypt = require("bcryptjs");
const { validateAndCheckDuplicates } = require("../utils/duplicateChecker");

// Calculate age from birth date
const calculateAge = (birthDate) => {
  if (!birthDate) return 0;

  const today = new Date();
  const birthDateObj = new Date(birthDate);

  if (isNaN(birthDateObj.getTime())) return 0;

  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
  ) {
    age--;
  }

  return age;
};

// Generate next teacher ID
const generateTeacherId = async () => {
  try {
    const lastTeacher = await Teacher.findOne()
      .sort({ teacherId: -1 })
      .select("teacherId");

    if (!lastTeacher) {
      return 200001; // Start teacher IDs from 200001
    }

    return lastTeacher.teacherId + 1;
  } catch (error) {
    console.error("Error generating teacher ID:", error);
    return 200001;
  }
};

// Get all teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({}).select("-password");

    // جلب الحلقات لكل معلم
    const teachersWithGroups = await Promise.all(
      teachers.map(async (teacher) => {
        // البحث عن الحلقات بناءً على ID المعلم فقط لتجنب التداخل بين معلمين بنفس الاسم
        const groups = await Group.find({
          $or: [
            { teacher: teacher._id },
            { teacher: teacher._id.toString() },
          ],
        });

        // إذا كانت الحلقات موجودة في قاعدة البيانات، استخدمها
        // وإلا استخدم الحلقات المخزنة في المعلم
        const finalGroups =
          groups.length > 0
            ? groups.map((g) => ({
                name: g.name,
                id: g._id,
                number: groups.indexOf(g) + 1,
              }))
            : teacher.groups || [];

        return {
          ...teacher.toObject(),
          groups: finalGroups,
        };
      })
    );

    return res.status(200).json({ success: true, data: teachersWithGroups });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return res
      .status(500)
      .json({ success: false, message: "حدث خطأ أثناء جلب المعلمين" });
  }
};

// Get single teacher by ID
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select("-password");
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

// Create new teacher
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

    // basic validation (keep minimal and practical)
    const must = ["firstName", "lastName", "email", "phoneNumber"];
    for (const f of must) {
      if (!req.body[f]) {
        return res
          .status(400)
          .json({ success: false, message: `حقل ${f} مطلوب` });
      }
    }

    // التحقق من تكرار البيانات الفريدة عبر جميع أنواع المستخدمين
    const hasDuplicates = await validateAndCheckDuplicates(req, res, {
      idNumber,
      phoneNumber,
      email,
    });
    if (hasDuplicates) return; // تم إرسال استجابة الخطأ بالفعل

    // teacherId + password
    const teacherId = await generateTeacherId();
    const rawPass = password || String(teacherId);
    const hashed = await bcrypt.hash(rawPass, 10);

    // age
    const age = calculateAge(birthDate);
    if (birthDate && age < 18) {
      return res.status(400).json({
        success: false,
        message: "يجب أن يكون عمر المعلم 18 عام على الأقل",
      });
    }

    // التحقق من أن الحلقات المضافة للمعلم الجديد لا تحتوي على معلمين آخرين
    if (Array.isArray(groups) && groups.length > 0) {
      const Group = require("../schema/Group");

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
              // تحويل البيانات القديمة (string) إلى البنية الجديدة
              return {
                id: null, // سيتم تحديثه لاحقاً
                name: group,
                number: 1, // قيمة افتراضية
              };
            }
            return group; // البيانات الجديدة (object)
          })
        : [], // التأكد من أن groups مصفوفة
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
          // تحديث الحلقة لربطها بالمعلم باستخدام ID المعلم بدلاً من الاسم لتجنب التداخل
          await Group.findByIdAndUpdate(groupId, {
            teacher: doc._id, // استخدام ID المعلم بدلاً من الاسم الكامل
            teacherName: teacherFullName, // الاحتفاظ بالاسم للعرض فقط
          });
          console.log(`✅ تم ربط الحلقة ${groupId} بالمعلم ${doc._id} (${teacherFullName})`);
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

    // التحقق من أخطاء التحقق من صحة البيانات
    if (error.name === "ValidationError") {
      const validationErrors = {};
      const errorMessages = [];

      Object.keys(error.errors).forEach((field) => {
        const fieldError = error.errors[field];
        validationErrors[field] = fieldError.message;

        // رسائل خطأ مخصصة حسب نوع الحقل
        if (field === "idNumber") {
          if (fieldError.message.includes("9 أرقام")) {
            errorMessages.push("رقم الهوية يجب أن يتكون من 9 أرقام فقط");
          } else {
            errorMessages.push("رقم الهوية غير صحيح");
          }
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

    // معالجة أخطاء التكرار (Duplicate key errors)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let arabicFieldName = field;
      let specificMessage = "";

      switch (field) {
        case "idNumber":
          arabicFieldName = "رقم الهوية";
          specificMessage =
            "رقم الهوية موجود بالفعل في النظام. يرجى استخدام رقم هوية مختلف.";
          break;
        case "phoneNumber":
          arabicFieldName = "رقم الهاتف";
          specificMessage =
            "رقم الهاتف موجود بالفعل في النظام. يرجى استخدام رقم هاتف مختلف.";
          break;
        case "email":
          arabicFieldName = "البريد الإلكتروني";
          specificMessage = "البريد الإلكتروني موجود بالفعل في النظام.";
          break;
        default:
          specificMessage = `${arabicFieldName} موجود بالفعل في النظام.`;
      }

      return res.status(400).json({
        success: false,
        message: specificMessage,
        error: `Duplicate ${field}`,
        field: field,
        arabicField: arabicFieldName,
      });
    }

    // معالجة أخطاء أخرى محددة
    if (error.message && error.message.includes("Cast to")) {
      return res.status(400).json({
        success: false,
        message: "نوع البيانات المدخلة غير صحيح",
        error: "Invalid data type",
      });
    }

    // معالجة الأخطاء العامة
    console.error("Unexpected error:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ غير متوقع أثناء حفظ بيانات المعلم",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Update teacher
exports.updateTeacher = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = { ...req.body };

    // التحقق من تكرار البيانات الفريدة عبر جميع أنواع المستخدمين (مع استثناء المعلم الحالي)
    const { idNumber, phoneNumber, email } = updates;
    const hasDuplicates = await validateAndCheckDuplicates(
      req,
      res,
      { idNumber, phoneNumber, email },
      id,
      "teacher"
    );
    if (hasDuplicates) return; // تم إرسال استجابة الخطأ بالفعل

    // Remove password field from updates if it's empty or undefined
    if (!updates.password) {
      delete updates.password;
    } else {
      // Hash password if provided
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Handle age calculation
    if (updates.birthDate) {
      updates.age = calculateAge(updates.birthDate);
    }

    // --- إدارة الحلقات ---
    const Group = require("../schema/Group");
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
        // تعيين المعلم للحلقة باستخدام ID بدلاً من الاسم
        await Group.updateOne(
          { _id: groupItem.id },
          { 
            teacher: currentTeacher._id, // استخدام ID المعلم
            teacherName: teacherFullName // الاحتفاظ بالاسم للعرض
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
    if (global.io) {
      global.io.emit("teacherUpdated", updated);
      console.log("📡 Teacher updated event emitted via socket");
    }

    return res.status(200).json({
      success: true,
      message: "تم تحديث بيانات المعلم بنجاح",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating teacher:", error);

    // التحقق من أخطاء التحقق من صحة البيانات
    if (error.name === "ValidationError") {
      const validationErrors = {};
      const errorMessages = [];

      Object.keys(error.errors).forEach((field) => {
        const fieldError = error.errors[field];
        validationErrors[field] = fieldError.message;

        // رسائل خطأ مخصصة حسب نوع الحقل
        if (field === "idNumber") {
          if (fieldError.message.includes("9 أرقام")) {
            errorMessages.push("رقم الهوية يجب أن يتكون من 9 أرقام فقط");
          } else {
            errorMessages.push("رقم الهوية غير صحيح");
          }
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

    // معالجة أخطاء التكرار (Duplicate key errors)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let arabicFieldName = field;
      let specificMessage = "";

      switch (field) {
        case "idNumber":
          arabicFieldName = "رقم الهوية";
          specificMessage =
            "رقم الهوية موجود بالفعل في النظام. يرجى استخدام رقم هوية مختلف.";
          break;
        case "phoneNumber":
          arabicFieldName = "رقم الهاتف";
          specificMessage =
            "رقم الهاتف موجود بالفعل في النظام. يرجى استخدام رقم هاتف مختلف.";
          break;
        case "email":
          arabicFieldName = "البريد الإلكتروني";
          specificMessage = "البريد الإلكتروني موجود بالفعل في النظام.";
          break;
        default:
          specificMessage = `${arabicFieldName} موجود بالفعل في النظام.`;
      }

      return res.status(400).json({
        success: false,
        message: specificMessage,
        error: `Duplicate ${field}`,
        field: field,
        arabicField: arabicFieldName,
      });
    }

    // معالجة أخطاء أخرى محددة
    if (error.message && error.message.includes("Cast to")) {
      return res.status(400).json({
        success: false,
        message: "نوع البيانات المدخلة غير صحيح",
        error: "Invalid data type",
      });
    }

    // معالجة الأخطاء العامة
    console.error("Unexpected error during update:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ غير متوقع أثناء تحديث بيانات المعلم",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Delete teacher (soft delete)
exports.deleteTeacher = async (req, res) => {
  try {
    const id = req.params.id;
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "المعلم غير موجود" });
    }

    const Group = require("../schema/Group");
    const Student = require("../schema/Student");

    const teacherName = `${teacher.firstName} ${teacher.lastName}`;

    console.log(`🗑️ جاري حذف المعلم: ${teacherName}`);

    // 1. إزالة المعلم من الحلقات (الحلقات تبقى موجودة بدون معلم)
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

    // 2. إزالة المعلم من الطلاب (الطلاب يبقوا موجودين بدون معلم)
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

    // 3. حذف المعلم نهائياً من قاعدة البيانات
    await Teacher.findByIdAndDelete(id);
    console.log(`🗑️ تم حذف المعلم ${teacherName} نهائياً من قاعدة البيانات`);

    // Emit socket event for real-time update
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

// Get teacher statistics
exports.getTeacherStats = async (req, res) => {
  try {
    // requires isActive in schema; if not present, remove filters
    const totalTeachers = await Teacher.countDocuments({ isActive: true });
    const totalAdmins = await Teacher.countDocuments({
      role: "admin",
      isActive: true,
    });
    const totalActiveTeachers = await Teacher.countDocuments({
      role: "teacher",
      isActive: true,
    });

    const teachers = await Teacher.find({ isActive: true }).select(
      "-password -avatar"
    );

    const exp = (x) => (Number.isFinite(x) ? x : 0);
    const experienceDistribution = {
      "مبتدئ (0-2 سنة)": teachers.filter((t) => exp(t.yearsOfExperience) <= 2)
        .length,
      "متوسط (3-5 سنوات)": teachers.filter(
        (t) => exp(t.yearsOfExperience) >= 3 && exp(t.yearsOfExperience) <= 5
      ).length,
      "خبير (6-10 سنوات)": teachers.filter(
        (t) => exp(t.yearsOfExperience) >= 6 && exp(t.yearsOfExperience) <= 10
      ).length,
      "خبير جداً (+10 سنوات)": teachers.filter(
        (t) => exp(t.yearsOfExperience) > 10
      ).length,
    };

    return res.status(200).json({
      success: true,
      data: {
        totalTeachers,
        totalAdmins,
        totalActiveTeachers,
        experienceDistribution,
        teachers: teachers.map((t) => ({
          _id: t._id,
          teacherId: t.teacherId,
          fullName: `${t.firstName || ""} ${t.fatherName || ""} ${
            t.lastName || ""
          }`
            .replace(/\s+/g, " ")
            .trim(),
          groups: t.groups || [], // الحلقات التي يدرسها المعلم
          yearsOfExperience: exp(t.yearsOfExperience),
          role: t.role,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching teacher stats:", error);
    return res
      .status(500)
      .json({ success: false, message: "حدث خطأ أثناء جلب إحصائيات المعلمين" });
  }
};
