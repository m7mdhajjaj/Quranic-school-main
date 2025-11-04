/**
 * Activity Upload Controller
 * Handles all activity image uploads
 */

/**
 * @desc    Upload single activity image
 * @route   POST /api/upload/activity
 * @access  Public
 */
const uploadActivityImage = async (req, res) => {
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
};

/**
 * @desc    Upload multiple activity images
 * @route   POST /api/upload/activity/multiple
 * @access  Public
 */
const uploadMultipleActivityImages = async (req, res) => {
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
};

module.exports = {
  uploadActivityImage,
  uploadMultipleActivityImages,
};
