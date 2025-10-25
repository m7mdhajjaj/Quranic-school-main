import { useState, useCallback, useTransition, lazy, Suspense } from "react";
import { Alert } from "../../components/shared";
import { BookOpen, Sparkles } from "lucide-react";
import SurahList from "./SurahList";
import ReaderControls from "./ReaderControls";
import Pagination from "./Pagination";
import { useQuranInit } from "./hooks/useQuranInit";
import { usePagination } from "./hooks/usePagination";
import { useReadingSettingsSync } from "./hooks/useReadingSettingsSync";
import { getSurah, saveReadingBookmark } from "../../Api/quranAudioApi";
import type { SurahData } from "./types/quran.types";

// ✅ Lazy load heavy components
const SurahReader = lazy(() => import("./SurahReader"));

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
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50"
      dir="rtl">
      {/* ✨ Enhanced Sticky Header with gradient and shadow */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg py-6 mb-8">
        <div className="container mx-auto text-center px-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-white animate-pulse" />
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
              القرآن الكريم
            </h1>
            <Sparkles className="w-8 h-8 text-amber-300 animate-bounce" />
          </div>
          <p className="text-white/90 text-sm md:text-base font-medium">
            اقرأ واستمع وتدبر آيات الله في واجهة مريحة وجميلة ✨
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-10">
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
              <div className="text-center py-8">جاري التحميل...</div>
            ) : (
              <Suspense fallback={<div className="text-center py-8">جاري التحميل...</div>}>
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

      {/* ✨ Enhanced Animations - مُحسّنة للأداء */}
      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        @keyframes slideUp { 
          from { transform: translate3d(0, 15px, 0); opacity: 0; } 
          to { transform: translate3d(0, 0, 0); opacity: 1; } 
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }
        .animate-fadeIn { 
          animation: fadeIn 0.3s ease-out; 
          will-change: opacity;
        }
        .animate-slideUp { 
          animation: slideUp 0.4s ease-out; 
          will-change: transform, opacity;
        }
        .animate-fadeSlide { 
          animation: slideUp 0.3s ease-out, fadeIn 0.3s ease-out; 
          will-change: transform, opacity;
        }
        .animate-shake { 
          animation: shake 0.4s ease-in-out; 
        }
        
        /* Scrollbar محسّن */
        .scrollbar-thin::-webkit-scrollbar { 
          width: 10px; 
        }
        .scrollbar-thin::-webkit-scrollbar-thumb { 
          background: linear-gradient(180deg, #10b981, #14b8a6); 
          border-radius: 10px;
          transition: background 0.2s;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { 
          background: linear-gradient(180deg, #059669, #0d9488); 
        }
        .scrollbar-thin::-webkit-scrollbar-track { 
          background-color: #f0fdf4; 
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default QuranPage;
