/**
 * Group Validation - Central Export
 */

// Export both old and new validators for backward compatibility
const oldValidators = require('./GroupValidation');
const newValidators = require('./groupValidators');

module.exports = {
  // Old validators (deprecated)
  ...oldValidators,
  
  // New express-validator validators (recommended)
  ...newValidators,
};
