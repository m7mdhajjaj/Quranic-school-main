const Attendance = require("../../schema/Attendance");
const Student = require("../../schema/Student");

// Arabic months array (ميلادي)
const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

// Get attendance statistics for a specific student (Optimized for Frontend)
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
    const grouped = {};

    records.forEach((record) => {
      const date = new Date(record.date);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      if (!grouped[key]) {
        grouped[key] = {
          year,
          month,
          absences: 0,
          total: 0,
          dates: []
        };
      }

      grouped[key].total++;
      if (!record.isPresent) {
        grouped[key].absences++;
        grouped[key].dates.push(record.date);
      }
    });

    // Convert to array with Arabic month names
    const stats = Object.entries(grouped).map(([k, v]) => {
      const label = AR_MONTHS[v.month];
      const rate = v.total > 0 ? Math.round((v.absences / v.total) * 1000) / 10 : 0;
      
      return {
        month: `${label} ${v.year}`,
        absenceCount: v.absences,
        totalDays: v.total,
        rate,
        absenceDates: v.dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      };
    });

    // Sort by year and month
    stats.sort((a, b) => {
      const aLastSpace = a.month.lastIndexOf(' ');
      const bLastSpace = b.month.lastIndexOf(' ');
      const aLabel = a.month.substring(0, aLastSpace);
      const bLabel = b.month.substring(0, bLastSpace);
      const aYear = parseInt(a.month.substring(aLastSpace + 1), 10);
      const bYear = parseInt(b.month.substring(bLastSpace + 1), 10);

      if (aYear !== bYear) return aYear - bYear;
      const aIdx = AR_MONTHS.findIndex(x => x === aLabel);
      const bIdx = AR_MONTHS.findIndex(x => x === bLabel);
      return aIdx - bIdx;
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error in getStudentAttendanceStats:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

