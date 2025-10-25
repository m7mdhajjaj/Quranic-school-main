// ============================================================================
// Create Or Update Ranking - إنشاء أو تحديث ترتيب
// ============================================================================

const Ranking = require("../../schema/Ranking");
const Student = require("../../schema/Student");

/**
 * إنشاء أو تحديث ترتيب لشهر/سنة معينة
 * @route POST /api/rankings
 * @access Protected (Teacher & Admin)
 */
const createOrUpdateRanking = async (req, res) => {
  try {
    const { month, year, topThree, topTen } = req.body;

    console.log("Received ranking data:", { month, year, topThree, topTen });

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "الشهر والسنة مطلوبان",
      });
    }

    // Validate month and year
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      return res.status(400).json({
        success: false,
        message: "الشهر يجب أن يكون بين 1 و 12",
      });
    }

    if (yearNum < 2020 || isNaN(yearNum)) {
      return res.status(400).json({
        success: false,
        message: "السنة يجب أن تكون 2020 أو أحدث",
      });
    }

    // Validate and prepare topThree data
    if (!Array.isArray(topThree) || topThree.length > 3) {
      return res.status(400).json({
        success: false,
        message: "يجب أن يحتوي topThree على مصفوفة تحتوي على 3 عناصر كحد أقصى",
      });
    }

    // Validate and prepare topTen data
    if (!Array.isArray(topTen) || topTen.length > 10) {
      return res.status(400).json({
        success: false,
        message: "يجب أن يحتوي topTen على مصفوفة تحتوي على 10 عناصر كحد أقصى",
      });
    }

    // Check if all student IDs exist
    const allStudentIds = [
      ...topThree.map((item) => item.studentId),
      ...topTen.map((item) => item.studentId),
    ];

    // Filter out undefined/null values
    const validStudentIds = allStudentIds.filter((id) => id);

    if (validStudentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "يجب إضافة طالب واحد على الأقل",
      });
    }

    const uniqueStudentIds = [...new Set(validStudentIds)];

    console.log("Checking student IDs:", uniqueStudentIds);

    const existingStudents = await Student.find({
      _id: { $in: uniqueStudentIds },
    }).select("_id group");

    console.log(
      "Found students:",
      existingStudents.map((s) => ({ id: s._id, group: s.group }))
    );

    const existingStudentIds = existingStudents.map((s) => s._id.toString());
    const invalidStudentIds = uniqueStudentIds.filter(
      (id) => !existingStudentIds.includes(id)
    );

    if (invalidStudentIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `الطلاب بالمعرفات التالية غير موجودين: ${invalidStudentIds.join(
          ", "
        )}`,
      });
    }

    // If user is a teacher, verify that all students belong to their groups
    if (req.user && req.user.role === "teacher") {
      const Teacher = require("../../schema/Teacher");
      const teacher = await Teacher.findById(req.user._id).select("groups");

      if (!teacher || !teacher.groups || teacher.groups.length === 0) {
        return res.status(403).json({
          success: false,
          message: "ليس لديك حلقات مسجلة. يرجى التواصل مع المسؤول",
        });
      }

      // Get teacher's group names
      const teacherGroupNames = teacher.groups.map((g) => g.name);

      // Check if all students belong to teacher's groups
      const unauthorizedStudents = existingStudents.filter(
        (student) => !teacherGroupNames.includes(student.group)
      );

      if (unauthorizedStudents.length > 0) {
        const studentNames = await Student.find({
          _id: { $in: unauthorizedStudents.map((s) => s._id) },
        }).select("firstName fatherName lastName");

        const names = studentNames
          .map((s) => `${s.firstName} ${s.fatherName} ${s.lastName}`)
          .join("، ");

        return res.status(403).json({
          success: false,
          message: `لا يمكنك إضافة الطلاب التالية لأنهم ليسوا في حلقاتك: ${names}`,
        });
      }
    }

    // Determine the group for this ranking
    // All students should be from the same group
    const studentGroup = existingStudents[0]?.group;

    if (!studentGroup) {
      return res.status(400).json({
        success: false,
        message: "يجب أن يكون جميع الطلاب من نفس الحلقة",
      });
    }

    // Verify all students are from the same group
    const differentGroups = existingStudents.some(
      (s) => s.group !== studentGroup
    );
    if (differentGroups) {
      return res.status(400).json({
        success: false,
        message: "يجب أن يكون جميع الطلاب من نفس الحلقة",
      });
    }

    // Prepare the topThree data with ranks
    const processedTopThree = topThree.map((item, index) => ({
      studentId: item.studentId,
      rank: index + 1,
      score: item.score,
    }));

    // Prepare the topTen data with ranks
    const processedTopTen = topTen.map((item, index) => ({
      studentId: item.studentId,
      rank: index + 1,
      score: item.score,
    }));

    // Find and update or create new ranking (now with group filter)
    const ranking = await Ranking.findOneAndUpdate(
      { month: monthNum, year: yearNum, group: studentGroup },
      {
        $set: {
          month: monthNum,
          year: yearNum,
          group: studentGroup,
          topThree: processedTopThree,
          topTen: processedTopTen,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    console.log("✅ تم حفظ/تحديث الترتيب بنجاح");

    res.status(200).json({
      success: true,
      message: "تم حفظ التصنيف بنجاح",
      data: ranking,
    });
  } catch (error) {
    console.error("❌ Error creating/updating ranking:", error);

    // Handle duplicate key error - this shouldn't happen with proper upsert, but just in case
    if (error.code === 11000) {
      console.log("⚠️ Duplicate key error, trying direct update...");

      try {
        // Try direct update if upsert failed
        const existingRanking = await Ranking.findOne({
          month: monthNum,
          year: yearNum,
          group: studentGroup,
        });

        if (existingRanking) {
          existingRanking.topThree = processedTopThree;
          existingRanking.topTen = processedTopTen;
          await existingRanking.save();

          return res.status(200).json({
            success: true,
            message: "تم تحديث التصنيف بنجاح",
            data: existingRanking,
          });
        }
      } catch (retryError) {
        console.error("❌ Retry failed:", retryError);
      }

      return res.status(400).json({
        success: false,
        message: `حدث خطأ في تحديث التصنيف لشهر ${req.body.month}/${req.body.year}`,
      });
    }

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حفظ التصنيف",
      error: error.message,
    });
  }
};

module.exports = createOrUpdateRanking;
