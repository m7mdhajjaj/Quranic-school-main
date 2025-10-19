const express = require('express');
const router = express.Router();
const quranController = require('../controllers/quranController');

/**
 * Quran Routes
 * Routes for accessing Quran data (Surahs and Ayahs)
 */

// Get all Surahs
router.get('/surahs', quranController.getAllSurahs);

// Get specific Surah with its Ayahs
router.get('/surah/:surahNumber', quranController.getSurahWithAyahs);

// Get specific Ayah
router.get('/ayah/:surahNumber/:ayahNumber', quranController.getAyah);

// Reading Settings (optional authentication - works for guest users too)
router.get('/reading-settings', quranController.getReadingSettings);
router.post('/reading-settings', quranController.saveReadingSettings);

// Bookmarks (optional authentication - works for guest users too)
router.get('/bookmarks', quranController.getBookmarks);
router.post('/bookmarks', quranController.addBookmark);
router.delete('/bookmarks/:id', quranController.removeBookmark);

// Favorite Reciter
router.get('/favorite-reciter', quranController.getFavoriteReciter);
router.post('/favorite-reciter', quranController.saveFavoriteReciter);

// Listening Progress
router.get('/listening-progress/:surahNumber', quranController.getListeningProgress);
router.post('/listening-progress', quranController.saveListeningProgress);

module.exports = router;
