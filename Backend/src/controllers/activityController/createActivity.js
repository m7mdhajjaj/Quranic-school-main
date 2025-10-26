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

    console.log("📝 Creating new activity...");
    console.log("📥 Received data:");
    console.log("  - Title:", title);
    console.log("  - Description length:", description?.length);
    console.log("  - Date:", date);
    console.log("  - Category:", category);
    console.log("  - Has file:", !!req.file);

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
        console.log("📤 Uploading image to Cloudinary via multer...");
        
        // Image is already uploaded by multer-storage-cloudinary
        imageUrl = req.file.path; // Cloudinary URL
        imagePublicId = req.file.filename; // Cloudinary public ID
        
        console.log("✅ Image uploaded successfully");
        console.log("  - URL:", imageUrl);
        console.log("  - Public ID:", imagePublicId);
        console.log("  - Temp Activity ID:", req.tempActivityId);
      } catch (uploadError) {
        console.error("❌ Image upload failed:", uploadError);
        return res.status(400).json({
          success: false,
          message: "فشل تحميل الصورة",
          error: uploadError.message,
        });
      }
    } else {
      // Use default placeholder if no image provided
      imageUrl = "https://placehold.co/600x400/f3e8ff/6b21a8?text=صورة+نشاط";
      console.log("⚠️ No image provided, using placeholder");
    }

    const activityData = {
      title: title.trim(),
      description: description.trim(),
      date: date,
      category: category || "رحلة",
      image: imageUrl,
      imagePublicId: imagePublicId,
      tempActivityId: req.tempActivityId, // حفظ المعرف المؤقت للصورة
    };

    console.log("💾 Saving activity with data:", activityData);

    const activity = await Activity.create(activityData);

    console.log("✅ Activity created successfully:", activity._id);
    
    // إذا كان هناك صورة مع معرف مؤقت، نحتاج لإعادة تسمية المجلد في Cloudinary
    if (req.file && req.tempActivityId) {
      try {
        console.log("🔄 Renaming Cloudinary folder from temp ID to actual ID...");
        const oldPublicId = imagePublicId;
        const sanitizedCategory = (category || 'عام').trim().replace(/\s+/g, '_');
        const newPublicId = oldPublicId.replace(
          `activities/${sanitizedCategory}/${req.tempActivityId}`,
          `activities/${sanitizedCategory}/${activity._id}`
        );
        
        // إعادة تسمية الصورة في Cloudinary
        const renameResult = await cloudinary.uploader.rename(oldPublicId, newPublicId);
        
        // تحديث النشاط بالمعرف الجديد
        activity.imagePublicId = newPublicId;
        activity.image = renameResult.secure_url;
        await activity.save();
        
        console.log("✅ Cloudinary folder renamed successfully");
        console.log("  - Old ID:", oldPublicId);
        console.log("  - New ID:", newPublicId);
      } catch (renameError) {
        console.error("⚠️ Failed to rename Cloudinary folder:", renameError);
        // نكمل حتى لو فشلت إعادة التسمية
      }
    }

    // Send notifications to all active students (includes Socket.IO broadcast)
    await sendActivityNotifications(activity, title, date, category);

    res.status(201).json({
      success: true,
      message: "تم إضافة النشاط بنجاح",
      activity,
    });
  } catch (error) {
    console.error("❌ Error creating activity:", error);
    console.error("Full error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إضافة النشاط",
      error: error.message,
    });
  }
};
