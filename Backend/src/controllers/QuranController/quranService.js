const axios = require('axios');

/**
 * Quran Service - External API Integration
 * Handles all communication with external Quran API
 */

const QURAN_API_BASE = 'https://api.alquran.cloud/v1';

class QuranService {
  /**
   * Fetch all Surahs from external API
   */
  async getAllSurahs() {
    try {
      const response = await axios.get(`${QURAN_API_BASE}/surah`);
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch surahs: ${error.message}`);
    }
  }

  /**
   * Fetch specific Surah with its Ayahs
   */
  async getSurahWithAyahs(surahNumber) {
    try {
      const response = await axios.get(`${QURAN_API_BASE}/surah/${surahNumber}`);
      const data = response.data.data;
      
      return {
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
      };
    } catch (error) {
      throw new Error(`Failed to fetch surah ${surahNumber}: ${error.message}`);
    }
  }

  /**
   * Fetch specific Ayah
   */
  async getAyah(surahNumber, ayahNumber) {
    try {
      const response = await axios.get(`${QURAN_API_BASE}/ayah/${surahNumber}:${ayahNumber}`);
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch ayah ${surahNumber}:${ayahNumber}: ${error.message}`);
    }
  }

  /**
   * Validate Surah number
   */
  validateSurahNumber(surahNumber) {
    const number = parseInt(surahNumber);
    if (!number || number < 1 || number > 114) {
      throw new Error('Invalid surah number. Must be between 1 and 114');
    }
    return number;
  }
}

module.exports = new QuranService();
