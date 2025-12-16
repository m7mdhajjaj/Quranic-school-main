const Student = require("../../../schema/Student");
const { populateTeacherFullName } = require("./studentHelpers");

/**
 * جلب الطلاب حسب الحلقة
 */
exports.getStudentsByGroup = async (req, res) => {
  try {
    const students = await Student.find({ group: req.params.group })
      .select("-avatar")
      .lean();
    
    // إضافة اسم المعلم الثلاثي للطلاب
    const studentsWithTeacherName = await populateTeacherFullName(students);
    
    res.json({
      success: true,
      data: studentsWithTeacherName,
      message: `تم تحميل ${students.length} طالب من المجموعة ${req.params.group}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * جلب الطلاب حسب المعلم
 */
exports.getStudentsByTeacher = async (req, res) => {
  try {
    const teacherName = decodeURIComponent(req.params.teacher);
    const students = await Student.find({ teacher: teacherName })
      .select("-avatar")
      .lean()
      .sort({ group: 1, firstName: 1 }); // Sort by group then by first name
    
    // إضافة اسم المعلم الثلاثي للطلاب
    const studentsWithTeacherName = await populateTeacherFullName(students);
    
    res.json({
      success: true,
      data: studentsWithTeacherName,
      message: `تم تحميل ${students.length} طالب للمعلم ${teacherName}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
