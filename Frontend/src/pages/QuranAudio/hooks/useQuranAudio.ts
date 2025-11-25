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
  getSurahTiming,
  estimateAyahTiming,
  getCurrentAyahFromTime,
  type Surah,
  type Ayah,
  type Reciter,
  type AyahTiming,
} from "@/Api/quranAudioApi";

export const useQuranAudio = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reciter, setReciter] = useState("ar.alafasy");
  const [audioError, setAudioError] = useState<string | null>(null);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [highlightWords, setHighlightWords] = useState(true);
  const [ayahTimings, setAyahTimings] = useState<AyahTiming[]>([]);

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
        setCurrentAyahIndex(0);
        setAyahTimings([]);
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
    setCurrentAyahIndex(0);
    setAyahTimings([]);
    setAudioError(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Save to backend asynchronously without blocking
    saveFavoriteReciter(newReciter).catch(error => 
      console.log("Could not save favorite reciter:", error)
    );
  }, []);

  // Toggle highlight words
  const toggleHighlightWords = useCallback(() => {
    setHighlightWords(prev => !prev);
  }, []);

  // Load timing data when surah and reciter are selected
  useEffect(() => {
    if (!selectedSurah || !reciter || ayahs.length === 0) return;

    const loadTiming = async () => {
      try {
        const timing = await getSurahTiming(selectedSurah.number, reciter);
        
        if (timing && timing.ayahs.length > 0) {
          // Use real timing data
          setAyahTimings(timing.ayahs);
          console.log('✅ Using real timing data');
        } else {
          // Fallback: wait for audio to load to estimate
          setAyahTimings([]);
          console.log('⚠️ Waiting for audio duration to estimate timing');
        }
      } catch (error) {
        console.log('Could not load timing data:', error);
        setAyahTimings([]);
      }
    };

    loadTiming();
  }, [selectedSurah, reciter, ayahs.length]);

  // Estimate timing when audio loads (fallback)
  useEffect(() => {
    if (!audioRef.current || ayahTimings.length > 0) return;

    const handleLoadedMetadata = () => {
      const audio = audioRef.current;
      if (!audio || !audio.duration || isNaN(audio.duration)) return;

      const estimated = estimateAyahTiming(audio.duration, ayahs.length);
      setAyahTimings(estimated);
      console.log('📊 Using estimated timing based on audio duration');
    };

    const audio = audioRef.current;
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [ayahTimings.length, ayahs.length]);

  // Update current ayah based on audio progress with precise timing
  useEffect(() => {
    if (!isPlaying || !audioRef.current || ayahTimings.length === 0) return;

    const updateCurrentAyah = () => {
      if (!audioRef.current) return;
      
      const currentTime = audioRef.current.currentTime;
      const ayahNumber = getCurrentAyahFromTime(currentTime, ayahTimings);
      
      if (ayahNumber !== null) {
        const newIndex = ayahs.findIndex(a => a.numberInSurah === ayahNumber);
        if (newIndex !== -1 && newIndex !== currentAyahIndex) {
          setCurrentAyahIndex(newIndex);
        }
      }
    };

    const audio = audioRef.current;
    audio.addEventListener('timeupdate', updateCurrentAyah);

    return () => {
      audio.removeEventListener('timeupdate', updateCurrentAyah);
    };
  }, [isPlaying, ayahTimings, ayahs, currentAyahIndex]);

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
    currentAyahNumber: ayahs[currentAyahIndex]?.number,
    highlightWords,
    handleSurahSelect,
    handleReciterChange,
    playFullSurah,
    pauseAudio,
    handleAudioEnded,
    toggleHighlightWords,
  };
};
