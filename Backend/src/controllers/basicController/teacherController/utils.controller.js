const Teacher = require("../../../schema/Teacher");

/**
 * حساب العمر من تاريخ الميلاد
 */
const calculateAge = (birthDate) => {
  if (!birthDate) return 0;

  const today = new Date();
  const birthDateObj = new Date(birthDate);

  if (isNaN(birthDateObj.getTime())) return 0;

  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * توليد رقم معلم جديد
 */
const generateTeacherId = async () => {
  try {
    const lastTeacher = await Teacher.findOne()
      .sort({ teacherId: -1 })
      .select("teacherId");

    if (!lastTeacher || !lastTeacher.teacherId) {
      return 1000; // Start teacher IDs from 1000
    }

    const nextId = lastTeacher.teacherId + 1;

    // Safety check: ensure it's within valid range (1000-9999)
    if (nextId > 9999) {
      throw new Error("تم الوصول للحد الأقصى من أرقام المعلمين (9999)");
    }

    return nextId;
  } catch (error) {
    console.error("Error generating teacher ID:", error);
    throw error; // Re-throw to handle in the calling function
  }
};

/**
 * جلب حلقات المعلم
 * @param {String} teacherId - معرف المعلم
 * @returns {Array} - قائمة أسماء الحلقات
 */
const getTeacherGroups = async (teacherId) => {
  try {
    const teacher = await Teacher.findById(teacherId).select("groups");
    
    if (!teacher || !teacher.groups || teacher.groups.length === 0) {
      return [];
    }
    
    return teacher.groups.map(g => g.name);
  } catch (error) {
    console.error("Error fetching teacher groups:", error);
    return [];
  }
};

module.exports = {
  calculateAge,
  generateTeacherId,
  getTeacherGroups,
};
