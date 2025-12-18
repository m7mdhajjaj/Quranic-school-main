// ============================================================================
// Get Ranking By Averages - جلب الترتيب حسب المعدلات الشهرية
// ============================================================================

const Student = require("../../schema/Student");
const { getTeacherGroups } = require("../basicController/teacherController/utils.controller");

/**
 * جلب الترتيب بناءً على معدلات الطلاب الشهرية
 * @route GET /api/rankings/by-averages
 * @access Protected
 */
const getRankingByAverages = async (req, res) => {
  try {
    const { month, year, group } = req.query;
    const today = new Date();
    const currentMonth = month ? parseInt(month) : today.getMonth() + 1;
    const currentYear = year ? parseInt(year) : today.getFullYear();

    // Get user's group(s)
    let userGroup = group || null;
    let teacherGroups = null;
    let allTeacherGroups = [];
    
    if (req.user) {
      if (req.user.role === "student") {
        // Student: fetch current group from database
        const studentData = await Student.findById(req.user._id).select('group');
        userGroup = studentData ? studentData.group : null;
      } else if (req.user.role === "teacher") {
        // Teacher: get assigned groups that have students ONLY
        allTeacherGroups = await getTeacherGroups(req.user._id);
        
        if (allTeacherGroups && allTeacherGroups.length > 0) {
          // ✅ جلب الحلقات التي تحتوي على طلاب (للاختيار الذكي الافتراضي)
          const groupsWithStudents = await Student.distinct('group', {
            group: { $in: allTeacherGroups }
          });
          
          // ✅ إرجاع جميع حلقات المعلم للقائمة المنسدلة (حتى الفارغة منها)
          teacherGroups = allTeacherGroups.sort((a, b) => a.localeCompare(b, 'ar'));
          
          // If specific group requested, check if it has students
          if (userGroup) {
            // Check if teacher has access to this group (even if it has no students)
            // Note: userGroup might be URL encoded or have slight differences, so we check loosely or ensure exact match
            // But getTeacherGroups returns exact names from DB.
            if (!allTeacherGroups.includes(userGroup)) {
               // Fallback: If the requested group is not accessible (e.g. inactive), 
               // don't return 403. Instead, fall back to the default selection logic.
               // This handles cases where a user has a stale group selected in their UI/LocalStorage.
               console.log(`Teacher ${req.user._id} requested invalid/inactive group '${userGroup}'. Falling back to default.`);
               userGroup = null;
            }
          }
          
          if (!userGroup) {
            // Smart default: Pick first group with students, otherwise first group
            if (groupsWithStudents.length > 0) {
                userGroup = teacherGroups.find(g => groupsWithStudents.includes(g)) || teacherGroups[0];
            } else {
                userGroup = teacherGroups[0];
            }
          }
        }
      }
      // Admin can see all groups or specific group
    }

    // Build query filter
    const filter = {};
    if (req.user && req.user.role === "student") {
      // Student: only their group
      filter.group = userGroup;
    } else if (req.user && req.user.role === "teacher") {
      // Teacher: specific group if selected, or first group
      if (userGroup && allTeacherGroups.includes(userGroup)) {
        filter.group = userGroup;
      } else if (teacherGroups && teacherGroups.length > 0) {
        filter.group = teacherGroups[0];
        userGroup = teacherGroups[0];
      }
    } else if (userGroup) {
      // Admin with specific group selected
      filter.group = userGroup;
    }
    // If admin without group filter, show all students

    // Get all students from the group
    const students = await Student.find(filter).select(
      "studentId firstName fatherName lastName group monthlyAverages"
    );

    // Process students and get their averages for the specified month/year
    const studentsWithAverages = students
      .map((student) => {
        // Find the monthly average for the specified period
        const monthlyAvg = student.monthlyAverages.find(
          (avg) => avg.month === currentMonth && avg.year === currentYear
        );

        return {
          _id: student._id,
          studentId: student.studentId,
          firstName: student.firstName,
          fatherName: student.fatherName,
          lastName: student.lastName,
          group: student.group,
          overallAverage: monthlyAvg?.overallAverage || 0,
          reviewAverage: monthlyAvg?.reviewAverage || 0,
          memorizationAverage: monthlyAvg?.memorizationAverage || 0,
          totalMarks: monthlyAvg?.totalMarks || 0,
        };
      })
      // Sort by overall average descending
      .sort((a, b) => b.overallAverage - a.overallAverage)
      // Add rank
      .map((student, index) => ({
        ...student,
        rank: index + 1,
      }));

    res.status(200).json({
      success: true,
      data: studentsWithAverages,
      month: currentMonth,
      year: currentYear,
      group: userGroup,
      totalStudents: studentsWithAverages.length,
      // إرجاع حلقات المعلم إذا كان معلماً
      teacherGroups: teacherGroups || null,
    });
  } catch (error) {
    console.error("Error fetching ranking by averages:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء استرجاع الترتيب",
      error: error.message,
    });
  }
};

module.exports = getRankingByAverages;
