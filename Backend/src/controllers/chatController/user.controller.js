const Teacher = require("../../schema/Teacher");
const Student = require("../../schema/Student");

/**
 * Get all teachers for a student to chat with
 */
exports.getTeachers = async (req, res) => {
  try {
    // Get the student's group
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find all teachers who teach this student's group
    const teachers = await Teacher.find({
      groups: { $in: [student.group] },
    }).select("_id firstName lastName imageUrl");

    res.status(200).json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res
      .status(500)
      .json({ message: "Error fetching teachers", error: error.message });
  }
};

/**
 * Get all students for a teacher
 */
exports.getStudents = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Find all students in the teacher's groups
    const students = await Student.find({
      group: { $in: teacher.groups },
    }).select("_id firstName lastName group imageUrl");

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res
      .status(500)
      .json({ message: "Error fetching students", error: error.message });
  }
};
