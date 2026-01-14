/**
 * Image Delete Controller
 * Handles image deletion from Cloudinary
 */

const { cloudinary } = require("../../config/cloudinary");

/**
 * @desc    Delete image from Cloudinary
 * @route   DELETE /api/upload/:publicId
 * @access  Public
 */
const deleteImage = async (req, res) => {
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
};

module.exports = {
  deleteImage,
};
