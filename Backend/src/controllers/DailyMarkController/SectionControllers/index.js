// ============================================================================
// SectionController/index.js - Main Controller Entry Point
// ============================================================================

// Import all controllers
const getController = require("./get.controller");
const createController = require("./create.controller");
const updateController = require("./update.controller");
const deleteController = require("./delete.controller");
const repairController = require("./repair.controller");

// Export all functions
module.exports = {
  // Repair operations (AI)
  ...repairController,

  // Get operations
  ...getController,
  
  // Create operations
  ...createController,
  
  // Update operations
  ...updateController,
  
  // Delete operations
  ...deleteController,
};
