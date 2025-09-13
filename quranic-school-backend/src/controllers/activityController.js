const Activity = require("../models/Activity");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for activity images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../public/uploads/activities");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log("Activity image will be uploaded to:", uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    const filename = "activity-" + uniqueSuffix + fileExt;
    console.log("Generated filename for activity image:", filename);
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit to accommodate larger images
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("فقط ملفات الصور مسموح بها!"));
    }
  },
});

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
    const { title, description, date, category } = req.body;
    console.log("Creating activity with:", {
      title,
      description,
      date,
      category,
    });
    console.log("Uploaded file:", req.file);

    if (!title || !description || !date || !category) {
      return res.status(400).json({ message: "جميع بيانات النشاط مطلوبة" });
    }

    let imageUrl = "https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+نشاط";

    // If file was uploaded, use its path
    if (req.file) {
      imageUrl = `uploads/activities/${req.file.filename}`;
      console.log("Activity image URL saved:", imageUrl);
    }

    const activity = await Activity.create({
      title,
      description,
      date,
      category,
      image: imageUrl,
    });

    // إرسال إشعار النشاط الجديد لجميع الطلاب
    if (global.notificationService) {
      try {
        // الحصول على جميع الطلاب النشطين
        const Student = require("../models/Student");
        const activeStudents = await Student.find({ isActive: true });
        
        // إرسال إشعار لكل طالب
        for (const student of activeStudents) {
          await global.notificationService.createNotification({
            recipient: student._id,
            recipientModel: 'Student',
            type: 'activity',
            title: '📅 نشاط جديد',
            message: `تم إضافة نشاط جديد: ${title}`,
            priority: 'medium',
            data: {
              activityId: activity._id,
              activityTitle: title,
              activityDate: date,
              category: category
            }
          });
        }
        
        console.log(`Sent new activity notifications to ${activeStudents.length} students`);
      } catch (notificationError) {
        console.error('Error sending activity notifications:', notificationError);
        // لا نريد أن يفشل إنشاء النشاط بسبب مشكلة في الإشعارات
      }
    }

    res.status(201).json({
      message: "تم إضافة النشاط بنجاح",
      activity,
    });
  } catch (error) {
    console.error("Error creating activity:", error);
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء إضافة النشاط", error: error.message });
  }
};

// Update activity
exports.updateActivity = async (req, res) => {
  try {
    const { title, description, date, category } = req.body;
    const activityId = req.params.id;

    // Get existing activity
    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({ message: "النشاط غير موجود" });
    }

    // Update fields if provided
    if (title) activity.title = title;
    if (description) activity.description = description;
    if (date) activity.date = date;
    if (category) activity.category = category;

    // Update image if a new file was uploaded
    if (req.file) {
      activity.image = `uploads/activities/${req.file.filename}`;
    }

    await activity.save();

    res.status(200).json({
      message: "تم تحديث النشاط بنجاح",
      activity,
    });
  } catch (error) {
    console.error("Error updating activity:", error);
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء تحديث النشاط", error: error.message });
  }
};

// Delete activity
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: "النشاط غير موجود" });
    }

    // Delete the activity
    await Activity.findByIdAndDelete(req.params.id);

    // TODO: Delete associated image file from the filesystem if it's not a placeholder
    // This requires more complex code to safely delete files and handle errors

    res.status(200).json({ message: "تم حذف النشاط بنجاح" });
  } catch (error) {
    console.error("Error deleting activity:", error);
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء حذف النشاط", error: error.message });
  }
};

// Upload middleware for activity image
exports.uploadActivityImage = upload.single("image");
