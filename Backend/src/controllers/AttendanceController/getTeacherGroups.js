const { getGroupsByTeacherIdWithFilters } = require('../groupController');
const Attendance = require('../../schema/Attendance');

/**
 * Get all groups for a teacher with full attendance data
 * GET /api/attendance/teacher/:teacherId/groups
 * 
 * This endpoint is specifically designed for the attendance page.
 * It combines 3 data sources into one response:
 * 1. Teacher groups with students (from groupController)
 * 2. Absence statistics for each student (aggregated)
 * 3. Attendance records for specific date (if provided)
 * 
 * Query params:
 * - filter: 'all' | 'withStudents' | 'withoutStudents' (default: 'all')
 * - includeStudents: 'true' | 'false' (default: 'true')
 * - date: ISO date string (default: today) - to get attendance for specific date
 * - includeAbsenceStats: 'true' | 'false' (default: 'true') - include absence statistics
 * 
 * Returns:
 * - teacher: معلومات المعلم
 * - groups: الحلقات مع عدد الطلاب
 * - students: الطلاب مع الحضور والإحصائيات (مدموجة وجاهزة)
 * - summary: ملخص الإحصائيات
 * 
 * Note: Validation is handled by validateGetTeacherGroups middleware
 */
exports.getTeacherGroupsForAttendance = async (req, res) => {
  try {
    const startTime = Date.now();
    const { teacherId } = req.params;
    const { 
      filter = 'all', 
      includeStudents = 'true',
      date,
      includeAbsenceStats = 'true'
    } = req.query;

    console.log(`📚 [Attendance Full Data] Teacher: ${teacherId}, Date: ${date || 'today'}`);

    // 1️⃣ Get groups with students from groupController
    req.query.filter = filter;
    req.query.includeStudents = includeStudents;

    // Create mock response to capture data from groupController
    const groupData = await new Promise((resolve, reject) => {
      const mockRes = {
        json: (data) => resolve(data),
        status: (code) => ({
          json: (data) => reject({ code, data })
        })
      };
      getGroupsByTeacherIdWithFilters(req, mockRes);
    });

    if (!groupData.success || !groupData.data) {
      return res.status(404).json(groupData);
    }

    const { teacher, groups, summary } = groupData.data;

    // If includeStudents is false, return early
    if (includeStudents === 'false') {
      const duration = Date.now() - startTime;
      console.log(`✅ [Attendance] Returned ${groups.length} groups in ${duration}ms`);
      return res.json(groupData);
    }

    // Extract all students from groups
    const allStudents = groups.flatMap(group => 
      (group.students || []).map(student => ({
        ...student,
        group: group.name
      }))
    );

    if (allStudents.length === 0) {
      const duration = Date.now() - startTime;
      console.log(`⚠️ [Attendance] No students found - ${duration}ms`);
      return res.json({
        success: true,
        data: {
          teacher,
          groups,
          students: [],
          summary: { ...summary, presentToday: 0, absentToday: 0 }
        }
      });
    }

    const studentIds = allStudents.map(s => s._id);

    // 2️⃣ Get absence statistics (if requested)
    let absenceStatsMap = new Map();
    if (includeAbsenceStats === 'true') {
      const absenceStats = await Attendance.aggregate([
        {
          $match: {
            studentId: { $in: studentIds },
            isPresent: false
          }
        },
        {
          $group: {
            _id: '$studentId',
            totalAbsences: { $sum: 1 },
            absenceDates: { $push: '$date' }
          }
        }
      ]);

      absenceStatsMap = new Map(
        absenceStats.map(stat => [
          stat._id.toString(),
          {
            totalAbsences: stat.totalAbsences,
            absenceDates: stat.absenceDates
              .map(d => {
                const date = new Date(d);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
              })
              .sort((a, b) => {
                const [dayA, monthA, yearA] = a.split('/').map(Number);
                const [dayB, monthB, yearB] = b.split('/').map(Number);
                const dateA = new Date(yearA, monthA - 1, dayA);
                const dateB = new Date(yearB, monthB - 1, dayB);
                return dateB.getTime() - dateA.getTime();
              })
          }
        ])
      );
      console.log(`📊 [Attendance] Got absence stats for ${absenceStatsMap.size} students`);
    }

    // 3️⃣ Get attendance for specific date (if provided)
    let attendanceMap = new Map();
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);

      const attendanceRecords = await Attendance.find({
        studentId: { $in: studentIds },
        date: { $gte: targetDate, $lt: nextDay }
      });

      attendanceMap = new Map(
        attendanceRecords.map(record => [
          record.studentId.toString(),
          record.isPresent
        ])
      );
      console.log(`📅 [Attendance] Got attendance for ${attendanceMap.size} students on ${date}`);
    }

    // 4️⃣ Merge all data
    const studentsWithFullData = allStudents.map(student => {
      const studentIdStr = student._id.toString();
      const absenceData = absenceStatsMap.get(studentIdStr);
      const isPresent = attendanceMap.has(studentIdStr) 
        ? attendanceMap.get(studentIdStr) 
        : true; // default to present if no record

      return {
        _id: student._id,
        studentId: parseInt(student.studentId) || 0,
        name: student.name,
        group: student.group || 'بدون حلقة',
        teacher: teacher.name,
        isPresent,
        totalAbsences: absenceData?.totalAbsences || 0,
        absenceDates: absenceData?.absenceDates || []
      };
    });

    // Calculate summary for today
    const presentToday = studentsWithFullData.filter(s => s.isPresent).length;
    const absentToday = studentsWithFullData.length - presentToday;

    const duration = Date.now() - startTime;
    console.log(`✅ [Attendance Full Data] ${studentsWithFullData.length} students with full data in ${duration}ms`);

    return res.json({
      success: true,
      data: {
        teacher,
        groups: groups.map(g => ({
          _id: g._id,
          name: g.name,
          totalStudents: g.totalStudents || 0
        })),
        students: studentsWithFullData,
        summary: {
          ...summary,
          presentToday,
          absentToday,
          attendanceRateToday: studentsWithFullData.length > 0 
            ? Math.round((presentToday / studentsWithFullData.length) * 100)
            : 0
        }
      }
    });

  } catch (error) {
    console.error('❌ [Attendance Full Data] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب البيانات',
      error: error.message
    });
  }
};
