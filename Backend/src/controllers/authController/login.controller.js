const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * تسجيل الدخول الرئيسي - يدعم الطلاب والمعلمين والإداريين
 */
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

    // التحقق من إدخال رقم الطالب ورقم الهوية
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "الرجاء إدخال رقم الطالب وكلمة المرور",
      });
    }

    // البحث عن الطالب باستخدام رقم الطالب
    console.log("🔍 البحث عن طالب برقم:", identifier);
    const studentIdNumber = parseInt(identifier);
    const student = await Student.findOne({ studentId: studentIdNumber });

    if (!student) {
      console.log("❌ لم يتم العثور على طالب برقم:", identifier);
      return res.status(401).json({
        success: false,
        message: "رقم الطالب غير صحيح أو غير موجود",
      });
    }

    console.log("✅ تم العثور على الطالب:", student.firstName, student.lastName);
    
    let isPasswordValid = false;

    // التحقق مما إذا كانت كلمة المرور مشفرة أم لا
    if (
      student.password &&
      student.password.startsWith("$2") &&
      student.password.length === 60
    ) {
      // كلمة المرور مشفرة - استخدام bcrypt للمقارنة
      console.log("🔐 كلمة المرور مشفرة - استخدام bcrypt للمقارنة");
      isPasswordValid = await bcrypt.compare(password, student.password);
    } else if (student.password) {
      // كلمة المرور غير مشفرة (نص عادي) - مقارنة مباشرة
      console.log("📝 كلمة المرور غير مشفرة - مقارنة مباشرة");
      isPasswordValid = password === student.password;

      // تشفير كلمة المرور للمرة القادمة
      if (isPasswordValid) {
        console.log("🔒 كلمة المرور صحيحة - تشفيرها للمرة القادمة");
        const hashedPassword = await bcrypt.hash(password, 10);
        await Student.findByIdAndUpdate(student._id, {
          password: hashedPassword,
        });
        console.log("✅ تم تشفير كلمة المرور بنجاح");
      }
    }

    if (!isPasswordValid) {
      console.log("❌ فشل التحقق من كلمة المرور");
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

/**
 * تسجيل دخول المعلم
 */
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

    if (!teacherId || !password) {
      return res.status(400).json({
        success: false,
        message: "الرجاء إدخال رقم المعلم وكلمة المرور",
      });
    }

    const teacher = await Teacher.findOne({ teacherId });

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: "رقم المعلم غير صحيح أو غير موجود",
      });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "كلمة مرور المعلم غير صحيحة",
      });
    }

    await Teacher.findByIdAndUpdate(teacher._id, {
      isActive: true,
      lastSeen: new Date(),
    });

    const tokenExpiry = rememberMe ? "7d" : "30m";

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

/**
 * تسجيل دخول الإداري
 */
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

    if (!adminId || !password) {
      return res.status(400).json({
        success: false,
        message: "الرجاء إدخال رقم الإداري وكلمة المرور",
      });
    }

    const admin = await Admin.findOne({ adminId });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "رقم الإداري غير صحيح أو غير موجود",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "كلمة مرور الإداري غير صحيحة",
      });
    }

    await Admin.findByIdAndUpdate(admin._id, {
      isActive: true,
      lastSeen: new Date(),
    });

    const tokenExpiry = rememberMe ? "7d" : "30m";

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
