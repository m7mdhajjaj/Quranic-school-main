const axios = require('axios');

/**
 * Quran Controller - Proxy to external Quran API
 * This controller fetches Quran data from external API (alquran.cloud)
 * and can be extended to cache data in the database if needed
 */

// Get all Surahs
exports.getAllSurahs = async (req, res) => {
  try {
    const response = await axios.get('https://api.alquran.cloud/v1/surah');
    res.json(response.data.data);
  } catch (error) {
    console.error('Error fetching surahs:', error.message);
    res.status(500).json({ 
      message: 'Failed to fetch surahs',
      error: error.message 
    });
  }
};

// Get specific Surah with its Ayahs
exports.getSurahWithAyahs = async (req, res) => {
  try {
    const { surahNumber } = req.params;
    
    if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
      return res.status(400).json({ 
        message: 'Invalid surah number. Must be between 1 and 114' 
      });
    }

    const response = await axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
    const data = response.data.data;
    
    res.json({
      surah: {
        number: data.number,
        name: data.name,
        englishName: data.englishName,
        numberOfAyahs: data.numberOfAyahs,
      },
      ayahs: data.ayahs.map(ayah => ({
        ...ayah,
        surahNumber: parseInt(surahNumber),
      }))
    });
  } catch (error) {
    console.error(`Error fetching surah ${req.params.surahNumber}:`, error.message);
    res.status(500).json({ 
      message: 'Failed to fetch surah',
      error: error.message 
    });
  }
};

// Get specific Ayah
exports.getAyah = async (req, res) => {
  try {
    const { surahNumber, ayahNumber } = req.params;
    
    if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
      return res.status(400).json({ 
        message: 'Invalid surah number. Must be between 1 and 114' 
      });
    }

    const response = await axios.get(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}`);
    res.json(response.data.data);
  } catch (error) {
    console.error(`Error fetching ayah ${req.params.surahNumber}:${req.params.ayahNumber}:`, error.message);
    res.status(500).json({ 
      message: 'Failed to fetch ayah',
      error: error.message 
    });
  }
};

// In-memory storage for reading settings (can be moved to database later)
const readingSettings = new Map();
const bookmarks = new Map(); // Store bookmarks by userId
const favoriteReciters = new Map(); // Store favorite reciter by userId
const listeningProgress = new Map(); // Store listening progress by userId

// Get reading settings for a user
exports.getReadingSettings = async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const settings = readingSettings.get(userId) || {
      fontSize: 18,
      theme: 'light',
      ayahsPerPage: 10
    };
    
    res.json({ settings });
  } catch (error) {
    console.error('Error getting reading settings:', error.message);
    res.status(500).json({ 
      message: 'Failed to get reading settings',
      error: error.message 
    });
  }
};

// Save reading settings for a user
exports.saveReadingSettings = async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const { settings } = req.body;
    
    if (!settings) {
      return res.status(400).json({ 
        message: 'Settings are required' 
      });
    }
    
    // Validate settings
    const validSettings = {
      fontSize: settings.fontSize || 18,
      theme: settings.theme || 'light',
      ayahsPerPage: settings.ayahsPerPage || 10
    };
    
    readingSettings.set(userId, validSettings);
    
    res.json({ 
      success: true,
      message: 'Settings saved successfully',
      settings: validSettings
    });
  } catch (error) {
    console.error('Error saving reading settings:', error.message);
    res.status(500).json({ 
      message: 'Failed to save reading settings',
      error: error.message 
    });
  }
};

// Get bookmarks for a user
exports.getBookmarks = async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const userBookmarks = bookmarks.get(userId) || [];
    
    res.json({ bookmarks: userBookmarks });
  } catch (error) {
    console.error('Error getting bookmarks:', error.message);
    res.status(500).json({ 
      message: 'Failed to get bookmarks',
      error: error.message 
    });
  }
};

// Add bookmark
exports.addBookmark = async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const { surah, ayah } = req.body;
    
    // Check if surah and ayah are provided and are valid numbers
    if (typeof surah !== 'number' || typeof ayah !== 'number' || surah < 1 || ayah < 1) {
      return res.status(400).json({ 
        message: 'Valid Surah and Ayah numbers are required' 
      });
    }
    
    const userBookmarks = bookmarks.get(userId) || [];
    
    // Check if bookmark already exists
    const exists = userBookmarks.some(
      b => b.surah === surah && b.ayah === ayah
    );
    
    if (exists) {
      // Don't return error, just return success with existing bookmark
      const existingBookmark = userBookmarks.find(
        b => b.surah === surah && b.ayah === ayah
      );
      return res.json({ 
        success: true,
        message: 'Bookmark already exists',
        bookmark: existingBookmark
      });
    }
    
    const newBookmark = {
      id: Date.now(),
      surah,
      ayah,
      createdAt: new Date().toISOString()
    };
    
    userBookmarks.push(newBookmark);
    bookmarks.set(userId, userBookmarks);
    
    res.json({ 
      success: true,
      message: 'Bookmark added successfully',
      bookmark: newBookmark
    });
  } catch (error) {
    console.error('Error adding bookmark:', error.message);
    res.status(500).json({ 
      message: 'Failed to add bookmark',
      error: error.message 
    });
  }
};

// Remove bookmark
exports.removeBookmark = async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const { id } = req.params;
    
    const userBookmarks = bookmarks.get(userId) || [];
    const filteredBookmarks = userBookmarks.filter(b => b.id !== parseInt(id));
    
    bookmarks.set(userId, filteredBookmarks);
    
    res.json({ 
      success: true,
      message: 'Bookmark removed successfully'
    });
  } catch (error) {
    console.error('Error removing bookmark:', error.message);
    res.status(500).json({ 
      message: 'Failed to remove bookmark',
      error: error.message 
    });
  }
};

// Get favorite reciter
exports.getFavoriteReciter = async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const reciter = favoriteReciters.get(userId) || 'ar.alafasy'; // Default reciter
    
    res.json({ reciter });
  } catch (error) {
    console.error('Error getting favorite reciter:', error.message);
    res.status(500).json({ 
      message: 'Failed to get favorite reciter',
      error: error.message 
    });
  }
};

// Save favorite reciter
exports.saveFavoriteReciter = async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const { reciter } = req.body;
    
    if (!reciter) {
      return res.status(400).json({ 
        message: 'Reciter code is required' 
      });
    }
    
    favoriteReciters.set(userId, reciter);
    
    res.json({ 
      success: true,
      message: 'Favorite reciter saved successfully',
      reciter
    });
  } catch (error) {
    console.error('Error saving favorite reciter:', error.message);
    res.status(500).json({ 
      message: 'Failed to save favorite reciter',
      error: error.message 
    });
  }
};

// Get listening progress
exports.getListeningProgress = async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const { surahNumber } = req.params;
    
    const userProgress = listeningProgress.get(userId) || {};
    const progress = userProgress[surahNumber] || 0;
    
    res.json({ progress });
  } catch (error) {
    console.error('Error getting listening progress:', error.message);
    res.status(500).json({ 
      message: 'Failed to get listening progress',
      error: error.message 
    });
  }
};

// Save listening progress
exports.saveListeningProgress = async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const { surahNumber, progress } = req.body;
    
    if (typeof surahNumber !== 'number' || typeof progress !== 'number') {
      return res.status(400).json({ 
        message: 'Valid surah number and progress are required' 
      });
    }
    
    const userProgress = listeningProgress.get(userId) || {};
    userProgress[surahNumber] = progress;
    listeningProgress.set(userId, userProgress);
    
    res.json({ 
      success: true,
      message: 'Listening progress saved successfully'
    });
  } catch (error) {
    console.error('Error saving listening progress:', error.message);
    res.status(500).json({ 
      message: 'Failed to save listening progress',
      error: error.message 
    });
  }
};
