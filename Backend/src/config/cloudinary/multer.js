// ============================================================================
// cloudinary/multer.js - إعدادات Multer مع Cloudinary
// ============================================================================

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./config');
const { CLOUDINARY_FOLDERS } = require('./constants');

console.log('🔧 Multer-Cloudinary storage initialized');

// ============================================================================
// News Storage - تخزين صور الأخبار
// ============================================================================
const newsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const userId = req.user?._id || req.body.author || 'unknown';
    const userName = req.user?.firstName
      ? `${req.user.firstName}_${req.user.lastName || ''}`.replace(/\s+/g, '_')
      : req.user?.name?.replace(/\s+/g, '_') || 'unknown_user';

    let newsId;
    if (req.params.id) {
      newsId = req.params.id;
    } else {
      if (!req.tempNewsId) {
        req.tempNewsId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      }
      newsId = req.tempNewsId;
    }

    const imageTimestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);

    return {
      folder: `${CLOUDINARY_FOLDERS.NEWS}/${userName}_${userId}/${newsId}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      public_id: `image_${imageTimestamp}_${randomString}`,
      transformation: [
        {
          width: 1200,
          height: 800,
          crop: 'limit',
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
    };
  },
});

const uploadNews = multer({
  storage: newsStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('يُسمح فقط بملفات الصور (JPG, PNG, GIF, WEBP)'), false);
    }
  },
});

// ============================================================================
// Avatar Storage - تخزين الصور الشخصية
// ============================================================================
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let userSubFolder;

    if (req.user && req.user.role) {
      if (req.user.role === 'admin') {
        userSubFolder = 'Admin';
      } else if (req.user.role === 'student') {
        userSubFolder = 'Students';
      } else if (req.user.role === 'teacher') {
        userSubFolder = 'Teachers';
      }
    }

    if (!userSubFolder) {
      throw new Error('نوع المستخدم غير محدد أو غير صالح');
    }

    return {
      folder: `${CLOUDINARY_FOLDERS.AVATARS}/${userSubFolder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        {
          width: 400,
          height: 400,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
    };
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('يُسمح فقط بملفات الصور (JPG, PNG, GIF, WEBP)'), false);
    }
  },
});

// ============================================================================
// Hero Storage - تخزين الصور البطولية
// ============================================================================
const heroStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: CLOUDINARY_FOLDERS.HEROES,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        {
          width: 1920,
          height: 1080,
          crop: 'limit',
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
    };
  },
});

const uploadHero = multer({
  storage: heroStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('يُسمح فقط بملفات الصور (JPG, PNG, GIF, WEBP)'), false);
    }
  },
});

// ============================================================================
// Logo Storage - تخزين الشعارات
// ============================================================================
const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: CLOUDINARY_FOLDERS.LOGOS,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
      transformation: [
        {
          width: 500,
          height: 500,
          crop: 'limit',
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
    };
  },
});

const uploadLogo = multer({
  storage: logoStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('يُسمح فقط بملفات الصور (JPG, PNG, GIF, WEBP, SVG)'), false);
    }
  },
});

// ============================================================================
// Welcome Video Storage - تخزين فيديو الترحيب
// ============================================================================
const welcomeVideoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: CLOUDINARY_FOLDERS.WELCOME_VIDEO,
      resource_type: 'video',
      allowed_formats: ['mp4', 'webm', 'mov', 'avi'],
      public_id: `Quest_${Date.now()}`,
    };
  },
});

const uploadWelcomeVideo = multer({
  storage: welcomeVideoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('يُسمح فقط بملفات الفيديو (MP4, WebM, MOV, AVI)'), false);
    }
  },
});

// ============================================================================
// Exports
// ============================================================================
module.exports = {
  uploadNews,
  uploadAvatar,
  uploadHero,
  uploadLogo,
  uploadWelcomeVideo,
};
