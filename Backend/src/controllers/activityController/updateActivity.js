const Activity = require("../../schema/Activity");
const cloudinary = require("../../config/cloudinary");
const { sendActivityUpdateNotifications } = require("./notificationHelper");

/**
 * Update activity
 * Updates activity details and image if provided
 */
exports.updateActivity = async (req, res) => {
  try {
    const { title, description, date, category } = req.body;
    const activityId = req.params.id;

    console.log("📝 Updating activity...");
    console.log("📥 Received data:");
    console.log("  - Activity ID:", activityId);
    console.log("  - Title:", title);
    console.log("  - Description length:", description?.length);
    console.log("  - Date:", date);
    console.log("  - Category:", category);
    console.log("  - Has new file:", !!req.file);

    // Get existing activity
    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "النشاط غير موجود",
      });
    }

    // Update fields if provided
    if (title) activity.title = title.trim();
    if (description) activity.description = description.trim();
    if (date) activity.date = date;
    if (category) activity.category = category;

    // Handle image update
    if (req.file) {
      try {
        console.log("📤 New image uploaded to Cloudinary via multer");
        
        // Delete old image from Cloudinary if exists
        if (activity.imagePublicId) {
          try {
            console.log("🗑️ Deleting old image from Cloudinary:", activity.imagePublicId);
            await cloudinary.uploader.destroy(activity.imagePublicId);
            console.log("✅ Old image deleted successfully");
          } catch (deleteError) {
            console.error("⚠️ Failed to delete old image:", deleteError);
            // Continue even if deletion fails
          }
        }

        // Update with new image
        activity.image = req.file.path; // Cloudinary URL
        activity.imagePublicId = req.file.filename; // Cloudinary public ID
        
        console.log("✅ Image updated successfully");
        console.log("  - New URL:", activity.image);
        console.log("  - New Public ID:", activity.imagePublicId);
      } catch (uploadError) {
        console.error("❌ Image upload failed:", uploadError);
        return res.status(400).json({
          success: false,
          message: "فشل تحميل الصورة الجديدة",
          error: uploadError.message,
        });
      }
    }

    await activity.save();

    console.log("✅ Activity updated successfully:", activity._id);

    // Send notifications to all active students (includes Socket.IO broadcast)
    await sendActivityUpdateNotifications(activity, title, date, category);

    res.status(200).json({
      success: true,
      message: "تم تحديث النشاط بنجاح",
      activity,
    });
  } catch (error) {
    console.error("❌ Error updating activity:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث النشاط",
      error: error.message,
    });
  }
};
