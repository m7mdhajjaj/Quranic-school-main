/**
 * Authentication Middleware Index
 * Central export point for all authentication middleware
 * 
 * Structure:
 * - protect.middleware.js: Core JWT authentication
 * - role.middleware.js: Role-based authorization (teacher, admin, restrictAdmin)
 * - session.middleware.js: Session management (getMe, logout)
 */

const { protect } = require("./protect.middleware");
const { teacherProtect, adminProtect, restrictAdmin } = require("./role.middleware");
const { getMe, logout } = require("./session.middleware");

module.exports = {
  // Core authentication
  protect,
  
  // Role-based authorization
  teacherProtect,
  adminProtect,
  restrictAdmin,
  
  // Session management
  getMe,
  logout,
};
