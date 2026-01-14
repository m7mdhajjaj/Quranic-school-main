// ============================================================================
// useWelcomePage.ts - Hook مخصص لصفحة الترحيب
// ============================================================================

import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaQuran, 
  FaGraduationCap, 
  FaMosque, 
  FaStar, 
  FaUsers,
  FaBook
} from 'react-icons/fa';
import { Award } from 'lucide-react';
import { createElement } from 'react';

// ============================================================================
// Types
// ============================================================================
export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export interface FloatingShape {
  id: number;
  type: 'circle' | 'star' | 'diamond';
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export interface ShootingStar {
  id: number;
  top: number;
  delay: number;
}

export interface Feature {
  icon: React.ReactElement;
  title: string;
  description: string;
}

export interface Stat {
  icon: React.ReactElement;
  number: string;
  label: string;
}

// ============================================================================
// Constants
// ============================================================================
// استخدم الفيديو المحلي إذا كان موجوداً، وإلا استخدم Cloudinary
export const LOCAL_VIDEO_URL = '/QuestPage/Quest.mp4';
export const CLOUDINARY_VIDEO_URL = 'https://res.cloudinary.com/dfi5r4ssx/video/upload/v1/quranic-school/QuestPage/Quest_fgcfvr.mp4';
// رابط فيديو احتياطي مجاني من Pexels (فيديو إسلامي/مسجد)
export const FALLBACK_VIDEO_URL = 'https://videos.pexels.com/video-files/3773486/3773486-hd_1920_1080_30fps.mp4';

// ============================================================================
// Generators - توليد العناصر العشوائية
// ============================================================================
const generateParticles = (count: number): Particle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
  }));
};

const generateFloatingShapes = (count: number): FloatingShape[] => {
  const types: ('circle' | 'star' | 'diamond')[] = ['circle', 'star', 'diamond'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    type: types[Math.floor(Math.random() * types.length)],
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 30 + 15,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
  }));
};

const generateShootingStars = (count: number): ShootingStar[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: 10 + i * 15,
    delay: i * 4 + Math.random() * 3,
  }));
};

// Pre-generated data
export const PARTICLES = generateParticles(50);
export const FLOATING_SHAPES = generateFloatingShapes(15);
export const SHOOTING_STARS = generateShootingStars(5);

// ============================================================================
// useWelcomePage Hook
// ============================================================================
export const useWelcomePage = () => {
  const navigate = useNavigate();

  // التحقق من وجود فيديو مرفوع من الأدمن في localStorage
  const customVideoUrl = typeof window !== 'undefined' 
    ? localStorage.getItem('welcomePageVideoUrl') 
    : null;

  // Features data
  const features: Feature[] = useMemo(() => [
    {
      icon: createElement(FaQuran),
      title: 'تعلم القرآن',
      description: 'نظام متكامل لحفظ وتلاوة القرآن الكريم مع متابعة دقيقة',
    },
    {
      icon: createElement(FaGraduationCap),
      title: 'تقييم مستمر',
      description: 'اختبارات وتقييمات دورية لقياس مستوى التقدم',
    },
    {
      icon: createElement(FaMosque),
      title: 'بيئة إسلامية',
      description: 'مواقيت الصلاة والأذكار اليومية في مكان واحد',
    },
    {
      icon: createElement(FaStar),
      title: 'نظام المكافآت',
      description: 'نقاط وجوائز تحفيزية لتشجيع الطلاب على التميز',
    },
  ], []);

  // Stats data
  const stats: Stat[] = useMemo(() => [
    { icon: createElement(FaUsers), number: '500+', label: 'طالب وطالبة' },
    { icon: createElement(FaBook), number: '30+', label: 'حلقة قرآنية' },
    { icon: createElement(FaGraduationCap), number: '50+', label: 'معلم متميز' },
    { icon: createElement(Award), number: '100+', label: 'خريج' },
  ], []);

  // Navigation handlers
  const handleLoginClick = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleHomeClick = useCallback(() => {
    navigate('/home');
  }, [navigate]);

  // Scroll handler
  const handleScrollDown = useCallback(() => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  }, []);

  return {
    // Data
    features,
    stats,
    particles: PARTICLES,
    floatingShapes: FLOATING_SHAPES,
    shootingStars: SHOOTING_STARS,
    // استخدم الفيديو المخصص إذا كان موجوداً، وإلا استخدم المحلي
    videoUrl: customVideoUrl || LOCAL_VIDEO_URL,
    fallbackVideoUrl: CLOUDINARY_VIDEO_URL, // ثم Cloudinary
    
    // Handlers
    handleLoginClick,
    handleHomeClick,
    handleScrollDown,
  };
};

export default useWelcomePage;
