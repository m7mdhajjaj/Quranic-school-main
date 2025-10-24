// routes/teacherRoutes/avatar.routes.js
const express = require("express");
const router = express.Router();
const cloudinary = require("../../config/cloudinary");
const Teacher = require("../../schema/Teacher");
const { uploadAvatar } = require("../../config/multer");
const { protect } = require("../../middleware/authMiddleware");

/**
 * Avatar Management Routes for Teachers
 */

// Upload teacher avatar
router.post("/:id/avatar", protect, uploadAvatar.single("avatar"), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "المعلم غير موجود" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "لم يتم استلام ملف صورة" });
    }

    // Delete old avatar from Cloudinary if exists
    if (teacher.avatar && teacher.avatar.publicId) {
      try {
        await cloudinary.uploader.destroy(teacher.avatar.publicId);
        console.log("🗑️ Old avatar deleted");
      } catch (error) {
        console.log("⚠️ Error deleting old avatar:", error);
      }
    }

    // Update avatar
    await Teacher.updateOne(
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

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.to("profile").emit("avatarUpdated", {
        userId: req.params.id,
        userRole: "teacher",
        avatarUrl: req.file.path,
        timestamp: Date.now(),
      });
      console.log("📡 Avatar updated event emitted (teacher)");
    }

    return res.status(200).json({
      success: true,
      message: "تم رفع الصورة بنجاح",
      avatarUrl: req.file.path,
    });
  } catch (error) {
    console.error("❌ Error uploading teacher avatar:", error);
    return res.status(500).json({ success: false, message: "خطأ في رفع الصورة" });
  }
});

// Get teacher avatar URL
router.get("/:id/avatar", protect, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select("avatar");
    if (!teacher) {
      return res.status(404).json({ success: false, message: "المعلم غير موجود" });
    }

    const avatarUrl = teacher.avatar?.url || null;
    res.json({ success: true, avatarUrl });
  } catch (error) {
    console.error("❌ Error getting teacher avatar:", error);
    return res.status(500).json({ success: false, message: "خطأ في عرض الصورة" });
  }
});

// Delete teacher avatar
router.delete("/:id/avatar", protect, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "المعلم غير موجود" });
    }

    if (teacher.avatar && teacher.avatar.publicId) {
      await cloudinary.uploader.destroy(teacher.avatar.publicId);

      await Teacher.updateOne({ _id: req.params.id }, { $unset: { avatar: "" } });

      // Emit socket event
      const io = req.app.get("io");
      if (io) {
        io.to("profile").emit("avatarDeleted", {
          userId: req.params.id,
          userRole: "teacher",
          timestamp: Date.now(),
        });
        console.log("📡 Avatar deleted event emitted (teacher)");
      }

      res.json({ success: true, message: "تم حذف الصورة بنجاح" });
    } else {
      res.status(404).json({ success: false, message: "لا توجد صورة لحذفها" });
    }
  } catch (error) {
    console.error("❌ Error deleting teacher avatar:", error);
    res.status(500).json({ success: false, message: "خطأ في حذف الصورة" });
  }
});

module.exports = router;
