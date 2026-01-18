/**
 * Avatar Management Controller (Universal)
 * Handles avatar upload/get/delete for all user types (Student, Teacher, Admin, Secretary, TeacherAssistant)
 * Can be used by ID or by current user
 */

const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");
const Secretary = require("../../schema/Secretary");
const TeacherAssistant = require("../../schema/TeacherAssistant");
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
    case "secretary":
      return Secretary;
    case "teacherAssistant":
      return TeacherAssistant;
    default:
      return Student;
  }
};

/**
 * Helper function to get role from baseUrl
 */
const getRoleFromBaseUrl = (baseUrl) => {
  // Check teacher-assistant FIRST (before teacher to avoid false match)
  if (baseUrl.includes("teacher-assistant")) return "teacherAssistant";
  if (baseUrl.includes("student")) return "student";
  if (baseUrl.includes("teacher")) return "teacher";
  if (baseUrl.includes("secretar")) return "secretary";
  if (baseUrl.includes("admin")) return "admin";
  return "student";
};

/**
 * Helper function to get Arabic role name
 */
const getArabicRoleName = (role) => {
  switch (role) {
    case "student": return "الطالب";
    case "teacher": return "المعلم";
    case "admin": return "المدير";
    case "secretary": return "السكرتير";
    case "teacherAssistant": return "مساعد المدرس";
    default: return "المستخدم";
  }
};

/**
 * @desc    Upload avatar by user ID
 * @route   POST /api/students/:id/avatar OR /api/teachers/:id/avatar OR /api/teacher-assistants/:id/avatar
 * @access  Private
 */
const uploadAvatarById = async (req, res) => {
  try {
    const userId = req.params.id;
    const userRole = getRoleFromBaseUrl(req.baseUrl);
    
    console.log(`📸 Avatar upload request: baseUrl=${req.baseUrl}, role=${userRole}, userId=${userId}`);

    const UserModel = getUserModel(userRole);
    
    if (!UserModel) {
      console.error(`❌ No model found for role: ${userRole}`);
      return res.status(500).json({
        success: false,
        message: "خطأ في تحديد نوع المستخدم",
      });
    }
    
    const user = await UserModel.findById(userId);

    if (!user) {
      console.log(`❌ User not found: ${userId} (role: ${userRole})`);
      return res.status(404).json({
        success: false,
        message: `${getArabicRoleName(userRole)} غير موجود`,
      });
    }

    if (!req.file) {
      console.log(`❌ No file uploaded for user: ${userId}`);
      return res.status(400).json({
        success: false,
        message: "الرجاء اختيار صورة للرفع",
      });
    }
    
    console.log(`✅ File received: ${req.file.filename}, path: ${req.file.path}`);

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
 * @route   GET /api/students/:id/avatar OR /api/teachers/:id/avatar OR /api/teacher-assistants/:id/avatar
 * @access  Private
 */
const getAvatarById = async (req, res) => {
  try {
    const userId = req.params.id;
    const userRole = getRoleFromBaseUrl(req.baseUrl);

    const UserModel = getUserModel(userRole);
    const user = await UserModel.findById(userId).select("avatar");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `${getArabicRoleName(userRole)} غير موجود`,
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
 * @route   DELETE /api/students/:id/avatar OR /api/teachers/:id/avatar OR /api/teacher-assistants/:id/avatar
 * @access  Private
 */
const deleteAvatarById = async (req, res) => {
  try {
    const userId = req.params.id;
    const userRole = getRoleFromBaseUrl(req.baseUrl);

    const UserModel = getUserModel(userRole);
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `${getArabicRoleName(userRole)} غير موجود`,
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
