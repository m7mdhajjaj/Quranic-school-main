// ============================================
// READ GROUP OPERATIONS
// ============================================

const Group = require("../../schema/Group");
const Student = require("../../schema/Student");
const { getStudentCountsForAllGroups, getStudentCountsForTeacher } = require("./cache");
const { getTeacherInfo } = require("./helpers");

/**
 * الحصول على جميع الحلقات
 */
exports.getAllGroups = async (req, res) => {
  try {
    const startTime = Date.now();

    // جلب جميع الحلقات و عدد الطلاب بشكل متوازي للسرعة
    const [groups, studentCountMap] = await Promise.all([
      Group.find().sort({ createdAt: -1 }),
      getStudentCountsForAllGroups(),
    ]);

    // إضافة عدد الطلاب وحالة السعة ومعلومات المعلم لكل حلقة
    const groupsWithStudentCount = await Promise.all(
      groups.map(async (group) => {
        const currentStudents = studentCountMap[group.name] || 0;
        const capacity = group.capacity || 30;
        const isFull = currentStudents >= capacity;

        // جلب معلومات المعلم إذا كان موجود
        let teacherName = group.teacher || "";
        let teacherInfo = null;

        if (group.teacher) {
          const teacherData = await getTeacherInfo(group.teacher);
          teacherName = teacherData.name;
          teacherInfo = teacherData.info;
        }

        return {
          ...group.toObject(),
          teacher: teacherName,
          teacherInfo,
          currentStudents,
          capacity,
          isFull,
          availableSpots: Math.max(0, capacity - currentStudents),
          capacityStatus: `${currentStudents}/${capacity}`,
          capacityPercentage: Math.round((currentStudents / capacity) * 100),
        };
      })
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(
      `✓ تم جلب ${groupsWithStudentCount.length} حلقة مع عدد الطلاب في ${duration}ms`
    );

    res.status(200).json({
      success: true,
      data: groupsWithStudentCount,
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الحلقات",
    });
  }
};

/**
 * الحصول على حلقة بالمعرف
 */
exports.getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "الحلقة غير موجودة",
      });
    }

    // إضافة عدد الطلاب المشتركين في الحلقة
    const currentStudents = await Student.countDocuments({
      group: group.name,
    });

    res.status(200).json({
      success: true,
      data: {
        ...group.toObject(),
        currentStudents,
      },
    });
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الحلقة",
    });
  }
};

/**
 * الحصول على الحلقات حسب المعلم
 */
exports.getGroupsByTeacher = async (req, res) => {
  try {
    const { teacher } = req.params;
    const startTime = Date.now();

    // جلب الحلقات وعدد الطلاب بشكل متوازي
    const [groups, studentCountMap] = await Promise.all([
      Group.find({
        teacher,
        isActive: true,
      }).sort({ createdAt: -1 }),
      getStudentCountsForTeacher(teacher),
    ]);

    // إضافة عدد الطلاب باستخدام البحث السريع
    const groupsWithStudentCount = groups.map((group) => ({
      ...group.toObject(),
      currentStudents: studentCountMap[group.name] || 0,
    }));

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(
      `✓ تم جلب ${groupsWithStudentCount.length} حلقة للمعلم "${teacher}" مع عدد الطلاب في ${duration}ms`
    );

    res.status(200).json({
      success: true,
      data: groupsWithStudentCount,
    });
  } catch (error) {
    console.error("Error fetching groups by teacher:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب حلقات المعلم",
    });
  }
};

/**
 * الحصول على إحصائيات الحلقات الشهرية
 */
exports.getGroupsMonthlyStats = async (req, res) => {
  try {
    console.log("📊 طلب الحصول على إحصائيات الحلقات الشهرية");

    // جلب جميع الحلقات مع إحصائياتها
    const groups = await Group.find({})
      .select("name teacher teacherName currentMonthStats")
      .sort({ name: 1 });

    // تنسيق البيانات
    const stats = groups.map((group) => ({
      _id: group._id,
      name: group.name,
      teacher: group.teacherName || group.teacher,
      currentMonthStats: group.currentMonthStats || {
        month: null,
        absenceRate: 0,
        attendanceRate: 0,
        totalDays: 0,
        totalAbsences: 0,
        totalPresences: 0,
      },
    }));

    console.log(`✅ تم جلب إحصائيات ${stats.length} حلقة`);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting groups monthly stats:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب إحصائيات الحلقات",
    });
  }
};
