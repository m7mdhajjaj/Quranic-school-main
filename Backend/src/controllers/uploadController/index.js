/**
 * Upload Controller - Index
 * Central export point for all upload controllers
 */



// Import News Upload Controllers
const {
  uploadNewsImage,
  uploadMultipleNewsImages,
} = require("./newsUpload");

// Import Hero Upload Controllers
const {
  uploadHeroImage,
  getHeroImage,
  getAllHeroImages,
  deleteHeroImage,
} = require("./heroUpload");

// Import Logo Upload Controllers
const {
  uploadLogo,
  getLogo,
} = require("./logoUpload");

// Import Avatar Upload Controller
const {
  uploadAvatarSimple,
  uploadAvatar,
  deleteAvatar,
} = require("./avatarUpload");

// Import Avatar Management Controller (for by-ID operations)
const {
  uploadAvatarById,
  getAvatarById,
  deleteAvatarById,
} = require("./avatarManagementController");

// Import Image Delete Controller
const {
  deleteImage,
} = require("./imageDelete");

// Export all controllers
module.exports = {

  
  // News Controllers
  uploadNewsImage,
  uploadMultipleNewsImages,
  
  // Hero Controllers
  uploadHeroImage,
  getHeroImage,
  getAllHeroImages,
  deleteHeroImage,
  
  // Logo Controllers
  uploadLogo,
  getLogo,
  
  // Avatar Controllers (current user)
  uploadAvatarSimple,
  uploadAvatar,
  deleteAvatar,
  
  // Avatar Management (by ID)
  uploadAvatarById,
  getAvatarById,
  deleteAvatarById,
  
  // Delete Controller
  deleteImage,
};
