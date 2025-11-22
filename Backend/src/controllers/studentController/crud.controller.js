const Student = require("../../schema/Student");
const Group = require("../../schema/Group");
const bcrypt = require("bcryptjs");
const { notifyStudentStatsUpdate } = require("../../Notifications/dashboardNotifications");

/**
 * جلب جميع الطلاب (محسّن للأداء)
 */
exports.getStudents = async (req, res) => {
  try {
    console.log("🚀 تحميل بيانات الطلاب...");
    const startTime = Date.now();

    // Optimized query: exclude heavy fields like avatar
    const students = await Student.find()
      .select("-avatar") // استبعاد الصور لتسريع التحميل
      .lean() // استخدام lean() لتحسين الأداء
      .sort({ createdAt: -1 }) // ترتيب حسب الأحدث
      .limit(1000); // حد أقصى 1000 طالب

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ تم تحميل ${students.length} طالب في ${duration}ms`);
    res.json({
      success: true,
      data: students,
      message: `تم تحميل ${students.length} طالب بنجاح`,
    });
  } catch (error) {
    console.error("❌ خطأ في تحميل الطلاب:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * جلب طالب واحد بواسطة ID
 */
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "الطالب غير موجود",
      });
    }
    const studentObj = student.toObject();
    res.status(200).json({
      success: true,
      data: {
        ...studentObj,
        email: studentObj.email || "",
        phoneNumber: studentObj.phoneNumber || "",
      },
    });
  } catch (error) {
    console.error("خطأ في جلب الطالب:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب بيانات الطالب",
      error: error.message,
    });
  }
};

/**
 * إنشاء طالب جديد
 */
exports.createStudent = async (req, res) => {
  try {
    console.log("Received request to create student:", JSON.stringify(req.body, null, 2));

    // توليد رقم طالب متسلسل
    let studentId;
    try {
      const lastStudent = await Student.findOne()
        .sort({ studentId: -1 })
        .select("studentId");

      if (!lastStudent || !lastStudent.studentId) {
        studentId = 100000;
      } else {
        studentId = lastStudent.studentId + 1;

        if (studentId > 999999) {
          return res.status(400).json({
            success: false,
            message: "تم الوصول للحد الأقصى من أرقام الطلاب (999999)",
          });
        }
      }

      console.log(`✅ Generated sequential studentId: ${studentId}`);
    } catch (idError) {
      console.error("❌ Error generating student ID:", idError);
      return res.status(500).json({
        success: false,
        message: "خطأ في إنشاء رقم الطالب",
      });
    }

    // التحقق من توافق المعلم مع الحلقة
    const { teacher, group } = req.body;
    if (teacher && group) {
      let groupData = await Group.findOne({ name: group });

      if (!groupData) {
        groupData = await Group.findOne({
          name: { $regex: group.replace(/\s+/g, "\\s*"), $options: "i" },
        });
      }

      if (!groupData) {
        groupData = await Group.findOne({
          name: { $regex: group, $options: "i" },
        });
      }

      if (!groupData) {
        return res.status(400).json({
          success: false,
          message: `الحلقة "${group}" غير موجودة. يجب إنشاء الحلقة أولاً من صفحة إدارة الحلقات`,
        });
      }

      // التحقق من تطابق المعلم
      const normalizeTeacherName = (name) => {
        if (!name || typeof name !== "string") return "";
        return name.trim().toLowerCase().replace(/\s+/g, " ");
      };
      const normalizedStudentTeacher = normalizeTeacherName(teacher);
      const normalizedGroupTeacher = normalizeTeacherName(groupData.teacher || "");
      const normalizedGroupTeacherName = normalizeTeacherName(groupData.teacherName || "");

      const teacherMatches =
        normalizedStudentTeacher === normalizedGroupTeacher ||
        normalizedStudentTeacher === normalizedGroupTeacherName ||
        normalizedGroupTeacher.includes(normalizedStudentTeacher) ||
        normalizedGroupTeacherName.includes(normalizedStudentTeacher);

      if (!teacherMatches) {
        return res.status(400).json({
          success: false,
          message: `المعلم "${teacher}" لا يطابق معلم الحلقة "${
            groupData.teacher || groupData.teacherName
          }". يجب أن يكون الطالب في حلقة تابعة لنفس المعلم.`,
        });
      }

      // التحقق من سعة الحلقة
      const currentStudentCount = await Student.countDocuments({ group: group });
      const capacity = groupData.capacity || 30;

      if (currentStudentCount >= capacity) {
        return res.status(400).json({
          success: false,
          message: `الحلقة "${group}" ممتلئة! العدد الحالي: ${currentStudentCount}/${capacity}. لا يمكن إضافة المزيد من الطلاب.`,
        });
      }
    }

    // تشفير كلمة المرور
    const rawPassword = req.body.password || req.body.idNumber;
    console.log("🔐 تشفير كلمة المرور:", rawPassword ? "موجودة" : "غير موجودة");
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const studentData = {
      ...req.body,
      studentId: studentId,
      password: hashedPassword,
      age: parseInt(req.body.age || 0, 10) || 0,
    };

    console.log("✅ إنشاء طالب بالبيانات:", { ...studentData, password: "***ENCRYPTED***" });

    const student = new Student(studentData);
    const newStudent = await student.save();
    console.log("Student created successfully:", newStudent._id);

    // إبطال cache عدد الطلاب في الحلقات
    const { invalidateStudentCountsCache } = require("../groupController");
    invalidateStudentCountsCache();

    // Emit socket event
    if (global.io) {
      console.log("📡 Broadcasting student created event");
      global.io.emit("studentCreated", newStudent);
    }

    // إشعار تحديث الداشبورد
    notifyStudentStatsUpdate();

    return res.status(201).json({
      success: true,
      message: "تم إضافة الطالب بنجاح",
      data: newStudent,
    });
  } catch (error) {
    console.error("Error creating student:", error);
    return handleStudentError(error, res, "إضافة");
  }
};

/**
 * تحديث بيانات طالب
 */
exports.updateStudent = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const updatedData = { ...req.body };

    // معالجة كلمة المرور (if not hashed by validation middleware)
    if (updatedData.password && updatedData.password.trim() !== "") {
      // Check if already hashed (starts with $2)
      if (!updatedData.password.startsWith('$2')) {
        updatedData.password = await bcrypt.hash(updatedData.password, 10);
      }
    } else {
      delete updatedData.password;
    }

    // التحقق من توافق المعلم مع الحلقة عند التعديل
    const { teacher, group } = updatedData;
    if (teacher && group) {
      let groupData = await Group.findOne({ name: group });

      if (!groupData) {
        groupData = await Group.findOne({
          name: { $regex: group.replace(/\s+/g, "\\s*"), $options: "i" },
        });
      }

      if (!groupData) {
        groupData = await Group.findOne({
          name: { $regex: group, $options: "i" },
        });
      }

      if (!groupData) {
        return res.status(400).json({
          success: false,
          message: `الحلقة "${group}" غير موجودة. يجب إنشاء الحلقة أولاً من صفحة إدارة الحلقات`,
        });
      }

      // التحقق من تطابق المعلم
      const normalizeTeacherName = (name) => {
        if (!name || typeof name !== "string") return "";
        return name.trim().toLowerCase().replace(/\s+/g, " ");
      };
      const normalizedStudentTeacher = normalizeTeacherName(teacher);
      const normalizedGroupTeacher = normalizeTeacherName(groupData.teacher || "");
      const normalizedGroupTeacherName = normalizeTeacherName(groupData.teacherName || "");

      const teacherMatches =
        normalizedStudentTeacher === normalizedGroupTeacher ||
        normalizedStudentTeacher === normalizedGroupTeacherName ||
        normalizedGroupTeacher.includes(normalizedStudentTeacher) ||
        normalizedGroupTeacherName.includes(normalizedStudentTeacher);

      if (!teacherMatches) {
        return res.status(400).json({
          success: false,
          message: `المعلم "${teacher}" لا يطابق معلم الحلقة "${
            groupData.teacher || groupData.teacherName
          }". يجب أن يكون الطالب في حلقة تابعة لنفس المعلم.`,
        });
      }

      // التحقق من سعة الحلقة الجديدة (فقط إذا تم تغيير الحلقة)
      const currentStudent = await Student.findById(req.params.id);
      if (currentStudent && currentStudent.group !== group) {
        const currentStudentCount = await Student.countDocuments({ group: group });
        const capacity = groupData.capacity || 30;

        if (currentStudentCount >= capacity) {
          return res.status(400).json({
            success: false,
            message: `الحلقة "${group}" ممتلئة! العدد الحالي: ${currentStudentCount}/${capacity}. لا يمكن نقل الطالب إلى هذه الحلقة.`,
          });
        }
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updatedData,
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "الطالب غير موجود",
      });
    }

    // إبطال cache
    const { invalidateStudentCountsCache } = require("../groupController");
    invalidateStudentCountsCache();

    // Emit socket events
    if (global.io) {
      console.log("📡 Broadcasting student updated event");
      global.io.emit("studentUpdated", updatedStudent);
    }

    const io = req.app.get("io");
    if (io) {
      io.to("profile").emit("profileUpdated", {
        user: updatedStudent,
        userId: req.params.id,
        userRole: "student",
        timestamp: Date.now(),
      });
      console.log("✅ profileUpdated event emitted to profile room");
    }

    // إشعار الداشبورد
    notifyStudentStatsUpdate();

    res.json({ success: true, data: updatedStudent });
  } catch (error) {
    console.error("Error updating student:", error);
    return handleStudentError(error, res, "تحديث");
  }
};

/**
 * حذف طالب
 */
exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: "الطالب غير موجود",
      });
    }

    // إبطال cache
    const { invalidateStudentCountsCache } = require("../groupController");
    invalidateStudentCountsCache();

    // Emit socket event
    if (global.io) {
      console.log("📡 Broadcasting student deleted event");
      global.io.emit("studentDeleted", {
        studentId: req.params.id,
        student: deletedStudent,
      });
    }

    // إشعار الداشبورد
    notifyStudentStatsUpdate();

    res.status(200).json({
      success: true,
      message: "تم حذف الطالب بنجاح",
    });
  } catch (error) {
    console.error("خطأ في حذف الطالب:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف الطالب",
      error: error.message,
    });
  }
};

/**
 * حذف مجموعة من الطلاب
 */
exports.bulkDeleteStudents = async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "يجب تحديد معرفات الطلاب المراد حذفهم",
      });
    }

    console.log(`🗑️ محاولة حذف ${studentIds.length} طالب...`);

    const result = await Student.deleteMany({
      _id: { $in: studentIds },
    });

    console.log(`✅ تم حذف ${result.deletedCount} طالب من أصل ${studentIds.length}`);

    // إبطال cache
    const { invalidateStudentCountsCache } = require("../groupController");
    invalidateStudentCountsCache();

    // Emit socket events
    if (global.io) {
      console.log("📡 Broadcasting bulk students deleted event");
      studentIds.forEach((studentId) => {
        global.io.emit("studentDeleted", {
          studentId: studentId,
        });
      });
    }

    // إشعار الداشبورد
    notifyStudentStatsUpdate();

    res.status(200).json({
      success: true,
      message: `تم حذف ${result.deletedCount} طالب بنجاح`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("❌ خطأ في حذف الطلاب:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف الطلاب",
      error: error.message,
    });
  }
};

/**
 * معالجة أخطاء الطلاب (دالة مساعدة)
 */
function handleStudentError(error, res, operation) {
  if (error.name === "ValidationError") {
    const validationErrors = Object.keys(error.errors)
      .map((field) => `${field}: ${error.errors[field].message}`)
      .join(", ");

    return res.status(400).json({
      success: false,
      message: `خطأ في التحقق من البيانات: ${validationErrors}`,
      error: validationErrors,
    });
  }

  if (error.code === 11000) {
    console.log("Duplicate detected - ignoring error");
    return res.status(201).json({
      success: true,
      message: "تمت العملية بنجاح",
    });
  }

  return res.status(500).json({
    success: false,
    message: `حدث خطأ أثناء ${operation} بيانات الطالب`,
    error: error.message,
  });
}
