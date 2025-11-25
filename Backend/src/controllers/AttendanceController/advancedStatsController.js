const Attendance = require("../../schema/Attendance");
const Student = require("../../schema/Student");

/**
 * Get advanced attendance statistics for a group of students
 * POST /api/attendance/stats/advanced
 * 
 * Body:
 * {
 *   studentIds: string[],  // Array of student IDs
 *   date?: string,         // Optional: specific date for attendance
 *   startDate?: string,    // Optional: date range start
 *   endDate?: string       // Optional: date range end
 * }
 * 
 * Returns:
 * {
 *   totalStudents: number,
 *   presentCount: number,
 *   absentCount: number,
 *   attendanceRate: number,
 *   students: [
 *     {
 *       _id: string,
 *       name: string,
 *       isPresent: boolean,
 *       totalAbsences: number,
 *       totalPresences: number,
 *       overallAttendanceRate: number
 *     }
 *   ]
 * }
 */
exports.getAdvancedAttendanceStats = async (req, res) => {
  try {
    console.log("📊 [Advanced Stats] حساب الإحصائيات المتقدمة...");
    const startTime = Date.now();

    const { studentIds, date, startDate, endDate } = req.body;

    // Validation
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "معرفات الطلاب مطلوبة",
      });
    }

    // Build date filter
    let dateFilter = {};
    if (date) {
      // Specific date
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);
      dateFilter = { $gte: targetDate, $lt: nextDay };
    } else if (startDate || endDate) {
      // Date range
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        dateFilter.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
    }

    // 1️⃣ Get students info
    const students = await Student.find({ _id: { $in: studentIds } })
      .select("studentId firstName fatherName lastName group")
      .lean();

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على طلاب",
      });
    }

    console.log(`👥 عدد الطلاب: ${students.length}`);

    // 2️⃣ Build query for attendance
    const attendanceQuery = {
      studentId: { $in: studentIds },
    };

    if (Object.keys(dateFilter).length > 0) {
      attendanceQuery.date = dateFilter;
    }

    // 3️⃣ Get attendance records with aggregation
    const attendanceStats = await Attendance.aggregate([
      { $match: attendanceQuery },
      {
        $group: {
          _id: "$studentId",
          totalRecords: { $sum: 1 },
          totalPresences: {
            $sum: { $cond: [{ $eq: ["$isPresent", true] }, 1, 0] },
          },
          totalAbsences: {
            $sum: { $cond: [{ $eq: ["$isPresent", false] }, 1, 0] },
          },
          // Get latest attendance status (for specific date)
          latestDate: { $max: "$date" },
          latestStatus: { $last: "$isPresent" },
        },
      },
    ]);

    console.log(`📋 سجلات الحضور: ${attendanceStats.length} طالب`);

    // 4️⃣ If specific date requested, get attendance for that date
    let specificDateAttendance = new Map();
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);

      const dateAttendance = await Attendance.find({
        studentId: { $in: studentIds },
        date: { $gte: targetDate, $lt: nextDay },
      }).lean();

      specificDateAttendance = new Map(
        dateAttendance.map((record) => [
          record.studentId.toString(),
          record.isPresent,
        ])
      );

      console.log(
        `📅 حضور التاريخ ${date}: ${specificDateAttendance.size} سجل`
      );
    }

    // 5️⃣ Create stats map
    const statsMap = new Map(
      attendanceStats.map((stat) => [stat._id.toString(), stat])
    );

    // 6️⃣ Merge data
    const studentsWithStats = students.map((student) => {
      const studentIdStr = student._id.toString();
      const stats = statsMap.get(studentIdStr);

      // Determine isPresent
      let isPresent = true; // Default to present
      if (date && specificDateAttendance.has(studentIdStr)) {
        // Use specific date attendance
        isPresent = specificDateAttendance.get(studentIdStr);
      } else if (stats) {
        // Use latest status from stats
        isPresent = stats.latestStatus;
      }

      const totalRecords = stats?.totalRecords || 0;
      const totalPresences = stats?.totalPresences || 0;
      const totalAbsences = stats?.totalAbsences || 0;
      const overallAttendanceRate =
        totalRecords > 0
          ? Math.round((totalPresences / totalRecords) * 100)
          : 100;

      return {
        _id: student._id,
        studentId: student.studentId,
        name: `${student.firstName} ${student.fatherName || ""} ${
          student.lastName || ""
        }`.trim(),
        group: student.group || "بدون حلقة",
        isPresent,
        totalAbsences,
        totalPresences,
        totalRecords,
        overallAttendanceRate,
      };
    });

    // 7️⃣ Calculate overall stats
    const totalStudents = studentsWithStats.length;
    const presentCount = studentsWithStats.filter((s) => s.isPresent).length;
    const absentCount = totalStudents - presentCount;
    const attendanceRate =
      totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    const duration = Date.now() - startTime;
    console.log(`✅ [Advanced Stats] تم الحساب في ${duration}ms`);
    console.log(
      `   📊 حاضر: ${presentCount} | غائب: ${absentCount} | النسبة: ${attendanceRate}%`
    );

    return res.json({
      success: true,
      data: {
        totalStudents,
        presentCount,
        absentCount,
        attendanceRate,
        students: studentsWithStats,
        dateRange: {
          specific: date || null,
          start: startDate || null,
          end: endDate || null,
        },
      },
    });
  } catch (error) {
    console.error("❌ [Advanced Stats] خطأ:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حساب الإحصائيات",
      error: error.message,
    });
  }
};

/**
 * Get attendance statistics for visible students (with filters)
 * POST /api/attendance/stats/filtered
 * 
 * Body:
 * {
 *   teacherId: string,
 *   date: string,           // Date for attendance
 *   groupFilter?: string,   // Optional: filter by group
 *   searchQuery?: string,   // Optional: search by name
 *   page?: number,          // Optional: pagination
 *   limit?: number          // Optional: items per page
 * }
 * 
 * Returns statistics for filtered students with pagination
 */
exports.getFilteredAttendanceStats = async (req, res) => {
  try {
    console.log("🔍 [Filtered Stats] حساب إحصائيات مفلترة...");
    const startTime = Date.now();

    const {
      teacherId,
      date,
      groupFilter,
      searchQuery,
      page = 1,
      limit = 10,
    } = req.body;

    // Validation
    if (!teacherId || !date) {
      return res.status(400).json({
        success: false,
        message: "معرف المعلم والتاريخ مطلوبان",
      });
    }

    // 1️⃣ Build student filter
    const studentFilter = {};

    // Filter by teacher (use the API we already have)
    const { getGroupsByTeacherIdWithFilters } = require("../groupController");

    // Mock request to get teacher's students
    const mockReq = {
      params: { teacherId },
      query: { filter: "all", includeStudents: "true" },
    };

    const groupData = await new Promise((resolve, reject) => {
      const mockRes = {
        json: (data) => resolve(data),
        status: (code) => ({
          json: (data) => reject({ code, data }),
        }),
      };
      getGroupsByTeacherIdWithFilters(mockReq, mockRes);
    });

    if (!groupData.success || !groupData.data) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على بيانات المعلم",
      });
    }

    // Extract students from groups
    let allStudents = groupData.data.groups.flatMap((group) =>
      (group.students || []).map((student) => ({
        ...student,
        group: group.name,
      }))
    );

    console.log(`👥 إجمالي طلاب المعلم: ${allStudents.length}`);

    // 2️⃣ Apply group filter
    if (groupFilter && groupFilter !== "all") {
      allStudents = allStudents.filter((s) => s.group === groupFilter);
      console.log(`🔍 بعد فلتر الحلقة "${groupFilter}": ${allStudents.length}`);
    }

    // 3️⃣ Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      allStudents = allStudents.filter((s) => {
        const name = `${s.firstName} ${s.fatherName || ""} ${
          s.lastName || ""
        }`.toLowerCase();
        return name.includes(query);
      });
      console.log(`🔍 بعد البحث "${searchQuery}": ${allStudents.length}`);
    }

    if (allStudents.length === 0) {
      return res.json({
        success: true,
        data: {
          totalStudents: 0,
          visibleStudents: 0,
          presentCount: 0,
          absentCount: 0,
          attendanceRate: 0,
          students: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: 0,
            total: 0,
          },
        },
      });
    }

    const studentIds = allStudents.map((s) => s._id);

    // 4️⃣ Get attendance for specific date
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    const attendanceRecords = await Attendance.find({
      studentId: { $in: studentIds },
      date: { $gte: targetDate, $lt: nextDay },
    }).lean();

    const attendanceMap = new Map(
      attendanceRecords.map((record) => [
        record.studentId.toString(),
        record.isPresent,
      ])
    );

    console.log(`📅 سجلات الحضور للتاريخ: ${attendanceRecords.length}`);

    // 5️⃣ Get absence statistics
    const absenceStats = await Attendance.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          isPresent: false,
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

    const absenceMap = new Map(
      absenceStats.map((stat) => [
        stat._id.toString(),
        {
          totalAbsences: stat.totalAbsences,
          absenceDates: stat.absenceDates
            .map((d) => {
              const date = new Date(d);
              const day = String(date.getDate()).padStart(2, "0");
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const year = date.getFullYear();
              return `${day}/${month}/${year}`;
            })
            .sort((a, b) => {
              const [dayA, monthA, yearA] = a.split("/").map(Number);
              const [dayB, monthB, yearB] = b.split("/").map(Number);
              const dateA = new Date(yearA, monthA - 1, dayA);
              const dateB = new Date(yearB, monthB - 1, dayB);
              return dateB.getTime() - dateA.getTime();
            }),
        },
      ])
    );

    // 6️⃣ Merge data
    const studentsWithData = allStudents.map((student) => {
      const studentIdStr = student._id.toString();
      const isPresent = attendanceMap.has(studentIdStr)
        ? attendanceMap.get(studentIdStr)
        : true;
      const absenceData = absenceMap.get(studentIdStr);

      return {
        _id: student._id,
        studentId: student.studentId,
        name: `${student.firstName} ${student.fatherName || ""} ${
          student.lastName || ""
        }`.trim(),
        group: student.group || "بدون حلقة",
        isPresent,
        totalAbsences: absenceData?.totalAbsences || 0,
        absenceDates: absenceData?.absenceDates || [],
      };
    });

    // 7️⃣ Calculate stats for ALL filtered students (before pagination)
    const totalStudents = studentsWithData.length;
    const presentCount = studentsWithData.filter((s) => s.isPresent).length;
    const absentCount = totalStudents - presentCount;
    const attendanceRate =
      totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    // 8️⃣ Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedStudents = studentsWithData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(totalStudents / limit);

    const duration = Date.now() - startTime;
    console.log(`✅ [Filtered Stats] تم الحساب في ${duration}ms`);
    console.log(`   📊 إجمالي: ${totalStudents} | صفحة ${page}/${totalPages}`);
    console.log(
      `   ✅ حاضر: ${presentCount} | ❌ غائب: ${absentCount} | النسبة: ${attendanceRate}%`
    );

    return res.json({
      success: true,
      data: {
        // Stats for ALL filtered students
        totalStudents,
        visibleStudents: totalStudents,
        presentCount,
        absentCount,
        attendanceRate,
        // Paginated students
        students: paginatedStudents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages,
          total: totalStudents,
        },
      },
    });
  } catch (error) {
    console.error("❌ [Filtered Stats] خطأ:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حساب الإحصائيات المفلترة",
      error: error.message,
    });
  }
};

/**
 * Get comprehensive attendance report for date range
 * POST /api/attendance/stats/report
 * 
 * Body:
 * {
 *   studentIds?: string[],  // Optional: specific students, otherwise all
 *   teacherId?: string,     // Optional: filter by teacher
 *   groupId?: string,       // Optional: filter by group
 *   startDate: string,      // Required: start of date range
 *   endDate: string         // Required: end of date range
 * }
 * 
 * Returns comprehensive statistics for date range
 */
exports.getAttendanceReport = async (req, res) => {
  try {
    console.log("📈 [Report] إنشاء تقرير الحضور...");
    const startTime = Date.now();

    const { studentIds, teacherId, groupId, startDate, endDate } = req.body;

    // Validation
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "تاريخ البداية والنهاية مطلوبان",
      });
    }

    // Build date range
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    console.log(`📅 نطاق التاريخ: ${startDate} إلى ${endDate}`);

    // 1️⃣ Build student filter
    let studentFilter = {};
    if (studentIds && studentIds.length > 0) {
      studentFilter._id = { $in: studentIds };
    }
    if (teacherId) {
      // Get teacher name from user/teacher collection
      const Teacher = require("../../schema/Teacher");
      const teacher = await Teacher.findById(teacherId).select("name");
      if (teacher) {
        studentFilter.teacher = teacher.name;
      }
    }
    if (groupId) {
      const Group = require("../../schema/Group");
      const group = await Group.findById(groupId).select("name");
      if (group) {
        studentFilter.group = group.name;
      }
    }

    // 2️⃣ Get students
    const students = await Student.find(studentFilter)
      .select("studentId firstName fatherName lastName group teacher")
      .lean();

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على طلاب",
      });
    }

    console.log(`👥 عدد الطلاب في التقرير: ${students.length}`);

    const studentIdsForQuery = students.map((s) => s._id);

    // 3️⃣ Get attendance records for date range
    const attendanceRecords = await Attendance.find({
      studentId: { $in: studentIdsForQuery },
      date: { $gte: start, $lte: end },
    }).lean();

    console.log(`📋 سجلات الحضور: ${attendanceRecords.length}`);

    // 4️⃣ Calculate statistics per student
    const studentStatsMap = new Map();

    // Initialize stats for all students
    students.forEach((student) => {
      studentStatsMap.set(student._id.toString(), {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        attendanceRate: 0,
      });
    });

    // Aggregate attendance by student
    attendanceRecords.forEach((record) => {
      const studentIdStr = record.studentId.toString();
      const stats = studentStatsMap.get(studentIdStr);
      if (stats) {
        stats.totalDays++;
        if (record.isPresent) {
          stats.presentDays++;
        } else {
          stats.absentDays++;
        }
      }
    });

    // Calculate attendance rates
    studentStatsMap.forEach((stats) => {
      if (stats.totalDays > 0) {
        stats.attendanceRate = Math.round(
          (stats.presentDays / stats.totalDays) * 100
        );
      }
    });

    // 5️⃣ Build report
    const studentReports = students.map((student) => {
      const stats = studentStatsMap.get(student._id.toString());
      return {
        _id: student._id,
        studentId: student.studentId,
        name: `${student.firstName} ${student.fatherName || ""} ${
          student.lastName || ""
        }`.trim(),
        group: student.group || "بدون حلقة",
        teacher: student.teacher,
        ...stats,
      };
    });

    // 6️⃣ Calculate overall statistics
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter((r) => r.isPresent).length;
    const absentDays = totalDays - presentDays;
    const overallAttendanceRate =
      totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Get unique dates
    const uniqueDates = [
      ...new Set(
        attendanceRecords.map((r) => new Date(r.date).toISOString().split("T")[0])
      ),
    ];

    const duration = Date.now() - startTime;
    console.log(`✅ [Report] تم إنشاء التقرير في ${duration}ms`);

    return res.json({
      success: true,
      data: {
        dateRange: {
          start: startDate,
          end: endDate,
          totalUniqueDays: uniqueDates.length,
        },
        overall: {
          totalStudents: students.length,
          totalRecords: totalDays,
          presentDays,
          absentDays,
          overallAttendanceRate,
        },
        students: studentReports,
      },
    });
  } catch (error) {
    console.error("❌ [Report] خطأ:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء التقرير",
      error: error.message,
    });
  }
};
