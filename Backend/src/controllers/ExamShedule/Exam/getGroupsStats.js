// ============================================================================
// getGroupsStats.js - Get Exam Statistics for Groups
// ============================================================================

const ExamSchedule = require("../../../schema/ExamShedule/ExamSchedule");
const Group = require("../../../schema/Group");

/**
 * Get exam count statistics for teacher's groups
 * @route GET /api/exam-schedule/groups-stats
 * @access Protected (Teacher/Admin)
 */
const getGroupsStats = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const Student = require("../../../schema/Student");

    // Get teacher's groups with student count
    let groupsData = [];
    
    if (role === 'teacher') {
      const groups = await Group.find({ teacher: userId }).select('name').lean();
      groupsData = groups.map(g => ({ name: g.name }));
    } else if (role === 'admin') {
      // Admin can see all groups
      const groups = await Group.find().select('name').lean();
      groupsData = groups.map(g => ({ name: g.name }));
    } else {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى هذه البيانات'
      });
    }

    if (groupsData.length === 0) {
      return res.json({
        success: true,
        groupsStats: []
      });
    }

    const teacherGroups = groupsData.map(g => g.name);

    // Get exam count for each group using aggregation
    const examStats = await ExamSchedule.aggregate([
      {
        $match: {
          group: { $in: teacherGroups }
        }
      },
      {
        $group: {
          _id: '$group',
          examCount: { $sum: 1 }
        }
      }
    ]);

    // Get student count for each group
    const studentStats = await Student.aggregate([
      {
        $match: {
          group: { $in: teacherGroups }
        }
      },
      {
        $group: {
          _id: '$group',
          studentCount: { $sum: 1 }
        }
      }
    ]);

    // Create maps for quick lookup
    const examStatsMap = new Map();
    examStats.forEach(stat => {
      examStatsMap.set(stat._id, stat.examCount);
    });

    const studentStatsMap = new Map();
    studentStats.forEach(stat => {
      studentStatsMap.set(stat._id, stat.studentCount);
    });

    // Combine all stats
    const groupsStats = teacherGroups.map(group => ({
      group,
      examCount: examStatsMap.get(group) || 0,
      studentCount: studentStatsMap.get(group) || 0
    }));

    console.log(`📊 Retrieved stats for ${groupsStats.length} groups`);

    res.json({
      success: true,
      groupsStats
    });

  } catch (error) {
    console.error('Error fetching groups stats:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات الحلقات',
      error: error.message
    });
  }
};

module.exports = getGroupsStats;
