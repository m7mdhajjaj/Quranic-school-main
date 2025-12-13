import type { SurahData, Ayah } from "./quran.types";

export interface SurahReaderProps {
  surah: SurahData;
  ayahs: Ayah[];
  fontSize: number;
  currentPage: number;
}
