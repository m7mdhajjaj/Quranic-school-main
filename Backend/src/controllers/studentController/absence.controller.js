const Student = require("../../schema/Student");
const Attendance = require("../../schema/Attendance");

/**
 * جلب الطلاب مع إحصائيات الغياب (محسّن للأداء)
 */
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
