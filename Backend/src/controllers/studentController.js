const Student = require("../models/Student");

// Get all students
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get students by group
exports.getStudentsByGroup = async (req, res) => {
  try {
    const students = await Student.find({ group: req.params.group });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new student - simplified for robustness
exports.createStudent = async (req, res) => {
  try {
    console.log(
      "Received request to create student:",
      JSON.stringify(req.body, null, 2),
    );

    // Generate new studentId (max + 1)
    let maxId = 100000;
    try {
      const lastStudent = await Student.findOne().sort({ studentId: -1 });
      if (lastStudent) {
        maxId = lastStudent.studentId;
      }
    } catch (idError) {
      console.error("Error getting last student ID:", idError);
      // Continue with default maxId if there's an error
    }

    const studentData = {
      ...req.body,
      studentId: maxId + 1,
      // Ensure age is a number
      age: parseInt(req.body.age || 0, 10) || 0,
    };

    console.log(
      "Creating student with data:",
      JSON.stringify(studentData, null, 2),
    );

    const student = new Student(studentData);
    const newStudent = await student.save();

    console.log("Student created successfully:", newStudent._id);
    res.status(201).json(newStudent);
  } catch (error) {
    console.error("Error creating student:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors)
        .map((field) => `${field}: ${error.errors[field].message}`)
        .join(", ");

      return res.status(400).json({
        message: `خطأ في التحقق من البيانات: ${validationErrors}`,
        error: validationErrors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `قيمة ${field} موجودة بالفعل`,
        error: `Duplicate ${field}`,
      });
    }

    // Generic error handling
    res.status(500).json({
      message: "حدث خطأ أثناء حفظ بيانات الطالب",
      error: error.message,
    });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
