/**
 * Get Profile Controller
 * Handles fetching current user profile
 */

const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");

/**
 * @desc    Get current user profile
 * @route   GET /api/profile/me
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userType = req.user.role || "student";

    let user;
    if (userType === "student") {
      user = await Student.findById(userId).select("-password");
    } else if (userType === "admin") {
      user = await Admin.findById(userId).select("-password");
    } else {
      user = await Teacher.findById(userId).select("-password");
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    // Return user with role field
    const userData = user.toObject();
    userData.role = userType;

    res.json(userData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في الخادم",
    });
  }
};

module.exports = {
  getUserProfile,
};
