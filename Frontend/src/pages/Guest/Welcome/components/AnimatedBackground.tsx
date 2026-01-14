// ============================================================================
// AnimatedBackground.tsx - الخلفية المتحركة (نسخة مبسطة)
// ============================================================================

import type { Particle, FloatingShape } from '../Hooks/useWelcomePage';
import { useAnimatedBackground } from '../Hooks/useAnimatedBackground';

interface AnimatedBackgroundProps {
  floatingShapes: FloatingShape[];
  particles: Particle[];
  shootingStars: { id: number; top: number; delay: number }[];
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
    <div className="absolute inset-0 overflow-hidden">
      {/* Video Background */}
      {!videoError && (
        <video
          key={currentVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover z-0"
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
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Vignette Effect - خفيف */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
    </div>
  );
};
