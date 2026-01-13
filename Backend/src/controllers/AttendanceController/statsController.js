const Attendance = require("../../schema/Attendance");
const Student = require("../../schema/Student");
const Section = require("../../schema/DailyMark/Section"); // Import Section schema

// Arabic months array (ميلادي)
const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

// Get attendance statistics for a specific student (Optimized for Frontend)
// ✅ Updated to rely on Section dates (System New Rule)
exports.getStudentAttendanceStats = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // 1. Verify that the student exists and get their group
    const student = await Student.findById(studentId).select("group");
    if (!student) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    const groupName = student.group;

    // 2. dates from Sections (The source of truth for "Total Days")
    // لجلب المقاطع التي تمت لهذا الجروب
    // We only care about sections that have happened (date <= now)
    const sections = await Section.find({
      group: groupName,
      date: { $lte: new Date() } // Only past/current sections
    }).select("date");

    // Extract unique dates from sections (Set to handle multiple sections per day if any)
    const sectionDatesMap = new Map(); // key="YYYY-MM-DD" -> Date Object
    sections.forEach(sec => {
      const dateStr = sec.date.toISOString().split('T')[0];
      if (!sectionDatesMap.has(dateStr)) {
         sectionDatesMap.set(dateStr, sec.date);
      }
    });

    // 3. Get all attendance records for this student
    const records = await Attendance.find({ studentId });
    // Map existing attendance by Date String
    const attendanceMap = new Map();
    records.forEach(r => {
      const dateStr = r.date.toISOString().split('T')[0];
      attendanceMap.set(dateStr, r);
    });

    // 4. Build Statistics based on Section Dates
    const grouped = {};

    for (const [dateStr, dateObj] of sectionDatesMap) {
      const date = new Date(dateObj);
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

      grouped[key].total++; // Count every Section day as a required day

      // Check Attendance
      // If record exists, check isPresent.
      // If record does NOT exist: 
      //    - If "Yesterday" or before: The auto-fill cron should have filled it. If not, assume Absent? Or Present?
      //    - If "Same Day" (Today): If not taken yet, do we count it?
      //    Let's assume: If record missing and date is Today, ignore (count=0 for this day? No, total++ but absence?).
      //    Better: Use attendance record status. If missing, assume absent for stats safety ?? 
      //    BUT user said "auto-fill as Present". So rely on mapped record.
      
      const record = attendanceMap.get(dateStr);
      
      if (record) {
        if (!record.isPresent) {
           grouped[key].absences++;
           grouped[key].dates.push(date);
        }
      } else {
        // No record exists.
        // If it's today, maybe not taken yet.
        // If it's past, maybe cron failed or recent data.
        // System convention: Missing record = Absent? Or just not counted?
        // User requested: "Take attendance based on Section dates."
        // We will count it in TOTAL. If no Present record, it effectively lowers the "Attendance Rate".
        // BUT we won't mark it as "Absence" count unless we are sure.
        // Percentage = (Total - Absences) / Total. 
        // If record missing, is it Present or Absent?
        // Let's assume Absent for calculation rigor, or maybe create "Unknown" state?
        // For simplicity: Treat missing record as Absent in calculation? 
        // No, that hurts "Today" stats. 
        // Logic: specific to "Absent Students". 
        // Let's count Absences ONLY if record.isPresent === false.
        // So a missing record acts as "Present" in the formula (Total - Absences).
        // This is safer for "Auto Present" logic.
      }
    }

    // Convert to array
    const stats = Object.entries(grouped).map(([k, v]) => {
      const label = AR_MONTHS[v.month];
      
      const presenceCount = v.total - v.absences;
      const absenceRate = v.total > 0 ? Math.round((v.absences / v.total) * 1000) / 10 : 0;
      const attendanceRate = v.total > 0 ? Math.round((presenceCount / v.total) * 1000) / 10 : 0;
      
      return {
        month: `${label} ${v.year}`,
        absenceCount: v.absences,
        presenceCount,
        totalDays: v.total,
        rate: absenceRate,
        attendanceRate,
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

