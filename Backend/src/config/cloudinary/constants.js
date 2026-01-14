// ============================================================================
// cloudinary/constants.js - ثوابت Cloudinary
// ============================================================================

// مجلدات Cloudinary
const CLOUDINARY_FOLDERS = {
  // الصور
  AVATARS: 'quranic-school/avatars',
  LOGOS: 'quranic-school/logos',
  HEROES: 'quranic-school/heroes',
  NEWS: 'quranic-school/news',
  
  // الفيديوهات
  VIDEOS: 'quranic-school/videos',
  WELCOME_VIDEO: 'quranic-school/QuestPage',
  
  // الأصوات
  SOUNDS: 'quranic-school/sounds',
};

// خيارات الرفع الافتراضية
const DEFAULT_IMAGE_OPTIONS = {
  resource_type: 'image',
  allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  max_bytes: 10 * 1024 * 1024, // 10MB
  transformation: [
    { quality: 'auto:good' },
    { fetch_format: 'auto' }
  ]
};

const DEFAULT_VIDEO_OPTIONS = {
  resource_type: 'video',
  allowed_formats: ['mp4', 'webm', 'mov', 'avi'],
  max_bytes: 100 * 1024 * 1024, // 100MB
  eager: [
    { width: 1920, height: 1080, crop: 'limit', quality: 'auto' }
  ],
  eager_async: true,
};

// دالة للحصول على خيارات الرفع حسب النوع
const getUploadOptions = (type, folder) => {
  const baseOptions = {
    folder: folder || CLOUDINARY_FOLDERS.AVATARS,
    overwrite: true,
    invalidate: true,
  };
  
  switch (type) {
    case 'avatar':
      return {
        ...baseOptions,
        ...DEFAULT_IMAGE_OPTIONS,
        folder: CLOUDINARY_FOLDERS.AVATARS,
        transformation: [
          { width: 300, height: 300, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      };
      
    case 'logo':
      return {
        ...baseOptions,
        ...DEFAULT_IMAGE_OPTIONS,
        folder: CLOUDINARY_FOLDERS.LOGOS,
      };
      
    case 'hero':
      return {
        ...baseOptions,
        ...DEFAULT_IMAGE_OPTIONS,
        folder: CLOUDINARY_FOLDERS.HEROES,
        transformation: [
          { width: 1920, height: 1080, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      };
      
    case 'news':
      return {
        ...baseOptions,
        ...DEFAULT_IMAGE_OPTIONS,
        folder: CLOUDINARY_FOLDERS.NEWS,
      };
      
    case 'video':
      return {
        ...baseOptions,
        ...DEFAULT_VIDEO_OPTIONS,
        folder: folder || CLOUDINARY_FOLDERS.VIDEOS,
      };
      
    case 'welcome_video':
      return {
        ...baseOptions,
        ...DEFAULT_VIDEO_OPTIONS,
        folder: CLOUDINARY_FOLDERS.WELCOME_VIDEO,
        public_id: `Quest_${Date.now()}`,
      };
      
    default:
      return {
        ...baseOptions,
        ...DEFAULT_IMAGE_OPTIONS,
      };
  }
};

module.exports = {
  CLOUDINARY_FOLDERS,
  DEFAULT_IMAGE_OPTIONS,
  DEFAULT_VIDEO_OPTIONS,
  getUploadOptions,
};
