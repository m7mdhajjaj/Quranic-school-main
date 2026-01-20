import React, { useCallback, lazy, Suspense } from "react";
import { useQuranAudio } from "./hooks/useQuranAudio";
import { PlaybackSettings } from "./components";
import { LoadingSpinner } from "@/components/UI";
import { Headphones } from "lucide-react";

// ✅ Lazy load heavy components to reduce initial bundle size
const ReciterSelector = lazy(() => import("./components/ReciterSelector"));
const SurahList = lazy(() => import("./components/SurahList"));
const AyahsList = lazy(() => import("./components/AyahsList"));

const QuranAudio: React.FC = () => {
  const {
    surahs,
    selectedSurah,
    ayahs,
    loading,
    isPlaying,
    reciter,
    audioError,
    reciters,
    audioRef,
    currentAyahNumber,
    highlightWords,
    handleSurahSelect,
    handleReciterChange,
    playFullSurah,
    pauseAudio,
    handleAudioEnded,
    toggleHighlightWords,
  } = useQuranAudio();

  // Optimize play/pause to avoid blocking
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playFullSurah();
    }
  }, [isPlaying, pauseAudio, playFullSurah]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20" dir="rtl">
      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={handleAudioEnded} preload="none" />

      <div className="max-w-[98%] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-2xl shadow-xl p-6 border border-white/10 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                🎧 القرآن الكريم - صوتي
              </h1>
              <p className="text-white/70 text-sm mt-1">
                استمع إلى القرآن الكريم بأصوات القراء المشهورين 🎧
              </p>
            </div>
          </div>
        </div>

        {/* ✅ استخدام Suspense واحد لتحميل جميع المكونات الأساسية معاً لتقليل عدد اللودرات */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="جاري تحميل صفحة القرآن الكريم..." />
          </div>
        }>
          <ReciterSelector
            reciters={reciters}
            selectedReciter={reciter}
            onReciterChange={handleReciterChange}
          />

          <SurahList
            surahs={surahs}
            selectedSurah={selectedSurah}
            isPlaying={isPlaying}
            loading={loading}
            onSurahSelect={handleSurahSelect}
            onPlayPause={handlePlayPause}
          />

          {selectedSurah && ayahs.length > 0 && (
            <PlaybackSettings
              highlightWords={highlightWords}
              onToggleHighlight={toggleHighlightWords}
            />
          )}

          <AyahsList 
            ayahs={ayahs} 
            loading={loading}
            isPlaying={isPlaying}
            currentAyahNumber={currentAyahNumber}
            highlightWords={highlightWords}
            selectedSurah={selectedSurah}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default React.memo(QuranAudio);
