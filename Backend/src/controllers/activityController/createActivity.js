const Activity = require("../../schema/Activity");
const cloudinary = require("../../config/cloudinary");
const { sendActivityNotifications } = require("./notificationHelper");

/**
 * Create a new activity
 * Handles image upload, validation, and sends notifications
 */
exports.createActivity = async (req, res) => {
  try {
    const { title, description, date, category } = req.body;

    // Validation
    if (!title || !description || !date) {
      return res.status(400).json({
        success: false,
        message: "جميع بيانات النشاط مطلوبة (العنوان، الوصف، التاريخ)",
      });
    }

    let imageUrl = null;
    let imagePublicId = null;

    // Upload image if provided via multer
    if (req.file) {
      try {
        // Image is already uploaded by multer-storage-cloudinary
        imageUrl = req.file.path;
        imagePublicId = req.file.filename;
      } catch (uploadError) {
        console.error("❌ Image upload failed:", uploadError);
        return res.status(400).json({
          success: false,
          message: "فشل تحميل الصورة",
          error: uploadError.message,
        });
      }
    } else {
      imageUrl = "https://placehold.co/600x400/f3e8ff/6b21a8?text=صورة+نشاط";
    }

    const activityData = {
      title: title.trim(),
      description: description.trim(),
      date: date,
      category: category || "رحلة",
      image: imageUrl,
      imagePublicId: imagePublicId,
      tempActivityId: req.tempActivityId,
    };

    const activity = await Activity.create(activityData);

    // Rename Cloudinary folder if needed
    if (req.file && req.tempActivityId) {
      try {
        const oldPublicId = imagePublicId;
        const sanitizedCategory = (category || 'عام').trim().replace(/\s+/g, '_');
        const newPublicId = oldPublicId.replace(
          `activities/${sanitizedCategory}/${req.tempActivityId}`,
          `activities/${sanitizedCategory}/${activity._id}`
        );
        
        const renameResult = await cloudinary.uploader.rename(oldPublicId, newPublicId);
        
        activity.imagePublicId = newPublicId;
        activity.image = renameResult.secure_url;
        await activity.save();
      } catch (renameError) {
        console.error("⚠️ Failed to rename Cloudinary folder:", renameError);
      }
    }

    // Send notifications to all active students
    await sendActivityNotifications(activity, title, date, category);

    res.status(201).json({
      success: true,
      message: "تم إضافة النشاط بنجاح",
      activity,
    });
  } catch (error) {
    console.error("❌ Error creating activity:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إضافة النشاط",
      error: error.message,
    });
  }
};
