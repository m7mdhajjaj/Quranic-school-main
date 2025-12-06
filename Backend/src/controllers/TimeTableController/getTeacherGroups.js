// ============================================
// GET TEACHER GROUPS OPERATION
// ============================================

const Group = require("../../schema/Group");

/**
 * جلب جميع حلقات المعلم
 */
exports.getTeacherGroups = async (req, res) => {
  try {
    const user = req.user; // من middleware المصادقة

    if (!user || user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "هذه العملية متاحة للمعلمين فقط"
      });
    }

    // البحث عن جميع حلقات المعلم بجميع الصيغ الممكنة للاسم
    const possibleNames = [
      `${user.firstName} ${user.lastName}`,
      `${user.firstName}${user.lastName}`,
      user.firstName,
      user.lastName
    ].filter(Boolean);

    const groups = await Group.find({
      teacher: { $in: possibleNames }
    }).select('name teacher');

    const groupNames = groups.map(g => g.name).sort((a, b) => a.localeCompare(b, 'ar'));

    res.json({
      success: true,
      groups: groupNames,
      fullGroups: groups
    });
  } catch (err) {
    console.error("Error fetching teacher groups:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "حدث خطأ أثناء جلب الحلقات"
    });
  }
};
