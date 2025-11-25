import type { SurahData } from "../pages/QuranPage/types/quran.types";

export interface ReaderControlsProps {
  selectedSurah: SurahData | null;
  currentPage: number;
  totalPages: number;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onBackToList: () => void;
}
