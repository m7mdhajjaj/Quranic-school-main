// ============================================================================
// useWelcomePage.ts - Hook مخصص لصفحة الترحيب
// ============================================================================

import { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/Api/api';

// ============================================================================
// Constants - روابط الفيديو
// ============================================================================
export const LOCAL_VIDEO_URL = '/QuestPage/Quest.mp4';
// فيديو مسجد من Pexels كـ fallback
export const CLOUDINARY_VIDEO_URL = 'https://videos.pexels.com/video-files/3773486/3773486-hd_1920_1080_30fps.mp4';

// مفاتيح التخزين
const CACHE_KEY = 'welcomeVideoUrl';
const CACHE_TIMESTAMP_KEY = 'welcomeVideoTimestamp';
const CACHE_DURATION = 30 * 60 * 1000; // 30 دقيقة

// ============================================================================
// useWelcomePage Hook
// ============================================================================
export const useWelcomePage = () => {
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false); // لمنع duplicate calls في StrictMode

  // جلب رابط الفيديو من Backend عند تحميل الصفحة (مع caching ذكي)
  useEffect(() => {
    // منع تنفيذ API call مرتين في StrictMode
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchWelcomeVideo = async () => {
      try {
        // 1. التحقق من وجود نسخة محفوظة في localStorage
        const cachedUrl = localStorage.getItem(CACHE_KEY);
        const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        const now = Date.now();

        // إذا في cache وما زال صالح (أقل من 30 دقيقة)
        if (cachedUrl && cachedTimestamp) {
          const cacheAge = now - parseInt(cachedTimestamp);
          if (cacheAge < CACHE_DURATION) {
            setVideoUrl(cachedUrl);
            setIsLoading(false);
            console.log('✅ تم تحميل فيديو الترحيب من Cache (عمر:', Math.round(cacheAge / 1000 / 60), 'دقيقة)');
            return; // استخدام الـ cache بدون API call
          }
        }

        // 2. إذا ما في cache أو قديم، اعمل API call
        console.log('🔄 جاري جلب فيديو الترحيب من Backend...');
        const response = await api.get('/upload/welcome-video');
        
        if (response.data.success && response.data.data.url) {
          const newUrl = response.data.data.url;
          setVideoUrl(newUrl);
          
          // حفظ في localStorage للمرات القادمة
          localStorage.setItem(CACHE_KEY, newUrl);
          localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());
          
          console.log('✅ تم جلب فيديو الترحيب من قاعدة البيانات وحفظه في Cache:', newUrl);
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
    videoUrl: videoUrl || CLOUDINARY_VIDEO_URL, // استخدام الفيديو الافتراضي إذا لم يتم التحميل بعد
    fallbackVideoUrl: CLOUDINARY_VIDEO_URL,
    isLoading,
    
    // Handlers
    handleLoginClick,
    handleHomeClick,
  };
};

export default useWelcomePage;
