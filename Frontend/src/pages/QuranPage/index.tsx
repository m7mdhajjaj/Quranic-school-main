import { useState, useCallback, useTransition, lazy, Suspense } from "react";
import { Alert, LoadingSpinner, PageHeader } from "@/components/UI";
import { BookOpen } from "lucide-react";
import SurahList from "./Components/SurahList";
import ReaderControls from "./Components/ReaderControls";
import Pagination from "./Components/Pagination";
import { useQuranInit } from "./hooks/useQuranInit";
import { usePagination } from "./hooks/usePagination";
import { useReadingSettingsSync } from "./hooks/useReadingSettingsSync";
import { getSurah, saveReadingBookmark } from "@/Api/quranAudioApi";
import type { SurahData } from "./types/quran.types";

// ✅ Lazy load heavy components
const SurahReader = lazy(() => import("./Components/SurahReader"));

const QuranPage = () => {
  // ✅ تهيئة البيانات الأساسية
  const { surahs, settings, loading: initLoading, error } = useQuranInit();

  // ✅ حالة السورة المختارة
  const [selectedSurah, setSelectedSurah] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState(settings.fontSize);
  
  // ✅ استخدام useTransition لتحسين الأداء
  const [isPending, startTransition] = useTransition();

  // ✅ إدارة الترقيم
  const {
    currentPage,
    totalPages,
    currentAyahs,
    goToNextPage,
    goToPreviousPage,
    resetPage,
  } = usePagination(selectedSurah?.ayahs || [], 10);

  // ✅ مزامنة إعدادات القراءة
  useReadingSettingsSync(fontSize, surahs.length > 0);

  // ✅ جلب سورة معينة - مع useCallback لتحسين الأداء
  const handleSelectSurah = useCallback(async (surahNumber: number) => {
    try {
      setLoading(true);
      const surahData = await getSurah(surahNumber);
      setSelectedSurah(surahData as SurahData);
      resetPage();
      await saveReadingBookmark(surahNumber, 1);
    } catch (err) {
      console.error("Error fetching surah:", err);
    } finally {
      setLoading(false);
    }
  }, [resetPage]);

  // ✅ العودة إلى قائمة السور - مع useCallback
  const handleBackToList = useCallback(() => {
    setSelectedSurah(null);
    resetPage();
  }, [resetPage]);

  // ✅ تغيير حجم الخط - مع useCallback و startTransition
  const handleFontSizeChange = useCallback((size: number) => {
    startTransition(() => {
      setFontSize(size);
    });
  }, [startTransition]);

  // ✅ معالج تغيير الصفحة - مع useCallback
  const handlePageChange = useCallback((page: number) => {
    startTransition(() => {
      const diff = page - currentPage;
      if (diff > 0) {
        for (let i = 0; i < diff; i++) goToNextPage();
      } else {
        for (let i = 0; i < Math.abs(diff); i++) goToPreviousPage();
      }
    });
  }, [currentPage, goToNextPage, goToPreviousPage, startTransition]);

  if (initLoading) {
    return (
      <LoadingSpinner 
        size="lg" 
        color="emerald" 
        text="جاري تحميل القرآن الكريم..." 
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50"
      dir="rtl">
      <div className="container mx-auto px-4 pt-8 pb-16 mb-8">
        <PageHeader
          title="القرآن الكريم"
          subtitle="اقرأ واستمع وتدبر آيات الله في واجهة مريحة وجميلة ✨"
          icon={<BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-white" />}
        />
        {error && (
          <Alert variant="danger" className="mb-6 animate-shake">
            {error}
          </Alert>
        )}

        {!selectedSurah ? (
          <SurahList surahs={surahs} onSelectSurah={handleSelectSurah} />
        ) : (
          <div className="max-w-5xl mx-auto animate-fadeIn">
            <ReaderControls
              selectedSurah={selectedSurah}
              currentPage={currentPage}
              totalPages={totalPages}
              fontSize={fontSize}
              onFontSizeChange={handleFontSizeChange}
              onBackToList={handleBackToList}
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
                  onNext={goToNextPage}
                  onPrevious={goToPreviousPage}
                  onPageChange={handlePageChange}
                />
              </Suspense>
            )}
          </div>
        )}
      </div>

     
    </div>
  );
};

export default QuranPage;
