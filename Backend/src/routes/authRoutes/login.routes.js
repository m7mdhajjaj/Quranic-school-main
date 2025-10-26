// routes/authRoutes/login.routes.js
const express = require("express");
const router = express.Router();
const { login, logout } = require("../../controllers/authController");
const { protect } = require("../../middleware/authMiddleware");
const { validateLogin } = require("../../Validation/Auth/AuthValidation");

/**
 * Login & Logout Routes
 */

// Login route (with validation)
router.post("/login", validateLogin, login);

// Logout route (protected)
router.post("/logout", protect, logout);

module.exports = router;
