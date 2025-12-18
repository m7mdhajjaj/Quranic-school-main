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
        // Delete old image from Cloudinary if exists
        if (activity.imagePublicId) {
          try {
            await cloudinary.uploader.destroy(activity.imagePublicId);
          } catch (deleteError) {
            console.error("⚠️ Failed to delete old image:", deleteError);
          }
        }

        // Update with new image
        activity.image = req.file.path;
        activity.imagePublicId = req.file.filename;
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

    // Send notifications to all active students
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
