/**
 * Session Controller
 * تم نقل جميع middleware المتعلقة بالمصادقة إلى authMiddleware.js
 * هذا الملف يستورد ويصدر الـ functions من authMiddleware لتجنب التكرار
 * 
 * IMPORTANT: All authentication logic has been consolidated in middleware/authMiddleware.js
 * This controller now simply re-exports those functions to avoid code duplication
 */

const { getMe, logout } = require("../../middleware/authMiddleware");

// إعادة تصدير الـ functions من authMiddleware
module.exports = {
  getMe,
  logout,
};
