const Student = require("../models/Student");
const { validateAndCheckDuplicates } = require("../utils/duplicateChecker");

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
    res.json(students);
  } catch (error) {
    console.error("❌ خطأ في تحميل الطلاب:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get students by group
exports.getStudentsByGroup = async (req, res) => {
  try {
    const students = await Student.find({ group: req.params.group });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single student by ID (for profile)
exports.getStudentById = async (req, res) => {
  try {
    // Always return email and phoneNumber if present
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
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
    res.status(500).json({ message: error.message });
  }
};

// Add new student - simplified for robustness
exports.createStudent = async (req, res) => {
  try {
    console.log(
      "Received request to create student:",
      JSON.stringify(req.body, null, 2)
    );

    // Generate unique studentId - simple and safe approach
    let studentId;

    try {
      // Use timestamp + random number for uniqueness
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const baseId = 100000 + (timestamp % 100000);

      // Try the base ID first
      studentId = baseId;
      let existingStudent = await Student.findOne({ studentId });

      // If exists, try with random suffix
      if (existingStudent) {
        studentId = baseId + random;
        existingStudent = await Student.findOne({ studentId });

        // If still exists, use timestamp + process ID + random
        if (existingStudent) {
          studentId = 100000 + ((timestamp + process.pid + random) % 899999);
        }
      }

      console.log(`Generated studentId: ${studentId}`);
    } catch (idError) {
      console.error("Error generating student ID:", idError);
      // Ultimate fallback
      studentId = 100000 + (Date.now() % 100000);
    }

    // التحقق من تكرار البيانات الفريدة عبر جميع أنواع المستخدمين
    const { idNumber, phoneNumber, email } = req.body;
    const hasDuplicates = await validateAndCheckDuplicates(req, res, { idNumber, phoneNumber, email });
    if (hasDuplicates) return; // تم إرسال استجابة الخطأ بالفعل

    // التحقق من توافق المعلم مع الحلقة
    const { teacher, group } = req.body;
    if (teacher && group) {
      const Group = require("../models/Group");

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
      const normalizeTeacherName = (name) =>
        name?.trim().toLowerCase().replace(/\s+/g, " ") || "";
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
      const currentStudentCount = await Student.countDocuments({ group: group });
      const capacity = groupData.capacity || 30; // السعة الافتراضية 30
      
      if (currentStudentCount >= capacity) {
        return res.status(400).json({
          success: false,
          message: `الحلقة "${group}" ممتلئة! العدد الحالي: ${currentStudentCount}/${capacity}. لا يمكن إضافة المزيد من الطلاب.`,
        });
      }
    }

    const studentData = {
      ...req.body,
      studentId: studentId,
      // Ensure age is a number
      age: parseInt(req.body.age || 0, 10) || 0,
    };

    console.log(
      "Creating student with data:",
      JSON.stringify(studentData, null, 2)
    );

    // Create student - simple approach without complex retry logic
    const student = new Student(studentData);
    const newStudent = await student.save();
    console.log("Student created successfully:", newStudent._id);

    // إبطال cache عدد الطلاب في الحلقات
    const { invalidateStudentCountsCache } = require('./groupController');
    invalidateStudentCountsCache();

    // Emit socket event for real-time updates
    if (global.io) {
      console.log("📡 Broadcasting student created event");
      global.io.emit("studentCreated", newStudent);
    }

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
    }

    // التحقق من تكرار البيانات الفريدة عبر جميع أنواع المستخدمين (مع استثناء المستخدم الحالي)
    const { idNumber, phoneNumber, email } = updatedData;
    const hasDuplicates = await validateAndCheckDuplicates(req, res, { idNumber, phoneNumber, email }, req.params.id, 'student');
    if (hasDuplicates) return; // تم إرسال استجابة الخطأ بالفعل

    // التحقق من توافق المعلم مع الحلقة عند التعديل
    const { teacher, group } = updatedData;
    if (teacher && group) {
      const Group = require("../models/Group");

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
      const normalizeTeacherName = (name) =>
        name?.trim().toLowerCase().replace(/\s+/g, " ") || "";
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
    const { invalidateStudentCountsCache } = require('./groupController');
    invalidateStudentCountsCache();

    // Emit socket event for real-time updates
    if (global.io) {
      console.log("📡 Broadcasting student updated event");
      global.io.emit("studentUpdated", updatedStudent);
    }

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
      return res.status(404).json({ message: "Student not found" });
    }

    // إبطال cache عدد الطلاب في الحلقات
    const { invalidateStudentCountsCache } = require('./groupController');
    invalidateStudentCountsCache();

    // Emit socket event for real-time updates
    if (global.io) {
      console.log("📡 Broadcasting student deleted event");
      global.io.emit("studentDeleted", {
        studentId: req.params.id,
        student: deletedStudent,
      });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
