// ============================================
// GROUP EXPORT OPERATIONS
// ============================================

const Group = require("../../../schema/Group");
const TimeTable = require("../../../schema/TimeTable");
const { getStudentCountsForAllGroups } = require("./cache");
const { getTeacherInfo } = require("./helpers");
const { TIMEZONE } = require('../../../config/timezone');

/**
 * تصدير بيانات الحلقات إلى CSV
 * GET /api/groups/export
 */
exports.exportGroupsToCSV = async (req, res) => {
  try {
    console.log("📥 تصدير بيانات الحلقات إلى CSV...");
    
    // Build query from filters
    const { 
      search, 
      capacity, 
      status, 
      sortBy, 
      sortOrder 
    } = req.query;
    
    const query = {};

    // Search filter (name, description, schedule)
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { schedule: searchRegex },
      ];
    }

    // Capacity filter
    if (capacity && capacity !== 'all') {
      switch (capacity) {
        case 'small':
          query.capacity = { $lte: 15 };
          break;
        case 'medium':
          query.capacity = { $gt: 15, $lte: 25 };
          break;
        case 'large':
          query.capacity = { $gt: 25 };
          break;
      }
    }

    // Status filter (activeStatus)
    if (status && status !== 'all') {
      query.activeStatus = status === 'active';
    }

    // Sorting
    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.name = 1; // Default sort by name
    }
    
    // Fetch all groups matching the query
    const groups = await Group.find(query)
      .lean()
      .sort(sortOptions);

    if (!groups || groups.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لا توجد حلقات للتصدير",
      });
    }

    // Get student counts for all groups
    const studentCountMap = await getStudentCountsForAllGroups();

    // Enrich groups with student counts and teacher names
    const enrichedGroups = await Promise.all(
      groups.map(async (group) => {
        const currentStudents = studentCountMap[group.name] || 0;
        const capacity = group.capacity || 30;
        
        // Get teacher name
        let teacherName = group.teacher;
        if (group.teacher) {
          const teacherData = await getTeacherInfo(group.teacher);
          if (teacherData.name) {
            teacherName = teacherData.name;
          }
        }

        // Get timetable from TimeTable collection
        const timetable = await TimeTable.find({ groupId: group._id })
          .select("day startHour endHour")
          .sort({ day: 1, startHour: 1 })
          .lean();

        // Format timetable
        const timetableStr = timetable && timetable.length > 0
          ? timetable.map(t => `${t.day} ${t.startHour}-${t.endHour}`).join(' | ')
          : 'غير محدد';

        return {
          name: group.name || '',
          teacher: teacherName || 'غير محدد',
          status: group.activeStatus ? 'فعالة' : 'غير فعالة',
          capacity: capacity,
          currentStudents: currentStudents,
          availableSpots: Math.max(0, capacity - currentStudents),
          capacityPercentage: Math.round((currentStudents / capacity) * 100),
          timetable: timetableStr,
          description: group.description || 'لا يوجد',
        };
      })
    );

    // CSV Headers - ترتيب منطقي للعرض في Excel
    const headers = [
      "اسم الحلقة",
      "المعلم المسؤول",
      "الحالة",
      "السعة القصوى",
      "عدد الطلاب",
      "الأماكن المتبقية",
      "نسبة الإشغال",
      "الجدول الأسبوعي",
      "الوصف",
    ];

    // Helper to escape CSV fields
    const escapeCSV = (field) => {
      if (field == null || field === undefined) return "";
      const str = String(field);
      // If contains semicolon, newline, or quote, wrap and escape
      if (str.includes(";") || str.includes("\n") || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build CSV rows - نفس ترتيب الـ headers
    const rows = enrichedGroups.map((group) => [
      group.name,
      group.teacher,
      group.status,
      group.capacity,
      group.currentStudents,
      group.availableSpots,
      `${group.capacityPercentage}%`,
      group.timetable,
      group.description,
    ]);

    // Generate CSV content
    const delimiter = ";";
    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(delimiter))
      .join("\r\n");

    // Send CSV with UTF-8 BOM for Excel compatibility
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      timeZone: TIMEZONE
    }).replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString('ar-EG', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: TIMEZONE
    }).replace(/:/g, '-');
    const filename = `الحلقات_${dateStr}_${timeStr}.csv`;
    
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.send("\ufeff" + csvContent);

    console.log(`✅ تم تصدير ${enrichedGroups.length} حلقة بنجاح إلى ${filename}`);
  } catch (error) {
    console.error("❌ خطأ في تصدير البيانات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تصدير البيانات",
      error: error.message,
    });
  }
};
