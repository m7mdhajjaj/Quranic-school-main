const storageService = require('./storageService');

/**
 * User Preferences Controller
 * Handles user reading settings, bookmarks, and preferences
 */

// Get reading settings for a user
exports.getReadingSettings = async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const settings = storageService.getReadingSettings(userId);
    
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
    
    const validSettings = storageService.saveReadingSettings(userId, settings);
    
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
    const userBookmarks = storageService.getBookmarks(userId);
    
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
    
    // Validate input
    if (typeof surah !== 'number' || typeof ayah !== 'number' || surah < 1 || ayah < 1) {
      return res.status(400).json({ 
        message: 'Valid Surah and Ayah numbers are required' 
      });
    }
    
    const result = storageService.addBookmark(userId, surah, ayah);
    
    res.json({ 
      success: true,
      message: result.exists ? 'Bookmark already exists' : 'Bookmark added successfully',
      bookmark: result.bookmark
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
    
    storageService.removeBookmark(userId, id);
    
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
    const reciter = storageService.getFavoriteReciter(userId);
    
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
    
    const savedReciter = storageService.saveFavoriteReciter(userId, reciter);
    
    res.json({ 
      success: true,
      message: 'Favorite reciter saved successfully',
      reciter: savedReciter
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
    
    const progress = storageService.getListeningProgress(userId, surahNumber);
    
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
    
    storageService.saveListeningProgress(userId, surahNumber, progress);
    
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
