const Attendance = require("../../schema/Attendance");
const Student = require("../../schema/Student");

// Get attendance statistics for a specific student
exports.getStudentAttendanceStats = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Verify that the student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    // Get all attendance records for this student
    const records = await Attendance.find({ studentId }).sort({ date: 1 });

    // Group records by month
    const months = {};

    records.forEach((record) => {
      const date = new Date(record.date);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      if (!months[key]) {
        months[key] = {
          year,
          month,
          present: 0,
          absent: 0,
          total: 0,
        };
      }

      months[key].total++;
      if (record.isPresent) {
        months[key].present++;
      } else {
        months[key].absent++;
      }
    });

    // Convert to array and calculate rates
    const stats = Object.values(months).map((month) => ({
      year: month.year,
      month: month.month,
      presentDays: month.present,
      absentDays: month.absent,
      totalDays: month.total,
      attendanceRate: Math.round((month.present / month.total) * 100 * 10) / 10,
      absenceRate: Math.round((month.absent / month.total) * 100 * 10) / 10,
    }));

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// دالة مساعدة لتحديث إحصائيات الحلقات للشهر الحالي
async function updateGroupsMonthlyStats(date) {
  try {
    const Group = require("../../schema/Group");

    // تحديد بداية ونهاية الشهر
    const targetDate = new Date(date);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`; // "YYYY-MM"

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

    console.log(`📊 تحديث إحصائيات الحلقات للشهر: ${monthKey}`);

    // جلب كل الحلقات
    const groups = await Group.find({});

    for (const group of groups) {
      try {
        // جلب كل الطلاب في هذه الحلقة
        const students = await Student.find({ group: group.name });
        const studentIds = students.map((s) => s._id);

        if (studentIds.length === 0) {
          console.log(`⚠️ لا يوجد طلاب في الحلقة: ${group.name}`);
          continue;
        }

        // جلب سجلات الحضور لهذا الشهر لطلاب هذه الحلقة
        const attendanceRecords = await Attendance.find({
          studentId: { $in: studentIds },
          date: { $gte: monthStart, $lte: monthEnd },
        });

        if (attendanceRecords.length === 0) {
          console.log(`⚠️ لا توجد سجلات حضور للحلقة: ${group.name}`);
          continue;
        }

        // حساب الإحصائيات
        let totalPresences = 0;
        let totalAbsences = 0;

        attendanceRecords.forEach((record) => {
          if (record.isPresent) {
            totalPresences++;
          } else {
            totalAbsences++;
          }
        });

        const totalRecords = totalPresences + totalAbsences;
        const attendanceRate =
          totalRecords > 0
            ? Math.round((totalPresences / totalRecords) * 100 * 10) / 10
            : 0;
        const absenceRate =
          totalRecords > 0
            ? Math.round((totalAbsences / totalRecords) * 100 * 10) / 10
            : 0;

        // حساب عدد الأيام الفريدة (عدد المرات التي تم تسجيل الحضور فيها)
        const uniqueDates = [
          ...new Set(
            attendanceRecords.map(
              (r) => new Date(r.date).toISOString().split("T")[0]
            )
          ),
        ];
        const totalDays = uniqueDates.length;

        // تحديث إحصائيات الحلقة
        group.currentMonthStats = {
          month: monthKey,
          absenceRate,
          attendanceRate,
          totalDays,
          totalAbsences,
          totalPresences,
        };

        await group.save();

        console.log(`✅ تم تحديث إحصائيات الحلقة: ${group.name}`);
        console.log(`   - نسبة الغياب: ${absenceRate}%`);
        console.log(`   - نسبة الحضور: ${attendanceRate}%`);
        console.log(`   - عدد الأيام: ${totalDays}`);
      } catch (groupError) {
        console.error(`❌ خطأ في تحديث الحلقة ${group.name}:`, groupError);
      }
    }

    console.log(`✅ تم الانتهاء من تحديث إحصائيات جميع الحلقات`);
  } catch (error) {
    console.error("❌ خطأ في تحديث إحصائيات الحلقات:", error);
  }
}

// تصدير الدالة للاستخدام في controllers أخرى
exports.updateGroupsMonthlyStats = updateGroupsMonthlyStats;
