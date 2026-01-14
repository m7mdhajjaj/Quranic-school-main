/**
 * Avatar Management Controller (Universal)
 * Handles avatar upload/get/delete for all user types (Student, Teacher, Admin)
 * Can be used by ID or by current user
 */

const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");
const { cloudinary } = require("../../config/cloudinary");

/**
 * Helper function to get user model based on role
 */
const getUserModel = (role) => {
  switch (role) {
    case "student":
      return Student;
    case "teacher":
      return Teacher;
    case "admin":
      return Admin;
    default:
      return Student;
  }
};

/**
 * @desc    Upload avatar by user ID
 * @route   POST /api/students/:id/avatar OR /api/teachers/:id/avatar
 * @access  Private
 */
const uploadAvatarById = async (req, res) => {
  try {
    const userId = req.params.id;
    const userRole = req.baseUrl.includes("student")
      ? "student"
      : req.baseUrl.includes("teacher")
      ? "teacher"
      : "admin";

    const UserModel = getUserModel(userRole);
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `${userRole === "student" ? "الطالب" : userRole === "teacher" ? "المعلم" : "المدير"} غير موجود`,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "الرجاء اختيار صورة للرفع",
      });
    }

    // Delete old avatar from Cloudinary if exists
    if (user.avatar && user.avatar.publicId) {
      try {
        await cloudinary.uploader.destroy(user.avatar.publicId);
        console.log("🗑️ Old avatar deleted");
      } catch (error) {
        console.log("⚠️ Error deleting old avatar:", error);
      }
    }

    // Update avatar
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          avatar: {
            url: req.file.path,
            publicId: req.file.filename,
          },
        },
      }
    );

    // Emit socket event if io is available
    const io = req.app.get("io");
    if (io) {
      io.to("profile").emit("avatarUpdated", {
        userId: userId,
        userRole: userRole,
        avatarUrl: req.file.path,
        timestamp: Date.now(),
      });
      console.log(`📡 Avatar updated event emitted (${userRole})`);
    }

    res.status(200).json({
      success: true,
      message: "تم رفع الصورة الشخصية بنجاح",
      avatar: {
        url: req.file.path,
        publicId: req.file.filename,
      },
      avatarUrl: req.file.path,
    });
  } catch (error) {
    console.error("❌ Error uploading avatar:", error);
    
    // Handle specific Cloudinary errors
    if (error.message && error.message.includes('Cloudinary')) {
      return res.status(500).json({
        success: false,
        message: "خطأ في رفع الصورة إلى السيرفر. الرجاء المحاولة مرة أخرى",
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء رفع الصورة",
    });
  }
};

/**
 * @desc    Get avatar by user ID
 * @route   GET /api/students/:id/avatar OR /api/teachers/:id/avatar
 * @access  Private
 */
const getAvatarById = async (req, res) => {
  try {
    const userId = req.params.id;
    const userRole = req.baseUrl.includes("student")
      ? "student"
      : req.baseUrl.includes("teacher")
      ? "teacher"
      : "admin";

    const UserModel = getUserModel(userRole);
    const user = await UserModel.findById(userId).select("avatar");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `${userRole === "student" ? "الطالب" : userRole === "teacher" ? "المعلم" : "المدير"} غير موجود`,
      });
    }

    const avatarUrl = user.avatar?.url || null;
    res.json({ 
      success: true, 
      avatarUrl,
      hasAvatar: !!avatarUrl 
    });
  } catch (error) {
    console.error("❌ Error getting avatar:", error);
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء جلب الصورة",
    });
  }
};

/**
 * @desc    Delete avatar by user ID
 * @route   DELETE /api/students/:id/avatar OR /api/teachers/:id/avatar
 * @access  Private
 */
const deleteAvatarById = async (req, res) => {
  try {
    const userId = req.params.id;
    const userRole = req.baseUrl.includes("student")
      ? "student"
      : req.baseUrl.includes("teacher")
      ? "teacher"
      : "admin";

    const UserModel = getUserModel(userRole);
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `${userRole === "student" ? "الطالب" : userRole === "teacher" ? "المعلم" : "المدير"} غير موجود`,
      });
    }

    if (user.avatar && user.avatar.publicId) {
      // Delete from Cloudinary
      try {
        await cloudinary.uploader.destroy(user.avatar.publicId);
      } catch (error) {
        console.log("⚠️ Error deleting avatar from Cloudinary:", error);
      }

      // Remove from database
      await UserModel.updateOne({ _id: userId }, { $unset: { avatar: "" } });

      // Emit socket event
      const io = req.app.get("io");
      if (io) {
        io.to("profile").emit("avatarDeleted", {
          userId: userId,
          userRole: userRole,
          timestamp: Date.now(),
        });
        console.log(`📡 Avatar deleted event emitted (${userRole})`);
      }

      res.json({ success: true, message: "تم حذف الصورة الشخصية بنجاح" });
    } else {
      res.status(404).json({
        success: false,
        message: "لا توجد صورة شخصية محفوظة",
      });
    }
  } catch (error) {
    console.error("❌ Error deleting avatar:", error);
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء حذف الصورة",
    });
  }
};

module.exports = {
  uploadAvatarById,
  getAvatarById,
  deleteAvatarById,
};
