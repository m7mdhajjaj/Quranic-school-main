// ملف رئيسي لتجميع جميع وظائف المصادقة
const loginController = require("./login.controller");
const registerController = require("./register.controller");
const passwordController = require("./password.controller");
const sessionController = require("./sessionController");
const verificationController = require("./verification.controller");

module.exports = {
  // وظائف تسجيل الدخول
  ...loginController,
  
  // وظائف التسجيل
  ...registerController,
  
  // وظائف كلمة المرور
  ...passwordController,
  
  // وظائف الجلسة
  ...sessionController,
  
  // وظائف التحقق
  ...verificationController,
};
