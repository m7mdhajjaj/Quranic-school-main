import api from './api';

// ============================================================================
// Quran Audio API
// ============================================================================

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  juz?: number;
  manzil?: number;
  page?: number;
  ruku?: number;
  hizbQuarter?: number;
  sajda?: boolean;
}

export interface WordTiming {
  word: string;
  startTime: number;
  endTime: number;
}

export interface AyahTiming {
  ayahNumber: number;
  startTime: number;
  endTime: number;
  words?: WordTiming[];
}

export interface SurahTiming {
  surahNumber: number;
  reciter: string;
  totalDuration: number;
  ayahs: AyahTiming[];
}

export interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation?: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: Ayah[];
}

export interface Reciter {
  code: string;
  name: string;
  baseUrls: string[];
}

export interface QuranResponse<T> {
  code: number;
  status: string;
  data: T;
}

// Available reciters with multiple server options for fallback
export const getReciters = (): Reciter[] => [
  {
    code: "ar.alafasy",
    name: "مشاري بن راشد العفاسي",
    baseUrls: [
      "https://download.quranicaudio.com/quran/mishary_rashid_alafasy/",
      "https://server8.mp3quran.net/afs/",
    ],
  },
  {
    code: "ar.abdulbasit",
    name: "عبد الباسط عبد الصمد",
    baseUrls: [
      "https://download.quranicaudio.com/quran/abdul_basit_murattal/",
      "https://server8.mp3quran.net/basit/",
    ],
  },
  {
    code: "ar.sudais",
    name: "عبد الرحمن السديس",
    baseUrls: [
      "https://server7.mp3quran.net/sudais/",
      "https://download.quranicaudio.com/quran/abdurrahmaan_as-sudays/",
    ],
  },
  {
    code: "ar.ajmi",
    name: "أحمد العجمي",
    baseUrls: [
      "https://server10.mp3quran.net/ajm/",
      "https://download.quranicaudio.com/quran/ahmed_ibn_ali_al-ajamy/",
    ],
  },
  {
    code: "ar.ghamdi",
    name: "سعد الغامدي",
    baseUrls: [
      "https://server7.mp3quran.net/s_gmd/",
      "https://download.quranicaudio.com/quran/sa3d_al-ghaamidi/",
    ],
  },
  {
    code: "ar.muaiqly",
    name: "ماهر المعيقلي",
    baseUrls: [
      "https://server12.mp3quran.net/maher/",
      "https://download.quranicaudio.com/quran/maher_al_meaqli/",
    ],
  },
  {
    code: "ar.dossari",
    name: "ياسر الدوسري",
    baseUrls: [
      "https://server11.mp3quran.net/yasser/",
      "https://download.quranicaudio.com/quran/yasser_ad-dussary/",
    ],
  },
];

// Get all Surahs from AlQuran API
export const getAllSurahs = async (): Promise<Surah[]> => {
  try {
    // Try backend first
    const backendResponse = await api.get('/quran/surahs');
    return backendResponse.data?.data || backendResponse.data;
  } catch (backendError) {
    console.log('Backend not available, using external API:', backendError);
    
    // Fallback to external API
    try {
      const response = await fetch("https://api.alquran.cloud/v1/surah");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: QuranResponse<Surah[]> = await response.json();
      
      if (data.code !== 200) {
        throw new Error(`API error: ${data.status}`);
      }
      
      return data.data;
    } catch (externalError) {
      console.error('External API also failed:', externalError);
      throw new Error('فشل في تحميل قائمة السور. يرجى المحاولة مرة أخرى.');
    }
  }
};

// Get specific Surah with Ayahs
export const getSurah = async (surahNumber: number): Promise<SurahData> => {
  try {
    // Try backend first
    const backendResponse = await api.get(`/quran/surah/${surahNumber}`);
    return backendResponse.data?.data || backendResponse.data;
  } catch (backendError) {
    console.log('Backend not available, using external API:', backendError);
    
    // Fallback to external API
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: QuranResponse<SurahData> = await response.json();
      
      if (data.code !== 200) {
        throw new Error(`API error: ${data.status}`);
      }
      
      return data.data;
    } catch (externalError) {
      console.error('External API also failed:', externalError);
      throw new Error('فشل في تحميل السورة. يرجى المحاولة مرة أخرى.');
    }
  }
};

// Process Ayahs to remove Bismillah from text (except Al-Fatiha)
export const processAyahs = (ayahs: Ayah[], surahNumber: number): Ayah[] => {
  return ayahs.map((ayah) => ({
    number: ayah.number,
    numberInSurah: ayah.numberInSurah,
    text: surahNumber === 1 ? ayah.text : ayah.text.replace(
      /^بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ\s*/,
      ""
    ), // Remove bismillah except from Al-Fatiha
  }));
};

// Get audio URL for a specific Surah and Reciter
export const getAudioUrls = (surahNumber: number, reciterCode: string): string[] => {
  const reciter = getReciters().find((r) => r.code === reciterCode);
  if (!reciter) {
    throw new Error(`لا يمكن العثور على القارئ: ${reciterCode}`);
  }

  const surahNumberFormatted = surahNumber.toString().padStart(3, "0");
  return reciter.baseUrls.map(baseUrl => `${baseUrl}${surahNumberFormatted}.mp3`);
};

// Test audio URL to check if it's available
export const testAudioUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error(`Audio URL test failed for ${url}:`, error);
    return false;
  }
};

// Get working audio URL with fallback
export const getWorkingAudioUrl = async (
  surahNumber: number, 
  reciterCode: string
): Promise<string> => {
  const urls = getAudioUrls(surahNumber, reciterCode);
  
  for (const url of urls) {
    const isWorking = await testAudioUrl(url);
    if (isWorking) {
      return url;
    }
  }
  
  const reciter = getReciters().find((r) => r.code === reciterCode);
  throw new Error(`لا يمكن العثور على تسجيل صوتي صالح للسورة رقم ${surahNumber} للقارئ ${reciter?.name || reciterCode}`);
};

// Save user's favorite reciter to backend (optional)
export const saveFavoriteReciter = async (reciterCode: string): Promise<void> => {
  try {
    await api.post('/quran/favorite-reciter', { reciter: reciterCode });
  } catch (error) {
    console.log('Could not save favorite reciter to backend:', error);
    // Save to localStorage as fallback
    localStorage.setItem('favoriteReciter', reciterCode);
  }
};

// Get user's favorite reciter
export const getFavoriteReciter = async (): Promise<string> => {
  try {
    const response = await api.get('/quran/favorite-reciter');
    return response.data?.reciter || 'ar.alafasy';
  } catch (error) {
    console.log('Could not get favorite reciter from backend:', error);
    // Get from localStorage as fallback
    return localStorage.getItem('favoriteReciter') || 'ar.alafasy';
  }
};

// Save listening progress (optional)
export const saveListeningProgress = async (
  surahNumber: number, 
  progress: number
): Promise<void> => {
  try {
    await api.post('/quran/listening-progress', {
      surahNumber: surahNumber,
      progress: progress
    });
  } catch (error) {
    console.log('Could not save listening progress to backend:', error);
    // Save to localStorage as fallback
    const key = `listeningProgress_${surahNumber}`;
    localStorage.setItem(key, progress.toString());
  }
};

// Get listening progress
export const getListeningProgress = async (surahNumber: number): Promise<number> => {
  try {
    const response = await api.get(`/quran/listening-progress/${surahNumber}`);
    return response.data?.progress || 0;
  } catch (error) {
    console.log('Could not get listening progress from backend:', error);
    // Get from localStorage as fallback
    const key = `listeningProgress_${surahNumber}`;
    return parseFloat(localStorage.getItem(key) || '0');
  }
};

// Search in Quran text
export const searchInQuran = async (query: string): Promise<{
  surah: number;
  ayah: number;
  text: string;
  surahName: string;
}[]> => {
  try {
    // Try backend first
    const response = await api.get(`/quran/search?q=${encodeURIComponent(query)}`);
    return response.data?.results || [];
  } catch (error) {
    console.log('Backend search not available:', error);
    // For now, return empty array - could implement client-side search
    return [];
  }
};

// Get reading bookmarks
export const getReadingBookmarks = async (): Promise<{
  surah: number;
  ayah: number;
  timestamp: string;
}[]> => {
  try {
    const response = await api.get('/quran/bookmarks');
    return response.data?.bookmarks || [];
  } catch (error) {
    console.log('Could not get bookmarks from backend:', error);
    // Get from localStorage as fallback
    const bookmarks = localStorage.getItem('quranBookmarks');
    return bookmarks ? JSON.parse(bookmarks) : [];
  }
};

// Save reading bookmark
export const saveReadingBookmark = async (
  surah: number,
  ayah: number
): Promise<void> => {
  try {
    await api.post('/quran/bookmarks', { surah, ayah });
  } catch (error) {
    console.log('Could not save bookmark to backend:', error);
    // Save to localStorage as fallback
    const bookmarks = await getReadingBookmarks();
    const newBookmark = {
      surah,
      ayah,
      timestamp: new Date().toISOString()
    };
    const updatedBookmarks = [newBookmark, ...bookmarks.slice(0, 9)]; // Keep last 10
    localStorage.setItem('quranBookmarks', JSON.stringify(updatedBookmarks));
  }
};

// Get reading settings (font size, theme, etc.)
export const getReadingSettings = async (): Promise<{
  fontSize: number;
  theme: 'light' | 'dark';
  ayahsPerPage: number;
}> => {
  try {
    const response = await api.get('/quran/reading-settings');
    return response.data?.settings || { fontSize: 18, theme: 'light', ayahsPerPage: 10 };
  } catch (error) {
    console.log('Could not get reading settings from backend:', error);
    // Get from localStorage as fallback
    const settings = localStorage.getItem('quranReadingSettings');
    return settings ? JSON.parse(settings) : { fontSize: 18, theme: 'light', ayahsPerPage: 10 };
  }
};

// Save reading settings
export const saveReadingSettings = async (settings: {
  fontSize: number;
  theme: 'light' | 'dark';
  ayahsPerPage: number;
}): Promise<void> => {
  try {
    await api.post('/quran/reading-settings', { settings });
  } catch (error) {
    console.log('Could not save reading settings to backend:', error);
    // Save to localStorage as fallback
    localStorage.setItem('quranReadingSettings', JSON.stringify(settings));
  }
};

// Get timing data for a surah (per-ayah timing)
export const getSurahTiming = async (
  surahNumber: number,
  reciterCode: string
): Promise<SurahTiming | null> => {
  try {
    // Try backend first
    const response = await api.get(
      `/quran/timing/${surahNumber}?reciter=${reciterCode}`
    );
    return response.data;
  } catch (error) {
    console.log('Backend timing not available, using estimation:', error);
    return null;
  }
};

// Calculate ayah timing based on audio duration and ayah count
export const estimateAyahTiming = (
  totalDuration: number,
  ayahCount: number
): AyahTiming[] => {
  const ayahTimings: AyahTiming[] = [];
  const avgDuration = totalDuration / ayahCount;

  for (let i = 0; i < ayahCount; i++) {
    ayahTimings.push({
      ayahNumber: i + 1,
      startTime: i * avgDuration,
      endTime: (i + 1) * avgDuration,
    });
  }

  return ayahTimings;
};

// Get current ayah based on time
export const getCurrentAyahFromTime = (
  currentTime: number,
  ayahTimings: AyahTiming[]
): number | null => {
  for (const timing of ayahTimings) {
    if (currentTime >= timing.startTime && currentTime < timing.endTime) {
      return timing.ayahNumber;
    }
  }
  return ayahTimings.length > 0 ? ayahTimings[ayahTimings.length - 1].ayahNumber : null;
};