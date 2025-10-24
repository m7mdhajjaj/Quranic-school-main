import { useState, useEffect, useRef, useCallback } from "react";
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
} from "../../../Api/quranAudioApi";

export const useQuranAudio = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reciter, setReciter] = useState("ar.alafasy");
  const [audioError, setAudioError] = useState<string | null>(null);
  const [reciters, setReciters] = useState<Reciter[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch all surahs
  const fetchSurahs = useCallback(async () => {
    setLoading(true);
    try {
      const surahsData = await getAllSurahs();
      setSurahs(surahsData);
    } catch (error) {
      console.error("Error fetching surahs:", error);
      setAudioError(
        error instanceof Error ? error.message : "فشل في تحميل قائمة السور"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch surah with audio
  const fetchSurahWithAudio = useCallback(
    async (surahNumber: number) => {
      setLoading(true);
      setAudioError(null);
      try {
        const surahData = await getSurah(surahNumber);
        const processedAyahs = processAyahs(surahData.ayahs, surahNumber);
        setAyahs(processedAyahs);

        try {
          getAudioUrls(surahNumber, reciter);
          setAudioError(null);
        } catch (audioError) {
          console.error("Audio URL error:", audioError);
          setAudioError(
            audioError instanceof Error
              ? audioError.message
              : "لا يمكن العثور على تسجيل صوتي"
          );
        }
      } catch (error) {
        console.error("Error fetching surah:", error);
        setAyahs([]);
        setAudioError(
          error instanceof Error ? error.message : "حدث خطأ في تحميل السورة"
        );
      } finally {
        setLoading(false);
      }
    },
    [reciter]
  );

  // Initialize component with optimized loading
  const initializeComponent = useCallback(async () => {
    try {
      // Load reciters synchronously (fast, local data)
      const availableReciters = getReciters();
      setReciters(availableReciters);

      // Load everything else in parallel for better performance
      const [favoriteReciter] = await Promise.all([
        getFavoriteReciter(),
        fetchSurahs(),
      ]);
      
      setReciter(favoriteReciter);
    } catch (error) {
      console.error("Error initializing component:", error);
    }
  }, [fetchSurahs]);

  // Play full surah
  const playFullSurah = useCallback(async () => {
    if (!selectedSurah || !audioRef.current) return;

    try {
      const audioUrls = getAudioUrls(selectedSurah.number, reciter);

      for (const audioUrl of audioUrls) {
        try {
          console.log(`Trying to play: ${audioUrl}`);
          audioRef.current.src = audioUrl;

          await audioRef.current.play();
          setIsPlaying(true);
          setAudioError(null);
          console.log(`Successfully playing: ${audioUrl}`);

          // Save progress asynchronously without blocking
          saveListeningProgress(selectedSurah.number, 0).catch(err => 
            console.log('Could not save progress:', err)
          );
          return;
        } catch (error) {
          console.log(`Failed to play ${audioUrl}:`, error);
          continue;
        }
      }

      const selectedReciterObj = reciters.find((r) => r.code === reciter);
      setAudioError(
        `لا يمكن تشغيل هذه السورة للقارئ ${selectedReciterObj?.name || reciter}`
      );
      console.error("All audio URLs failed for this reciter");
    } catch (error) {
      console.error("Error getting audio URLs:", error);
      setAudioError(
        error instanceof Error
          ? error.message
          : "فشل في الحصول على رابط التسجيل الصوتي"
      );
    }
  }, [selectedSurah, reciter, reciters]);

  // Pause audio
  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Handle audio ended
  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Handle surah select
  const handleSurahSelect = useCallback(
    (surah: Surah) => {
      // Defer heavy work to avoid blocking UI
      requestAnimationFrame(() => {
        setSelectedSurah(surah);
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      });
    },
    []
  );

  // Handle reciter change
  const handleReciterChange = useCallback((newReciter: string) => {
    // Update state immediately for fast UI response
    setReciter(newReciter);
    setIsPlaying(false);
    setAudioError(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Save to backend asynchronously without blocking
    saveFavoriteReciter(newReciter).catch(error => 
      console.log("Could not save favorite reciter:", error)
    );
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeComponent();
  }, [initializeComponent]);

  // Fetch surah when selected
  useEffect(() => {
    if (selectedSurah) {
      fetchSurahWithAudio(selectedSurah.number);
    }
  }, [selectedSurah, fetchSurahWithAudio]);

  return {
    surahs,
    selectedSurah,
    ayahs,
    loading,
    isPlaying,
    reciter,
    audioError,
    reciters,
    audioRef,
    handleSurahSelect,
    handleReciterChange,
    playFullSurah,
    pauseAudio,
    handleAudioEnded,
  };
};
