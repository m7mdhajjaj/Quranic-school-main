// ============================================================================
// useWelcomePage.ts - Hook مخصص لصفحة الترحيب
// ============================================================================

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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

// ============================================================================
// Constants - روابط الفيديو
// ============================================================================
export const LOCAL_VIDEO_URL = '/QuestPage/Quest.mp4';
export const CLOUDINARY_VIDEO_URL = 'https://res.cloudinary.com/dfi5r4ssx/video/upload/v1/quranic-school/QuestPage/Quest_fgcfvr.mp4';

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
const PARTICLES = generateParticles(50);
const FLOATING_SHAPES = generateFloatingShapes(15);
const SHOOTING_STARS = generateShootingStars(5);

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
    particles: PARTICLES,
    floatingShapes: FLOATING_SHAPES,
    shootingStars: SHOOTING_STARS,
    videoUrl: customVideoUrl || LOCAL_VIDEO_URL,
    fallbackVideoUrl: CLOUDINARY_VIDEO_URL,
    
    // Handlers
    handleLoginClick,
    handleHomeClick,
  };
};

export default useWelcomePage;
