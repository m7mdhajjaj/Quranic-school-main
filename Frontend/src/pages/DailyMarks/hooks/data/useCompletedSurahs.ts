import { useState, useEffect, useCallback } from 'react';
import { getCompletedSurahs, getSurahHistory } from '@/Api/DailyMark/sectionApi';
import type { CompletedSurah, SurahHistoryItem } from '@/Api/DailyMark/sectionApi';

export const useCompletedSurahs = (selectedGroup: string, isOpen: boolean) => {
  const [loading, setLoading] = useState(false);
  const [completedList, setCompletedList] = useState<CompletedSurah[]>([]);
  
  // Drill-down state
  const [selectedSurah, setSelectedSurah] = useState<CompletedSurah | null>(null);
  const [history, setHistory] = useState<SurahHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadList = useCallback(async () => {
    if (!selectedGroup) return;
    setLoading(true);
    try {
      const data = await getCompletedSurahs(selectedGroup);
      setCompletedList(data);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (isOpen && selectedGroup) {
      loadList();
      setSelectedSurah(null); // Reset view
    }
  }, [isOpen, selectedGroup, loadList]);

  const handleSelectSurah = async (surah: CompletedSurah) => {
    setSelectedSurah(surah);
    setLoadingHistory(true);
    try {
      const hist = await getSurahHistory(selectedGroup, surah.surahNumber, surah.type || 'memorization');
      setHistory(hist);
    } catch {
      // Error handled silently
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleBack = () => {
    setSelectedSurah(null);
    setHistory([]);
  };

  return {
    loading,
    completedList,
    selectedSurah,
    history,
    loadingHistory,
    handleSelectSurah,
    handleBack,
    refresh: loadList
  };
};
