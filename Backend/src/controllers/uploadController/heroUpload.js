/**
 * Hero Image Upload Controller
 * Handles hero image upload and retrieval
 */

const { cloudinary } = require("../../config/cloudinary");

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
 * @desc    Get current hero image (latest one)
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

/**
 * @desc    Get all hero images for carousel
 * @route   GET /api/upload/hero/all
 * @access  Public
 */
const getAllHeroImages = async (req, res) => {
  try {
    // Get all resources in the Hero folder, sorted by uploaded_at desc
    const result = await cloudinary.search
      .expression("folder:quranic-school/Hero")
      .sort_by("uploaded_at", "desc")
      .max_results(10) // Maximum 10 images for carousel
      .execute();

    if (result.resources && result.resources.length > 0) {
      const images = result.resources.map((resource) => ({
        url: resource.secure_url,
        publicId: resource.public_id,
        width: resource.width,
        height: resource.height,
        createdAt: resource.created_at,
      }));

      res.json({
        success: true,
        images,
        total: images.length,
      });
    } else {
      res.json({
        success: true,
        images: [],
        total: 0,
        message: "لم يتم رفع صور هيرو بعد",
      });
    }
  } catch (error) {
    console.error("Get all hero images error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب صور الهيرو",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a hero image
 * @route   DELETE /api/upload/hero/:publicId
 * @access  Admin/Teacher
 */
const deleteHeroImage = async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "معرف الصورة مطلوب",
      });
    }

    // Decode the publicId (it may be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);

    const result = await cloudinary.uploader.destroy(decodedPublicId);

    if (result.result === "ok") {
      res.json({
        success: true,
        message: "تم حذف الصورة بنجاح",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "فشل في حذف الصورة",
      });
    }
  } catch (error) {
    console.error("Delete hero image error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف الصورة",
      error: error.message,
    });
  }
};

module.exports = {
  uploadHeroImage,
  getHeroImage,
  getAllHeroImages,
  deleteHeroImage,
};
