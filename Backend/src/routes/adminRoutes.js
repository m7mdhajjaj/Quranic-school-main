// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");

const Admin = require("../models/Admin");
const controller = require("../controllers/adminController");

// ========== Multer in-memory ==========
const adminAvatarUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/"))
      return cb(null, true);
    cb(new Error("يُسمح فقط بملفات الصور"), false);
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// ========== رفع أفاتار الإداري ==========
router.post(
  "/:id/avatar",
  adminAvatarUpload.single("avatar"),
  async (req, res) => {
    try {
      const admin = await Admin.findById(req.params.id);
      if (!admin)
        return res
          .status(404)
          .json({ success: false, message: "الإداري غير موجود" });
      if (!req.file)
        return res
          .status(400)
          .json({ success: false, message: "لم يتم استلام ملف صورة" });

      await Admin.updateOne(
        { _id: req.params.id },
        {
          $set: {
            avatar: { data: req.file.buffer, contentType: req.file.mimetype },
          },
        }
      );

      return res
        .status(200)
        .json({ success: true, message: "تم حفظ الصورة في قاعدة البيانات" });
    } catch (error) {
      console.error("Error uploading admin avatar:", error);
      return res
        .status(500)
        .json({ success: false, message: "خطأ في رفع الصورة" });
    }
  }
);

// ========== عرض صورة أفاتار الإداري ==========
router.get("/:id/avatar", async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("avatar");
    if (!admin || !admin.avatar || !admin.avatar.data) {
      return res.status(404).send("لا توجد صورة");
    }
    res.set("Content-Type", admin.avatar.contentType || "image/jpeg");
    return res.send(admin.avatar.data);
  } catch (error) {
    console.error("Error serving admin avatar:", error);
    return res.status(500).send("خطأ في عرض الصورة");
  }
});

// ========== باقي المسارات ==========
router.get("/", controller.getAllAdmins);
router.get("/:id", controller.getAdminById);
router.post("/", controller.createAdmin);
router.put("/:id", controller.updateAdmin);
router.delete("/:id", controller.deleteAdmin);

module.exports = router;
