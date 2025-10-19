// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");

const Admin = require("../schema/Admin");
const controller = require("../controllers/adminController");
const { validateAdminData } = require("../Validation/AdminValidation");
const { uploadAvatar } = require("../config/multer");
const { protect } = require("../middleware/authMiddleware");

// ========== رفع أفاتار الإداري (Cloudinary) - UPDATED ==========
router.post(
  "/:id/avatar",
  protect,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    try {
      console.log("🔐 Admin avatar upload - User:", req.user?.role, req.user?._id);
      
      const admin = await Admin.findById(req.params.id);
      if (!admin)
        return res
          .status(404)
          .json({ success: false, message: "الإداري غير موجود" });
      if (!req.file)
        return res
          .status(400)
          .json({ success: false, message: "لم يتم استلام ملف صورة" });

      // Delete old avatar from Cloudinary if exists
      if (admin.avatar && admin.avatar.publicId) {
        try {
          await cloudinary.uploader.destroy(admin.avatar.publicId);
        } catch (error) {
          console.log("Error deleting old avatar:", error);
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

      return res
        .status(200)
        .json({
          success: true,
          message: "تم رفع الصورة بنجاح",
          avatarUrl: req.file.path,
        });
    } catch (error) {
      console.error("Error uploading admin avatar:", error);
      return res
        .status(500)
        .json({ success: false, message: "خطأ في رفع الصورة" });
    }
  }
);

// ========== عرض رابط صورة أفاتار الإداري ==========
router.get("/:id/avatar", protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("avatar");
    if (!admin) {
      return res.status(404).json({ success: false, message: "الإداري غير موجود" });
    }
    // إذا ما في صورة، نرجع null بدل error
    const avatarUrl = admin.avatar?.url || null;
    res.json({ success: true, avatarUrl });
  } catch (error) {
    console.error("Error getting admin avatar:", error);
    return res.status(500).json({ success: false, message: "خطأ في عرض الصورة" });
  }
});

// ========== حذف أفاتار الإداري ==========
router.delete("/:id/avatar", protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin)
      return res.status(404).json({ success: false, message: "الإداري غير موجود" });

    if (admin.avatar && admin.avatar.publicId) {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(admin.avatar.publicId);

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
      res.status(404).json({ success: false, message: "لا توجد صورة لحذفها" });
    }
  } catch (error) {
    console.error("Error deleting admin avatar:", error);
    res.status(500).json({ success: false, message: "خطأ في حذف الصورة" });
  }
});

// ========== باقي المسارات ==========
router.get("/", controller.getAllAdmins);
router.get("/stats", controller.getAdminStats);
router.get("/:id", controller.getAdminById);
router.post("/", validateAdminData, controller.createAdmin);
router.put("/:id", validateAdminData, controller.updateAdmin);
router.delete("/:id", controller.deleteAdmin);

module.exports = router;
