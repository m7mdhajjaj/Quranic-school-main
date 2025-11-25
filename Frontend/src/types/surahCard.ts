import type { Surah } from "../pages/QuranPage/types/quran.types";

export interface SurahCardProps {
  surah: Surah;
  onClick: () => void;
  animationDelay?: number;
}
