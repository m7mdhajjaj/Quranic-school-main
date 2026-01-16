// ============================================================================
// AnimatedBackground.tsx - الخلفية المتحركة (نسخة مبسطة)
// ============================================================================

import { useAnimatedBackground } from '../Hooks/useAnimatedBackground';

interface AnimatedBackgroundProps {
  videoUrl: string;
  fallbackVideoUrl: string;
}

export const AnimatedBackground = ({ 
  videoUrl, 
  fallbackVideoUrl 
}: AnimatedBackgroundProps) => {
  const {
    videoError,
    currentVideoUrl,
    handleVideoError,
    handleVideoLoaded,
  } = useAnimatedBackground(videoUrl, fallbackVideoUrl);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-emerald-950">
      {/* Video Background - Full Cover */}
      {!videoError && (
        <video
          key={currentVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          loading="lazy"
          className="absolute inset-0 w-full h-full z-0"
          style={{
            objectFit: 'cover',
            objectPosition: 'center center',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
          onError={handleVideoError}
          onLoadedData={(e) => {
            handleVideoLoaded();
            const video = e.currentTarget;
            video.play().catch(handleVideoError);
          }}
        >
          <source src={currentVideoUrl} type="video/mp4" />
        </video>
      )}

      {/* Fallback gradient background if all videos fail */}
      {videoError && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-950 z-0" />
      )}

      {/* Combined Overlay - أداء أفضل */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50 z-[1]" />
    </div>
  );
};
