// ============================================================================
// useAnimatedBackground.ts - Hook لإدارة خلفية الفيديو
// ============================================================================

import { useState, useCallback, useMemo } from 'react';

export const useAnimatedBackground = (videoUrl: string, fallbackVideoUrl: string) => {
  const [videoError, setVideoError] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // قائمة بجميع روابط الفيديوهات للتجربة
  const videoUrls = useMemo(() => [
    videoUrl, // Local or Primary
    fallbackVideoUrl, // Cloudinary
    'https://videos.pexels.com/video-files/3773486/3773486-hd_1920_1080_30fps.mp4', // Pexels Mosque
  ], [videoUrl, fallbackVideoUrl]);

  const currentVideoUrl = videoUrls[currentVideoIndex];

  const handleVideoError = useCallback(() => {
    console.log(`❌ فشل تحميل الفيديو: ${videoUrls[currentVideoIndex]}`);
    
    if (currentVideoIndex < videoUrls.length - 1) {
      console.log(`🔄 جاري المحاولة بفيديو آخر... (${currentVideoIndex + 2}/${videoUrls.length})`);
      setCurrentVideoIndex(prev => prev + 1);
    } else {
      console.log('✅ عرض الخلفية القرآنية البديلة');
      setVideoError(true);
    }
  }, [currentVideoIndex, videoUrls]);

  const handleVideoLoaded = useCallback(() => {
    console.log(`✅ تم تحميل الفيديو بنجاح: ${videoUrls[currentVideoIndex]}`);
  }, [currentVideoIndex, videoUrls]);

  return {
    videoError,
    currentVideoUrl,
    handleVideoError,
    handleVideoLoaded,
  };
};
