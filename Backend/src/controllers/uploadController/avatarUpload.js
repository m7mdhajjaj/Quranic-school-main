/**
 * Avatar Upload Controller
 * Handles user avatar/profile picture uploads and deletion
 */

const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");
const cloudinary = require("../../config/cloudinary");

/**
 * @desc    Upload avatar (Simple - just returns upload URL)
 * @route   POST /api/upload/avatar
 * @access  Private
 */
const uploadAvatarSimple = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "لم يتم رفع أي ملف",
      });
    }

    res.json({
      success: true,
      message: "تم رفع الصورة الشخصية بنجاح",
      url: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء رفع الصورة الشخصية",
      error: error.message,
    });
  }
};

/**
 * @desc    Upload and update user avatar in database
 * @route   POST /api/profile/avatar
 * @access  Private
 */
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "لم يتم رفع أي ملف",
      });
    }

    const userId = req.user.id || req.user._id;
    const userType = req.user.role || "student";

    // Avatar data from Cloudinary (from multer config)
    const avatarData = {
      url: req.file.path,
      publicId: req.file.filename,
    };

    let user;
    if (userType === "student") {
      // Delete old avatar from Cloudinary if exists
      const existingUser = await Student.findById(userId);
      if (existingUser && existingUser.avatar && existingUser.avatar.publicId) {
        try {
          await cloudinary.uploader.destroy(existingUser.avatar.publicId);
        } catch (error) {
          console.warn("Could not delete old avatar:", error);
        }
      }

      user = await Student.findByIdAndUpdate(
        userId,
        { avatar: avatarData },
        { new: true }
      ).select("-password");
    } else if (userType === "admin") {
      // Delete old avatar from Cloudinary if exists
      const existingUser = await Admin.findById(userId);
      if (existingUser && existingUser.avatar && existingUser.avatar.publicId) {
        try {
          await cloudinary.uploader.destroy(existingUser.avatar.publicId);
        } catch (error) {
          console.warn("Could not delete old avatar:", error);
        }
      }

      user = await Admin.findByIdAndUpdate(
        userId,
        { avatar: avatarData },
        { new: true }
      ).select("-password");
    } else {
      // Delete old avatar from Cloudinary if exists
      const existingUser = await Teacher.findById(userId);
      if (existingUser && existingUser.avatar && existingUser.avatar.publicId) {
        try {
          await cloudinary.uploader.destroy(existingUser.avatar.publicId);
        } catch (error) {
          console.warn("Could not delete old avatar:", error);
        }
      }

      user = await Teacher.findByIdAndUpdate(
        userId,
        { avatar: avatarData },
        { new: true }
      ).select("-password");
    }

    res.json({
      success: true,
      message: "تم تحديث الصورة الشخصية بنجاح",
      avatar: avatarData,
      user: user,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);

    // Try to delete the uploaded file from Cloudinary if there was an error
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (deleteError) {
        console.warn("Could not delete uploaded file after error:", deleteError);
      }
    }

    res.status(500).json({
      success: false,
      message: "خطأ في رفع الصورة",
    });
  }
};

/**
 * @desc    Delete user avatar
 * @route   DELETE /api/profile/avatar
 * @access  Private
 */
const deleteAvatar = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userType = req.user.role || "student";

    // Default avatar URL from Cloudinary
    const defaultAvatar = {
      url: "https://res.cloudinary.com/dfi5r4ssx/image/upload/v1/quranic-school/Avatar/default-avatar.jpg",
      publicId: null,
    };

    let user;
    if (userType === "student") {
      const existingUser = await Student.findById(userId);

      // Delete from Cloudinary if exists
      if (existingUser && existingUser.avatar && existingUser.avatar.publicId) {
        try {
          await cloudinary.uploader.destroy(existingUser.avatar.publicId);
        } catch (error) {
          console.warn("Could not delete avatar from Cloudinary:", error);
        }
      }

      user = await Student.findByIdAndUpdate(
        userId,
        { $set: { avatar: defaultAvatar } },
        { new: true }
      ).select("-password");
    } else if (userType === "admin") {
      const existingUser = await Admin.findById(userId);

      // Delete from Cloudinary if exists
      if (existingUser && existingUser.avatar && existingUser.avatar.publicId) {
        try {
          await cloudinary.uploader.destroy(existingUser.avatar.publicId);
        } catch (error) {
          console.warn("Could not delete avatar from Cloudinary:", error);
        }
      }

      user = await Admin.findByIdAndUpdate(
        userId,
        { $set: { avatar: defaultAvatar } },
        { new: true }
      ).select("-password");
    } else {
      const existingUser = await Teacher.findById(userId);

      // Delete from Cloudinary if exists
      if (existingUser && existingUser.avatar && existingUser.avatar.publicId) {
        try {
          await cloudinary.uploader.destroy(existingUser.avatar.publicId);
        } catch (error) {
          console.warn("Could not delete avatar from Cloudinary:", error);
        }
      }

      user = await Teacher.findByIdAndUpdate(
        userId,
        { $set: { avatar: defaultAvatar } },
        { new: true }
      ).select("-password");
    }

    res.json({
      success: true,
      message: "تم حذف الصورة الشخصية بنجاح",
      user: user,
    });
  } catch (error) {
    console.error("Error deleting avatar:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في حذف الصورة",
    });
  }
};

module.exports = {
  uploadAvatarSimple,
  uploadAvatar,
  deleteAvatar,
};
