// ============================================================================
// useAnimatedBackground.ts - Hook لإدارة خلفية الفيديو
// ============================================================================

import { useState, useCallback, useMemo, useEffect } from 'react';

export const useAnimatedBackground = (videoUrl: string, fallbackVideoUrl: string) => {
  const [videoError, setVideoError] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // قائمة بجميع روابط الفيديوهات للتجربة (الفيديو من Cloudinary أولاً)
  const videoUrls = useMemo(() => {
    // إذا كان videoUrl هو نفسه fallbackVideoUrl، استخدم واحد فقط
    if (videoUrl === fallbackVideoUrl) {
      return [videoUrl];
    }
    return [videoUrl]; // فقط الفيديو المخصص أو الافتراضي
  }, [videoUrl, fallbackVideoUrl]);

  // إعادة تعيين الحالة عند تغيير videoUrl
  useEffect(() => {
    setCurrentVideoIndex(0);
    setVideoError(false);
  }, [videoUrl]);

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
