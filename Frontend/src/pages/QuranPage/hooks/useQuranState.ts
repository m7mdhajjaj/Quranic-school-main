import { useState, useCallback, useTransition } from "react";
import { getSurah, saveReadingBookmark } from "@/Api/quranAudioApi";
import type { SurahData } from "../types/quran.types";

export const useQuranState = (resetPage: () => void) => {
  const [selectedSurah, setSelectedSurah] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSelectSurah = useCallback(async (surahNumber: number) => {
    try {
      setLoading(true);
      const surahData = await getSurah(surahNumber);
      setSelectedSurah(surahData as SurahData);
      resetPage();
      await saveReadingBookmark(surahNumber, 1);
    } catch (err) {
      console.error("Error fetching surah:", err);
    } finally {
      setLoading(false);
    }
  }, [resetPage]);

  const handleBackToList = useCallback(() => {
    setSelectedSurah(null);
    resetPage();
  }, [resetPage]);

  return {
    selectedSurah,
    loading,
    isPending,
    startTransition,
    handleSelectSurah,
    handleBackToList,
  };
};
