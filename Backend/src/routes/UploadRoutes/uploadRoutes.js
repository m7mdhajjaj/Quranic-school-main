const express = require("express");
const router = express.Router();
const { uploadActivity, uploadNews, uploadHero, uploadLogo, uploadAvatar } = require("../../config/multer");
const cloudinary = require("../../config/cloudinary");
const { protect } = require("../../middleware/authMiddleware");

// Upload single activity image
router.post("/activity", uploadActivity.single("image"), (req, res) => {
  try {
    console.log("📤 Uploading activity image via upload route...");
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "لم يتم رفع أي ملف",
      });
    }

    console.log("✅ Activity image uploaded successfully");
    console.log("  - URL:", req.file.path);
    console.log("  - Public ID:", req.file.filename);

    res.json({
      success: true,
      message: "تم رفع الصورة بنجاح",
      url: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
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
    console.log("📤 Uploading news image via upload route...");
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "لم يتم رفع أي ملف",
      });
    }

    console.log("✅ News image uploaded successfully");
    console.log("  - URL:", req.file.path);
    console.log("  - Public ID:", req.file.filename);

    res.json({
      success: true,
      message: "تم رفع الصورة بنجاح",
      url: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
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
      console.log("📤 Uploading multiple activity images...");
      
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

      console.log(`✅ Uploaded ${urls.length} activity images successfully`);

      res.json({
        success: true,
        message: `تم رفع ${urls.length} صور بنجاح`,
        files: urls,
      });
    } catch (error) {
      console.error("❌ Upload error:", error);
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
    console.log("📤 Uploading multiple news images...");
    
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

    console.log(`✅ Uploaded ${urls.length} news images successfully`);

    res.json({
      success: true,
      message: `تم رفع ${urls.length} صور بنجاح`,
      files: urls,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء رفع الصور",
      error: error.message,
    });
  }
});

// ============= Hero Image Routes =============

// Upload hero image
router.post("/hero", uploadHero.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "لم يتم رفع أي ملف",
      });
    }

    res.json({
      success: true,
      message: "تم رفع صورة الهيرو بنجاح",
      url: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    console.error("Upload hero error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء رفع صورة الهيرو",
      error: error.message,
    });
  }
});

// Get current hero image (returns the latest uploaded hero image)
router.get("/hero", async (req, res) => {
  try {
    // Get the list of resources in the Hero folder, sorted by uploaded_at desc
    const result = await cloudinary.search
      .expression('folder:quranic-school/Hero')
      .sort_by('uploaded_at', 'desc')
      .max_results(1)
      .execute();

    if (result.resources && result.resources.length > 0) {
      res.json({
        success: true,
        url: result.resources[0].secure_url,
        publicId: result.resources[0].public_id,
      });
    } else {
      res.json({
        success: true,
        url: null,
        message: "لم يتم رفع صورة هيرو بعد",
      });
    }
  } catch (error) {
    console.error("Get hero image error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب صورة الهيرو",
      error: error.message,
    });
  }
});

// ============= Logo Routes =============

// Upload logo
router.post("/logo", uploadLogo.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "لم يتم رفع أي ملف",
      });
    }

    res.json({
      success: true,
      message: "تم رفع اللوغو بنجاح",
      url: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    console.error("Upload logo error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء رفع اللوغو",
      error: error.message,
    });
  }
});

// Get current logo (returns the latest uploaded logo)
router.get("/logo", async (req, res) => {
  try {
    // Get the list of resources in the Logo folder, sorted by uploaded_at desc
    const result = await cloudinary.search
      .expression('folder:quranic-school/Logo')
      .sort_by('uploaded_at', 'desc')
      .max_results(1)
      .execute();

    if (result.resources && result.resources.length > 0) {
      res.json({
        success: true,
        url: result.resources[0].secure_url,
        publicId: result.resources[0].public_id,
      });
    } else {
      res.json({
        success: true,
        url: null,
        message: "لم يتم رفع لوغو بعد",
      });
    }
  } catch (error) {
    console.error("Get logo error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب اللوغو",
      error: error.message,
    });
  }
});

// ============= Avatar Routes =============

// Upload avatar
router.post("/avatar", protect, uploadAvatar.single("image"), (req, res) => {
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
});

// Delete image from Cloudinary
router.delete("/:publicId", async (req, res) => {
  try {
    const publicId = req.params.publicId.replace(/-/g, "/"); // Convert dashes back to slashes
    
    console.log("🗑️ Deleting image from Cloudinary:", publicId);

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      console.log("✅ Image deleted successfully from Cloudinary");
      res.json({
        success: true,
        message: "تم حذف الصورة بنجاح",
      });
    } else {
      console.log("⚠️ Image not found or already deleted");
      res.status(404).json({
        success: false,
        message: "الصورة غير موجودة أو تم حذفها مسبقاً",
      });
    }
  } catch (error) {
    console.error("❌ Delete error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف الصورة",
      error: error.message,
    });
  }
});

module.exports = router;
