/**
 * Get User By ID Controller
 * Handles fetching other users' profiles (for teachers/admins)
 */

const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");

/**
 * @desc    Get user by ID (for teachers/admins to view other profiles)
 * @route   GET /api/profile/user/:id
 * @access  Private (Teacher/Admin only)
 */
const getUserById = async (req, res) => {
  try {
    const requestingUserRole = req.user.role;

    // Only teachers and admins can view other profiles
    if (requestingUserRole !== "teacher" && requestingUserRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مسموح لك بعرض هذه البيانات",
      });
    }

    const userId = req.params.id;

    // Try to find in students first, then teachers
    let user = await Student.findById(userId).select("-password");
    let userType = "student";

    if (!user) {
      user = await Teacher.findById(userId).select("-password");
      userType = "teacher";
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    res.json({
      success: true,
      user: user,
      userType: userType,
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في الخادم",
    });
  }
};

module.exports = {
  getUserById,
};
