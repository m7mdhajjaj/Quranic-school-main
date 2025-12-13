import type { SurahData } from "./quran.types";

export interface ReaderControlsProps {
  selectedSurah: SurahData | null;
  currentPage: number;
  totalPages: number;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onBackToList: () => void;
}
