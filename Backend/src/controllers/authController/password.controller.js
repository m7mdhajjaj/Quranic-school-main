const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");
const bcrypt = require("bcryptjs");

/**
 * تغيير كلمة المرور
 */
exports.changePassword = async (req, res) => {
  try {
    console.log("=== changePassword called ===");
    console.log("Request body:", req.body);
    console.log("Validated data:", req.validatedData);

    // استخدام البيانات المُتحققة من middleware
    const { currentPassword, newPassword, userId, userType } =
      req.validatedData || req.body;

    // التحقق من المدخلات
    if (!currentPassword || !newPassword || !userId) {
      console.log("Missing required fields");
      return res.status(400).json({
        success: false,
        message: "جميع الحقول مطلوبة",
      });
    }

    let user = null;

    console.log("Searching for user with ID:", userId, "Type:", userType);
    // البحث عن المستخدم حسب النوع
    if (userType === "admin") {
      user = await Admin.findById(userId);
    } else if (userType === "teacher") {
      user = await Teacher.findById(userId);
    } else {
      user = await Student.findById(userId);
    }

    console.log("User found:", user ? "Yes" : "No");
    if (!user) {
      console.log("User not found in database");
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    // التحقق من كلمة المرور الحالية
    let isCurrentPasswordValid = false;

    if (userType === "admin" || userType === "teacher") {
      // للأدمن والمعلمين، التحقق من كلمة المرور المشفرة
      isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
    } else {
      // للطلاب، التحقق إذا كانت كلمة المرور مشفرة أم لا
      console.log("Student password field:", user.password);
      console.log("Student idNumber:", user.idNumber);
      console.log("Current password entered:", currentPassword);

      if (user.password && user.password.length > 20) {
        // كلمة المرور مشفرة
        console.log("Checking encrypted password");
        isCurrentPasswordValid = await bcrypt.compare(
          currentPassword,
          user.password
        );
      } else if (user.password) {
        // كلمة المرور غير مشفرة (نص عادي)
        console.log("Checking plain text password");
        isCurrentPasswordValid = currentPassword === user.password;
      } else {
        // لا يوجد حقل password، استخدام رقم الهوية
        console.log("No password field, using idNumber");
        isCurrentPasswordValid = currentPassword === user.idNumber;
      }
    }

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "كلمة المرور الحالية غير صحيحة",
      });
    }

    // تشفير كلمة المرور الجديدة
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // تحديث كلمة المرور في قاعدة البيانات
    if (userType === "admin") {
      await Admin.findByIdAndUpdate(userId, {
        password: hashedNewPassword,
      });
    } else if (userType === "teacher") {
      await Teacher.findByIdAndUpdate(userId, {
        password: hashedNewPassword,
      });
    } else {
      await Student.findByIdAndUpdate(userId, {
        password: hashedNewPassword,
      });
    }

    // Emit socket event for real-time password change notification
    const io = req.app.get("io");
    if (io) {
      io.to("profile").emit("passwordChanged", {
        userId: userId,
        userRole: userType,
        timestamp: Date.now(),
      });
      console.log(`📡 Password changed event emitted via socket (${userType})`);
    }

    res.json({
      success: true,
      message: "تم تغيير كلمة المرور بنجاح",
    });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تغيير كلمة المرور",
    });
  }
};

/**
 * إعادة تعيين كلمة المرور
 */
exports.resetPassword = async (req, res) => {
  try {
    const {
      firstName,
      fatherName,
      grandFatherName,
      lastName,
      motherName,
      idNumber,
      birthDate,
      newPassword,
    } = req.validatedData || req.body;

    // التحقق أولاً من الهوية مرة أخرى للأمان
    let user = null;
    let userType = null;

    // البحث في جدول الطلاب
    const student = await Student.findOne({
      $or: [{ idNumber: idNumber }, { studentId: idNumber }],
    });

    if (student) {
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
        user = student;
        userType = "student";
      }
    }

    // إذا لم نجد في الطلاب، ابحث في المعلمين
    if (!user) {
      const teacher = await Teacher.findOne({
        $or: [{ idNumber: idNumber }, { teacherId: idNumber }],
      });

      if (teacher) {
        const birthDateMatch = teacher.birthDate
          ? new Date(teacher.birthDate).toISOString().split("T")[0] ===
            birthDate
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
          user = teacher;
          userType = "teacher";
        }
      }
    }

    // إذا لم نجد في المعلمين، ابحث في المسؤولين
    if (!user) {
      const admin = await Admin.findOne({
        $or: [{ idNumber: idNumber }, { adminId: idNumber }],
      });

      if (admin) {
        const birthDateMatch = admin.birthDate
          ? new Date(admin.birthDate).toISOString().split("T")[0] === birthDate
          : false;

        if (
          admin.firstName.trim().toLowerCase() === firstName.toLowerCase() &&
          admin.fatherName &&
          admin.fatherName.trim().toLowerCase() === fatherName.toLowerCase() &&
          admin.grandFatherName &&
          admin.grandFatherName.trim().toLowerCase() ===
            grandFatherName.toLowerCase() &&
          admin.lastName.trim().toLowerCase() === lastName.toLowerCase() &&
          admin.motherName &&
          admin.motherName.trim().toLowerCase() === motherName.toLowerCase() &&
          (admin.idNumber === idNumber || admin.adminId === idNumber) &&
          birthDateMatch
        ) {
          user = admin;
          userType = "admin";
        }
      }
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "فشل في التحقق من البيانات",
      });
    }

    // تشفير كلمة المرور الجديدة
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // تحديث كلمة المرور
    if (userType === "student") {
      await Student.findByIdAndUpdate(user._id, {
        password: hashedPassword,
      });
    } else if (userType === "teacher") {
      await Teacher.findByIdAndUpdate(user._id, {
        password: hashedPassword,
      });
    } else if (userType === "admin") {
      await Admin.findByIdAndUpdate(user._id, {
        password: hashedPassword,
      });
    }

    res.json({
      success: true,
      message: "تم تغيير كلمة المرور بنجاح",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تغيير كلمة المرور",
    });
  }
};
