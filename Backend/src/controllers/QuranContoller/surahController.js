const quranService = require('./quranService');

/**
 * Surah Controller
 * Handles Surah-related requests
 */

// Get all Surahs
exports.getAllSurahs = async (req, res) => {
  try {
    const surahs = await quranService.getAllSurahs();
    res.json(surahs);
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
    
    // Validate surah number
    quranService.validateSurahNumber(surahNumber);
    
    const data = await quranService.getSurahWithAyahs(surahNumber);
    res.json(data);
  } catch (error) {
    console.error(`Error fetching surah ${req.params.surahNumber}:`, error.message);
    
    const statusCode = error.message.includes('Invalid') ? 400 : 500;
    res.status(statusCode).json({ 
      message: error.message,
      error: error.message 
    });
  }
};

// Get specific Ayah
exports.getAyah = async (req, res) => {
  try {
    const { surahNumber, ayahNumber } = req.params;
    
    // Validate surah number
    quranService.validateSurahNumber(surahNumber);
    
    const ayah = await quranService.getAyah(surahNumber, ayahNumber);
    res.json(ayah);
  } catch (error) {
    console.error(`Error fetching ayah ${req.params.surahNumber}:${req.params.ayahNumber}:`, error.message);
    
    const statusCode = error.message.includes('Invalid') ? 400 : 500;
    res.status(statusCode).json({ 
      message: error.message,
      error: error.message 
    });
  }
};
