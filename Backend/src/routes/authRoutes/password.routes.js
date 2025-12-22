// routes/authRoutes/password.routes.js
const express = require("express");
const router = express.Router();
const {
  changePassword,
  verifyIdentity,
  resetPassword,
} = require("../../controllers/authController");
const { protect } = require("../../middleware/auth");
const {
  validateChangePassword,
  validateVerifyIdentity,
  validateResetPassword,
} = require("../../Validation/Auth/AuthValidation");

/**
 * Password Management Routes
 */

// Change password (protected, with validation)
router.post(
  "/change-password",
  protect,
  validateChangePassword,
  changePassword
);

// Verify identity for password reset (with validation)
router.post("/verify-identity", validateVerifyIdentity, verifyIdentity);

// Reset password (with validation)
router.post("/reset-password", validateResetPassword, resetPassword);

module.exports = router;
