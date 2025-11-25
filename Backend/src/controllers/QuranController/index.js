/**
 * Quran Module - Main Export
 * Combines all Quran-related controllers
 */

const surahController = require('./surahController');
const userPreferencesController = require('./userPreferencesController');
const audioTimingController = require('./audioTimingController');

module.exports = {
  // Surah endpoints
  ...surahController,
  
  // User preferences endpoints
  ...userPreferencesController,
  
  // Audio timing endpoints
  ...audioTimingController
};
