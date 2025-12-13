import type { Surah } from "./quran.types";

export interface SurahListProps {
  surahs: Surah[];
  onSelectSurah: (surahNumber: number) => void;
}
