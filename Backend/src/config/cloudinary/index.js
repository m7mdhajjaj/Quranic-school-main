// ============================================================================
// cloudinary/index.js - تصدير موحد لجميع إعدادات Cloudinary
// ============================================================================

const cloudinary = require('./config');
const { 
  uploadToCloudinary, 
  uploadVideoToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl 
} = require('./upload');
const { CLOUDINARY_FOLDERS, getUploadOptions } = require('./constants');
const {
  uploadNews,
  uploadAvatar,
  uploadHero,
  uploadLogo,
  uploadWelcomeVideo,
} = require('./multer');
const { SOUNDS, getSoundUrl, getAllSounds } = require('./sounds');

module.exports = {
  // Cloudinary Instance
  cloudinary,
  
  // Upload Functions
  uploadToCloudinary,
  uploadVideoToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl,
  
  // Constants
  CLOUDINARY_FOLDERS,
  getUploadOptions,
  
  // Multer Instances
  uploadNews,
  uploadAvatar,
  uploadHero,
  uploadLogo,
  uploadWelcomeVideo,
  
  // Sounds
  SOUNDS,
  getSoundUrl,
  getAllSounds,
};
