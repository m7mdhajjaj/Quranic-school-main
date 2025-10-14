const express = require("express");
const {
  login,
  logout,
  getMe,
  registerTeacher,
  changePassword,
  verifyIdentity,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const {
  validateLogin,
  validateRegisterTeacher,
  validateChangePassword,
  validateVerifyIdentity,
  validateResetPassword,
} = require("../Validation/AuthValidation");

const router = express.Router();

// Test endpoint to check if server is working
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth API is working",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    jwt_secret: process.env.JWT_SECRET ? "Set" : "Not Set",
    mongodb_uri: process.env.MONGODB_URI ? "Set" : "Not Set",
  });
});

// مسار تسجيل الدخول للطلاب والمعلمين (مع validation)
router.post("/login", validateLogin, login);

// مسار تسجيل الخروج
router.post("/logout", protect, logout);

// مسار للحصول على بيانات المستخدم الحالي
router.get("/me", getMe);

// مسار لتسجيل معلم جديد (للمسؤول فقط)
router.post(
  "/register-teacher",
  protect,
  validateRegisterTeacher,
  registerTeacher
);

// مسار تغيير كلمة المرور
router.post(
  "/change-password",
  protect,
  validateChangePassword,
  changePassword
);

// مسار للتحقق من الهوية عند نسيان كلمة المرور
router.post("/verify-identity", validateVerifyIdentity, verifyIdentity);

// مسار لإعادة تعيين كلمة المرور
router.post("/reset-password", validateResetPassword, resetPassword);

// مسار للتحقق من صحة التوكن
router.get("/verify", protect, (req, res) => {
  res.json({
    success: true,
    message: "التوكن صحيح",
    user: {
      _id: req.user.id || req.user._id,
      role: req.user.role,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
    },
  });
});

// مسار لتشفير كلمات مرور الطلاب القديمة (للإدارة فقط)
router.post("/encrypt-student-passwords", protect, async (req, res) => {
  try {
    // التحقق من أن المستخدم هو admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بتنفيذ هذا الأمر",
      });
    }

    const Student = require("../schema/Student");
    const bcrypt = require("bcryptjs");

    // جلب جميع الطلاب
    const students = await Student.find();

    let updatedCount = 0;
    let alreadyEncryptedCount = 0;

    for (const student of students) {
      // التحقق مما إذا كانت كلمة المرور مشفرة بالفعل
      if (
        student.password &&
        student.password.startsWith("$2") &&
        student.password.length === 60
      ) {
        alreadyEncryptedCount++;
        continue;
      }

      // تشفير كلمة المرور
      if (student.password) {
        const hashedPassword = await bcrypt.hash(student.password, 10);
        await Student.findByIdAndUpdate(student._id, {
          password: hashedPassword,
        });
        updatedCount++;
      } else if (student.idNumber) {
        // إذا لم تكن هناك كلمة مرور، استخدام رقم الهوية
        const hashedPassword = await bcrypt.hash(student.idNumber, 10);
        await Student.findByIdAndUpdate(student._id, {
          password: hashedPassword,
        });
        updatedCount++;
      }
    }

    res.json({
      success: true,
      message: `تم تشفير كلمات المرور بنجاح`,
      totalStudents: students.length,
      updatedCount: updatedCount,
      alreadyEncryptedCount: alreadyEncryptedCount,
    });
  } catch (error) {
    console.error("خطأ في تشفير كلمات المرور:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تشفير كلمات المرور",
      error: error.message,
    });
  }
});

module.exports = router;
