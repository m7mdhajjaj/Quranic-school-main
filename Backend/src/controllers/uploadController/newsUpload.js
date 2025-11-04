/**
 * News Upload Controller
 * Handles all news image uploads
 */

/**
 * @desc    Upload single news image
 * @route   POST /api/upload/news
 * @access  Public
 */
const uploadNewsImage = async (req, res) => {
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
};

/**
 * @desc    Upload multiple news images
 * @route   POST /api/upload/news/multiple
 * @access  Public
 */
const uploadMultipleNewsImages = async (req, res) => {
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
};

module.exports = {
  uploadNewsImage,
  uploadMultipleNewsImages,
};
