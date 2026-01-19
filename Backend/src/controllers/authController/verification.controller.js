const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");
const Secretary = require("../../schema/Secretary");
const TeacherAssistant = require("../../schema/TeacherAssistant");

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
      // Normalize birthDate for comparison (handle both Date and String types)
      let studentBirthDateStr = null;
      if (student.birthDate) {
        if (student.birthDate instanceof Date) {
          studentBirthDateStr = student.birthDate.toISOString().split("T")[0];
        } else {
          // If it's already a string, extract YYYY-MM-DD part
          studentBirthDateStr = String(student.birthDate).split("T")[0].trim();
        }
      }
      const birthDateMatch = studentBirthDateStr === birthDate.split("T")[0].trim();

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
      // Normalize birthDate for comparison (handle both Date and String types)
      let teacherBirthDateStr = null;
      if (teacher.birthDate) {
        if (teacher.birthDate instanceof Date) {
          teacherBirthDateStr = teacher.birthDate.toISOString().split("T")[0];
        } else {
          teacherBirthDateStr = String(teacher.birthDate).split("T")[0].trim();
        }
      }
      const birthDateMatch = teacherBirthDateStr === birthDate.split("T")[0].trim();

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
      // Normalize birthDate for comparison (handle both Date and String types)
      let adminBirthDateStr = null;
      if (admin.birthDate) {
        if (admin.birthDate instanceof Date) {
          adminBirthDateStr = admin.birthDate.toISOString().split("T")[0];
        } else {
          adminBirthDateStr = String(admin.birthDate).split("T")[0].trim();
        }
      }
      const birthDateMatch = adminBirthDateStr === birthDate.split("T")[0].trim();

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

    // البحث في جدول السكرتيرين (Secretary)
    const secretary = await Secretary.findOne({
      $or: [{ idNumber: idNumber }, { secretaryId: parseInt(idNumber) }],
    });

    if (secretary) {
      // التحقق من البيانات الشخصية للسكرتير
      // Normalize birthDate for comparison (handle both Date and String types)
      let secretaryBirthDateStr = null;
      if (secretary.birthDate) {
        if (secretary.birthDate instanceof Date) {
          secretaryBirthDateStr = secretary.birthDate.toISOString().split("T")[0];
        } else {
          secretaryBirthDateStr = String(secretary.birthDate).split("T")[0].trim();
        }
      }
      const birthDateMatch = secretaryBirthDateStr === birthDate.split("T")[0].trim();

      if (
        secretary.firstName.trim().toLowerCase() === firstName.toLowerCase() &&
        secretary.fatherName &&
        secretary.fatherName.trim().toLowerCase() === fatherName.toLowerCase() &&
        secretary.grandFatherName &&
        secretary.grandFatherName.trim().toLowerCase() === grandFatherName.toLowerCase() &&
        secretary.lastName.trim().toLowerCase() === lastName.toLowerCase() &&
        secretary.motherName &&
        secretary.motherName.trim().toLowerCase() === motherName.toLowerCase() &&
        (secretary.idNumber === idNumber || secretary.secretaryId === parseInt(idNumber)) &&
        birthDateMatch
      ) {
        return res.json({
          success: true,
          message: "تم التحقق من البيانات بنجاح",
          userType: "secretary",
          userId: secretary._id,
        });
      }
    }

    // البحث في جدول مساعدي المدرسين (TeacherAssistant)
    const teacherAssistant = await TeacherAssistant.findOne({
      $or: [{ idNumber: idNumber }, { assistantId: parseInt(idNumber) }],
    });

    if (teacherAssistant) {
      console.log("=== TeacherAssistant Identity Verification ===");
      console.log("DB firstName:", teacherAssistant.firstName, "| Request:", firstName, "| Match:", teacherAssistant.firstName.trim().toLowerCase() === firstName.toLowerCase());
      console.log("DB fatherName:", teacherAssistant.fatherName, "| Request:", fatherName, "| Match:", teacherAssistant.fatherName && teacherAssistant.fatherName.trim().toLowerCase() === fatherName.toLowerCase());
      console.log("DB grandFatherName:", teacherAssistant.grandFatherName, "| Request:", grandFatherName, "| Match:", teacherAssistant.grandFatherName && teacherAssistant.grandFatherName.trim().toLowerCase() === grandFatherName.toLowerCase());
      console.log("DB lastName:", teacherAssistant.lastName, "| Request:", lastName, "| Match:", teacherAssistant.lastName.trim().toLowerCase() === lastName.toLowerCase());
      console.log("DB motherName:", teacherAssistant.motherName, "| Request:", motherName, "| Match:", teacherAssistant.motherName && teacherAssistant.motherName.trim().toLowerCase() === motherName.toLowerCase());
      console.log("DB idNumber:", teacherAssistant.idNumber, "| DB assistantId:", teacherAssistant.assistantId, "| Request:", idNumber);
      console.log("ID Match:", teacherAssistant.idNumber === idNumber || teacherAssistant.assistantId === parseInt(idNumber));
      
      // التحقق من البيانات الشخصية لمساعد المدرس
      // Normalize birthDate for comparison (handle both Date and String types)
      let teacherAssistantBirthDateStr = null;
      if (teacherAssistant.birthDate) {
        if (teacherAssistant.birthDate instanceof Date) {
          teacherAssistantBirthDateStr = teacherAssistant.birthDate.toISOString().split("T")[0];
        } else {
          teacherAssistantBirthDateStr = String(teacherAssistant.birthDate).split("T")[0].trim();
        }
      }
      const requestBirthDateStr = birthDate.split("T")[0].trim();
      const birthDateMatch = teacherAssistantBirthDateStr === requestBirthDateStr;
      
      console.log("DB birthDate (raw):", teacherAssistant.birthDate, "| Type:", typeof teacherAssistant.birthDate);
      console.log("DB birthDate (normalized):", teacherAssistantBirthDateStr);
      console.log("Request birthDate (normalized):", requestBirthDateStr);
      console.log("BirthDate match:", birthDateMatch);

      const firstNameMatch = teacherAssistant.firstName.trim().toLowerCase() === firstName.toLowerCase();
      const fatherNameMatch = teacherAssistant.fatherName && teacherAssistant.fatherName.trim().toLowerCase() === fatherName.toLowerCase();
      const grandFatherNameMatch = teacherAssistant.grandFatherName && teacherAssistant.grandFatherName.trim().toLowerCase() === grandFatherName.toLowerCase();
      const lastNameMatch = teacherAssistant.lastName.trim().toLowerCase() === lastName.toLowerCase();
      const motherNameMatch = teacherAssistant.motherName && teacherAssistant.motherName.trim().toLowerCase() === motherName.toLowerCase();
      const idMatch = teacherAssistant.idNumber === idNumber || teacherAssistant.assistantId === parseInt(idNumber);

      if (
        firstNameMatch &&
        fatherNameMatch &&
        grandFatherNameMatch &&
        lastNameMatch &&
        motherNameMatch &&
        idMatch &&
        birthDateMatch
      ) {
        return res.json({
          success: true,
          message: "تم التحقق من البيانات بنجاح",
          userType: "teacherAssistant",
          userId: teacherAssistant._id,
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
