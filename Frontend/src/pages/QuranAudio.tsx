import React, { useState, useEffect, useRef, useCallback } from "react";
import { QuranAudioSkeleton } from "../components/Loading/LoadingSkeleton";
import {
  getAllSurahs,
  getSurah,
  processAyahs,
  getReciters,
  getAudioUrls,
  saveFavoriteReciter,
  getFavoriteReciter,
  saveListeningProgress,
  type Surah,
  type Ayah,
  type Reciter,
} from "../Api/quranAudioApi";

const QuranAudio: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reciter, setReciter] = useState("ar.alafasy");
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [reciters, setReciters] = useState<Reciter[]>([]);

  const fetchSurahs = useCallback(async () => {
    setLoading(true);
    try {
      const surahsData = await getAllSurahs();
      setSurahs(surahsData);
    } catch (error) {
      console.error("Error fetching surahs:", error);
      setAudioError(error instanceof Error ? error.message : "فشل في تحميل قائمة السور");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSurahWithAudio = useCallback(async (surahNumber: number) => {
    setLoading(true);
    setAudioError(null);
    try {
      // Fetch Surah data using centralized API
      const surahData = await getSurah(surahNumber);
      
      // Process ayahs to remove bismillah (except for Al-Fatiha)
      const processedAyahs = processAyahs(surahData.ayahs, surahNumber);
      setAyahs(processedAyahs);
      
      // Verify audio URLs are available
      try {
        getAudioUrls(surahNumber, reciter);
        setAudioError(null);
      } catch (audioError) {
        console.error("Audio URL error:", audioError);
        setAudioError(audioError instanceof Error ? audioError.message : "لا يمكن العثور على تسجيل صوتي");
      }
      
    } catch (error) {
      console.error("Error fetching surah:", error);
      setAyahs([]);
      setAudioError(error instanceof Error ? error.message : "حدث خطأ في تحميل السورة");
    } finally {
      setLoading(false);
    }
  }, [reciter]);

  const initializeComponent = useCallback(async () => {
    try {
      // Initialize reciters
      const availableReciters = getReciters();
      setReciters(availableReciters);
      
      // Get favorite reciter
      const favoriteReciter = await getFavoriteReciter();
      setReciter(favoriteReciter);
      
      // Fetch surahs
      await fetchSurahs();
    } catch (error) {
      console.error('Error initializing component:', error);
    }
  }, [fetchSurahs]);

  useEffect(() => {
    initializeComponent();
  }, [initializeComponent]);

  useEffect(() => {
    if (selectedSurah) {
      fetchSurahWithAudio(selectedSurah.number);
    }
  }, [selectedSurah, fetchSurahWithAudio]);

  const handleSurahSelect = (surah: Surah) => {
    setSelectedSurah(surah);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const playFullSurah = async () => {
    if (!selectedSurah || !audioRef.current) return;

    try {
      // Get audio URLs using centralized API
      const audioUrls = getAudioUrls(selectedSurah.number, reciter);
      
      // Try each URL until one works
      for (const audioUrl of audioUrls) {
        try {
          console.log(`Trying to play: ${audioUrl}`);
          audioRef.current.src = audioUrl;

          await audioRef.current.play();
          setIsPlaying(true);
          setAudioError(null);
          console.log(`Successfully playing: ${audioUrl}`);
          
          // Save listening progress
          await saveListeningProgress(selectedSurah.number, 0);
          
          return; // Exit if successful
        } catch (error) {
          console.log(`Failed to play ${audioUrl}:`, error);
          continue; // Try next URL
        }
      }

      // If all URLs fail
      const selectedReciterObj = reciters.find((r) => r.code === reciter);
      setAudioError(`لا يمكن تشغيل هذه السورة للقارئ ${selectedReciterObj?.name || reciter}`);
      console.error("All audio URLs failed for this reciter");
      
    } catch (error) {
      console.error("Error getting audio URLs:", error);
      setAudioError(error instanceof Error ? error.message : "فشل في الحصول على رابط التسجيل الصوتي");
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleReciterChange = async (newReciter: string) => {
    setReciter(newReciter);
    setIsPlaying(false);
    setAudioError(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Save favorite reciter
    try {
      await saveFavoriteReciter(newReciter);
    } catch (error) {
      console.log('Could not save favorite reciter:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={handleAudioEnded} preload="none" />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-600 mb-4">
            القرآن الكريم - صوتي
          </h1>
          <p className="text-gray-600 text-lg">
            استمع إلى القرآن الكريم بأصوات القراء المشهورين
          </p>
        </div>

        {/* Reciter Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            اختر القارئ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reciters.map((reciterOption) => (
              <button
                key={reciterOption.code}
                onClick={() => handleReciterChange(reciterOption.code)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-right ${
                  reciter === reciterOption.code
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md"
                    : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                <div className="font-semibold">{reciterOption.name}</div>
                {reciter === reciterOption.code && (
                  <div className="text-sm text-emerald-600 mt-1">
                    ✓ القارئ المحدد
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Surah Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            اختر السورة
          </h2>
          {loading && surahs.length === 0 ? (
            <QuranAudioSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {surahs.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => handleSurahSelect(surah)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-right ${
                    selectedSurah?.number === surah.number
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md"
                      : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{surah.name}</span>
                    <span className="text-sm bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                      {surah.number}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {surah.englishName} • {surah.numberOfAyahs} آية
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {surah.revelationType === "Meccan" ? "مكية" : "مدنية"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Audio Controls */}
        {selectedSurah && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedSurah.name}
              </h3>
              <span className="text-sm text-gray-600">
                {selectedSurah.numberOfAyahs} آية
              </span>
            </div>

            {audioError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {audioError}
              </div>
            )}

            <div className="flex gap-4 mb-4">
              {!isPlaying ? (
                <button
                  onClick={playFullSurah}
                  disabled={loading}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  تشغيل السورة كاملة
                </button>
              ) : (
                <button
                  onClick={pauseAudio}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  إيقاف التشغيل
                </button>
              )}

              <div className="flex items-center text-sm text-gray-600">
                القارئ: {reciters.find((r) => r.code === reciter)?.name}
              </div>
            </div>

            {isPlaying && (
              <div className="flex items-center gap-2 text-emerald-600">
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
                <span className="text-sm">جاري التشغيل...</span>
              </div>
            )}
          </div>
        )}

        {/* Ayahs Display */}
        {ayahs.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              نص السورة
            </h3>
            {loading && ayahs.length === 0 ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {ayahs.map((ayah) => (
                  <div
                    key={ayah.number}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {ayah.numberInSurah}
                      </span>
                      <p className="text-lg leading-loose text-gray-800 font-amiri">
                        {ayah.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuranAudio;