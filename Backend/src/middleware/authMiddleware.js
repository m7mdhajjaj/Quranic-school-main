const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

// JWT Secret - في الحالة المثالية يجب وضع هذا في ملف .env
const JWT_SECRET = process.env.JWT_SECRET;

// وسيط للتحقق من المصادقة
exports.protect = async (req, res, next) => {
  try {
    let token;

    // التحقق من وجود رمز في الترويسة
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // التحقق من وجود الرمز
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "يجب تسجيل الدخول للوصول إلى هذه الصفحة",
      });
    }

    // التحقق من صحة الرمز
    const decoded = jwt.verify(token, JWT_SECRET);

    // تحديد نوع المستخدم (طالب أو معلم)
    if (decoded.role === "student" || !decoded.role) {
      // البحث عن الطالب في قاعدة البيانات
      const currentStudent = await Student.findById(decoded.id);

      if (!currentStudent) {
        return res.status(401).json({
          success: false,
          message: "الطالب المرتبط بهذا الرمز غير موجود",
        });
      }

      // إضافة بيانات الطالب إلى الطلب
      req.user = currentStudent;
      req.user.role = "student";
    } else {
      // البحث عن المعلم في قاعدة البيانات
      const currentTeacher = await Teacher.findById(decoded.id);

      if (!currentTeacher) {
        return res.status(401).json({
          success: false,
          message: "المعلم المرتبط بهذا الرمز غير موجود",
        });
      }

      // إضافة بيانات المعلم إلى الطلب
      req.user = currentTeacher;
      req.user.role = currentTeacher.role;
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

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

    res.status(401).json({
      success: false,
      message: "غير مصرح، يرجى تسجيل الدخول مرة أخرى",
    });
  }
};

// وسيط للتحقق من صلاحيات المعلم
exports.teacherProtect = async (req, res, next) => {
  try {
    // استخدام وسيط الحماية أولاً
    await exports.protect(req, res, () => {
      // التحقق من أن المستخدم معلم
      if (req.user.role !== "teacher" && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "غير مصرح للطلاب بالوصول إلى هذه الصفحة",
        });
      }

      next();
    });
  } catch (error) {
    console.error("Teacher protect middleware error:", error);
    res.status(401).json({
      success: false,
      message: "خطأ في التحقق من صلاحيات المعلم",
    });
  }
};

// وسيط للتحقق من صلاحيات المسؤول
exports.adminProtect = async (req, res, next) => {
  try {
    // استخدام وسيط الحماية أولاً
    await exports.protect(req, res, () => {
      // التحقق من أن المستخدم مسؤول
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "غير مصرح لغير المسؤولين بالوصول إلى هذه الصفحة",
        });
      }

      next();
    });
  } catch (error) {
    console.error("Admin protect middleware error:", error);
    res.status(401).json({
      success: false,
      message: "خطأ في التحقق من صلاحيات المسؤول",
    });
  }
};
