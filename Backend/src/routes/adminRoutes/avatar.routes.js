// routes/adminRoutes/avatar.routes.js
const express = require("express");
const router = express.Router();
const cloudinary = require("../../config/cloudinary");
const Admin = require("../../schema/Admin");
const { uploadAvatar } = require("../../config/multer");
const { protect } = require("../../middleware/authMiddleware");

/**
 * Avatar Management Routes for Admins
 * Handle upload, get, and delete avatar operations
 */

// ========== Upload Admin Avatar (Cloudinary) ==========
router.post(
  "/:id/avatar",
  protect,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    try {
      console.log("🔐 Admin avatar upload - User:", req.user?.role, req.user?._id);
      
      const admin = await Admin.findById(req.params.id);
      if (!admin) {
        return res
          .status(404)
          .json({ success: false, message: "الإداري غير موجود" });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "لم يتم استلام ملف صورة" });
      }

      // Delete old avatar from Cloudinary if exists
      if (admin.avatar && admin.avatar.publicId) {
        try {
          await cloudinary.uploader.destroy(admin.avatar.publicId);
          console.log("🗑️ Old avatar deleted from Cloudinary");
        } catch (error) {
          console.log("⚠️ Error deleting old avatar:", error);
        }
      }

      // Update avatar with Cloudinary URL and public ID
      console.log("📸 Cloudinary upload successful:");
      console.log("   URL:", req.file.path);
      console.log("   Public ID:", req.file.filename);
      
      await Admin.updateOne(
        { _id: req.params.id },
        {
          $set: {
            avatar: {
              url: req.file.path,
              publicId: req.file.filename,
            },
          },
        }
      );

      // Emit socket event for real-time avatar update
      const io = req.app.get("io");
      if (io) {
        io.to("profile").emit("avatarUpdated", {
          userId: req.params.id,
          userRole: "admin",
          avatarUrl: req.file.path,
          timestamp: Date.now(),
        });
        console.log("📡 Avatar updated event emitted via socket (admin)");
      }

      return res.status(200).json({
        success: true,
        message: "تم رفع الصورة بنجاح",
        avatarUrl: req.file.path,
      });
    } catch (error) {
      console.error("❌ Error uploading admin avatar:", error);
      return res
        .status(500)
        .json({ success: false, message: "خطأ في رفع الصورة" });
    }
  }
);

// ========== Get Admin Avatar URL ==========
router.get("/:id/avatar", protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("avatar");
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "الإداري غير موجود" });
    }

    // Return null if no avatar instead of error
    const avatarUrl = admin.avatar?.url || null;
    res.json({ success: true, avatarUrl });
  } catch (error) {
    console.error("❌ Error getting admin avatar:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطأ في عرض الصورة" });
  }
});

// ========== Delete Admin Avatar ==========
router.delete("/:id/avatar", protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "الإداري غير موجود" });
    }

    if (admin.avatar && admin.avatar.publicId) {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(admin.avatar.publicId);
      console.log("🗑️ Avatar deleted from Cloudinary");

      // Remove avatar completely - Avatar component will show initials
      await Admin.updateOne(
        { _id: req.params.id },
        { $unset: { avatar: "" } }
      );

      // Emit socket event for real-time avatar deletion
      const io = req.app.get("io");
      if (io) {
        io.to("profile").emit("avatarDeleted", {
          userId: req.params.id,
          userRole: "admin",
          timestamp: Date.now(),
        });
        console.log("📡 Avatar deleted event emitted via socket (admin)");
      }

      res.json({ success: true, message: "تم حذف الصورة بنجاح" });
    } else {
      res
        .status(404)
        .json({ success: false, message: "لا توجد صورة لحذفها" });
    }
  } catch (error) {
    console.error("❌ Error deleting admin avatar:", error);
    res.status(500).json({ success: false, message: "خطأ في حذف الصورة" });
  }
});

module.exports = router;
