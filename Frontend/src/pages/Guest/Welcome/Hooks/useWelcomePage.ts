// ============================================================================
// useWelcomePage.ts - Hook مخصص لصفحة الترحيب
// ============================================================================

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// Constants - روابط الفيديو
// ============================================================================
export const LOCAL_VIDEO_URL = '/QuestPage/Quest.mp4';
export const CLOUDINARY_VIDEO_URL = 'https://res.cloudinary.com/dfi5r4ssx/video/upload/v1/quranic-school/QuestPage/Quest_fgcfvr.mp4';

// ============================================================================
// useWelcomePage Hook
// ============================================================================
export const useWelcomePage = () => {
  const navigate = useNavigate();

  // التحقق من وجود فيديو مرفوع من الأدمن في localStorage
  const customVideoUrl = typeof window !== 'undefined' 
    ? localStorage.getItem('welcomePageVideoUrl') 
    : null;

  // Navigation handlers
  const handleLoginClick = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleHomeClick = useCallback(() => {
    navigate('/home');
  }, [navigate]);

  return {
    // Data
    videoUrl: customVideoUrl || LOCAL_VIDEO_URL,
    fallbackVideoUrl: CLOUDINARY_VIDEO_URL,
    
    // Handlers
    handleLoginClick,
    handleHomeClick,
  };
};

export default useWelcomePage;
