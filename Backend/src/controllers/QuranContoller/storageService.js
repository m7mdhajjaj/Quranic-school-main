/**
 * In-Memory Storage for User Preferences
 * TODO: Move to database in production
 */

// Storage Maps
const readingSettings = new Map();
const bookmarks = new Map();
const favoriteReciters = new Map();
const listeningProgress = new Map();

class StorageService {
  // Reading Settings
  getReadingSettings(userId) {
    return readingSettings.get(userId) || {
      fontSize: 18,
      theme: 'light',
      ayahsPerPage: 10
    };
  }

  saveReadingSettings(userId, settings) {
    const validSettings = {
      fontSize: settings.fontSize || 18,
      theme: settings.theme || 'light',
      ayahsPerPage: settings.ayahsPerPage || 10
    };
    readingSettings.set(userId, validSettings);
    return validSettings;
  }

  // Bookmarks
  getBookmarks(userId) {
    return bookmarks.get(userId) || [];
  }

  addBookmark(userId, surah, ayah) {
    const userBookmarks = this.getBookmarks(userId);
    
    // Check if bookmark already exists
    const existing = userBookmarks.find(
      b => b.surah === surah && b.ayah === ayah
    );
    
    if (existing) {
      return { exists: true, bookmark: existing };
    }
    
    const newBookmark = {
      id: Date.now(),
      surah,
      ayah,
      createdAt: new Date().toISOString()
    };
    
    userBookmarks.push(newBookmark);
    bookmarks.set(userId, userBookmarks);
    
    return { exists: false, bookmark: newBookmark };
  }

  removeBookmark(userId, bookmarkId) {
    const userBookmarks = this.getBookmarks(userId);
    const filteredBookmarks = userBookmarks.filter(b => b.id !== parseInt(bookmarkId));
    bookmarks.set(userId, filteredBookmarks);
    return true;
  }

  // Favorite Reciter
  getFavoriteReciter(userId) {
    return favoriteReciters.get(userId) || 'ar.alafasy';
  }

  saveFavoriteReciter(userId, reciter) {
    favoriteReciters.set(userId, reciter);
    return reciter;
  }

  // Listening Progress
  getListeningProgress(userId, surahNumber) {
    const userProgress = listeningProgress.get(userId) || {};
    return userProgress[surahNumber] || 0;
  }

  saveListeningProgress(userId, surahNumber, progress) {
    const userProgress = listeningProgress.get(userId) || {};
    userProgress[surahNumber] = progress;
    listeningProgress.set(userId, userProgress);
    return progress;
  }
}

module.exports = new StorageService();
