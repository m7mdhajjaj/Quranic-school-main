// ============================================
// GET ACTIVE GROUPS - جلب الحلقات النشطة
// ============================================
// وظيفة لجلب الحلقات النشطة (التي لها معلم وفيها طالب واحد على الأقل)
// تستخدم في صفحة العلامات اليومية (Daily Marks)

const Group = require("../../../schema/Group");
const Student = require("../../../schema/Student");
const { convertGroupToGroupResponse } = require("./helpers");

/**
 * @route GET /api/daily-marks/active-groups
 * @desc جلب الحلقات النشطة للمعلم المحدد (activeStatus: true)
 * @param {string} req.query.teacherId - معرف المعلم (إلزامي)
 * @param {string} req.query.type - نوع البيانات المطلوبة:
 *   - "basic": فقط _id واسم الحلقة (افتراضي)
 *   - "detailed": جميع بيانات الحلقة مع اسم المعلم
 * @access Private (Teacher/Admin)
 * @returns {Array} قائمة الحلقات النشطة للمعلم
 */
const getActiveGroups = async (req, res) => {
  try {
    const { type = "basic", teacherId } = req.query;

    console.log("🔍 [getActiveGroups] Starting fetch - teacherId:", teacherId, "type:", type);

    // التحقق من وجود teacherId
    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "معرف المعلم مطلوب",
      });
    }

    // جلب حلقات المعلم المحدد فقط
    let query = Group.find({ 
      teacher: teacherId,
      activeStatus: true 
    });

    // تحديد نوع البيانات المطلوبة
    if (type === "basic") {
      // جلب البيانات الأساسية فقط
      query = query.select("_id name");
    } else if (type === "detailed") {
      // جلب جميع البيانات مع populate للمعلم
      query = query.populate({
        path: "teacher",
        select: "firstName fatherName lastName email phoneNumber",
      });
    }

    // ترتيب النتائج حسب اسم الحلقة
    query = query.sort({ name: 1 });

    const groups = await query.lean();
    console.log(`📋 [getActiveGroups] Found ${groups.length} active groups for teacher`);

    // تحويل البيانات حسب النوع المطلوب + إضافة studentsCount للتأكد
    let responseData;
    if (type === "detailed") {
      responseData = [];
      for (const group of groups) {
        const studentCount = await Student.countDocuments({ group: group.name });
        const convertedGroup = convertGroupToGroupResponse(group);
        responseData.push({
          ...convertedGroup,
          currentStudents: studentCount,
          activeStatus: true,
        });
      }
    } else {
      // حتى في basic mode، نضيف studentsCount للشفافية
      responseData = await Promise.all(
        groups.map(async (group) => {
          const studentsCount = await Student.countDocuments({ group: group.name });
          return {
            ...group,
            studentsCount, // إضافة عدد الطلاب للتحقق
          };
        })
      );
    }

    console.log(`✅ [getActiveGroups] Returning ${responseData.length} active groups`);

    return res.status(200).json({
      success: true,
      message: "تم جلب الحلقات النشطة بنجاح",
      data: responseData,
      count: responseData.length,
    });
  } catch (error) {
    console.error("❌ خطأ في جلب الحلقات النشطة:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الحلقات النشطة",
      error: error.message,
    });
  }
};

module.exports = {
  getActiveGroups,
};
