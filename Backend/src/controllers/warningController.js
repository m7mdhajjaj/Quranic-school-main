const Warning = require("../schema/Warning");
const Student = require("../schema/Student");
const Teacher = require("../schema/Teacher");
const Group = require("../schema/Group");

// إنشاء إنذار جديد (للمعلم فقط)
exports.createWarning = async (req, res) => {
  try {
    const { studentId, teacherId, groupId, groupName, type, reason } = req.body;

    // البحث عن الحلقة إما بالـ ID أو بالاسم
    let group;
    if (groupId) {
      group = await Group.findById(groupId);
    } else if (groupName) {
      group = await Group.findOne({ name: groupName });
    }

    if (!group) {
      return res.status(404).json({ message: "الحلقة غير موجودة" });
    }

    // التحقق من أن الطالب موجود
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    // التحقق من أن الطالب في هذه الحلقة (مقارنة بالاسم)
    if (student.group !== group.name) {
      return res.status(400).json({
        message: "الطالب غير مسجل في هذه الحلقة",
        studentGroup: student.group,
        expectedGroup: group.name,
      });
    }

    // التحقق من عدم وجود إنذار سابق من نفس النوع (ما عدا التنبيه)
    if (type !== "warning") {
      const existingWarning = await Warning.findOne({
        studentId,
        type,
      });

      if (existingWarning) {
        const warningTypeNames = {
          first: "الإنذار الأول",
          second: "الإنذار الثاني",
          third: "الإنذار الثالث",
          expulsion: "الفصل النهائي",
        };

        return res.status(400).json({
          message: `الطالب حاصل على ${warningTypeNames[type]} مسبقاً. لا يمكن إعطاء نفس الإنذار مرتين.`,
          existingWarning: {
            type: existingWarning.type,
            date: existingWarning.createdAt,
            reason: existingWarning.reason,
          },
        });
      }
    }

    // إنشاء الإنذار
    const warning = new Warning({
      studentId,
      teacherId,
      groupId: group._id, // استخدم الـ ID الحقيقي للحلقة
      type,
      reason,
    });

    await warning.save();

    // إذا كان فصل نهائي، قم بإزالة الطالب من الحلقة
    if (type === "expulsion") {
      student.group = null;
      student.isActive = false;
      await student.save();

      // إزالة الطالب من قائمة طلاب الحلقة إذا كانت موجودة
      if (group.students && Array.isArray(group.students)) {
        group.students = group.students.filter(
          (id) => id.toString() !== studentId
        );
        await group.save();
      }
    }

    // إرجاع الإنذار مع البيانات المرتبطة
    const populatedWarning = await Warning.findById(warning._id)
      .populate("studentId", "firstName lastName")
      .populate("teacherId", "firstName lastName")
      .populate("groupId", "name");

    // إرسال تحديث Socket للمستخدمين المتصلين
    const io = req.app.get("io");
    if (io) {
      io.to("warnings").emit("warningCreated", populatedWarning);
      console.log(`⚠️ Warning created event emitted to warnings room`);
    }

    res.status(201).json(populatedWarning);
  } catch (error) {
    console.error("Error creating warning:", error);
    res.status(500).json({ message: "حدث خطأ أثناء إنشاء الإنذار" });
  }
};

// جلب إنذارات طالب معين
exports.getStudentWarnings = async (req, res) => {
  try {
    const { studentId } = req.params;

    const warnings = await Warning.find({ studentId })
      .populate("studentId", "firstName lastName")
      .populate("teacherId", "firstName lastName")
      .populate("groupId", "name")
      .sort({ createdAt: -1 });

    res.json(warnings);
  } catch (error) {
    console.error("Error fetching student warnings:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الإنذارات" });
  }
};

// جلب إنذارات حلقة معينة (للمعلم فقط)
exports.getGroupWarnings = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { teacherId } = req.query;

    // التحقق من أن المعلم يدرس في هذه الحلقة
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "الحلقة غير موجودة" });
    }

    if (teacherId && group.teacher.toString() !== teacherId) {
      return res.status(403).json({
        message: "غير مصرح لك بعرض إنذارات هذه الحلقة",
      });
    }

    const warnings = await Warning.find({ groupId })
      .populate("studentId", "firstName lastName")
      .populate("teacherId", "firstName lastName")
      .populate("groupId", "name")
      .sort({ createdAt: -1 });

    res.json(warnings);
  } catch (error) {
    console.error("Error fetching group warnings:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الإنذارات" });
  }
};

// جلب طلاب الحلقة مع عدد الإنذارات
exports.getGroupStudentsWithWarnings = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate(
      "students",
      "firstName lastName"
    );

    if (!group) {
      return res.status(404).json({ message: "الحلقة غير موجودة" });
    }

    // جلب عدد الإنذارات لكل طالب
    const studentsWithWarnings = await Promise.all(
      group.students.map(async (student) => {
        const warningsCount = await Warning.countDocuments({
          studentId: student._id,
        });

        return {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          warningsCount,
        };
      })
    );

    res.json(studentsWithWarnings);
  } catch (error) {
    console.error("Error fetching students with warnings:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الطلاب" });
  }
};

// حذف إنذار (للمدير فقط)
exports.deleteWarning = async (req, res) => {
  try {
    const { warningId } = req.params;

    const warning = await Warning.findByIdAndDelete(warningId);

    if (!warning) {
      return res.status(404).json({ message: "الإنذار غير موجود" });
    }

    // إرسال تحديث Socket للمستخدمين المتصلين
    const io = req.app.get("io");
    if (io) {
      io.to("warnings").emit("warningDeleted", { warningId });
      console.log(`🗑️ Warning deleted event emitted to warnings room`);
    }

    res.json({ message: "تم حذف الإنذار بنجاح" });
  } catch (error) {
    console.error("Error deleting warning:", error);
    res.status(500).json({ message: "حدث خطأ أثناء حذف الإنذار" });
  }
};

// جلب إحصائيات الإنذارات (للمدير)
exports.getWarningsStatistics = async (req, res) => {
  try {
    const totalWarnings = await Warning.countDocuments();
    const warningsByType = await Warning.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    const activeWarnings = await Warning.countDocuments({ isActive: true });

    res.json({
      totalWarnings,
      warningsByType,
      activeWarnings,
    });
  } catch (error) {
    console.error("Error fetching warnings statistics:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الإحصائيات" });
  }
};

// التحقق من حالة الطالب (مفصول أم لا)
exports.checkStudentStatus = async (req, res) => {
  try {
    const { studentId } = req.params;

    // البحث عن إنذار فصل نهائي
    const expulsion = await Warning.findOne({
      studentId,
      type: "expulsion",
    });

    // البحث عن إنذارات فصل مؤقت نشطة
    const activeSuspension = await Warning.findOne({
      studentId,
      type: { $in: ["first", "second", "third"] },
      isActive: true,
      endDate: { $gt: new Date() },
    });

    // البحث عن حظر دائم من الأنشطة
    const permanentBan = await Warning.findOne({
      studentId,
      $or: [{ type: "third" }, { type: "expulsion" }],
    });

    // حساب حظر مؤقت من الأنشطة
    const temporaryBan = await Warning.findOne({
      studentId,
      type: "second",
      isActive: true,
    });

    let activitiesBanEndDate = null;
    if (temporaryBan) {
      const banEndDate = new Date(temporaryBan.startDate);
      banEndDate.setMonth(banEndDate.getMonth() + 1); // شهر واحد
      if (banEndDate > new Date()) {
        activitiesBanEndDate = banEndDate;
      }
    }

    res.json({
      isPermanentlyExpelled: !!expulsion,
      isTemporarilySuspended: !!activeSuspension,
      suspensionEndDate: activeSuspension?.endDate || null,
      isPermanentlyBannedFromActivities: !!permanentBan,
      isTemporarilyBannedFromActivities: !!activitiesBanEndDate,
      activitiesBanEndDate,
    });
  } catch (error) {
    console.error("Error checking student status:", error);
    res.status(500).json({ message: "حدث خطأ أثناء التحقق من حالة الطالب" });
  }
};
