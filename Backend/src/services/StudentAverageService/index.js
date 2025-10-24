// ============================================================================
// StudentAverageService/index.js - Main Service Entry Point
// ============================================================================

// Import all service functions
const calculateMonthlyAverage = require("./calculateMonthlyAverage");
const getMonthlyAverage = require("./getMonthlyAverage");
const getAllMonthlyAverages = require("./getAllMonthlyAverages");
const calculateOverallAverage = require("./calculateOverallAverage");

// Export all functions
module.exports = {
  // Calculate functions
  calculateAndUpdateMonthlyAverage:
    calculateMonthlyAverage.calculateAndUpdateMonthlyAverage,

  // Get functions
  getMonthlyAverage: getMonthlyAverage.getMonthlyAverage,

  // Get all functions
  getAllMonthlyAverages: getAllMonthlyAverages.getAllMonthlyAverages,
  getAllMonthlyAveragesWithFilter:
    getAllMonthlyAverages.getAllMonthlyAveragesWithFilter,
  getLatestMonthlyAverage: getAllMonthlyAverages.getLatestMonthlyAverage,

  // Calculate overall functions
  calculateOverallAverage: calculateOverallAverage.calculateOverallAverage,
  calculateYearlyAverage: calculateOverallAverage.calculateYearlyAverage,
  compareStudentAverages: calculateOverallAverage.compareStudentAverages,
};
