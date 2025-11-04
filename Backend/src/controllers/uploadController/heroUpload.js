/**
 * Hero Image Upload Controller
 * Handles hero image upload and retrieval
 */

const cloudinary = require("../../config/cloudinary");

/**
 * @desc    Upload hero image
 * @route   POST /api/upload/hero
 * @access  Public
 */
const uploadHeroImage = async (req, res) => {
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
};

/**
 * @desc    Get current hero image
 * @route   GET /api/upload/hero
 * @access  Public
 */
const getHeroImage = async (req, res) => {
  try {
    // Get the list of resources in the Hero folder, sorted by uploaded_at desc
    const result = await cloudinary.search
      .expression("folder:quranic-school/Hero")
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
};

module.exports = {
  uploadHeroImage,
  getHeroImage,
};
