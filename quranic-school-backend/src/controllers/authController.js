const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// JWT Secret - في الحالة المثالية يجب وضع هذا في ملف .env
const JWT_SECRET = "quranic-school-secret-key";

// تسجيل الدخول بواسطة رقم الطالب ورقم الهوية
exports.login = async (req, res) => {
  try {
    const { studentId, idNumber, userType } = req.body;

    // Check if it's a teacher login
    if (userType === "teacher") {
      return await loginTeacher(req, res);
    }

    // Otherwise, proceed with student login
    // التحقق من إدخال رقم الطالب ورقم الهوية
    if (!studentId || !idNumber) {
      return res.status(400).json({
        success: false,
        message: "الرجاء إدخال رقم الطالب ورقم الهوية",
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

    // التحقق من صحة رقم الهوية
    if (student.idNumber !== idNumber) {
      return res.status(401).json({
        success: false,
        message: "رقم الهوية غير صحيح",
      });
    }

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
        role: "student",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تسجيل الدخول",
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
        groups: teacher.groups,
        role: teacher.role,
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

      // إرسال بيانات الطالب
      return res.status(200).json({
        success: true,
        user: {
          _id: student._id,
          studentId: student.studentId,
          firstName: student.firstName,
          fatherName: student.fatherName,
          lastName: student.lastName,
          group: student.group,
          role: "student",
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

      // إرسال بيانات المعلم
      return res.status(200).json({
        success: true,
        user: {
          _id: teacher._id,
          teacherId: teacher.teacherId,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
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
