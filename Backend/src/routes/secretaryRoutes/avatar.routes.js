// routes/secretaryRoutes/avatar.routes.js
const express = require("express");
const router = express.Router();
const { cloudinary } = require("../../config/cloudinary");
const Secretary = require("../../schema/Secretary");
const { uploadAvatar } = require("../../config/cloudinary");
const { protect, secretaryOrAdminProtect } = require("../../middleware/auth");

/**
 * Avatar Management Routes for Secretaries
 * Handle upload, get, and delete avatar operations
 */

// ========== Upload Secretary Avatar (Cloudinary) ==========
router.post(
  "/:id/avatar",
  secretaryOrAdminProtect,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    try {
      console.log("🔐 Secretary avatar upload - User:", req.user?.role, req.user?._id);
      
      const secretary = await Secretary.findById(req.params.id);
      if (!secretary) {
        return res
          .status(404)
          .json({ success: false, message: "السكرتير غير موجود" });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "لم يتم استلام ملف صورة" });
      }

      // Delete old avatar from Cloudinary if exists
      if (secretary.avatar && secretary.avatar.publicId) {
        try {
          await cloudinary.uploader.destroy(secretary.avatar.publicId);
          console.log("🗑️ Old avatar deleted from Cloudinary");
        } catch (error) {
          console.log("⚠️ Error deleting old avatar:", error);
        }
      }

      // Update avatar with Cloudinary URL and public ID
      console.log("📸 Cloudinary upload successful:");
      console.log("   URL:", req.file.path);
      console.log("   Public ID:", req.file.filename);
      
      await Secretary.updateOne(
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
          userRole: "secretary",
          avatarUrl: req.file.path,
          timestamp: Date.now(),
        });
        console.log("📡 Avatar updated event emitted via socket (secretary)");
      }

      return res.status(200).json({
        success: true,
        message: "تم رفع الصورة بنجاح",
        avatarUrl: req.file.path,
      });
    } catch (error) {
      console.error("❌ Error uploading secretary avatar:", error);
      return res
        .status(500)
        .json({ success: false, message: "خطأ في رفع الصورة" });
    }
  }
);

// ========== Get Secretary Avatar URL ==========
router.get("/:id/avatar", protect, async (req, res) => {
  try {
    const secretary = await Secretary.findById(req.params.id).select("avatar");
    if (!secretary) {
      return res
        .status(404)
        .json({ success: false, message: "السكرتير غير موجود" });
    }

    // Return null if no avatar instead of error
    const avatarUrl = secretary.avatar?.url || null;
    res.json({ success: true, avatarUrl });
  } catch (error) {
    console.error("❌ Error getting secretary avatar:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطأ في عرض الصورة" });
  }
});

// ========== Delete Secretary Avatar ==========
router.delete("/:id/avatar", secretaryOrAdminProtect, async (req, res) => {
  try {
    const secretary = await Secretary.findById(req.params.id);
    if (!secretary) {
      return res
        .status(404)
        .json({ success: false, message: "السكرتير غير موجود" });
    }

    if (secretary.avatar && secretary.avatar.publicId) {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(secretary.avatar.publicId);
      console.log("🗑️ Avatar deleted from Cloudinary");

      // Remove avatar completely - Avatar component will show initials
      await Secretary.updateOne(
        { _id: req.params.id },
        { $unset: { avatar: "" } }
      );

      // Emit socket event for real-time avatar deletion
      const io = req.app.get("io");
      if (io) {
        io.to("profile").emit("avatarDeleted", {
          userId: req.params.id,
          userRole: "secretary",
          timestamp: Date.now(),
        });
        console.log("📡 Avatar deleted event emitted via socket (secretary)");
      }

      res.json({ success: true, message: "تم حذف الصورة بنجاح" });
    } else {
      res
        .status(404)
        .json({ success: false, message: "لا توجد صورة لحذفها" });
    }
  } catch (error) {
    console.error("❌ Error deleting secretary avatar:", error);
    res.status(500).json({ success: false, message: "خطأ في حذف الصورة" });
  }
});

module.exports = router;
