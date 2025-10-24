// routes/studentRoutes/avatar.routes.js
const express = require("express");
const router = express.Router();
const cloudinary = require("../../config/cloudinary");
const Student = require("../../schema/Student");
const { uploadAvatar } = require("../../config/multer");
const { protect } = require("../../middleware/authMiddleware");

/**
 * Avatar Management Routes for Students
 */

// Upload student avatar
router.post("/:id/avatar", protect, uploadAvatar.single("avatar"), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "الطالب غير موجود" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "لم يتم استلام ملف صورة" });
    }

    // Delete old avatar from Cloudinary if exists
    if (student.avatar && student.avatar.publicId) {
      try {
        await cloudinary.uploader.destroy(student.avatar.publicId);
        console.log("🗑️ Old avatar deleted");
      } catch (error) {
        console.log("⚠️ Error deleting old avatar:", error);
      }
    }

    // Update avatar
    await Student.updateOne(
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
        userRole: "student",
        avatarUrl: req.file.path,
        timestamp: Date.now(),
      });
      console.log("📡 Avatar updated event emitted (student)");
    }

    res.status(200).json({
      success: true,
      message: "تم رفع الصورة بنجاح",
      avatarUrl: req.file.path,
    });
  } catch (error) {
    console.error("❌ Error uploading student avatar:", error);
    res.status(500).json({ success: false, message: "خطأ في رفع الصورة" });
  }
});

// Get student avatar URL
router.get("/:id/avatar", protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("avatar");
    if (!student) {
      return res.status(404).json({ success: false, message: "الطالب غير موجود" });
    }

    const avatarUrl = student.avatar?.url || null;
    res.json({ success: true, avatarUrl });
  } catch (error) {
    console.error("❌ Error getting student avatar:", error);
    res.status(500).json({ success: false, message: "خطأ في عرض الصورة" });
  }
});

// Delete student avatar
router.delete("/:id/avatar", protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "الطالب غير موجود" });
    }

    if (student.avatar && student.avatar.publicId) {
      await cloudinary.uploader.destroy(student.avatar.publicId);

      await Student.updateOne({ _id: req.params.id }, { $unset: { avatar: "" } });

      // Emit socket event
      const io = req.app.get("io");
      if (io) {
        io.to("profile").emit("avatarDeleted", {
          userId: req.params.id,
          userRole: "student",
          timestamp: Date.now(),
        });
        console.log("📡 Avatar deleted event emitted (student)");
      }

      res.json({ success: true, message: "تم حذف الصورة بنجاح" });
    } else {
      res.status(404).json({ success: false, message: "لا توجد صورة لحذفها" });
    }
  } catch (error) {
    console.error("❌ Error deleting student avatar:", error);
    res.status(500).json({ success: false, message: "خطأ في حذف الصورة" });
  }
});

module.exports = router;
