const Activity = require("../../schema/Activity");
const cloudinary = require("../../config/cloudinary");

/**
 * Delete activity
 * Removes activity from database, deletes image from Cloudinary, and broadcasts deletion event
 */
exports.deleteActivity = async (req, res) => {
  try {
    console.log("🗑️ Deleting activity:", req.params.id);
    
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ 
        success: false,
        message: "النشاط غير موجود" 
      });
    }

    // Delete image from Cloudinary if it exists
    if (activity.imagePublicId) {
      try {
        console.log("🗑️ Deleting activity image from Cloudinary:", activity.imagePublicId);
        await cloudinary.uploader.destroy(activity.imagePublicId);
        console.log("✅ Activity image deleted from Cloudinary");
      } catch (cloudinaryError) {
        console.error("⚠️ Failed to delete image from Cloudinary:", cloudinaryError);
        // Continue with activity deletion even if image deletion fails
      }
    }

    // Delete the activity from database
    await Activity.findByIdAndDelete(req.params.id);

    console.log("✅ Activity deleted successfully:", req.params.id);

    // Emit Socket.IO event for activity deletion
    if (global.io) {
      console.log("📡 Broadcasting activity deleted event");
      global.io.to("activities").emit("activityDeleted", {
        _id: req.params.id,
        title: activity.title,
      });
    }

    res.status(200).json({ 
      success: true,
      message: "تم حذف النشاط بنجاح" 
    });
  } catch (error) {
    console.error("❌ Error deleting activity:", error);
    res.status(500).json({ 
      success: false,
      message: "حدث خطأ أثناء حذف النشاط", 
      error: error.message 
    });
  }
};
