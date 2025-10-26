// routes/authRoutes/user.routes.js
const express = require("express");
const router = express.Router();
const { getMe, registerTeacher } = require("../../controllers/authController");
const { protect } = require("../../middleware/authMiddleware");
const { validateRegisterTeacher } = require("../../Validation/Auth/AuthValidation");

/**
 * User Management Routes
 */

// Get current user info
router.get("/me", getMe);

// Verify token and get user data (protected)
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
      gender: req.user.gender,
      avatar: req.user.avatar,
    },
  });
});

// Register new teacher (admin only, protected, with validation)
router.post(
  "/register-teacher",
  protect,
  validateRegisterTeacher,
  registerTeacher
);

module.exports = router;
