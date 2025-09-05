const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

// JWT Secret - في الحالة المثالية يجب وضع هذا في ملف .env
const JWT_SECRET = "quranic-school-secret-key";

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

    // البحث عن الطالب في قاعدة البيانات
    const currentStudent = await Student.findById(decoded.id);

    if (!currentStudent) {
      return res.status(401).json({
        success: false,
        message: "الطالب المرتبط بهذا الرمز غير موجود",
      });
    }

    // إضافة بيانات الطالب إلى الطلب
    req.student = currentStudent;
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
