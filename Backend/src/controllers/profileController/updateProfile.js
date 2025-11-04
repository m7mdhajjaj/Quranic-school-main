/**
 * Update Profile Controller
 * Handles updating current user profile
 */

const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");

/**
 * @desc    Update user profile
 * @route   PUT /api/profile/me
 * @access  Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userType = req.user.role || "student";
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData._id;
    delete updateData.studentId;
    delete updateData.teacherId;
    delete updateData.adminId;

    let updatedUser;
    if (userType === "student") {
      updatedUser = await Student.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");
    } else if (userType === "admin") {
      updatedUser = await Admin.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");
    } else {
      updatedUser = await Teacher.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");
    }

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    res.json({
      success: true,
      message: "تم تحديث البيانات بنجاح",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "بيانات غير صحيحة",
        errors: errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "خطأ في الخادم",
    });
  }
};

module.exports = {
  updateUserProfile,
};
