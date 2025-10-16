const Student = require("../schema/Student");
const Teacher = require("../schema/Teacher");
const Admin = require("../schema/Admin");
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
    console.log("Validated data:", req.validatedData);

    // استخدام البيانات من req.validatedData إذا كانت موجودة، وإلا من req.body
    const identifier =
      req.validatedData?.identifier ||
      req.body.studentId ||
      req.body.teacherId ||
      req.body.adminId;
    const password =
      req.validatedData?.password || req.body.idNumber || req.body.password;
    const userType = req.validatedData?.userType || req.body.userType;
    const rememberMe =
      req.body.rememberMe === true || req.body.rememberMe === "true";

    console.log("Parsed values:", {
      identifier,
      password: password ? "***" : "none",
      userType,
    });

    // إذا في userType، استخدمه مباشرة
    // لكن إذا ما فيش، حاول تسجيل دخول الطالب أولاً
    if (userType === "teacher") {
      console.log("🎓 Attempting teacher login (explicit userType)");
      return await loginTeacher(req, res, identifier, password, rememberMe);
    }

    if (userType === "admin") {
      console.log("👔 Attempting admin login (explicit userType)");
      return await loginAdmin(req, res, identifier, password, rememberMe);
    }

    // إذا ما في userType محدد، حاول الطالب أولاً (default behavior)
    console.log("🎒 No userType specified, attempting student login first");

    // Otherwise, proceed with student login
    // التحقق من إدخال رقم الطالب ورقم الهوية
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "الرجاء إدخال رقم الطالب وكلمة المرور",
      });
    }

    // البحث عن الطالب باستخدام رقم الطالب
    console.log("🔍 البحث عن طالب برقم:", identifier);
    console.log("🔍 نوع البيانات:", typeof identifier);

    // تحويل إلى رقم إذا كان string
    const studentIdNumber = parseInt(identifier);
    console.log(
      "🔍 بعد التحويل:",
      studentIdNumber,
      "- نوع:",
      typeof studentIdNumber
    );

    const student = await Student.findOne({ studentId: studentIdNumber });

    if (!student) {
      console.log("❌ لم يتم العثور على طالب برقم:", identifier);
      return res.status(401).json({
        success: false,
        message: "رقم الطالب غير صحيح أو غير موجود",
      });
    }

    console.log(
      "✅ تم العثور على الطالب:",
      student.firstName,
      student.lastName
    );
    console.log("📋 معلومات الطالب:");
    console.log("   - studentId:", student.studentId);
    console.log("   - idNumber:", student.idNumber);
    console.log("   - كلمة المرور موجودة:", !!student.password);
    console.log(
      "   - طول كلمة المرور:",
      student.password ? student.password.length : 0
    );
    console.log(
      "   - كلمة المرور تبدأ بـ:",
      student.password ? student.password.substring(0, 4) : "none"
    );
    console.log("📥 كلمة المرور المُدخلة:", password ? "(موجودة)" : "(فارغة)");

    let isPasswordValid = false;

    // التحقق مما إذا كانت كلمة المرور مشفرة أم لا
    // كلمات المرور المشفرة بـ bcrypt تبدأ بـ $2a$ أو $2b$ وطولها 60 حرف
    if (
      student.password &&
      student.password.startsWith("$2") &&
      student.password.length === 60
    ) {
      // كلمة المرور مشفرة - استخدام bcrypt للمقارنة
      console.log("🔐 كلمة المرور مشفرة - استخدام bcrypt للمقارنة");
      console.log("   - رقم الهوية المُدخل:", password);
      console.log(
        "   - كلمة المرور المشفرة في DB:",
        student.password.substring(0, 20) + "..."
      );
      isPasswordValid = await bcrypt.compare(password, student.password);
      console.log(
        "   - نتيجة المقارنة:",
        isPasswordValid ? "✅ صحيح" : "❌ خاطئ"
      );
    } else if (student.password) {
      // كلمة المرور غير مشفرة (نص عادي) - مقارنة مباشرة
      console.log("📝 كلمة المرور غير مشفرة - مقارنة مباشرة");
      console.log("   - رقم الهوية المُدخل:", password);
      console.log("   - كلمة المرور في DB:", student.password);
      isPasswordValid = password === student.password;
      console.log(
        "   - نتيجة المقارنة:",
        isPasswordValid ? "✅ صحيح" : "❌ خاطئ"
      );

      // تشفير كلمة المرور للمرة القادمة
      if (isPasswordValid) {
        console.log("🔒 كلمة المرور صحيحة - تشفيرها للمرة القادمة");
        const hashedPassword = await bcrypt.hash(password, 10);
        await Student.findByIdAndUpdate(student._id, {
          password: hashedPassword,
        });
        console.log("✅ تم تشفير كلمة المرور بنجاح");
      }
    } else {
      console.log("❌ لا يوجد حقل password في قاعدة البيانات");
    }

    if (!isPasswordValid) {
      console.log("❌ فشل التحقق من كلمة المرور");
      console.log("💡 تأكد من:");
      console.log("   1. رقم الطالب صحيح:", studentIdNumber);
      console.log("   2. رقم الهوية المُدخل:", password);
      console.log("   3. رقم الهوية الصحيح في DB:", student.idNumber);
      console.log("   4. هل يتطابقان؟", password === student.idNumber);

      // محاولة أخيرة: جرب بـ idNumber مباشرة
      console.log("\n🔄 محاولة أخيرة: المقارنة مع idNumber مباشرة");
      const directMatch = await bcrypt.compare(
        student.idNumber,
        student.password
      );
      console.log("   - النتيجة:", directMatch ? "✅ صحيح" : "❌ خاطئ");

      if (directMatch) {
        console.log("⚠️ المشكلة: كلمة المرور في DB مشفرة من idNumber");
        console.log("💡 الحل: استخدم رقم الهوية:", student.idNumber);
      }

      return res.status(401).json({
        success: false,
        message: `رقم الهوية (كلمة المرور) غير صحيح. رقم الهوية الصحيح هو: ${student.idNumber}`,
      });
    }

    console.log("✅✅✅ تم التحقق من كلمة المرور بنجاح!");

    // Set isActive to true and update lastSeen on login
    await Student.findByIdAndUpdate(student._id, {
      isActive: true,
      lastSeen: new Date(),
    });

    // تحديد مدة الجلسة بناءً على "تذكرني"
    // rememberMe = true: 7 أيام
    // rememberMe = false: 30 دقيقة
    const tokenExpiry = rememberMe ? "7d" : "30m";

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
      { expiresIn: tokenExpiry }
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
        gender: student.gender,
        avatar: student.avatar,
        role: "student",
        isActive: true,
      },
    });
  } catch (error) {
    console.error("=== Login Error Details ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Request body:", req.body);
    console.error("========================");

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تسجيل الدخول",
      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : {
              name: error.name,
              message: error.message,
              details: error.toString(),
            },
    });
  }
};

// تسجيل دخول المعلم
const loginTeacher = async (
  req,
  res,
  teacherIdParam,
  passwordParam,
  rememberMeParam
) => {
  try {
    const teacherId =
      teacherIdParam || req.validatedData?.identifier || req.body.teacherId;
    const password =
      passwordParam || req.validatedData?.password || req.body.password;
    const rememberMe =
      rememberMeParam !== undefined
        ? rememberMeParam
        : req.body.rememberMe === true || req.body.rememberMe === "true";

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
        message: "رقم المعلم غير صحيح أو غير موجود",
      });
    }

    // التحقق من صحة كلمة المرور
    const isMatch = await bcrypt.compare(password, teacher.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "كلمة مرور المعلم غير صحيحة",
      });
    }

    // Set isActive to true and update lastSeen on login
    await Teacher.findByIdAndUpdate(teacher._id, {
      isActive: true,
      lastSeen: new Date(),
    });

    // تحديد مدة الجلسة بناءً على "تذكرني"
    const tokenExpiry = rememberMe ? "7d" : "30m";

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
      { expiresIn: tokenExpiry }
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
        gender: teacher.gender,
        avatar: teacher.avatar,
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
const loginAdmin = async (
  req,
  res,
  adminIdParam,
  passwordParam,
  rememberMeParam
) => {
  try {
    const adminId =
      adminIdParam || req.validatedData?.identifier || req.body.adminId;
    const password =
      passwordParam || req.validatedData?.password || req.body.password;
    const rememberMe =
      rememberMeParam !== undefined
        ? rememberMeParam
        : req.body.rememberMe === true || req.body.rememberMe === "true";

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
        message: "رقم الإداري غير صحيح أو غير موجود",
      });
    }

    // التحقق من صحة كلمة المرور
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "كلمة مرور الإداري غير صحيحة",
      });
    }

    // Set isActive to true and update lastSeen on login
    await Admin.findByIdAndUpdate(admin._id, {
      isActive: true,
      lastSeen: new Date(),
    });

    // تحديد مدة الجلسة بناءً على "تذكرني"
    const tokenExpiry = rememberMe ? "7d" : "30m";

    // إنشاء رمز JWT
    const token = jwt.sign(
      {
        id: admin._id,
        adminId: admin.adminId,
        name: `${admin.firstName} ${admin.lastName}`,
        role: "admin",
      },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
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
        gender: admin.gender,
        avatar: admin.avatar,
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

    // التحقق تم في middleware - لا حاجة للتحقق المكرر

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
        admin.firstName.toLowerCase() === firstName.toLowerCase() &&
        admin.fatherName &&
        admin.fatherName.toLowerCase() === fatherName.toLowerCase() &&
        admin.grandFatherName &&
        admin.grandFatherName.toLowerCase() === grandFatherName.toLowerCase() &&
        admin.lastName.toLowerCase() === lastName.toLowerCase() &&
        admin.motherName &&
        admin.motherName.toLowerCase() === motherName.toLowerCase() &&
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
          admin.firstName.toLowerCase() === firstName.toLowerCase() &&
          admin.fatherName &&
          admin.fatherName.toLowerCase() === fatherName.toLowerCase() &&
          admin.grandFatherName &&
          admin.grandFatherName.toLowerCase() ===
            grandFatherName.toLowerCase() &&
          admin.lastName.toLowerCase() === lastName.toLowerCase() &&
          admin.motherName &&
          admin.motherName.toLowerCase() === motherName.toLowerCase() &&
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

// Logout functionality
exports.logout = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Set isActive to false and update lastSeen based on user type
    const updateData = {
      isActive: false,
      lastSeen: new Date(),
    };

    console.log(
      `🔴 Logout: تحديث lastSeen للمستخدم ${userId} في ${updateData.lastSeen.toISOString()}`
    );

    let updatedUser;
    if (userRole === "student") {
      updatedUser = await Student.findByIdAndUpdate(userId, updateData, {
        new: true,
      });
      console.log(`✅ Student updated - lastSeen: ${updatedUser.lastSeen}`);
    } else if (userRole === "teacher" || userRole === "admin") {
      if (userRole === "admin") {
        updatedUser = await Admin.findByIdAndUpdate(userId, updateData, {
          new: true,
        });
        console.log(`✅ Admin updated - lastSeen: ${updatedUser.lastSeen}`);
      } else {
        updatedUser = await Teacher.findByIdAndUpdate(userId, updateData, {
          new: true,
        });
        console.log(`✅ Teacher updated - lastSeen: ${updatedUser.lastSeen}`);
      }
    }

    // إرسال إشعار Socket بتغيير حالة المستخدم (إذا كان هناك Socket.IO متاح)
    if (req.app && req.app.get("io")) {
      req.app.get("io").emit("userStatusChange", {
        userId: userId,
        isActive: false,
        lastSeen:
          updatedUser?.lastSeen?.toISOString() || new Date().toISOString(),
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
