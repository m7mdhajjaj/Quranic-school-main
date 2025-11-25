import type { Ayah } from "@/Api/quranAudioApi";

export interface AyahCardProps {
  ayah: Ayah;
  fontSize?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  isPlaying?: boolean;
  isCurrentAyah?: boolean;
  highlightWords?: boolean;
}
