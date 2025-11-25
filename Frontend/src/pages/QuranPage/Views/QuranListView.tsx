import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/UI";
import type { Surah } from "../types/quran.types";

const SurahList = lazy(() => import("../Components/SurahList"));

interface QuranListViewProps {
  surahs: Surah[];
  onSelectSurah: (surahNumber: number) => void;
}

const QuranListView = ({ surahs, onSelectSurah }: QuranListViewProps) => {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" color="emerald" text="جاري تحميل السور..." />}>
      <SurahList surahs={surahs} onSelectSurah={onSelectSurah} />
    </Suspense>
  );
};

export default QuranListView;
