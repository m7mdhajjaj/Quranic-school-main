const express = require("express");
const { login, getMe } = require("../controllers/authController");

const router = express.Router();

// مسار تسجيل الدخول
router.post("/login", login);

// مسار للحصول على بيانات المستخدم الحالي
router.get("/me", getMe);

module.exports = router;
