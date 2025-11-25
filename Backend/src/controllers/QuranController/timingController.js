/**
 * Quran Timing Controller
 * Provides accurate timing data for ayahs during audio playback
 */

// Sample timing data structure - this should be loaded from a database
// Data can be sourced from EveryAyah.com or similar Quran timing databases

const timingDatabase = {
  // Example: Surah Al-Fatiha with Alafasy
  '1-ar.alafasy': {
    surahNumber: 1,
    reciter: 'ar.alafasy',
    totalDuration: 29.5, // seconds
    ayahs: [
      { ayahNumber: 1, startTime: 0.0, endTime: 2.8 },      // بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      { ayahNumber: 2, startTime: 2.8, endTime: 6.5 },      // الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
      { ayahNumber: 3, startTime: 6.5, endTime: 9.2 },      // الرَّحْمَٰنِ الرَّحِيمِ
      { ayahNumber: 4, startTime: 9.2, endTime: 12.8 },     // مَالِكِ يَوْمِ الدِّينِ
      { ayahNumber: 5, startTime: 12.8, endTime: 17.5 },    // إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ
      { ayahNumber: 6, startTime: 17.5, endTime: 23.0 },    // اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ
      { ayahNumber: 7, startTime: 23.0, endTime: 29.5 },    // صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ...
    ]
  }
};

/**
 * Get timing data for a specific surah and reciter
 * @param {number} surahNumber - Surah number (1-114)
 * @param {string} reciter - Reciter code (e.g., 'ar.alafasy')
 * @returns {object|null} Timing data or null if not found
 */
const getSurahTiming = (surahNumber, reciter) => {
  const key = `${surahNumber}-${reciter}`;
  return timingDatabase[key] || null;
};

/**
 * Express route handler
 */
const getTimingHandler = (req, res) => {
  try {
    const { surahNumber } = req.params;
    const { reciter } = req.query;

    if (!surahNumber || !reciter) {
      return res.status(400).json({
        success: false,
        message: 'Surah number and reciter are required'
      });
    }

    const timing = getSurahTiming(parseInt(surahNumber), reciter);

    if (!timing) {
      return res.status(404).json({
        success: false,
        message: 'Timing data not available for this surah and reciter',
        note: 'Client will use estimation fallback'
      });
    }

    res.json(timing);
  } catch (error) {
    console.error('Error fetching timing data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching timing data'
    });
  }
};

/**
 * Route setup (add to your Express app)
 * app.get('/api/quran/timing/:surahNumber', getTimingHandler);
 */

module.exports = {
  getSurahTiming,
  getTimingHandler
};

/**
 * HOW TO POPULATE TIMING DATA:
 * 
 * Option 1: Manual Database Population
 * - Create a MongoDB collection 'quran_timings'
 * - Import timing data from sources like EveryAyah.com
 * - Structure: { surahNumber, reciter, totalDuration, ayahs: [...] }
 * 
 * Option 2: Use External API
 * - EveryAyah.com provides timing data
 * - Parse their timing files and cache in your database
 * 
 * Option 3: Generate from Audio Analysis
 * - Use audio processing libraries to detect silence between ayahs
 * - Requires significant processing power but gives accurate results
 * 
 * RESOURCES:
 * - EveryAyah.com - Comprehensive Quran audio with timing
 * - Tanzil.net - Quran text and metadata
 * - QuranComplex.gov.sa - Official Quran resources
 */
