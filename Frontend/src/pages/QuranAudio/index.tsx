import React, { useCallback, lazy, Suspense } from "react";
import { useQuranAudio } from "./hooks/useQuranAudio";
import { PageHeader } from "./components";
import { LoadingSpinner } from "../../components/UI";

// ✅ Lazy load heavy components to reduce initial bundle size
const ReciterSelector = lazy(() => import("./components/ReciterSelector"));
const SurahList = lazy(() => import("./components/SurahList"));
const AudioControls = lazy(() => import("./components/AudioControls"));
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
    handleSurahSelect,
    handleReciterChange,
    playFullSurah,
    pauseAudio,
    handleAudioEnded,
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" dir="rtl">
      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={handleAudioEnded} preload="none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <PageHeader 
          title="القرآن الكريم - صوتي"
          subtitle="استمع إلى القرآن الكريم بأصوات القراء المشهورين 🎧"
        />

        {/* ✅ Lazy load components with Suspense for better performance */}
        <Suspense fallback={<LoadingSpinner size="lg" />}>
          <ReciterSelector
            reciters={reciters}
            selectedReciter={reciter}
            onReciterChange={handleReciterChange}
          />
        </Suspense>

        {/* Sticky Audio Controls - يظهر فقط عند اختيار سورة */}
        {selectedSurah && (
          <Suspense fallback={<LoadingSpinner size="md" />}>
            <div className="sticky top-4 z-20 mb-6 animate-fadeIn">
              <AudioControls
                selectedSurah={selectedSurah}
                isPlaying={isPlaying}
                loading={loading}
                audioError={audioError}
                reciter={reciter}
                reciters={reciters}
                onPlay={playFullSurah}
                onPause={pauseAudio}
              />
            </div>
          </Suspense>
        )}

        <Suspense fallback={<LoadingSpinner size="lg" text="جاري تحميل قائمة السور..." />}>
          <SurahList
            surahs={surahs}
            selectedSurah={selectedSurah}
            isPlaying={isPlaying}
            loading={loading}
            onSurahSelect={handleSurahSelect}
            onPlayPause={handlePlayPause}
          />
        </Suspense>

        <Suspense fallback={<LoadingSpinner size="md" text="جاري تحميل الآيات..." />}>
          <AyahsList ayahs={ayahs} loading={loading} />
        </Suspense>
      </div>
    </div>
  );
};

export default React.memo(QuranAudio);
