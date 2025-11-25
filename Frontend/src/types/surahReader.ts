import type { SurahData, Ayah } from "../pages/QuranPage/types/quran.types";

export interface SurahReaderProps {
  surah: SurahData;
  ayahs: Ayah[];
  fontSize: number;
  currentPage: number;
}
