const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");
const Secretary = require("../../schema/Secretary");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * تسجيل الدخول الموحد - يحدد نوع المستخدم تلقائياً من الباك إند
 * يبحث في جميع الأنواع (طالب، معلم، إداري) ويحدد الصحيح
 */
exports.login = async (req, res) => {
  try {
    // استخدام البيانات من req.validatedData إذا كانت موجودة، وإلا من req.body
    const identifier =
      req.validatedData?.identifier ||
      req.body.identifier ||
      req.body.studentId ||
      req.body.teacherId ||
      req.body.adminId;
    const password =
      req.validatedData?.password || req.body.idNumber || req.body.password;
    const rememberMe =
      req.body.rememberMe === true || req.body.rememberMe === "true";

    // التحقق من إدخال المعرف وكلمة المرور
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "الرجاء إدخال المعرف وكلمة المرور",
      });
    }

    // البحث التلقائي في جميع الأنواع
    
    // 1. محاولة البحث كطالب (studentId)
    const studentIdNumber = parseInt(identifier);
    if (!isNaN(studentIdNumber)) {
      const student = await Student.findOne({ studentId: studentIdNumber });
      
      if (student) {
        return await authenticateStudent(student, password, rememberMe, res);
      }
    }

    // 2. محاولة البحث كمعلم (teacherId)
    const teacher = await Teacher.findOne({ teacherId: identifier });
    
    if (teacher) {
      return await authenticateTeacher(teacher, password, rememberMe, res);
    }

    // 3. محاولة البحث كإداري (adminId)
    const admin = await Admin.findOne({ adminId: identifier });
    
    if (admin) {
      return await authenticateAdmin(admin, password, rememberMe, res);
    }

    // 4. محاولة البحث كسكرتير (secretaryId)
    const secretary = await Secretary.findOne({ secretaryId: identifier });
    
    if (secretary) {
      return await authenticateSecretary(secretary, password, rememberMe, res);
    }

    // لم يتم العثور على المستخدم في أي نوع
    return res.status(401).json({
      success: false,
      message: "المعرف غير صحيح أو غير موجود",
    });
  } catch (error) {
    console.error("❌ Login error:", error);

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
 * مصادقة الطالب بعد التحقق من وجوده
 */
const authenticateStudent = async (student, password, rememberMe, res) => {
  try {
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
      console.log("❌ فشل التحقق من كلمة المرور للطالب");
      return res.status(401).json({
        success: false,
        message: "كلمة المرور غير صحيحة",
      });
    }

    console.log("✅ تم التحقق من كلمة المرور بنجاح!");

    // ✅ تحديث lastSeen فقط (isActive يتم عبر Socket.io)
    await Student.findByIdAndUpdate(student._id, {
      lastSeen: new Date(),
    });

    // ℹ️ Note: Status update (online/offline) يتم تلقائياً عبر Socket.io
    // عند اتصال المستخدم في app.js socket handlers

    // تحديد مدة الجلسة
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

    // إرسال الاستجابة
    return res.status(200).json({
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
        // ℹ️ isActive will be managed by Socket.io - Frontend will get it from UserStatusContext
      },
    });
  } catch (error) {
    console.error("خطأ في مصادقة الطالب:", error);
    throw error;
  }
};

/**
 * مصادقة المعلم بعد التحقق من وجوده
 */
const authenticateTeacher = async (teacher, password, rememberMe, res) => {
  try {
    const isMatch = await bcrypt.compare(password, teacher.password);

    if (!isMatch) {
      console.log("❌ فشل التحقق من كلمة المرور للمعلم");
      return res.status(401).json({
        success: false,
        message: "كلمة المرور غير صحيحة",
      });
    }

    // ✅ تحديث lastSeen فقط (isActive يتم عبر Socket.io)
    await Teacher.findByIdAndUpdate(teacher._id, {
      lastSeen: new Date(),
    });

    // ℹ️ Note: Status update (online/offline) يتم تلقائياً عبر Socket.io

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

    return res.status(200).json({
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
        // ℹ️ isActive managed by Socket.io
      },
    });
  } catch (error) {
    console.error("خطأ في مصادقة المعلم:", error);
    throw error;
  }
};

/**
 * مصادقة الإداري بعد التحقق من وجوده
 */
const authenticateAdmin = async (admin, password, rememberMe, res) => {
  try {
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      console.log("❌ فشل التحقق من كلمة المرور للإداري");
      return res.status(401).json({
        success: false,
        message: "كلمة المرور غير صحيحة",
      });
    }

    // ✅ تحديث lastSeen فقط (isActive يتم عبر Socket.io)
    await Admin.findByIdAndUpdate(admin._id, {
      lastSeen: new Date(),
    });

    // ℹ️ Note: Status update (online/offline) يتم تلقائياً عبر Socket.io

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

    return res.status(200).json({
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
        // ℹ️ isActive managed by Socket.io
      },
    });
  } catch (error) {
    console.error("خطأ في مصادقة الإداري:", error);
    throw error;
  }
};

/**
 * مصادقة السكرتير بعد التحقق من وجوده
 */
const authenticateSecretary = async (secretary, password, rememberMe, res) => {
  try {
    const isMatch = await bcrypt.compare(password, secretary.password);

    if (!isMatch) {
      console.log("❌ فشل التحقق من كلمة المرور للسكرتير");
      return res.status(401).json({
        success: false,
        message: "كلمة المرور غير صحيحة",
      });
    }

    // ✅ تحديث lastSeen فقط (isActive يتم عبر Socket.io)
    await Secretary.findByIdAndUpdate(secretary._id, {
      lastSeen: new Date(),
    });

    // ℹ️ Note: Status update (online/offline) يتم تلقائياً عبر Socket.io

    const tokenExpiry = rememberMe ? "7d" : "30m";

    const token = jwt.sign(
      {
        id: secretary._id,
        secretaryId: secretary.secretaryId,
        name: `${secretary.firstName} ${secretary.lastName}`,
        role: "secretary",
      },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: secretary._id,
        secretaryId: secretary.secretaryId,
        firstName: secretary.firstName,
        lastName: secretary.lastName,
        email: secretary.email,
        gender: secretary.gender,
        avatar: secretary.avatar,
        permissions: secretary.permissions,
        role: "secretary",
        // ℹ️ isActive managed by Socket.io
      },
    });
  } catch (error) {
    console.error("خطأ في مصادقة السكرتير:", error);
    throw error;
  }
};

/**
 * تسجيل دخول المعلم (Deprecated - للتوافق مع الكود القديم)
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

    // ✅ تحديث lastSeen فقط (isActive يتم عبر Socket.io)
    await Teacher.findByIdAndUpdate(teacher._id, {
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
        // ℹ️ isActive managed by Socket.io
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

    // ✅ تحديث lastSeen فقط (isActive يتم عبر Socket.io)
    await Admin.findByIdAndUpdate(admin._id, {
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
        // ℹ️ isActive managed by Socket.io
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
