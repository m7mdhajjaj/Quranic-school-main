// ============================================================================
// dailyPointsController - إدارة النقاط اليومية
// ============================================================================

const DailyPoints = require("../../schema/DailyPoints");
const Student = require("../../schema/Student");
const Group = require("../../schema/Group");
const Teacher = require("../../schema/Teacher");
const MonthlyPoints = require("../../schema/MonthlyPoints");
const {
  updateBadgeProgress,
} = require("../../services/PointsGameService/badgeService");
const {
  updateMonthlyPoints,
} = require("../../services/PointsGameService/monthlyPointsService");

/**
 * @desc    حفظ النقاط اليومية للطالب
 * @route   POST /api/points-game/daily
 * @access  Private (Student)
 */
exports.saveDailyPoints = async (req, res) => {
  try {
    const studentId = req.user._id;
    const {
      prayers,
      nawafel,
      parentRespect,
      schoolAttendance,
      dailyStudy,
      adhkar,
      halaqah,
      ramadan,
      date,
    } = req.body;

    // الحصول على معلومات الطالب
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    // تحديد تاريخ اليوم (بدون الوقت)
    const today = date ? new Date(date) : new Date();
    today.setHours(0, 0, 0, 0);

    // البحث عن سجل موجود لنفس اليوم
    let dailyPoints = await DailyPoints.findOne({
      studentId,
      date: today,
    });

    if (dailyPoints) {
      // تحديث السجل الموجود
      dailyPoints.prayers = prayers;
      dailyPoints.nawafel = nawafel;
      dailyPoints.parentRespect = parentRespect;
      dailyPoints.schoolAttendance = schoolAttendance;
      dailyPoints.dailyStudy = dailyStudy;
      dailyPoints.adhkar = adhkar;
      dailyPoints.halaqah = halaqah;
      dailyPoints.ramadan = ramadan || {
        taraweehRakaat: 0,
        quranPages: 0,
        fpiasting: false,
      };
      // إجبار Mongoose على اكتشاف التغييرات في الحقول المتداخلة
      dailyPoints.markModified("prayers");
      dailyPoints.markModified("nawafel");
      dailyPoints.markModified("adhkar");
      dailyPoints.markModified("halaqah");
      dailyPoints.markModified("ramadan");
    } else {
      // إنشاء سجل جديد
      dailyPoints = new DailyPoints({
        studentId,
        date: today,
        prayers,
        nawafel,
        parentRespect,
        schoolAttendance,
        dailyStudy,
        adhkar,
        halaqah,
        ramadan: ramadan || {
          taraweehRakaat: 0,
          quranPages: 0,
          fpiasting: false,
        },
        group: student.group,
        teacher: student.teacher,
      });
    }

    await dailyPoints.save();

    // تحديث التقدم نحو الشارات
    await updateBadgeProgress(studentId, dailyPoints, student);

    // تحديث نقاط الشهر الحالي
    await updateMonthlyPoints(studentId, dailyPoints, student);

    res.status(200).json({
      success: true,
      message: "تم حفظ النقاط بنجاح",
      data: dailyPoints,
    });
  } catch (error) {
    console.error("خطأ في حفظ النقاط:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حفظ النقاط",
      error: error.message,
    });
  }
};

/**
 * @desc    الحصول على النقاط اليومية للطالب
 * @route   GET /api/points-game/daily/:date?
 * @access  Private (Student)
 */
exports.getDailyPoints = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { date } = req.params;

    // تحديد التاريخ
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const dailyPoints = await DailyPoints.findOne({
      studentId,
      date: targetDate,
    });

    if (!dailyPoints) {
      return res.status(200).json({
        success: true,
        message: "لا توجد نقاط لهذا اليوم",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: dailyPoints,
    });
  } catch (error) {
    console.error("خطأ في جلب النقاط:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب النقاط",
      error: error.message,
    });
  }
};

/**
 * @desc    جلب نقاط طلاب الحلقة اليومية (للمعلم)
 * @route   GET /api/points-game/daily/group/:groupId
 * @access  Private (Teacher)
 */
exports.getGroupDailyPoints = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    if (userRole !== "teacher" && userRole !== "admin") {
      return res.status(403).json({ message: "غير مصرح لك" });
    }

    const { groupId } = req.params;
    const { date } = req.query;

    // التحقق من الحلقة
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "الحلقة غير موجودة" });
    }

    // التحقق أن المعلم يملك هذه الحلقة
    if (userRole === "teacher") {
      const teacher = await Teacher.findById(userId);
      if (!teacher) {
        return res.status(404).json({ message: "المعلم غير موجود" });
      }
      const teacherName = `${teacher.firstName} ${teacher.lastName}`;
      if (group.teacher !== teacherName) {
        return res.status(403).json({ message: "هذه الحلقة ليست لك" });
      }
    }

    // جلب طلاب الحلقة
    const students = await Student.find({ group: group.name }).select(
      "_id firstName lastName",
    );

    // تحديد التاريخ
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // جلب نقاط جميع الطلاب لهذا اليوم
    const studentIds = students.map((s) => s._id);
    const dailyRecords = await DailyPoints.find({
      studentId: { $in: studentIds },
      date: targetDate,
    }).lean();

    // إنشاء Map للوصول السريع
    const pointsMap = new Map(
      dailyRecords.map((record) => [record.studentId.toString(), record]),
    );

    // تجميع البيانات
    const result = students.map((student) => {
      const record = pointsMap.get(student._id.toString());
      return {
        studentId: student._id,
        name: `${student.firstName} ${student.lastName}`,
        totalPoints: record ? record.totalPoints : 0,
        hasData: !!record,
        date: targetDate,
      };
    });

    // ترتيب حسب النقاط (الأعلى أولاً)
    result.sort((a, b) => b.totalPoints - a.totalPoints);

    res.status(200).json({
      success: true,
      data: result,
      date: targetDate,
      groupName: group.name,
    });
  } catch (error) {
    console.error("خطأ في جلب نقاط الحلقة اليومية:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب نقاط الحلقة",
      error: error.message,
    });
  }
};

/**
 * @desc    تصفير نقاط طالب يومية (للمعلم)
 * @route   DELETE /api/points-game/daily/:studentId/:date
 * @access  Private (Teacher)
 */
exports.resetStudentDailyPoints = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    if (userRole !== "teacher" && userRole !== "admin") {
      return res.status(403).json({ message: "غير مصرح لك" });
    }

    const { studentId, date } = req.params;

    // التحقق من الطالب
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    // التحقق أن المعلم يملك هذا الطالب
    if (userRole === "teacher") {
      const teacher = await Teacher.findById(userId);
      if (!teacher) {
        return res.status(404).json({ message: "المعلم غير موجود" });
      }
      const teacherName = `${teacher.firstName} ${teacher.lastName}`;
      if (student.teacher !== teacherName) {
        return res.status(403).json({ message: "هذا الطالب ليس في حلقتك" });
      }
    }

    // تحديد التاريخ
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // حذف سجل النقاط اليومية
    const deleted = await DailyPoints.findOneAndDelete({
      studentId,
      date: targetDate,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "لا توجد نقاط لهذا الطالب في هذا اليوم",
      });
    }

    // إعادة حساب النقاط الشهرية بعد الحذف
    const month = targetDate.getMonth() + 1;
    const year = targetDate.getFullYear();

    // جلب إجمالي النقاط المتبقية لهذا الشهر
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const remaining = await DailyPoints.aggregate([
      {
        $match: {
          studentId: student._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: "$totalPoints" },
          activeDays: { $sum: 1 },
        },
      },
    ]);

    // تحديث MonthlyPoints
    if (remaining.length > 0) {
      await MonthlyPoints.findOneAndUpdate(
        { studentId: student._id, month, year },
        {
          totalPoints: remaining[0].totalPoints,
          activeDays: remaining[0].activeDays,
        },
      );
    } else {
      // حذف سجل الشهر إذا لم يتبق أي أيام
      await MonthlyPoints.findOneAndDelete({
        studentId: student._id,
        month,
        year,
      });
    }

    res.status(200).json({
      success: true,
      message: `تم تصفير نقاط ${student.firstName} ${student.lastName} بنجاح`,
    });
  } catch (error) {
    console.error("خطأ في تصفير نقاط الطالب:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تصفير النقاط",
      error: error.message,
    });
  }
};

module.exports = exports;
