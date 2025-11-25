import type { Surah } from "@/Api/quranAudioApi";

export interface SurahCardProps {
  surah: Surah;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: (surah: Surah) => void;
  onPlayPause: (e: React.MouseEvent) => void;
}
