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
          preload="auto"
          className="absolute inset-0 w-full h-full z-0"
          style={{
            objectFit: 'cover',
            objectPosition: 'center center',
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

      {/* Dark Overlay for better text readability - خفيف */}
      <div className="absolute inset-0 bg-black/40 z-[1]" />
      
      {/* Vignette Effect - خفيف */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 z-[2]" />
    </div>
  );
};
