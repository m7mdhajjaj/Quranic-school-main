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

