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
    console.log("📊 [Stats] Student:", studentId, "Group:", groupName);

    // 2. dates from Sections (Fetching ALL to avoid DB timezone filtering issues)
    // We strictly filter in memory based on "End of Today"
    const sections = await Section.find({
      group: groupName
    }).select("date");

    console.log("📅 [Stats] Found", sections.length, "sections for group:", groupName);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Extract unique dates from sections (Set to handle multiple sections per day if any)
    const sectionDatesMap = new Set(); 
    const allSectionDatesMap = new Set(); // Include Future dates for Weekly Schedule view

    sections.forEach(sec => {
      const dateStr = sec.date.toISOString().split('T')[0];
      allSectionDatesMap.add(dateStr);

      if (sec.date <= endOfToday) {
          sectionDatesMap.add(dateStr);
      }
    });

    console.log("📅 [Stats] Section dates (all):", [...allSectionDatesMap]);

    // 3. Get all attendance records for this student
    const records = await Attendance.find({ studentId });
    console.log("📋 [Stats] Found", records.length, "attendance records for student");
    
    // Map existing attendance by Date String
    const attendanceMap = new Map();
    records.forEach(r => {
      const dateStr = r.date.toISOString().split('T')[0];
      attendanceMap.set(dateStr, r);
      // 🔍 تشخيص: طباعة كل سجل حضور
      console.log(`  📋 Attendance: ${dateStr} -> isPresent: ${r.isPresent}`);
    });

    // 4. Build Statistics based on UNION of Section Dates and Attendance Dates
    // This ensures historical absences (from previous groups) are counted
    const allDates = new Set([...sectionDatesMap, ...attendanceMap.keys()]);
    const grouped = {};

    for (const dateStr of allDates) {
      const date = new Date(dateStr);
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

      // Logic:
      // 1. If Attendance exists:
      //    - Count as Total Day.
      //    - If !isPresent -> Absence.
      // 2. If Attendance MISSING but Section Exists:
      //    - Count as Total Day (Required Day).
      //    - Assume Present (Auto-fill logic).

      const record = attendanceMap.get(dateStr);
      const isSectionDay = sectionDatesMap.has(dateStr);

      if (record) {
          grouped[key].total++;
          if (!record.isPresent) {
             grouped[key].absences++;
             grouped[key].dates.push(date);
          }
      } else if (isSectionDay) {
          // Required day but no record -> Assume Present
          grouped[key].total++;
      }
    }

    // --- Calculate Weekly Stats (String Based) ---
    const today = new Date();
    // Safety HACK: Set time to Noon (12:00) to avoid timezone shift issues when converting to UTC date string
    // This ensures that "Saturday" local doesn't become "Friday" UTC if we are in positive timezone and it's early morning
    today.setHours(12, 0, 0, 0);
    
    const dayOfWeek = today.getDay(); // 0=Sun, 6=Sat
    // Offset to make Saturday the start (Sat=0, Sun=1, ..., Fri=6)
    const diffToSat = (dayOfWeek + 1) % 7;
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - diffToSat);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); 

    console.log("📆 [Weekly] Week:", weekStart.toISOString().split('T')[0], "to", weekEnd.toISOString().split('T')[0]);

    const weekDateStrings = new Set();
    const currentMapDate = new Date(weekStart);
    
    // Generate 7 days strings for the current week
    for(let i=0; i<7; i++) {
        weekDateStrings.add(currentMapDate.toISOString().split('T')[0]);
        currentMapDate.setDate(currentMapDate.getDate() + 1);
    }

    console.log("📆 [Weekly] Week date strings:", [...weekDateStrings]);

    let weeklyTotal = 0;
    let weeklyAbsences = 0;
    const weeklyAbsenceDates = [];

    // Calculate Stats STRICTLY based on this week's Sections
    // "Total Days" = Number of sections in this week.
    for (const dateStr of weekDateStrings) {
        // 1. Check if there is a Section for this day (Scheduled, past or future)
        if (allSectionDatesMap.has(dateStr)) {
            weeklyTotal++;
            console.log(`  ✅ [Weekly] Section found for: ${dateStr}`);
            
            // 2. Check for Absence on this Section Day
            const record = attendanceMap.get(dateStr);
            console.log(`  🔍 [Weekly] Attendance for ${dateStr}:`, record ? `isPresent: ${record.isPresent}` : 'NO RECORD');
            
            if (record && !record.isPresent) {
                weeklyAbsences++;
                weeklyAbsenceDates.push(record.date);
                console.log(`  ❌ [Weekly] ABSENCE recorded for: ${dateStr}`);
            }
        }
    }

    console.log("📊 [Weekly] RESULT: Total:", weeklyTotal, "Absences:", weeklyAbsences);


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

    // Calculate Weekly Rates
    const weeklyPresenceCount = weeklyTotal - weeklyAbsences;
    const weeklyAbsenceRate = weeklyTotal > 0 ? Math.round((weeklyAbsences / weeklyTotal) * 1000) / 10 : 0;
    const weeklyAttendanceRate = weeklyTotal > 0 ? Math.round((weeklyPresenceCount / weeklyTotal) * 1000) / 10 : 0;

    res.json({
      success: true,
      data: stats,
      weeklyStats: {
          totalDays: weeklyTotal,
          absenceCount: weeklyAbsences,
          presenceCount: weeklyPresenceCount,
          rate: weeklyAbsenceRate,
          attendanceRate: weeklyAttendanceRate,
          weekStart: weekStart.toISOString().split('T')[0],
          weekEnd: weekEnd.toISOString().split('T')[0],
          absenceDates: weeklyAbsenceDates // Include dates
      }
    });
  } catch (error) {
    console.error("Error in getStudentAttendanceStats:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

