import type { Reciter } from "@/Api/quranAudioApi";

export interface ReciterSelectorProps {
  reciters: Reciter[];
  selectedReciter: string;
  onReciterChange: (reciterCode: string) => void;
}
