import type { Surah } from "@/Api/quranAudioApi";

export interface SurahListProps {
  surahs: Surah[];
  selectedSurah: Surah | null;
  isPlaying: boolean;
  loading: boolean;
  onSurahSelect: (surah: Surah) => void;
  onPlayPause: (surah: Surah) => void;
}

export type SortOrder = "asc" | "desc";
