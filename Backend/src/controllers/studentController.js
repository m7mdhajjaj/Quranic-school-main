// // Get single student by ID (for profile)
// exports.getStudentById = async (req, res) => {
//   try {
//     // Always return email and phoneNumber if present
//     const student = await Student.findById(req.params.id);
//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }
//     // Explicitly include email and phoneNumber in response (for clarity)
//     const studentObj = student.toObject();
//     res.status(200).json({ success: true, data: {
//       ...studentObj,
//       email: studentObj.email || '',
//       phoneNumber: studentObj.phoneNumber || ''
//     }});
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// const Student = require("../models/Student");

// // Get all students
// exports.getStudents = async (req, res) => {
//   try {
//     const students = await Student.find();
//     res.json(students);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get students by group
// exports.getStudentsByGroup = async (req, res) => {
//   try {
//     const students = await Student.find({ group: req.params.group });
//     res.json(students);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Add new student - simplified for robustness
// exports.createStudent = async (req, res) => {
//   try {
//     console.log(
//       "Received request to create student:",
//       JSON.stringify(req.body, null, 2),
//     );

//     // Generate new studentId (max + 1)
//     let maxId = 100000;
//     try {
//       const lastStudent = await Student.findOne().sort({ studentId: -1 });
//       if (lastStudent) {
//         maxId = lastStudent.studentId;
//       }
//     } catch (idError) {
//       console.error("Error getting last student ID:", idError);
//       // Continue with default maxId if there's an error
//     }

//     const studentData = {
//       ...req.body,
//       studentId: maxId + 1,
//       // Ensure age is a number
//       age: parseInt(req.body.age || 0, 10) || 0,
//     };

//     console.log(
//       "Creating student with data:",
//       JSON.stringify(studentData, null, 2),
//     );

//     const student = new Student(studentData);
//     const newStudent = await student.save();

//     console.log("Student created successfully:", newStudent._id);
//     res.status(201).json(newStudent);
//   } catch (error) {
//     console.error("Error creating student:", error);

//     // Handle validation errors
//     if (error.name === "ValidationError") {
//       const validationErrors = Object.keys(error.errors)
//         .map((field) => `${field}: ${error.errors[field].message}`)
//         .join(", ");

//       return res.status(400).json({
//         message: `خطأ في التحقق من البيانات: ${validationErrors}`,
//         error: validationErrors,
//       });
//     }

//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return res.status(400).json({
//         message: `قيمة ${field} موجودة بالفعل`,
//         error: `Duplicate ${field}`,
//       });
//     }

//     // Generic error handling
//     res.status(500).json({
//       message: "حدث خطأ أثناء حفظ بيانات الطالب",
//       error: error.message,
//     });
//   }
// };

// // Update student
// exports.updateStudent = async (req, res) => {
//   try {
//     const updatedStudent = await Student.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true },
//     );
//     res.json(updatedStudent);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // Delete student
// exports.deleteStudent = async (req, res) => {
//   try {
//     await Student.findByIdAndDelete(req.params.id);
//     res.json({ message: "Student deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const Student = require("../models/Student");

// Get all students - OPTIMIZED for performance
exports.getStudents = async (req, res) => {
  try {
    console.log('🚀 تحميل بيانات الطلاب...');
    const startTime = Date.now();
    
    // Optimized query: exclude heavy fields like avatar
    const students = await Student.find()
      .select('-avatar') // استبعاد الصور لتسريع التحميل
      .lean() // استخدام lean() لتحسين الأداء
      .sort({ createdAt: -1 }) // ترتيب حسب الأحدث
      .limit(1000); // حد أقصى 1000 طالب
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ تم تحميل ${students.length} طالب في ${duration}ms`);
    res.json(students);
  } catch (error) {
    console.error('❌ خطأ في تحميل الطلاب:', error);
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

// Get single student by ID (for profile)
exports.getStudentById = async (req, res) => {
  try {
    // Always return email and phoneNumber if present
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    // Explicitly include email and phoneNumber in response (for clarity)
    const studentObj = student.toObject();
    res.status(200).json({ 
      success: true, 
      data: {
        ...studentObj,
        email: studentObj.email || '',
        phoneNumber: studentObj.phoneNumber || ''
      }
    });
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
    console.log("Request body:", req.body);
    
    const updatedData = { ...req.body };
    
    // Always run validation, but handle password field specially
    if (!updatedData.password || updatedData.password.trim() === '') {
      // If no password provided, remove it from update data
      delete updatedData.password;
    }
    
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { 
        new: true, 
        runValidators: true, // ✅ Always run validation to match Student.js
        context: 'query' // Required for some validators to work properly
      }
    );
    
    if (!updatedStudent) {
      return res.status(404).json({ 
        success: false, 
        message: "الطالب غير موجود" 
      });
    }
    
    res.json({ success: true, data: updatedStudent });
    
  } catch (error) {
    console.error("Error updating student:", error);
    
    // Handle validation errors (same as createStudent)
    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors)
        .map((field) => `${field}: ${error.errors[field].message}`)
        .join(", ");

      return res.status(400).json({
        success: false,
        message: `خطأ في التحقق من البيانات: ${validationErrors}`,
        error: validationErrors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `قيمة ${field} موجودة بالفعل`,
        error: `Duplicate ${field}`,
      });
    }

    // Generic error handling
    res.status(400).json({ 
      success: false, 
      message: "حدث خطأ أثناء تحديث بيانات الطالب",
      error: error.message 
    });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};