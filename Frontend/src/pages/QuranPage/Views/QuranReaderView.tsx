import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/UI";
import ReaderControls from "../Components/ReaderControls";
import Pagination from "../Components/Pagination";
import type { SurahData, Ayah } from "../types/quran.types";

const SurahReader = lazy(() => import("../Components/SurahReader"));

interface QuranReaderViewProps {
  selectedSurah: SurahData;
  currentAyahs: Ayah[];
  currentPage: number;
  totalPages: number;
  fontSize: number;
  loading: boolean;
  isPending: boolean;
  onFontSizeChange: (size: number) => void;
  onBackToList: () => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onPageChange: (page: number) => void;
}

const QuranReaderView = ({
  selectedSurah,
  currentAyahs,
  currentPage,
  totalPages,
  fontSize,
  loading,
  isPending,
  onFontSizeChange,
  onBackToList,
  onNextPage,
  onPreviousPage,
  onPageChange,
}: QuranReaderViewProps) => {
  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      <ReaderControls
        selectedSurah={selectedSurah}
        currentPage={currentPage}
        totalPages={totalPages}
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
        onBackToList={onBackToList}
      />

      {loading || isPending ? (
        <LoadingSpinner 
          size="lg" 
          color="emerald" 
          text="جاري تحميل السورة..." 
        />
      ) : (
        <Suspense fallback={<LoadingSpinner size="lg" color="emerald" text="جاري تحميل السورة..." />}>
          <SurahReader
            surah={selectedSurah}
            ayahs={currentAyahs}
            fontSize={fontSize}
            currentPage={currentPage}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalAyahs={selectedSurah.ayahs.length}
            ayahsPerPage={10}
            onNext={onNextPage}
            onPrevious={onPreviousPage}
            onPageChange={onPageChange}
          />
        </Suspense>
      )}
    </div>
  );
};

export default QuranReaderView;
