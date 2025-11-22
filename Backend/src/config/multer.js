const multer = require("multer");
const CloudinaryStorage = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// Configure Cloudinary storage for activities with dynamic folders
const activityStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // الحصول على التصنيف من البيانات المرسلة
    const category = req.body.category || 'عام';
    
    // الحصول على معرف النشاط (للتعديل) أو استخدام timestamp (للإضافة)
    // عند الإضافة، سنستخدم timestamp كمعرف مؤقت ثم نعيد تسمية المجلد لاحقاً
    let activityIdentifier;
    
    if (req.params.id) {
      // عند التعديل: استخدم ID الموجود
      activityIdentifier = req.params.id;
    } else {
      // عند الإضافة: استخدم timestamp + random للتفرد
      activityIdentifier = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // حفظ المعرف المؤقت في req لاستخدامه لاحقاً
      req.tempActivityId = activityIdentifier;
    }
    
    // تنظيف اسم التصنيف ليكون مناسباً كاسم مجلد
    const sanitizedCategory = category.trim().replace(/\s+/g, '_');
    
    return {
      folder: `quranic-school/activities/${sanitizedCategory}/${activityIdentifier}`,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      transformation: [
        {
          width: 1200,
          height: 800,
          crop: "limit",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    };
  },
});

// Configure Cloudinary storage for news
const newsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "quranic-school/news",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      {
        width: 1200,
        height: 800,
        crop: "limit",
        quality: "auto",
        fetch_format: "auto",
      },
    ],
  },
});

// Create multer upload instances
const uploadActivity = multer({
  storage: activityStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("يجب أن يكون الملف صورة فقط!"), false);
    }
  },
});

const uploadNews = multer({
  storage: newsStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("يجب أن يكون الملف صورة فقط!"), false);
    }
  },
});

// Configure Cloudinary storage for avatars with dynamic folders
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // تحديد المجلد الفرعي حسب نوع المستخدم داخل مجلد Avatar
    let userSubFolder;
    
    if (req.user && req.user.role) {
      if (req.user.role === "admin") {
        userSubFolder = "Admin";
      } else if (req.user.role === "student") {
        userSubFolder = "Students";
      } else if (req.user.role === "teacher") {
        userSubFolder = "Teachers";
      }
    }

    // إذا لم يتم تحديد role صحيح، ارجع خطأ
    if (!userSubFolder) {
      throw new Error("نوع المستخدم غير محدد أو غير صالح");
    }

    return {
      folder: `quranic-school/Avatar/${userSubFolder}`,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      transformation: [
        {
          width: 400,
          height: 400,
          crop: "fill",
          gravity: "face",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    };
  },
});

// Create multer upload instance for avatars
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("يُسمح فقط بملفات الصور!"), false);
    }
  },
});

// Configure Cloudinary storage for hero images
const heroStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "quranic-school/Hero",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      {
        width: 1920,
        height: 1080,
        crop: "limit",
        quality: "auto",
        fetch_format: "auto",
      },
    ],
  },
});

// Create multer upload instance for hero images
const uploadHero = multer({
  storage: heroStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("يجب أن يكون الملف صورة فقط!"), false);
    }
  },
});

// Configure Cloudinary storage for logo
const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "quranic-school/Logo",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
    transformation: [
      {
        width: 500,
        height: 500,
        crop: "limit",
        quality: "auto",
        fetch_format: "auto",
      },
    ],
  },
});

// Create multer upload instance for logo
const uploadLogo = multer({
  storage: logoStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("يجب أن يكون الملف صورة فقط!"), false);
    }
  },
});

module.exports = {
  uploadActivity,
  uploadNews,
  uploadAvatar,
  uploadHero,
  uploadLogo,
};
