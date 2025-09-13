const express = require("express");
const {
  login,
  getMe,
  registerTeacher,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// مسار تسجيل الدخول للطلاب والمعلمين
router.post("/login", login);

// مسار للحصول على بيانات المستخدم الحالي
router.get("/me", getMe);

// مسار لتسجيل معلم جديد (للمسؤول فقط)
router.post("/register-teacher", protect, registerTeacher);

// مسار تغيير كلمة المرور
router.post("/change-password", protect, changePassword);

module.exports = router;
