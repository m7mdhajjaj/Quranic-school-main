import type { Ayah, Surah } from "@/Api/quranAudioApi";

export interface AyahsListProps {
  ayahs: Ayah[];
  loading: boolean;
  isPlaying?: boolean;
  currentAyahNumber?: number;
  highlightWords?: boolean;
  selectedSurah?: Surah | null;
}
