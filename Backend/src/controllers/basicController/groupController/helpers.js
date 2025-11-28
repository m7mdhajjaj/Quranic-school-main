// ============================================
// HELPER FUNCTIONS FOR GROUP OPERATIONS
// ============================================

const Teacher = require("../../../schema/Teacher");
const Group = require("../../../schema/Group");

/**
 * دالة للبحث عن المعلم بالـ ID أو الاسم
 */
const findTeacherByIdOrName = async (teacherIdentifier) => {
  try {
    // محاولة البحث بالـ ObjectId أولاً
    if (teacherIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
      console.log("🆔 البحث بالـ ObjectId");
      return await Teacher.findById(teacherIdentifier);
    }

    // البحث بالاسم
    console.log("👤 البحث بالاسم الكامل");
    const nameParts = teacherIdentifier.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    console.log("📝 أجزاء الاسم:", { firstName, lastName });

    const searchQuery = {};

    if (firstName && lastName) {
      searchQuery.$and = [
        { firstName: { $regex: `^${firstName}$`, $options: "i" } },
        { lastName: { $regex: `^${lastName}$`, $options: "i" } },
      ];
    } else if (firstName) {
      searchQuery.firstName = { $regex: `^${firstName}$`, $options: "i" };
    }

    console.log("🔎 استعلام البحث:", JSON.stringify(searchQuery, null, 2));
    return await Teacher.findOne(searchQuery);
  } catch (error) {
    console.error("❌ خطأ في البحث عن المعلم:", error);
    return null;
  }
};

/**
 * دالة للتحقق من تضارب الحلقات والمعلمين
 */
const checkGroupTeacherConflict = async (groupName, teacherId, excludeGroupId = null) => {
  const query = {
    name: groupName,
    $and: [
      { teacher: { $ne: teacherId } },
      { teacher: { $exists: true, $ne: null, $ne: "" } },
    ],
  };

  if (excludeGroupId) {
    query._id = { $ne: excludeGroupId };
  }

  return await Group.findOne(query);
};

/**
 * دالة للحصول على معلومات المعلم بصيغ مختلفة
 */
const getTeacherInfo = async (teacherId) => {
  try {
    const teacherStr = String(teacherId);

    // إذا كان teacher هو ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(teacherStr)) {
      const teacherInfo = await Teacher.findById(teacherStr);
      if (teacherInfo) {
        return {
          name: `${teacherInfo.firstName} ${teacherInfo.lastName}`,
          info: {
            _id: teacherInfo._id,
            firstName: teacherInfo.firstName,
            lastName: teacherInfo.lastName,
            email: teacherInfo.email,
          },
        };
      }
    }

    // إذا كان teacher هو اسم المعلم بالفعل
    return {
      name: teacherStr,
      info: null,
    };
  } catch (err) {
    console.error("خطأ في معالجة معلومات المعلم:", err);
    return {
      name: String(teacherId),
      info: null,
    };
  }
};

module.exports = {
  findTeacherByIdOrName,
  checkGroupTeacherConflict,
  getTeacherInfo,
};
