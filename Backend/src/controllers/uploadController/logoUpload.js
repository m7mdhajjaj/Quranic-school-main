/**
 * Logo Upload Controller
 * Handles logo upload and retrieval
 */

const cloudinary = require("../../config/cloudinary");

/**
 * @desc    Upload logo
 * @route   POST /api/upload/logo
 * @access  Public
 */
const uploadLogo = async (req, res) => {
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
};

/**
 * @desc    Get current logo
 * @route   GET /api/upload/logo
 * @access  Public
 */
const getLogo = async (req, res) => {
  try {
    // Get the list of resources in the Logo folder, sorted by uploaded_at desc
    const result = await cloudinary.search
      .expression("folder:quranic-school/Logo")
      .sort_by("uploaded_at", "desc")
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
};

module.exports = {
  uploadLogo,
  getLogo,
};
