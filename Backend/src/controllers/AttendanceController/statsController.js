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
// ✅ Supports optional month/year filtering via query params
exports.getStudentAttendanceStats = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    
    // 🆕 استخراج الشهر والسنة من query params (اختياري)
    const requestedMonth = req.query.month ? parseInt(req.query.month, 10) : null; // 0-11
    const requestedYear = req.query.year ? parseInt(req.query.year, 10) : null;

    // 1. Verify that the student exists and get their group
    const student = await Student.findById(studentId).select("group");
    if (!student) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    const groupName = student.group;
    console.log("📊 [Stats] Student:", studentId, "Group:", groupName);
    if (requestedMonth !== null && requestedYear !== null) {
      console.log("📊 [Stats] Filtering by:", AR_MONTHS[requestedMonth], requestedYear);
    }

    // 2. dates from Sections (Fetching ALL to avoid DB timezone filtering issues)
    // ✅ Using dateKey (YYYY-MM-DD string) for consistent date comparison
    const sections = await Section.find({
      group: groupName
    }).select("dateKey date");

    console.log("📅 [Stats] Found", sections.length, "sections for group:", groupName);

    const todayStr = new Date().toISOString().split('T')[0];

    // Extract unique dates from sections (Set to handle multiple sections per day if any)
    const sectionDatesMap = new Set(); 
    const allSectionDatesMap = new Set(); // Include Future dates for Weekly Schedule view

    sections.forEach(sec => {
      // ✅ استخدام dateKey بدل date.toISOString() لتجنب مشاكل التايم زون
      const dateStr = sec.dateKey || sec.date.toISOString().split('T')[0];
      allSectionDatesMap.add(dateStr);

      // فقط التواريخ الماضية أو اليوم
      if (dateStr <= todayStr) {
          sectionDatesMap.add(dateStr);
      }
    });

    console.log("📅 [Stats] Section dates (all):", [...allSectionDatesMap]);
    console.log("📅 [Stats] Section dates (past/today):", [...sectionDatesMap]);

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
        year: v.year,
        monthIndex: v.month,
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
      if (a.year !== b.year) return a.year - b.year;
      return a.monthIndex - b.monthIndex;
    });

    // Calculate Weekly Rates
    const weeklyPresenceCount = weeklyTotal - weeklyAbsences;
    const weeklyAbsenceRate = weeklyTotal > 0 ? Math.round((weeklyAbsences / weeklyTotal) * 1000) / 10 : 0;
    const weeklyAttendanceRate = weeklyTotal > 0 ? Math.round((weeklyPresenceCount / weeklyTotal) * 1000) / 10 : 0;

    // 🆕 Calculate Monthly Stats
    // إذا كان هناك طلب لشهر محدد، نحسب إحصائياته
    // وإلا نحسب إحصائيات الشهر الحالي
    const targetMonth = requestedMonth !== null ? requestedMonth : today.getMonth();
    const targetYear = requestedYear !== null ? requestedYear : today.getFullYear();
    const targetMonthKey = `${targetYear}-${targetMonth}`;
    
    // حساب عدد المقاطع في الشهر المحدد
    let monthlyTotalSections = 0;
    for (const dateStr of allSectionDatesMap) {
      const [yearStr, monthStr] = dateStr.split('-');
      const sectionYear = parseInt(yearStr, 10);
      const sectionMonth = parseInt(monthStr, 10) - 1; // 0-indexed
      
      if (sectionMonth === targetMonth && sectionYear === targetYear) {
        monthlyTotalSections++;
      }
    }
    
    console.log("📊 [Monthly] Target Month:", AR_MONTHS[targetMonth], targetYear, "| Sections in month:", monthlyTotalSections);
    
    // الغيابات من grouped
    const targetMonthData = grouped[targetMonthKey] || { total: 0, absences: 0, dates: [] };
    const monthlyAbsences = targetMonthData.absences;
    
    // استخدام عدد المقاطع الفعلي كـ total
    const monthlyPresenceCount = monthlyTotalSections - monthlyAbsences;
    const monthlyAbsenceRate = monthlyTotalSections > 0 ? Math.round((monthlyAbsences / monthlyTotalSections) * 1000) / 10 : 0;
    const monthlyAttendanceRate = monthlyTotalSections > 0 ? Math.round((monthlyPresenceCount / monthlyTotalSections) * 1000) / 10 : 0;

    console.log("📊 [Monthly] Target Month:", AR_MONTHS[targetMonth], targetYear);
    console.log("📊 [Monthly] Total Sections:", monthlyTotalSections, "Absences:", monthlyAbsences);

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
          absenceDates: weeklyAbsenceDates
      },
      // 🆕 إحصائيات الشهر المحدد (أو الحالي)
      monthlyStats: {
          totalDays: monthlyTotalSections,
          absenceCount: monthlyAbsences,
          presenceCount: monthlyPresenceCount,
          rate: monthlyAbsenceRate,
          attendanceRate: monthlyAttendanceRate,
          month: AR_MONTHS[targetMonth],
          year: targetYear,
          absenceDates: targetMonthData.dates || []
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
