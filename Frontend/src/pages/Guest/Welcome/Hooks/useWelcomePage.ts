// ============================================================================
// useWelcomePage.ts - Hook مخصص لصفحة الترحيب
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/Api/api';

// ============================================================================
// Constants - روابط الفيديو
// ============================================================================
export const LOCAL_VIDEO_URL = '/QuestPage/Quest.mp4';
// فيديو مسجد من Pexels كـ fallback
export const CLOUDINARY_VIDEO_URL = 'https://videos.pexels.com/video-files/3773486/3773486-hd_1920_1080_30fps.mp4';

// ============================================================================
// useWelcomePage Hook
// ============================================================================
export const useWelcomePage = () => {
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState<string>(LOCAL_VIDEO_URL);
  const [isLoading, setIsLoading] = useState(true);

  // جلب رابط الفيديو من Backend عند تحميل الصفحة
  useEffect(() => {
    const fetchWelcomeVideo = async () => {
      try {
        const response = await api.get('/upload/welcome-video');
        
        if (response.data.success && response.data.data.url) {
          setVideoUrl(response.data.data.url);
          console.log('✅ تم جلب فيديو الترحيب من قاعدة البيانات:', response.data.data.url);
        }
      } catch (error) {
        console.log('ℹ️ استخدام الفيديو الافتراضي');
        // في حالة الخطأ، نستخدم الفيديو الافتراضي
      } finally {
        setIsLoading(false);
      }
    };

    fetchWelcomeVideo();
  }, []);

  // Navigation handlers
  const handleLoginClick = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleHomeClick = useCallback(() => {
    navigate('/home');
  }, [navigate]);

  return {
    // Data
    videoUrl,
    fallbackVideoUrl: CLOUDINARY_VIDEO_URL,
    isLoading,
    
    // Handlers
    handleLoginClick,
    handleHomeClick,
  };
};

export default useWelcomePage;
