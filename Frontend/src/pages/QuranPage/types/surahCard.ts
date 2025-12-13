import type { Surah } from "./quran.types";

export interface SurahCardProps {
  surah: Surah;
  onClick: () => void;
  animationDelay?: number;
}
