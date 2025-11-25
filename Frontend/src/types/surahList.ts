import type { Surah } from "../pages/QuranPage/types/quran.types";

export interface SurahListProps {
  surahs: Surah[];
  onSelectSurah: (surahNumber: number) => void;
}
