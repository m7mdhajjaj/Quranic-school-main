import { useState, useCallback } from "react";
import { Alert, PageHeader } from "@/components/UI";
import { BookOpen } from "lucide-react";
import QuranListView from "./Views/QuranListView";
import QuranReaderView from "./Views/QuranReaderView";
import { useQuranInit } from "./hooks/useQuranInit";
import { usePagination } from "./hooks/usePagination";
import { useReadingSettingsSync } from "./hooks/useReadingSettingsSync";
import { useQuranState } from "./hooks/useQuranState";

const QuranPage = () => {
  const { surahs, settings, loading: initLoading, error } = useQuranInit();
  const [fontSize, setFontSize] = useState(settings.fontSize);

  const paginationData = usePagination([], 10);

  const {
    selectedSurah,
    loading,
    isPending,
    startTransition,
    handleSelectSurah,
    handleBackToList,
  } = useQuranState(paginationData.resetPage);

  useReadingSettingsSync(fontSize, surahs.length > 0);

  // تحديث الترقيم عند تغيير السورة
  const readerPagination = usePagination(selectedSurah?.ayahs || [], 10);

  const handleFontSizeChange = useCallback((size: number) => {
    startTransition(() => {
      setFontSize(size);
    });
  }, [startTransition]);

  const handlePageChange = useCallback((page: number) => {
    startTransition(() => {
      const diff = page - readerPagination.currentPage;
      if (diff > 0) {
        for (let i = 0; i < diff; i++) readerPagination.goToNextPage();
      } else {
        for (let i = 0; i < Math.abs(diff); i++) readerPagination.goToPreviousPage();
      }
    });
  }, [readerPagination, startTransition]);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100"
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

        {initLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل قائمة السور...</p>
            </div>
          </div>
        ) : !selectedSurah ? (
          <QuranListView surahs={surahs} onSelectSurah={handleSelectSurah} />
        ) : (
          <QuranReaderView
            selectedSurah={selectedSurah}
            currentAyahs={readerPagination.currentAyahs}
            currentPage={readerPagination.currentPage}
            totalPages={readerPagination.totalPages}
            fontSize={fontSize}
            loading={loading}
            isPending={isPending}
            onFontSizeChange={handleFontSizeChange}
            onBackToList={handleBackToList}
            onNextPage={readerPagination.goToNextPage}
            onPreviousPage={readerPagination.goToPreviousPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>

     
    </div>
  );
};

export default QuranPage;
