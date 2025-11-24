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

/**
 * 🆕 الحصول على حلقات المعلم بفلاتر مرنة
 * Query params:
 * - teacherId: ID المعلم (required)
 * - filter: 'all' | 'withStudents' | 'withoutStudents' (default: 'all')
 * - includeStudents: true | false (default: false) - هل نجلب بيانات الطلاب مع الحلقات
 */
exports.getGroupsByTeacherIdWithFilters = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { filter = 'all', includeStudents = 'false' } = req.query;

    console.log(`⚡ جلب حلقات المعلم - ID: ${teacherId}, فلتر: ${filter}, مع الطلاب: ${includeStudents}`);
    const startTime = Date.now();

    // 1. جلب المعلم
    const Teacher = require("../../schema/Teacher");
    const teacher = await Teacher.findById(teacherId).select("firstName lastName");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "المعلم غير موجود",
      });
    }

    const teacherFullName = `${teacher.firstName} ${teacher.lastName}`;

    // 2. جلب حلقات المعلم
    const groups = await Group.find({
      $or: [
        { teacher: teacherId },
        { teacher: teacherId.toString() },
        { teacherName: teacherFullName },
      ],
      isActive: true,
    })
      .select("name _id capacity description schedule")
      .lean()
      .sort({ name: 1 });

    console.log(`📚 تم جلب ${groups.length} حلقة للمعلم`);

    // 3. جلب عدد الطلاب لكل حلقة
    const groupNames = groups.map((g) => g.name);
    const studentCounts = await Student.aggregate([
      { $match: { group: { $in: groupNames } } },
      { $group: { _id: "$group", count: { $sum: 1 } } },
    ]);

    const studentCountMap = new Map(
      studentCounts.map((item) => [item._id, item.count])
    );

    // 4. إضافة معلومات الطلاب لكل حلقة
    let groupsWithInfo = groups.map((group) => {
      const currentStudents = studentCountMap.get(group.name) || 0;
      return {
        ...group,
        currentStudents,
        totalStudents: currentStudents, // إجمالي عدد الطلاب (نفس currentStudents)
        capacity: group.capacity || 30,
        hasStudents: currentStudents > 0,
        isEmpty: currentStudents === 0,
      };
    });

    // 5. تطبيق الفلتر
    if (filter === 'withStudents') {
      groupsWithInfo = groupsWithInfo.filter((g) => g.hasStudents);
      console.log(`🔍 فلترة: ${groupsWithInfo.length} حلقة فيها طلاب`);
    } else if (filter === 'withoutStudents') {
      groupsWithInfo = groupsWithInfo.filter((g) => g.isEmpty);
      console.log(`🔍 فلترة: ${groupsWithInfo.length} حلقة فارغة`);
    }

    // 6. جلب الطلاب إذا كان مطلوباً
    if (includeStudents === 'true') {
      console.log('👥 جلب بيانات الطلاب...');
      
      const groupsWithStudents = await Promise.all(
        groupsWithInfo.map(async (group) => {
          const students = await Student.find({ group: group.name })
            .select("studentId firstName lastName group")
            .lean()
            .sort({ firstName: 1 });

          return {
            ...group,
            students: students.map(s => ({
              _id: s._id,
              studentId: s.studentId,
              name: `${s.firstName} ${s.lastName}`,
            })),
            totalStudents: students.length, // تحديث العدد الفعلي من الطلاب المجلوبين
          };
        })
      );

      groupsWithInfo = groupsWithStudents;
    }

    const duration = Date.now() - startTime;
    console.log(`✅ تم جلب ${groupsWithInfo.length} حلقة في ${duration}ms`);

    res.json({
      success: true,
      data: {
        teacher: {
          _id: teacher._id,
          name: teacherFullName,
        },
        groups: groupsWithInfo,
        summary: {
          totalGroups: groups.length,
          groupsWithStudents: groups.filter(g => studentCountMap.get(g.name) > 0).length,
          emptyGroups: groups.filter(g => (studentCountMap.get(g.name) || 0) === 0).length,
          totalStudents: Array.from(studentCountMap.values()).reduce((sum, count) => sum + count, 0),
        },
      },
    });
  } catch (error) {
    console.error("❌ خطأ في جلب حلقات المعلم:", error);
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء جلب الحلقات",
    });
  }
};
