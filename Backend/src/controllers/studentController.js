const Student = require("../schema/Student");
const bcrypt = require("bcryptjs");
const { validateAndCheckDuplicates } = require("../utils/duplicateChecker");
const { notifyStudentStatsUpdate } = require("../utils/dashboardNotifications");
const {
  calculateAndUpdateMonthlyAverage,
  getMonthlyAverage,
  getAllMonthlyAverages,
  calculateOverallAverage,
} = require("../utils/studentAverageCalculator");

// Get all students - OPTIMIZED for performance
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

// Get students by group
exports.getStudentsByGroup = async (req, res) => {
  try {
    const students = await Student.find({ group: req.params.group })
      .select("-avatar")
      .lean();
    res.json({
      success: true,
      data: students,
      message: `تم تحميل ${students.length} طالب من المجموعة ${req.params.group}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get students by teacher
exports.getStudentsByTeacher = async (req, res) => {
  try {
    const teacherName = decodeURIComponent(req.params.teacher);
    const students = await Student.find({ teacher: teacherName })
      .select("-avatar")
      .lean()
      .sort({ group: 1, firstName: 1 }); // Sort by group then by first name
    res.json({
      success: true,
      data: students,
      message: `تم تحميل ${students.length} طالب للمعلم ${teacherName}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single student by ID (for profile)
exports.getStudentById = async (req, res) => {
  try {
    // Always return email and phoneNumber if present
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "الطالب غير موجود",
      });
    }
    // Explicitly include email and phoneNumber in response (for clarity)
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

// Add new student - simplified for robustness
exports.createStudent = async (req, res) => {
  try {
    console.log(
      "Received request to create student:",
      JSON.stringify(req.body, null, 2)
    );

    // Generate sequential studentId - starts from 100000 and increments by 1
    let studentId;

    try {
      // Find the highest studentId in the database
      const lastStudent = await Student.findOne()
        .sort({ studentId: -1 })
        .select("studentId");

      if (!lastStudent || !lastStudent.studentId) {
        // No students yet, start from 100000
        studentId = 100000;
      } else {
        // Increment the last studentId by 1
        studentId = lastStudent.studentId + 1;

        // Safety check: ensure it's within valid range (100000-999999)
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

    // التحقق من تكرار البيانات الفريدة عبر جميع أنواع المستخدمين
    const { idNumber, phoneNumber, email } = req.body;
    const hasDuplicates = await validateAndCheckDuplicates(req, res, {
      idNumber,
      phoneNumber,
      email,
    });
    if (hasDuplicates) return; // تم إرسال استجابة الخطأ بالفعل

    // التحقق من توافق المعلم مع الحلقة
    const { teacher, group } = req.body;
    if (teacher && group) {
      const Group = require("../schema/Group");

      // البحث بالاسم الكامل أولاً
      let groupData = await Group.findOne({ name: group });

      // إذا لم يوجد تطابق كامل، ابحث بالتطابق الجزئي
      if (!groupData) {
        groupData = await Group.findOne({
          name: { $regex: group.replace(/\s+/g, "\\s*"), $options: "i" },
        });
      }

      // إذا لم يوجد، ابحث عن المجموعات التي تحتوي على الاسم المحدد
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

      // التحقق من تطابق المعلم مع معلم الحلقة
      const normalizeTeacherName = (name) => {
        if (!name || typeof name !== "string") return "";
        return name.trim().toLowerCase().replace(/\s+/g, " ");
      };
      const normalizedStudentTeacher = normalizeTeacherName(teacher);
      const normalizedGroupTeacher = normalizeTeacherName(
        groupData.teacher || ""
      );
      const normalizedGroupTeacherName = normalizeTeacherName(
        groupData.teacherName || ""
      );

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
      const currentStudentCount = await Student.countDocuments({
        group: group,
      });
      const capacity = groupData.capacity || 30; // السعة الافتراضية 30

      if (currentStudentCount >= capacity) {
        return res.status(400).json({
          success: false,
          message: `الحلقة "${group}" ممتلئة! العدد الحالي: ${currentStudentCount}/${capacity}. لا يمكن إضافة المزيد من الطلاب.`,
        });
      }
    }

    // تشفير كلمة المرور
    const rawPassword = req.body.password || req.body.idNumber;
    console.log("🔐 تشفير كلمة المرور:");
    console.log(
      "   - كلمة المرور الأولية (password):",
      req.body.password ? "موجودة" : "غير موجودة"
    );
    console.log("   - رقم الهوية (idNumber):", req.body.idNumber);
    console.log(
      "   - سيتم استخدام:",
      rawPassword === req.body.password ? "password" : "idNumber"
    );
    console.log("   - القيمة:", rawPassword);

    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    console.log(
      "   - كلمة المرور بعد التشفير:",
      hashedPassword.substring(0, 20) + "..."
    );

    const studentData = {
      ...req.body,
      studentId: studentId,
      password: hashedPassword, // استخدام كلمة المرور المشفرة
      // Ensure age is a number
      age: parseInt(req.body.age || 0, 10) || 0,
    };

    console.log(
      "✅ إنشاء طالب بالبيانات:",
      JSON.stringify({ ...studentData, password: "***ENCRYPTED***" }, null, 2)
    );

    // Create student - simple approach without complex retry logic
    const student = new Student(studentData);
    const newStudent = await student.save();
    console.log("Student created successfully:", newStudent._id);

    // إبطال cache عدد الطلاب في الحلقات
    const { invalidateStudentCountsCache } = require("./groupController");
    invalidateStudentCountsCache();

    // Emit socket event for real-time updates
    if (global.io) {
      console.log("📡 Broadcasting student created event");
      global.io.emit("studentCreated", newStudent);
    }

    // إشعار تحديث إحصائيات الداشبورد
    notifyStudentStatsUpdate();

    return res.status(201).json({
      success: true,
      message: "تم إضافة الطالب بنجاح",
      data: newStudent,
    });
  } catch (error) {
    console.error("Error creating student:", error);

    // Handle validation errors
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

    // Ignore duplicate key errors completely
    if (error.code === 11000) {
      console.log("Duplicate detected - ignoring error");
      return res.status(201).json({
        success: true,
        message: "تمت العملية بنجاح",
      });
    }

    // Generic error handling
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حفظ بيانات الطالب",
      error: error.message,
    });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const updatedData = { ...req.body };

    // Always run validation, but handle password field specially
    if (!updatedData.password || updatedData.password.trim() === "") {
      // If no password provided, remove it from update data
      delete updatedData.password;
    } else {
      // تشفير كلمة المرور الجديدة
      updatedData.password = await bcrypt.hash(updatedData.password, 10);
    }

    // التحقق من تكرار البيانات الفريدة عبر جميع أنواع المستخدمين (مع استثناء المستخدم الحالي)
    const { idNumber, phoneNumber, email } = updatedData;
    const hasDuplicates = await validateAndCheckDuplicates(
      req,
      res,
      { idNumber, phoneNumber, email },
      req.params.id,
      "student"
    );
    if (hasDuplicates) return; // تم إرسال استجابة الخطأ بالفعل

    // التحقق من توافق المعلم مع الحلقة عند التعديل
    const { teacher, group } = updatedData;
    if (teacher && group) {
      const Group = require("../schema/Group");

      // البحث بالاسم الكامل أولاً
      let groupData = await Group.findOne({ name: group });

      // إذا لم يوجد تطابق كامل، ابحث بالتطابق الجزئي
      if (!groupData) {
        groupData = await Group.findOne({
          name: { $regex: group.replace(/\s+/g, "\\s*"), $options: "i" },
        });
      }

      // إذا لم يوجد، ابحث عن المجموعات التي تحتوي على الاسم المحدد
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

      // التحقق من تطابق المعلم مع معلم الحلقة
      const normalizeTeacherName = (name) => {
        if (!name || typeof name !== "string") return "";
        return name.trim().toLowerCase().replace(/\s+/g, " ");
      };
      const normalizedStudentTeacher = normalizeTeacherName(teacher);
      const normalizedGroupTeacher = normalizeTeacherName(
        groupData.teacher || ""
      );
      const normalizedGroupTeacherName = normalizeTeacherName(
        groupData.teacherName || ""
      );

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
        const currentStudentCount = await Student.countDocuments({
          group: group,
        });
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
        runValidators: true, // ✅ Always run validation to match Student.js
        context: "query", // Required for some validators to work properly
      }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "الطالب غير موجود",
      });
    }

    // إبطال cache عدد الطلاب في الحلقات
    const { invalidateStudentCountsCache } = require("./groupController");
    invalidateStudentCountsCache();

    // Emit socket event for real-time updates
    if (global.io) {
      console.log("📡 Broadcasting student updated event");
      global.io.emit("studentUpdated", updatedStudent);
    }

    // 🔌 Emit Socket event to profile room
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

    // إشعار تحديث إحصائيات الداشبورد
    notifyStudentStatsUpdate();

    res.json({ success: true, data: updatedStudent });
  } catch (error) {
    console.error("Error updating student:", error);

    // Handle validation errors (same as createStudent)
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

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `قيمة ${field} موجودة بالفعل`,
        error: `Duplicate ${field}`,
      });
    }

    // Generic error handling
    res.status(400).json({
      success: false,
      message: "حدث خطأ أثناء تحديث بيانات الطالب",
      error: error.message,
    });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: "الطالب غير موجود",
      });
    }

    // إبطال cache عدد الطلاب في الحلقات
    const { invalidateStudentCountsCache } = require("./groupController");
    invalidateStudentCountsCache();

    // Emit socket event for real-time updates
    if (global.io) {
      console.log("📡 Broadcasting student deleted event");
      global.io.emit("studentDeleted", {
        studentId: req.params.id,
        student: deletedStudent,
      });
    }

    // إشعار تحديث إحصائيات الداشبورد
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

// Bulk delete students
exports.bulkDeleteStudents = async (req, res) => {
  try {
    const { studentIds } = req.body;

    // التحقق من وجود معرفات الطلاب
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "يجب تحديد معرفات الطلاب المراد حذفهم",
      });
    }

    console.log(`🗑️ محاولة حذف ${studentIds.length} طالب...`);

    // حذف الطلاب باستخدام deleteMany
    const result = await Student.deleteMany({
      _id: { $in: studentIds },
    });

    console.log(
      `✅ تم حذف ${result.deletedCount} طالب من أصل ${studentIds.length}`
    );

    // إبطال cache عدد الطلاب في الحلقات
    const { invalidateStudentCountsCache } = require("./groupController");
    invalidateStudentCountsCache();

    // Emit socket events for real-time updates
    if (global.io) {
      console.log("📡 Broadcasting bulk students deleted event");
      studentIds.forEach((studentId) => {
        global.io.emit("studentDeleted", {
          studentId: studentId,
        });
      });
    }

    // إشعار تحديث إحصائيات الداشبورد
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

// Get student's monthly average
exports.getStudentMonthlyAverage = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "الشهر والسنة مطلوبان",
      });
    }

    const average = await getMonthlyAverage(
      studentId,
      parseInt(month),
      parseInt(year)
    );

    if (!average) {
      return res.status(404).json({
        success: false,
        message: "لا توجد معدلات لهذا الشهر",
      });
    }

    res.json({
      success: true,
      data: average,
    });
  } catch (error) {
    console.error("خطأ في الحصول على المعدل الشهري:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الحصول على المعدل الشهري",
      error: error.message,
    });
  }
};

// Get all monthly averages for a student
exports.getAllStudentMonthlyAverages = async (req, res) => {
  try {
    const { studentId } = req.params;

    const averages = await getAllMonthlyAverages(studentId);

    res.json({
      success: true,
      data: averages,
    });
  } catch (error) {
    console.error("خطأ في الحصول على جميع المعدلات الشهرية:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الحصول على المعدلات الشهرية",
      error: error.message,
    });
  }
};

// Calculate and update monthly average for a student
exports.calculateStudentMonthlyAverage = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "الشهر والسنة مطلوبان",
      });
    }

    const average = await calculateAndUpdateMonthlyAverage(
      studentId,
      month,
      year
    );

    if (!average) {
      return res.status(404).json({
        success: false,
        message: "لا توجد علامات لهذا الشهر",
      });
    }

    res.json({
      success: true,
      data: average,
      message: "تم حساب المعدل الشهري بنجاح",
    });
  } catch (error) {
    console.error("خطأ في حساب المعدل الشهري:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حساب المعدل الشهري",
      error: error.message,
    });
  }
};

// Get overall average for a student
exports.getStudentOverallAverage = async (req, res) => {
  try {
    const { studentId } = req.params;

    const average = await calculateOverallAverage(studentId);

    if (!average) {
      return res.status(404).json({
        success: false,
        message: "لا توجد معدلات للطالب",
      });
    }

    res.json({
      success: true,
      data: average,
    });
  } catch (error) {
    console.error("خطأ في حساب المعدل الإجمالي:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حساب المعدل الإجمالي",
      error: error.message,
    });
  }
};

// ⚡ Get students with absence statistics (OPTIMIZED for Absence page)
exports.getStudentsWithAbsenceStats = async (req, res) => {
  try {
    console.log("⚡ [OPTIMIZED] جلب الطلاب مع إحصائيات الغياب...");
    const startTime = Date.now();

    const { teacher, group } = req.query;

    // 1. بناء فلتر الطلاب
    let filter = {};
    if (teacher) {
      filter.teacher = teacher;
      console.log(`🔍 فلترة حسب المعلم: ${teacher}`);
    }
    if (group && group !== "all") {
      filter.group = group;
      console.log(`🔍 فلترة حسب الحلقة: ${group}`);
    }

    // 2. جلب الطلاب (استعلام واحد فقط)
    const students = await Student.find(filter)
      .select("studentId firstName fatherName lastName group teacher")
      .lean()
      .sort({ firstName: 1 });

    console.log(`📋 تم جلب ${students.length} طالب`);

    if (students.length === 0) {
      const duration = Date.now() - startTime;
      console.log(`✅ لا يوجد طلاب - استغرق ${duration}ms`);
      return res.json([]);
    }

    const studentIds = students.map((s) => s._id);

    // 3. جلب إحصائيات الغياب بـ Aggregation (استعلام واحد فقط!)
    const Attendance = require("../schema/Attendance");

    const absenceStats = await Attendance.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          isPresent: false, // الغيابات فقط
        },
      },
      {
        $group: {
          _id: "$studentId",
          totalAbsences: { $sum: 1 },
          absenceDates: { $push: "$date" },
        },
      },
    ]);

    console.log(`📊 تم جلب إحصائيات ${absenceStats.length} طالب لديهم غيابات`);

    // 4. دمج البيانات باستخدام Map للوصول السريع
    const statsMap = new Map(
      absenceStats.map((stat) => [stat._id.toString(), stat])
    );

    const result = students.map((student) => {
      const stat = statsMap.get(student._id.toString());
      return {
        _id: student._id,
        studentId: student.studentId,
        name: `${student.firstName} ${student.fatherName || ""} ${
          student.lastName || ""
        }`.trim(),
        group: student.group,
        teacher: student.teacher,
        totalAbsences: stat?.totalAbsences || 0,
        absenceDates: stat?.absenceDates || [],
      };
    });

    const duration = Date.now() - startTime;
    console.log(
      `✅ [OPTIMIZED] تم جلب ${result.length} طالب مع الإحصائيات في ${duration}ms`
    );
    console.log(
      `⚡ تحسين الأداء: ${students.length} طالب = 2 استعلامات فقط (بدلاً من ${
        students.length + 1
      })`
    );

    res.json(result);
  } catch (error) {
    console.error("❌ خطأ في جلب الطلاب مع الإحصائيات:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
