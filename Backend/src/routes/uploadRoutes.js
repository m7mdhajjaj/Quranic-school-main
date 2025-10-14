const express = require("express");
const router = express.Router();
const { uploadActivity, uploadNews } = require("../config/multer");
const cloudinary = require("../config/cloudinary");

// Upload single activity image
router.post("/activity", uploadActivity.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "لم يتم رفع أي ملف",
      });
    }

    res.json({
      success: true,
      message: "تم رفع الصورة بنجاح",
      url: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء رفع الصورة",
      error: error.message,
    });
  }
});

// Upload single news image
router.post("/news", uploadNews.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "لم يتم رفع أي ملف",
      });
    }

    res.json({
      success: true,
      message: "تم رفع الصورة بنجاح",
      url: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء رفع الصورة",
      error: error.message,
    });
  }
});

// Upload multiple activity images
router.post(
  "/activity/multiple",
  uploadActivity.array("images", 5),
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "لم يتم رفع أي ملفات",
        });
      }

      const urls = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));

      res.json({
        success: true,
        message: `تم رفع ${urls.length} صور بنجاح`,
        files: urls,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء رفع الصور",
        error: error.message,
      });
    }
  }
);

// Upload multiple news images
router.post("/news/multiple", uploadNews.array("images", 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "لم يتم رفع أي ملفات",
      });
    }

    const urls = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    res.json({
      success: true,
      message: `تم رفع ${urls.length} صور بنجاح`,
      files: urls,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء رفع الصور",
      error: error.message,
    });
  }
});

// Delete image from Cloudinary
router.delete("/:publicId", async (req, res) => {
  try {
    const publicId = req.params.publicId;

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      res.json({
        success: true,
        message: "تم حذف الصورة بنجاح",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "الصورة غير موجودة أو تم حذفها مسبقاً",
      });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف الصورة",
      error: error.message,
    });
  }
});

module.exports = router;
