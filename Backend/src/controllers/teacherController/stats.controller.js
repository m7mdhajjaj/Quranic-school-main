const Teacher = require("../../schema/Teacher");

/**
 * جلب إحصائيات المعلمين
 */
exports.getTeacherStats = async (req, res) => {
  try {
    const totalTeachers = await Teacher.countDocuments({ isActive: true });
    const totalAdmins = await Teacher.countDocuments({
      role: "admin",
      isActive: true,
    });
    const totalActiveTeachers = await Teacher.countDocuments({
      role: "teacher",
      isActive: true,
    });

    const teachers = await Teacher.find({ isActive: true }).select(
      "-password -avatar"
    );

    const exp = (x) => (Number.isFinite(x) ? x : 0);
    const experienceDistribution = {
      "مبتدئ (0-2 سنة)": teachers.filter((t) => exp(t.yearsOfExperience) <= 2)
        .length,
      "متوسط (3-5 سنوات)": teachers.filter(
        (t) => exp(t.yearsOfExperience) >= 3 && exp(t.yearsOfExperience) <= 5
      ).length,
      "خبير (6-10 سنوات)": teachers.filter(
        (t) => exp(t.yearsOfExperience) >= 6 && exp(t.yearsOfExperience) <= 10
      ).length,
      "خبير جداً (+10 سنوات)": teachers.filter(
        (t) => exp(t.yearsOfExperience) > 10
      ).length,
    };

    return res.status(200).json({
      success: true,
      data: {
        totalTeachers,
        totalAdmins,
        totalActiveTeachers,
        experienceDistribution,
        teachers: teachers.map((t) => ({
          _id: t._id,
          teacherId: t.teacherId,
          fullName: `${t.firstName || ""} ${t.fatherName || ""} ${
            t.lastName || ""
          }`
            .replace(/\s+/g, " ")
            .trim(),
          groups: t.groups || [],
          yearsOfExperience: exp(t.yearsOfExperience),
          role: t.role,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching teacher stats:", error);
    return res
      .status(500)
      .json({ success: false, message: "حدث خطأ أثناء جلب إحصائيات المعلمين" });
  }
};
