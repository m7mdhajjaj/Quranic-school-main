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

const router = express.Router();

// مسار تسجيل الدخول للطلاب والمعلمين
router.post("/login", login);

// مسار تسجيل الخروج
router.post("/logout", protect, logout);

// مسار للحصول على بيانات المستخدم الحالي
router.get("/me", getMe);

// مسار لتسجيل معلم جديد (للمسؤول فقط)
router.post("/register-teacher", protect, registerTeacher);

// مسار تغيير كلمة المرور
router.post("/change-password", protect, changePassword);

// مسار للتحقق من الهوية عند نسيان كلمة المرور
router.post("/verify-identity", verifyIdentity);

// مسار لإعادة تعيين كلمة المرور
router.post("/reset-password", resetPassword);

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
