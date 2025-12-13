/**
 * Profile Controller - Index
 * Central export point for all profile-related controllers
 */

// Import Get Profile Controller
const { getUserProfile } = require("./getProfile");

// Import Update Profile Controller
const { updateUserProfile } = require("./updateProfile");

// Import Get User By ID Controller
const { getUserById } = require("./getUserById");

// Import Get User Status Controller
const { getUserStatus } = require("./getUserStatus");

// Import Check Duplicate Controller
const { checkDuplicate } = require("./checkDuplicate");

// Import Get Edit Limits Controller
const { getEditLimits } = require("./getEditLimits");

// Export all controllers
module.exports = {
  // Get Profile
  getUserProfile,
  
  // Update Profile
  updateUserProfile,
  
  // Get User By ID
  getUserById,
  
  // Get User Status
  getUserStatus,
  
  // Check Duplicate
  checkDuplicate,
  
  // Get Edit Limits
  getEditLimits,
};
