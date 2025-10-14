const Activity = require("../schema/Activity");

// Get all activities
exports.getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ date: -1 }); // Newest first
    res.status(200).json(activities);
  } catch (error) {
    console.error("Error getting activities:", error);
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء جلب الأنشطة", error: error.message });
  }
};

// Get a single activity
exports.getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: "النشاط غير موجود" });
    }

    res.status(200).json(activity);
  } catch (error) {
    console.error("Error getting activity by ID:", error);
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء جلب النشاط", error: error.message });
  }
};

// Create a new activity
exports.createActivity = async (req, res) => {
  try {
    const { title, description, date, category, imageUrl } = req.body;

    console.log("Creating activity with data:", req.body);

    if (!title || !description || !date) {
      return res.status(400).json({
        success: false,
        message: "جميع بيانات النشاط مطلوبة (العنوان، الوصف، التاريخ)",
      });
    }

    // Use the provided Cloudinary URL or a default placeholder
    const finalImageUrl =
      imageUrl && imageUrl.startsWith("http")
        ? imageUrl
        : "https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+نشاط";

    const activityData = {
      title: title.trim(),
      description: description.trim(),
      date: date,
      category: category || "درس",
      image: finalImageUrl,
    };

    console.log("Saving activity with data:", activityData);

    const activity = await Activity.create(activityData); // إرسال إشعار النشاط الجديد لجميع الطلاب
    if (global.notificationService) {
      try {
        // الحصول على جميع الطلاب النشطين
        const Student = require("../schema/Student");
        const activeStudents = await Student.find({ isActive: true });

        // إرسال إشعار لكل طالب
        for (const student of activeStudents) {
          await global.notificationService.createNotification({
            recipient: student._id,
            recipientModel: "Student",
            type: "activity",
            title: "📅 نشاط جديد",
            message: `تم إضافة نشاط جديد: ${title}`,
            priority: "medium",
            data: {
              activityId: activity._id,
              activityTitle: title,
              activityDate: date,
              category: category,
            },
          });
        }

        console.log(
          `Sent new activity notifications to ${activeStudents.length} students`
        );
      } catch (notificationError) {
        console.error(
          "Error sending activity notifications:",
          notificationError
        );
        // لا نريد أن يفشل إنشاء النشاط بسبب مشكلة في الإشعارات
      }
    }

    res.status(201).json({
      success: true,
      message: "تم إضافة النشاط بنجاح",
      activity,
    });
  } catch (error) {
    console.error("Error creating activity:", error);
    console.error("Full error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إضافة النشاط",
      error: error.message,
    });
  }
};

// Update activity
exports.updateActivity = async (req, res) => {
  try {
    const { title, description, date, category, imageUrl } = req.body;
    const activityId = req.params.id;

    console.log("Updating activity with data:", req.body);

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

    // Update image only if a new Cloudinary URL was provided
    if (imageUrl && imageUrl.startsWith("http")) {
      activity.image = imageUrl;
    }

    await activity.save();

    res.status(200).json({
      success: true,
      message: "تم تحديث النشاط بنجاح",
      activity,
    });
  } catch (error) {
    console.error("Error updating activity:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث النشاط",
      error: error.message,
    });
  }
};

// Delete activity
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: "النشاط غير موجود" });
    }

    // Delete the activity from database
    await Activity.findByIdAndDelete(req.params.id);

    // Note: Deleting the image from Cloudinary should be handled separately
    // via the /api/upload route if needed.

    res.status(200).json({ message: "تم حذف النشاط بنجاح" });
  } catch (error) {
    console.error("Error deleting activity:", error);
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء حذف النشاط", error: error.message });
  }
};
