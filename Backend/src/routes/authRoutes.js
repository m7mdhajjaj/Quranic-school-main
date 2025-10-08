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
  validateResetPassword
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
    mongodb_uri: process.env.MONGODB_URI ? "Set" : "Not Set"
  });
});

// مسار تسجيل الدخول للطلاب والمعلمين
router.post("/login", validateLogin, login);

// مسار تسجيل الخروج
router.post("/logout", protect, logout);

// مسار للحصول على بيانات المستخدم الحالي
router.get("/me", getMe);

// مسار لتسجيل معلم جديد (للمسؤول فقط)
router.post("/register-teacher", protect, validateRegisterTeacher, registerTeacher);

// مسار تغيير كلمة المرور
router.post("/change-password", protect, validateChangePassword, changePassword);

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
      email: req.user.email
    }
  });
});

module.exports = router;
