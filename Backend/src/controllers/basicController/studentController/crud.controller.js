const Student = require("../../../schema/Student");
const Group = require("../../../schema/Group");
const bcrypt = require("bcryptjs");
const {
  checkDuplicateFields,
} = require("../../../Validation/validators/duplicateChecker");
const { invalidateCache } = require("../../../middleware");
const { TIMEZONE } = require("../../../config/timezone");
const {
  notifyStudentAddedToGroup,
  notifyStudentRemovedFromGroup,
  notifyStudentMovedGroup,
} = require("../../../Notifications");
const {
  validateTeacherGroupMatch,
  validateGroupCapacity,
  buildStudentQuery,
  invalidateStudentCaches,
  emitStudentEvent,
  notifyStudentUpdate,
  handleStudentError,
  populateTeacherFullName,
} = require("./studentHelpers");
// تسجيل حدث RESTORATION عند إرجاع طالب للحلقة
const { logRestorationEvent } = require("./history/helpers/restorationHistory");

/**
 * دالة مساعدة لإزالة studentId من البيانات للمعلم والسكرتير والطالب
 * المعلم والسكرتير والطالب ممنوعين يشوفون studentId
 */
const removeStudentIdForRestrictedRoles = (students, userRole) => {
  if (
    userRole === "teacher" ||
    userRole === "secretary" ||
    userRole === "student"
  ) {
    return students.map((student) => {
      const { studentId, ...rest } = student;
      return rest;
    });
  }
  return students;
};

/**
 * إرجاع طالب للحلقة بعد فصل (فقط للأدمن)
 * @route POST /api/students/:id/restore
 */
exports.restoreStudentToGroup = async (req, res) => {
  try {
    // فقط الأدمن يملك صلاحية الإرجاع
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح لك بإرجاع الطالب" });
    }

    const studentId = req.params.id;
    const { groupId, reason } = req.body;

    // جلب الطالب والحلقة
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "الحلقة غير موجودة" });
    }

    // تحديث مجموعة الطالب والمعلم
    const oldGroup = student.group;
    student.group = group.name;
    student.teacher = group.teacher;
    await student.save();

    // إلغاء تفعيل جميع الإنذارات للطالب عند إرجاعه (تصفير الإنذارات)
    const Warning = require("../../../schema/Warning");
    const warningUpdate = await Warning.updateMany(
      {
        studentId: studentId,
        status: "active",
      },
      {
        $set: { status: "inactive" }, // استخدام inactive بدلاً من student_removed
      },
    );
    console.log(
      `✅ تم إلغاء ${warningUpdate.modifiedCount} إنذارات للطالب ${studentId}`,
    );

    // تسجيل حدث RESTORATION في التاريخ
    await logRestorationEvent(
      studentId,
      {
        groupId: group._id,
        groupName: group.name,
        teacherId: group.teacher,
        teacherName: group.teacherName || "غير محدد",
      },
      reason || "إرجاع الطالب للحلقة من قبل الأدمن",
      req.user,
    );

    // مسح الكاش
    await invalidateStudentCaches();

    // إرسال الإشعارات
    const io = req.app.get("io");
    if (io) {
      notifyStudentAddedToGroup(student, group.name, io);
    }

    // إرسال حدث Socket للطالب
    emitStudentEvent("updated", student);

    res.json({
      success: true,
      message: "تم إرجاع الطالب للحلقة وتسجيل الحدث في التاريخ",
    });
  } catch (error) {
    console.error("Error restoring student:", error);
    res.status(500).json({ message: "حدث خطأ أثناء إرجاع الطالب" });
  }
};

/**
 * جلب جميع الطلاب مع فلترة وترتيب (محسّن للأداء)
 */
exports.getStudents = async (req, res) => {
  try {
    console.log("🚀 تحميل بيانات الطلاب...");
    const startTime = Date.now();

    // Build query from filters using helper
    const { sortBy, sortOrder, page, limit, search } = req.query;
    const query = buildStudentQuery(req.query);

    // Sorting
    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    } else {
      sortOptions.studentId = 1; // Default: sort by studentId ascending (oldest first)
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 1000;
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    let students = await Student.find(query)
      .select("-avatar")
      .lean()
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Smart sorting when search is active - exact matches first
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      students = students.sort((a, b) => {
        const aGroup = (a.group || "").toLowerCase();
        const bGroup = (b.group || "").toLowerCase();
        const aFirstName = (a.firstName || "").toLowerCase();
        const bFirstName = (b.firstName || "").toLowerCase();
        const aLastName = (a.lastName || "").toLowerCase();
        const bLastName = (b.lastName || "").toLowerCase();

        // Priority 1: Exact match in group
        const aGroupExact = aGroup === searchTerm;
        const bGroupExact = bGroup === searchTerm;
        if (aGroupExact && !bGroupExact) return -1;
        if (!aGroupExact && bGroupExact) return 1;

        // Priority 2: Starts with in group
        const aGroupStarts = aGroup.startsWith(searchTerm);
        const bGroupStarts = bGroup.startsWith(searchTerm);
        if (aGroupStarts && !bGroupStarts) return -1;
        if (!aGroupStarts && bGroupStarts) return 1;

        // Priority 3: Exact match in name fields
        const aNameExact =
          aFirstName === searchTerm || aLastName === searchTerm;
        const bNameExact =
          bFirstName === searchTerm || bLastName === searchTerm;
        if (aNameExact && !bNameExact) return -1;
        if (!aNameExact && bNameExact) return 1;

        // Priority 4: Starts with in name fields
        const aNameStarts =
          aFirstName.startsWith(searchTerm) || aLastName.startsWith(searchTerm);
        const bNameStarts =
          bFirstName.startsWith(searchTerm) || bLastName.startsWith(searchTerm);
        if (aNameStarts && !bNameStarts) return -1;
        if (!aNameStarts && bNameStarts) return 1;

        // Default: maintain original order
        return 0;
      });
    }

    // Get total count for pagination
    const total = await Student.countDocuments(query);

    // إضافة اسم المعلم الثلاثي للطلاب
    let studentsWithTeacherName = await populateTeacherFullName(students);

    // إزالة studentId للمعلم والسكرتير
    const userRole = req.user?.role;
    studentsWithTeacherName = removeStudentIdForRestrictedRoles(
      studentsWithTeacherName,
      userRole,
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    res.json({
      success: true,
      data: studentsWithTeacherName,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
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

    // إضافة اسم المعلم الثلاثي
    const studentWithTeacherName = await populateTeacherFullName(studentObj);

    res.status(200).json({
      success: true,
      data: {
        ...studentWithTeacherName,
        email: studentWithTeacherName.email || "",
        phoneNumber: studentWithTeacherName.phoneNumber || "",
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
    console.log(
      "Received request to create student:",
      JSON.stringify(req.body, null, 2),
    );

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
    const teacherGroupValidation = await validateTeacherGroupMatch(
      teacher,
      group,
    );
    if (!teacherGroupValidation.valid) {
      return res.status(400).json({
        success: false,
        message: teacherGroupValidation.error,
      });
    }

    // التحقق من سعة الحلقة
    const capacityValidation = await validateGroupCapacity(
      group,
      null,
      teacherGroupValidation.groupData,
    );
    if (!capacityValidation.valid) {
      return res.status(400).json({
        success: false,
        message: capacityValidation.error,
      });
    }

    // تشفير كلمة المرور - استخدام رقم الهوية كقيمة افتراضية
    const rawPassword = req.body.idNumber || "1234";
    console.log("🔐 تشفير كلمة المرور - استخدام رقم الهوية كقيمة افتراضية");
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const studentData = {
      ...req.body,
      studentId: studentId,
      password: hashedPassword,
      age: parseInt(req.body.age || 0, 10) || 0,
    };

    console.log("✅ إنشاء طالب بالبيانات:", {
      ...studentData,
      password: "***ENCRYPTED***",
    });

    const student = new Student(studentData);
    const newStudent = await student.save();
    console.log("Student created successfully:", newStudent._id);

    // Notify Teacher if added to group
    if (group && group !== "غير محدد") {
      const io = req.app.get("io");
      notifyStudentAddedToGroup(newStudent, group, io);
    }

    // Invalidate caches and emit events using helpers
    await invalidateStudentCaches();
    emitStudentEvent("created", newStudent);

    // تحديث activeStatus للحلقة
    if (group && group !== "غير محدد") {
      await updateGroupActiveStatus(group).catch((err) =>
        console.error("⚠️ Error updating group activeStatus:", err),
      );
    }

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

    // Check if birthDate is being changed - apply edit limits
    if (updatedData.birthDate) {
      const currentStudent = await Student.findById(req.params.id).select(
        "birthDate birthDateEditHistory",
      );

      if (currentStudent) {
        // Check if birthDate is actually changing
        // Student schema uses Date type
        const currentBirthDate = currentStudent.birthDate
          ? new Date(currentStudent.birthDate).toISOString().split("T")[0]
          : null;
        const newBirthDateStr = updatedData.birthDate
          ? typeof updatedData.birthDate === "string"
            ? updatedData.birthDate.split("T")[0]
            : new Date(updatedData.birthDate).toISOString().split("T")[0]
          : null;

        if (currentBirthDate !== newBirthDateStr && newBirthDateStr) {
          // BirthDate is being changed - check edit limits
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

          // Count recent edits (within last month)
          const recentEdits =
            currentStudent.birthDateEditHistory?.filter(
              (edit) => new Date(edit.editDate) >= oneMonthAgo,
            ) || [];

          const editCount = recentEdits.length;
          const allowed = editCount < 2;

          if (!allowed) {
            return res.status(400).json({
              success: false,
              message:
                "لا يمكنك تعديل تاريخ الميلاد أكثر من مرتين خلال شهر كامل من آخر تعديلاتك",
              editLimit: {
                allowed: false,
                remaining: 0,
                count: editCount,
              },
            });
          }

          // Add new edit to history (will be saved with the update)
          if (!updatedData.birthDateEditHistory) {
            updatedData.birthDateEditHistory =
              currentStudent.birthDateEditHistory || [];
          }
          updatedData.birthDateEditHistory.push({ editDate: new Date() });
        }
      }
    }

    // معالجة كلمة المرور (if not hashed by validation middleware)
    if (updatedData.password && updatedData.password.trim() !== "") {
      // Check if already hashed (starts with $2)
      if (!updatedData.password.startsWith("$2")) {
        updatedData.password = await bcrypt.hash(updatedData.password, 10);
      }
    } else {
      delete updatedData.password;
    }

    // التحقق من الحلقة وتحديث المعلم تلقائياً
    const { group } = updatedData;

    // إذا تم تعيين الحلقة إلى "غير محدد" أو null، قم بإزالة المعلم أيضاً
    if (group === "غير محدد" || group === null || group === "") {
      updatedData.teacher = "غير محدد";
      updatedData.group = "غير محدد";
    } else if (group) {
      // جلب بيانات الحلقة
      const groupData = await Group.findOne({ name: group });

      if (!groupData) {
        return res.status(400).json({
          success: false,
          message: `الحلقة "${group}" غير موجودة`,
        });
      }

      // تحديث اسم المعلم تلقائياً من الحلقة
      const { getTeacherInfo } = require("./studentHelpers");
      const teacherData = await getTeacherInfo(groupData.teacher);
      updatedData.teacher =
        teacherData.name || groupData.teacherName || updatedData.teacher;

      // التحقق من سعة الحلقة الجديدة (فقط إذا تم تغيير الحلقة)
      const currentStudent = await Student.findById(req.params.id);
      if (currentStudent && currentStudent.group !== group) {
        const capacityValidation = await validateGroupCapacity(
          group,
          req.params.id,
          groupData,
        );
        if (!capacityValidation.valid) {
          return res.status(400).json({
            success: false,
            message: capacityValidation.error,
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
      },
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "الطالب غير موجود",
      });
    }

    // Cleanup old edit history entries (older than 2 months) for birthDate
    if (
      updatedStudent.birthDateEditHistory &&
      updatedStudent.birthDateEditHistory.length > 0
    ) {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      const cleanedHistory = updatedStudent.birthDateEditHistory.filter(
        (edit) => new Date(edit.editDate) >= twoMonthsAgo,
      );

      // Only update if we removed old entries
      if (
        cleanedHistory.length !== updatedStudent.birthDateEditHistory.length
      ) {
        await Student.findByIdAndUpdate(req.params.id, {
          birthDateEditHistory: cleanedHistory,
        });
        updatedStudent.birthDateEditHistory = cleanedHistory;
      }
    }

    // Invalidate caches and emit events using helpers
    await invalidateStudentCaches();
    emitStudentEvent("updated", updatedStudent);

    // Notification Logic
    const io = req.app.get("io");
    const oldGroup = currentStudent.group;
    const newGroup = updatedStudent.group;

    const wasInGroup = oldGroup && oldGroup !== "غير محدد";
    const isInGroup = newGroup && newGroup !== "غير محدد";

    // 🧹 إذا تم نقل الطالب لحلقة مختلفة، احذف علاماته من امتحانات الحلقة القديمة
    if (wasInGroup && oldGroup !== newGroup) {
      const ExamSchedule = require("../../../schema/ExamShedule/ExamSchedule");
      const examCleanup = await ExamSchedule.updateMany(
        { group: oldGroup, "marks.student": req.params.id },
        { $pull: { marks: { student: req.params.id } } },
      );
      console.log(
        `🧹 تم حذف علامات الطالب من ${examCleanup.modifiedCount} امتحان في الحلقة القديمة`,
      );
    }

    if (!wasInGroup && isInGroup) {
      notifyStudentAddedToGroup(updatedStudent, newGroup, io);
    } else if (wasInGroup && !isInGroup) {
      notifyStudentRemovedFromGroup(updatedStudent, oldGroup, io);
    } else if (wasInGroup && isInGroup && oldGroup !== newGroup) {
      notifyStudentMovedGroup(updatedStudent, oldGroup, newGroup, io);
    }

    // Emit profile update event
    if (io) {
      io.to("profile").emit("profileUpdated", {
        user: updatedStudent,
        userId: req.params.id,
        userRole: "student",
        timestamp: Date.now(),
      });
      console.log("✅ profileUpdated event emitted to profile room");
    }

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
    // 1. تنظيف علامات الطالب من الامتحانات قبل الحذف
    const ExamSchedule = require("../../../schema/ExamShedule/ExamSchedule");
    const Warning = require("../../../schema/Warning");
    const DailyPoints = require("../../../schema/DailyPoints");
    const Ranking = require("../../../schema/Ranking");

    // إزالة علامات الطالب من جميع الامتحانات
    const examCleanup = await ExamSchedule.updateMany(
      { "marks.student": req.params.id },
      { $pull: { marks: { student: req.params.id } } },
    );
    console.log(
      `🧹 تم حذف علامات الطالب من ${examCleanup.modifiedCount} امتحان`,
    );

    // حذف إنذارات الطالب
    const warningCleanup = await Warning.deleteMany({
      studentId: req.params.id,
    });
    console.log(`🧹 تم حذف ${warningCleanup.deletedCount} إنذار للطالب`);

    // حذف نقاط الطالب اليومية
    const pointsCleanup = await DailyPoints.deleteMany({
      studentId: req.params.id,
    });
    console.log(`🧹 تم حذف ${pointsCleanup.deletedCount} نقطة يومية للطالب`);

    // حذف تصنيفات الطالب
    const rankingCleanup = await Ranking.deleteMany({
      studentId: req.params.id,
    });
    console.log(`🧹 تم حذف ${rankingCleanup.deletedCount} تصنيف للطالب`);

    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: "الطالب غير موجود",
      });
    }

    // Invalidate caches and emit events using helpers
    await invalidateStudentCaches();
    emitStudentEvent("deleted", {
      studentId: req.params.id,
      student: deletedStudent,
    });

    // Notify Teacher if removed from group
    if (deletedStudent.group && deletedStudent.group !== "غير محدد") {
      const io = req.app.get("io");
      notifyStudentRemovedFromGroup(deletedStudent, deletedStudent.group, io);
    }

    // Update group activeStatus after student deletion
    if (deletedStudent.group) {
      await updateGroupActiveStatus(deletedStudent.group);
    }

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

    // 🧹 تنظيف البيانات المرتبطة قبل الحذف
    const ExamSchedule = require("../../../schema/ExamShedule/ExamSchedule");
    const Warning = require("../../../schema/Warning");
    const DailyPoints = require("../../../schema/DailyPoints");
    const Ranking = require("../../../schema/Ranking");

    // إزالة علامات الطلاب من الامتحانات
    const examCleanup = await ExamSchedule.updateMany(
      { "marks.student": { $in: studentIds } },
      { $pull: { marks: { student: { $in: studentIds } } } },
    );
    console.log(`🧹 تم حذف علامات من ${examCleanup.modifiedCount} امتحان`);

    // حذف إنذارات الطلاب
    await Warning.deleteMany({ studentId: { $in: studentIds } });

    // حذف نقاط الطلاب اليومية
    await DailyPoints.deleteMany({ studentId: { $in: studentIds } });

    // حذف تصنيفات الطلاب
    await Ranking.deleteMany({ studentId: { $in: studentIds } });

    // جلب الطلاب المراد حذفهم للحصول على حلقاتهم
    const studentsToDelete = await Student.find({
      _id: { $in: studentIds },
    }).select("group");
    const affectedGroups = [
      ...new Set(
        studentsToDelete
          .map((s) => s.group)
          .filter((g) => g && g !== "غير محدد"),
      ),
    ];

    const result = await Student.deleteMany({
      _id: { $in: studentIds },
    });

    console.log(
      `✅ تم حذف ${result.deletedCount} طالب من أصل ${studentIds.length}`,
    );

    // Invalidate caches and emit events using helpers
    await invalidateStudentCaches();

    // تحديث activeStatus للحلقات المتأثرة
    if (affectedGroups.length > 0) {
      console.log(
        `🔄 تحديث activeStatus لـ ${affectedGroups.length} حلقة متأثرة...`,
      );
      await Group.recalculateMultipleActiveStatus(affectedGroups).catch((err) =>
        console.error("⚠️ خطأ في تحديث activeStatus:", err),
      );
    }

    // Emit delete events for each student
    if (global.io) {
      console.log("📡 Broadcasting bulk students deleted event");
      studentIds.forEach((studentId) => {
        emitStudentEvent("deleted", { studentId });
      });
    }

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
 * حساب إحصائيات الطلاب مع فلترة (محسّن)
 */
exports.getStudentsStatistics = async (req, res) => {
  try {
    console.log("📊 حساب إحصائيات الطلاب...");
    const startTime = Date.now();

    // Build query from filters using helper (same as getStudents)
    const query = buildStudentQuery(req.query);

    // Use aggregation for efficient statistics calculation
    const stats = await Student.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          maleCount: {
            $sum: { $cond: [{ $eq: ["$gender", "ذكر"] }, 1, 0] },
          },
          femaleCount: {
            $sum: { $cond: [{ $eq: ["$gender", "أنثى"] }, 1, 0] },
          },
          totalAge: { $sum: "$age" },
          withGroupCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$group", null] },
                    { $ne: ["$group", ""] },
                    { $ne: ["$group", "غير محدد"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const result = stats[0] || {
      total: 0,
      maleCount: 0,
      femaleCount: 0,
      totalAge: 0,
      withGroupCount: 0,
    };

    const avgAge =
      result.total > 0 ? (result.totalAge / result.total).toFixed(1) : 0;

    const duration = Date.now() - startTime;
    console.log(`✅ تم حساب الإحصائيات في ${duration}ms`);

    res.json({
      success: true,
      data: {
        total: result.total,
        male: result.maleCount,
        female: result.femaleCount,
        active: result.withGroupCount,
        inactive: result.total - result.withGroupCount,
        avgAge: avgAge,
      },
    });
  } catch (error) {
    console.error("❌ خطأ في حساب الإحصائيات:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * التحقق من تكرار البيانات (للتحقق الفوري في الفرونت إند)
 */
exports.checkDuplicate = async (req, res) => {
  try {
    const { field, value, excludeId } = req.query;

    if (!field || !value) {
      return res.status(400).json({
        success: false,
        message: "يجب تحديد الحقل والقيمة",
      });
    }

    const data = { [field]: value };
    const duplicateError = await checkDuplicateFields(
      data,
      excludeId,
      "student",
    );

    if (duplicateError) {
      return res.json({
        success: false,
        isDuplicate: true,
        message: duplicateError.message,
        field: duplicateError.field,
        existingUserType: duplicateError.existingUserType,
      });
    }

    return res.json({
      success: true,
      isDuplicate: false,
      message: "القيمة متاحة",
    });
  } catch (error) {
    console.error("خطأ في التحقق من التكرار:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء التحقق من البيانات",
    });
  }
};

/**
 * تصدير الطلاب إلى CSV
 */
exports.exportStudentsToCSV = async (req, res) => {
  try {
    console.log("📥 تصدير بيانات الطلاب إلى CSV...");

    // Build query from filters
    const query = buildStudentQuery(req.query);

    // Fetch all students matching the query
    const students = await Student.find(query)
      .select("-password -avatar -__v")
      .lean()
      .sort({ studentId: 1 });

    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لا توجد بيانات للتصدير",
      });
    }

    // CSV Headers
    const headers = [
      "رقم الطالب",
      "الاسم الأول",
      "اسم الأب",
      "اسم الجد",
      "اسم الأم",
      "اسم العائلة",
      "رقم الهوية",
      "تاريخ الميلاد",
      "العمر",
      "الجنس",
      "مكان السكن",
      "المعلم",
      "الحلقة",
      "البريد الإلكتروني",
      "رقم الهاتف",
    ];

    // Helper to escape CSV fields
    const escapeCSV = (field) => {
      if (field == null || field === undefined) return "";
      const str = String(field);
      // If contains semicolon, newline, or quote, wrap and escape
      if (str.includes(";") || str.includes("\n") || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Helper to format numbers as text for Excel (prevents scientific notation)
    const formatAsText = (value) => {
      if (value == null || value === undefined || value === "") return "";
      // Use Excel formula to force text format
      return `="${value}"`;
    };

    // Format date helper
    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleDateString("ar-EG", { timeZone: TIMEZONE });
    };

    // إضافة اسم المعلم الثلاثي للطلاب
    const studentsWithTeacherName = await populateTeacherFullName(students);

    // Build CSV rows
    const rows = studentsWithTeacherName.map((student) => [
      student.studentId || "",
      student.firstName || "",
      student.fatherName || "",
      student.grandFatherName || "",
      student.motherName || "",
      student.lastName || "",
      formatAsText(student.idNumber), // Format as text to prevent scientific notation
      formatDate(student.birthDate),
      student.age || "",
      student.gender || "",
      student.residence || "",
      student.teacherFullName || student.teacher || "غير محدد",
      student.group || "غير محدد",
      student.email || "",
      formatAsText(student.phoneNumber), // Format as text
    ]);

    // Generate CSV content
    const delimiter = ";";
    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(delimiter))
      .join("\r\n");

    // Send CSV with UTF-8 BOM for Excel compatibility
    const filename = `students_${new Date().toISOString().split("T")[0]}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send("\ufeff" + csvContent);

    console.log(`✅ تم تصدير ${students.length} طالب بنجاح`);
  } catch (error) {
    console.error("❌ خطأ في تصدير البيانات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تصدير البيانات",
      error: error.message,
    });
  }
};

/**
 * جلب قائمة الحلقات المبسطة لاختيار حلقة الطالب
 * يستخدم من قبل السكرتير الذي لديه صلاحية إدارة الطلاب
 * @route GET /api/students/groups-for-assignment
 */
exports.getGroupsForStudentAssignment = async (req, res) => {
  try {
    console.log("📚 جلب الحلقات لاختيار حلقة الطالب...");

    const groups = await Group.find()
      .select("name teacher teacherName capacity studentsCount isActive")
      .lean()
      .sort({ name: 1 });

    // تحميل أسماء المعلمين
    const Teacher = require("../../../schema/Teacher");
    const teachers = await Teacher.find()
      .select("_id firstName lastName")
      .lean();

    const teacherMap = {};
    teachers.forEach((t) => {
      teacherMap[t._id.toString()] = `${t.firstName} ${t.lastName}`;
    });

    const groupsWithTeacherNames = groups.map((group) => ({
      _id: group._id,
      name: group.name,
      teacher: group.teacher,
      teacherName:
        group.teacherName ||
        (group.teacher ? teacherMap[group.teacher.toString()] : null) ||
        "غير محدد",
      capacity: group.capacity || 0,
      studentsCount: group.studentsCount || 0,
      isActive: group.isActive !== false,
    }));

    console.log(`✅ تم جلب ${groupsWithTeacherNames.length} حلقة`);

    res.json({
      success: true,
      data: groupsWithTeacherNames,
    });
  } catch (error) {
    console.error("❌ خطأ في جلب الحلقات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الحلقات",
      error: error.message,
    });
  }
};
