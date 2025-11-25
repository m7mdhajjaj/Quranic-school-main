import type { Surah } from "@/Api/quranAudioApi";

export interface AudioControlsProps {
  selectedSurah: Surah;
  isPlaying: boolean;
  loading: boolean;
  audioError: string | null;
  onPlay: () => void;
  onPause: () => void;
}
