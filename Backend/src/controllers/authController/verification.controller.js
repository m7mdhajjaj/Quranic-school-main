const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");

/**
 * التحقق من الهوية لاسترداد كلمة المرور
 */
exports.verifyIdentity = async (req, res) => {
  try {
    console.log("=== verifyIdentity called ===");
    console.log("Request body:", req.body);

    const {
      firstName,
      fatherName,
      grandFatherName,
      lastName,
      motherName,
      idNumber,
      birthDate,
    } = req.validatedData || req.body;

    console.log("Extracted data:", {
      firstName,
      fatherName,
      grandFatherName,
      lastName,
      motherName,
      idNumber,
      birthDate,
    });

    // البحث في جدول الطلاب
    console.log("Searching for student with idNumber:", idNumber);
    const student = await Student.findOne({
      $or: [{ idNumber: idNumber }, { studentId: idNumber }],
    });

    console.log("Found student:", student ? "Yes" : "No");
    if (student) {
      console.log("Student data:", {
        firstName: student.firstName,
        fatherName: student.fatherName,
        grandFatherName: student.grandFatherName,
        lastName: student.lastName,
        motherName: student.motherName,
        idNumber: student.idNumber,
        birthDate: student.birthDate,
      });

      // التحقق من البيانات الشخصية للطالب
      const birthDateMatch = student.birthDate
        ? new Date(student.birthDate).toISOString().split("T")[0] === birthDate
        : false;

      if (
        student.firstName.trim().toLowerCase() === firstName.toLowerCase() &&
        student.fatherName.trim().toLowerCase() === fatherName.toLowerCase() &&
        student.grandFatherName.trim().toLowerCase() ===
          grandFatherName.toLowerCase() &&
        student.lastName.trim().toLowerCase() === lastName.toLowerCase() &&
        student.motherName &&
        student.motherName.trim().toLowerCase() === motherName.toLowerCase() &&
        student.idNumber === idNumber &&
        birthDateMatch
      ) {
        return res.json({
          success: true,
          message: "تم التحقق من البيانات بنجاح",
          userType: "student",
          userId: student._id,
        });
      }
    }

    // البحث في جدول المعلمين
    const teacher = await Teacher.findOne({
      $or: [{ idNumber: idNumber }, { teacherId: idNumber }],
    });

    if (teacher) {
      // التحقق من البيانات الشخصية للمعلم
      const birthDateMatch = teacher.birthDate
        ? new Date(teacher.birthDate).toISOString().split("T")[0] === birthDate
        : false;

      if (
        teacher.firstName.trim().toLowerCase() === firstName.toLowerCase() &&
        teacher.fatherName &&
        teacher.fatherName.trim().toLowerCase() === fatherName.toLowerCase() &&
        teacher.grandFatherName &&
        teacher.grandFatherName.trim().toLowerCase() ===
          grandFatherName.toLowerCase() &&
        teacher.lastName.trim().toLowerCase() === lastName.toLowerCase() &&
        teacher.motherName &&
        teacher.motherName.trim().toLowerCase() === motherName.toLowerCase() &&
        (teacher.idNumber === idNumber || teacher.teacherId === idNumber) &&
        birthDateMatch
      ) {
        return res.json({
          success: true,
          message: "تم التحقق من البيانات بنجاح",
          userType: "teacher",
          userId: teacher._id,
        });
      }
    }

    // البحث في جدول المسؤولين (Admin)
    const admin = await Admin.findOne({
      $or: [{ idNumber: idNumber }, { adminId: idNumber }],
    });

    if (admin) {
      // التحقق من البيانات الشخصية للمسؤول
      const birthDateMatch = admin.birthDate
        ? new Date(admin.birthDate).toISOString().split("T")[0] === birthDate
        : false;

      if (
        admin.firstName.trim().toLowerCase() === firstName.toLowerCase() &&
        admin.fatherName &&
        admin.fatherName.trim().toLowerCase() === fatherName.toLowerCase() &&
        admin.grandFatherName &&
        admin.grandFatherName.trim().toLowerCase() === grandFatherName.toLowerCase() &&
        admin.lastName.trim().toLowerCase() === lastName.toLowerCase() &&
        admin.motherName &&
        admin.motherName.trim().toLowerCase() === motherName.toLowerCase() &&
        (admin.idNumber === idNumber || admin.adminId === idNumber) &&
        birthDateMatch
      ) {
        return res.json({
          success: true,
          message: "تم التحقق من البيانات بنجاح",
          userType: "admin",
          userId: admin._id,
        });
      }
    }

    return res.status(400).json({
      success: false,
      message: "البيانات المدخلة غير صحيحة. تأكد من جميع البيانات الشخصية.",
    });
  } catch (error) {
    console.error("Error in verifyIdentity:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء التحقق من البيانات",
    });
  }
};
