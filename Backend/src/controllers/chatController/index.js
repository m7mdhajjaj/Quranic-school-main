// ============================================================================
// ChatController/index.js - Main Controller Entry Point
// ============================================================================

// Import all controllers
const messageController = require("./message.controller");
const userController = require("./user.controller");

// Export all functions
module.exports = {
  // Message operations
  ...messageController,
  
  // User operations
  ...userController,
};
