import type { Ayah } from "@/Api/quranAudioApi";

export interface AyahsListProps {
  ayahs: Ayah[];
  loading: boolean;
  isPlaying?: boolean;
  currentAyahNumber?: number;
  highlightWords?: boolean;
}
