const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// JWT Secret - في الحالة المثالية يجب وضع هذا في ملف .env
const JWT_SECRET = process.env.JWT_SECRET;

const { body, validationResult } = require("express-validator");

// تسجيل الدخول بواسطة رقم الطالب ورقم الهوية
exports.login = async (req, res) => {
  try {
    console.log("=== Login called ===");
    console.log("Request body:", req.body);

    const { studentId, idNumber, userType } = req.body;

    console.log("Parsed values:", { studentId, idNumber, userType });

    // Check if it's a teacher login
    if (userType === "teacher") {
      return await loginTeacher(req, res);
    }

    // Check if it's an admin login
    if (userType === "admin") {
      return await loginAdmin(req, res);
    }

    // Otherwise, proceed with student login
    // التحقق من إدخال رقم الطالب ورقم الهوية
    // (already validated above)
    if (!studentId || !idNumber) {
      return res.status(400).json({
        success: false,
        message: "الرجاء إدخال رقم الطالب وكلمة المرور",
      });
    }

    // البحث عن الطالب باستخدام رقم الطالب
    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "رقم الطالب غير موجود",
      });
    }

    // التحقق من صحة رقم الهوية أو كلمة المرور
    let isPasswordValid = false;

    console.log("Student password field:", student.password);
    console.log("Entered idNumber:", idNumber);

    if (student.password && student.password.length > 20) {
      // كلمة المرور مشفرة - استخدام bcrypt للتحقق
      console.log("Checking encrypted password");
      isPasswordValid = await bcrypt.compare(idNumber, student.password);
    } else if (student.password) {
      // كلمة المرور غير مشفرة (نص عادي) - مقارنة مباشرة
      console.log("Checking plain text password");
      isPasswordValid = student.password === idNumber;
    } else {
      // لا يوجد حقل password - استخدام رقم الهوية
      console.log("No password field, using idNumber");
      isPasswordValid = student.idNumber === idNumber;
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "كلمة المرور غير صحيحة",
      });
    }

    // Set isActive to true and update lastSeen on login
    await Student.findByIdAndUpdate(student._id, { 
      isActive: true, 
      lastSeen: new Date() 
    });

    // إنشاء رمز JWT
    const token = jwt.sign(
      {
        id: student._id,
        studentId: student.studentId,
        name: `${student.firstName} ${student.lastName}`,
        group: student.group,
        role: "student",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // إرسال البيانات المصادق عليها
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: student._id,
        studentId: student.studentId,
        firstName: student.firstName,
        fatherName: student.fatherName,
        lastName: student.lastName,
        group: student.group,
        email: student.email,
        role: "student",
        isActive: true,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تسجيل الدخول",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// تسجيل دخول المعلم
const loginTeacher = async (req, res) => {
  try {
    const { teacherId, password } = req.body;

    // التحقق من إدخال رقم المعلم وكلمة المرور
    if (!teacherId || !password) {
      return res.status(400).json({
        success: false,
        message: "الرجاء إدخال رقم المعلم وكلمة المرور",
      });
    }

    // البحث عن المعلم باستخدام رقم المعلم
    const teacher = await Teacher.findOne({ teacherId });

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: "رقم المعلم غير موجود",
      });
    }

    // التحقق من صحة كلمة المرور
    const isMatch = await bcrypt.compare(password, teacher.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "كلمة المرور غير صحيحة",
      });
    }

    // Set isActive to true and update lastSeen on login
    await Teacher.findByIdAndUpdate(teacher._id, { 
      isActive: true, 
      lastSeen: new Date() 
    });

    // إنشاء رمز JWT
    const token = jwt.sign(
      {
        id: teacher._id,
        teacherId: teacher.teacherId,
        name: `${teacher.firstName} ${teacher.lastName}`,
        groups: teacher.groups,
        role: teacher.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // إرسال البيانات المصادق عليها
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: teacher._id,
        teacherId: teacher.teacherId,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        groups: teacher.groups,
        role: teacher.role,
        isActive: true,
      },
    });
  } catch (error) {
    console.error("Teacher login error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تسجيل الدخول",
    });
  }
};

// تسجيل دخول الإداري
const loginAdmin = async (req, res) => {
  try {
    const { adminId, password } = req.body;

    // التحقق من إدخال رقم الإداري وكلمة المرور
    if (!adminId || !password) {
      return res.status(400).json({
        success: false,
        message: "الرجاء إدخال رقم الإداري وكلمة المرور",
      });
    }

    // البحث عن الإداري باستخدام رقم الإداري
    const admin = await Admin.findOne({ adminId });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "رقم الإداري غير موجود",
      });
    }

    // التحقق من صحة كلمة المرور
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "كلمة المرور غير صحيحة",
      });
    }

    // Set isActive to true and update lastSeen on login
    await Admin.findByIdAndUpdate(admin._id, { 
      isActive: true, 
      lastSeen: new Date() 
    });

    // إنشاء رمز JWT
    const token = jwt.sign(
      {
        id: admin._id,
        adminId: admin.adminId,
        name: `${admin.firstName} ${admin.lastName}`,
        role: "admin",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // إرسال البيانات المصادق عليها
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: admin._id,
        adminId: admin.adminId,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: "admin",
        isActive: true,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تسجيل الدخول",
    });
  }
};

// إضافة معلم جديد (للمسؤول فقط)
exports.registerTeacher = async (req, res) => {
  try {
    const {
      teacherId,
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      groups,
    } = req.body;

    // التحقق من عدم وجود معلم بنفس الرقم أو البريد الإلكتروني
    const existingTeacher = await Teacher.findOne({
      $or: [{ teacherId }, { email }],
    });

    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: "رقم المعلم أو البريد الإلكتروني مستخدم بالفعل",
      });
    }

    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // إنشاء معلم جديد
    const teacher = await Teacher.create({
      teacherId,
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      groups,
    });

    res.status(201).json({
      success: true,
      message: "تم إنشاء حساب المعلم بنجاح",
      data: {
        _id: teacher._id,
        teacherId: teacher.teacherId,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        groups: teacher.groups,
      },
    });
  } catch (error) {
    console.error("Register teacher error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء حساب المعلم",
    });
  }
};

// التحقق من صحة الرمز وإعادة بيانات المستخدم
exports.getMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "لم يتم توفير رمز المصادقة",
      });
    }

    // التحقق من صحة الرمز
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role === "student" || !decoded.role) {
      // البحث عن الطالب في قاعدة البيانات
      const student = await Student.findById(decoded.id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "الطالب غير موجود",
        });
      }

      // إرسال جميع بيانات الطالب
      return res.status(200).json({
        success: true,
        user: {
          _id: student._id,
          studentId: student.studentId,
          idNumber: student.idNumber,
          firstName: student.firstName,
          fatherName: student.fatherName,
          grandFatherName: student.grandFatherName,
          motherName: student.motherName,
          lastName: student.lastName,
          birthDate: student.birthDate,
          age: student.age,
          gender: student.gender,
          residence: student.residence,
          teacher: student.teacher,
          group: student.group,
          email: student.email,
          role: "student",
        },
      });
    } else if (decoded.role === "admin") {
      // البحث عن الإداري في قاعدة البيانات
      const admin = await Admin.findById(decoded.id);

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "الإداري غير موجود",
        });
      }

      // إرسال جميع بيانات الإداري
      return res.status(200).json({
        success: true,
        user: {
          _id: admin._id,
          adminId: admin.adminId,
          idNumber: admin.idNumber,
          firstName: admin.firstName,
          fatherName: admin.fatherName,
          grandFatherName: admin.grandFatherName,
          motherName: admin.motherName,
          lastName: admin.lastName,
          birthDate: admin.birthDate,
          age: admin.age,
          gender: admin.gender,
          residence: admin.residence,
          email: admin.email,
          phoneNumber: admin.phoneNumber,
          role: "admin",
        },
      });
    } else {
      // البحث عن المعلم في قاعدة البيانات
      const teacher = await Teacher.findById(decoded.id);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "المعلم غير موجود",
        });
      }

      // إرسال جميع بيانات المعلم
      return res.status(200).json({
        success: true,
        user: {
          _id: teacher._id,
          teacherId: teacher.teacherId,
          idNumber: teacher.idNumber,
          firstName: teacher.firstName,
          fatherName: teacher.fatherName,
          grandFatherName: teacher.grandFatherName,
          motherName: teacher.motherName,
          lastName: teacher.lastName,
          birthDate: teacher.birthDate,
          age: teacher.age,
          gender: teacher.gender,
          residence: teacher.residence,
          email: teacher.email,
          phoneNumber: teacher.phoneNumber,
          groups: teacher.groups,
          role: teacher.role,
        },
      });
    }
  } catch (error) {
    console.error("GetMe error:", error);

    // التحقق من نوع الخطأ
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "رمز المصادقة غير صالح",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "انتهت صلاحية رمز المصادقة",
      });
    }

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء التحقق من المصادقة",
    });
  }
};

// تغيير كلمة المرور
exports.changePassword = async (req, res) => {
  try {
    console.log("=== changePassword called ===");
    console.log("Request body:", req.body);

    const { currentPassword, newPassword, userId, userType } = req.body;

    // التحقق من المدخلات
    if (!currentPassword || !newPassword || !userId) {
      console.log("Missing required fields");
      return res.status(400).json({
        success: false,
        message: "جميع الحقول مطلوبة",
      });
    }

    // التحقق من طول كلمة المرور الجديدة
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل",
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
      await Student.freezeByIdAndUpdate(userId, {
        password: hashedNewPassword,
      });
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

// التحقق من الهوية لاسترداد كلمة المرور
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
    } = req.body;

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
        student.firstName.toLowerCase() === firstName.toLowerCase() &&
        student.fatherName.toLowerCase() === fatherName.toLowerCase() &&
        student.grandFatherName.toLowerCase() ===
          grandFatherName.toLowerCase() &&
        student.lastName.toLowerCase() === lastName.toLowerCase() &&
        student.motherName &&
        student.motherName.toLowerCase() === motherName.toLowerCase() &&
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
        teacher.firstName.toLowerCase() === firstName.toLowerCase() &&
        teacher.fatherName &&
        teacher.fatherName.toLowerCase() === fatherName.toLowerCase() &&
        teacher.grandFatherName &&
        teacher.grandFatherName.toLowerCase() ===
          grandFatherName.toLowerCase() &&
        teacher.lastName.toLowerCase() === lastName.toLowerCase() &&
        teacher.motherName &&
        teacher.motherName.toLowerCase() === motherName.toLowerCase() &&
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

// إعادة تعيين كلمة المرور
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
    } = req.body;

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
        student.firstName.toLowerCase() === firstName.toLowerCase() &&
        student.fatherName.toLowerCase() === fatherName.toLowerCase() &&
        student.grandFatherName.toLowerCase() ===
          grandFatherName.toLowerCase() &&
        student.lastName.toLowerCase() === lastName.toLowerCase() &&
        student.motherName &&
        student.motherName.toLowerCase() === motherName.toLowerCase() &&
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
          teacher.firstName.toLowerCase() === firstName.toLowerCase() &&
          teacher.fatherName &&
          teacher.fatherName.toLowerCase() === fatherName.toLowerCase() &&
          teacher.grandFatherName &&
          teacher.grandFatherName.toLowerCase() ===
            grandFatherName.toLowerCase() &&
          teacher.lastName.toLowerCase() === lastName.toLowerCase() &&
          teacher.motherName &&
          teacher.motherName.toLowerCase() === motherName.toLowerCase() &&
          (teacher.idNumber === idNumber || teacher.teacherId === idNumber) &&
          birthDateMatch
        ) {
          user = teacher;
          userType = "teacher";
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
    } else {
      await Teacher.findByIdAndUpdate(user._id, {
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

// Logout functionality
exports.logout = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Set isActive to false and update lastSeen based on user type
    const updateData = {
      isActive: false,
      lastSeen: new Date()
    };

    console.log(`🔴 Logout: تحديث lastSeen للمستخدم ${userId} في ${updateData.lastSeen.toISOString()}`);

    let updatedUser;
    if (userRole === "student") {
      updatedUser = await Student.findByIdAndUpdate(userId, updateData, { new: true });
      console.log(`✅ Student updated - lastSeen: ${updatedUser.lastSeen}`);
    } else if (userRole === "teacher" || userRole === "admin") {
      if (userRole === "admin") {
        updatedUser = await Admin.findByIdAndUpdate(userId, updateData, { new: true });
        console.log(`✅ Admin updated - lastSeen: ${updatedUser.lastSeen}`);
      } else {
        updatedUser = await Teacher.findByIdAndUpdate(userId, updateData, { new: true });
        console.log(`✅ Teacher updated - lastSeen: ${updatedUser.lastSeen}`);
      }
    }

    // إرسال إشعار Socket بتغيير حالة المستخدم (إذا كان هناك Socket.IO متاح)
    if (req.app && req.app.get('io')) {
      req.app.get('io').emit('userStatusChange', {
        userId: userId,
        isActive: false,
        lastSeen: updatedUser?.lastSeen?.toISOString() || new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      message: "تم تسجيل الخروج بنجاح",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تسجيل الخروج",
    });
  }
};
