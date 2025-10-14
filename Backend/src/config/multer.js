const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// Configure Cloudinary storage for activities
const activityStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "quranic-school/activities",
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

module.exports = {
  uploadActivity,
  uploadNews,
};
