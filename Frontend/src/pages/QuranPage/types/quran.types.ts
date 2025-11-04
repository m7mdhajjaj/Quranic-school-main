import type {
  Surah as ApiSurah,
  SurahData as ApiSurahData,
  Ayah as ApiAyah,
} from "@/Api/quranAudioApi";

// ✅ نمد الأنواع من الـ API
export interface Ayah extends ApiAyah {
  juz?: number;
  manzil?: number;
  page?: number;
  ruku?: number;
  hizbQuarter?: number;
  sajda?: boolean;
}

export interface SurahData extends ApiSurahData {
  englishNameTranslation?: string;
  ayahs: Ayah[];
}

export type Surah = ApiSurah;

export interface ReadingSettings {
  fontSize: number;
  theme: string;
  ayahsPerPage: number;
}

export type SortOrder = "asc" | "desc";
