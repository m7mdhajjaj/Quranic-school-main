/**
 * ============================================================================
 * USE HERO CAROUSEL HOOK - هوك التحكم بكاروسيل الهيرو
 * ============================================================================
 * يحتوي على كل منطق الكاروسيل:
 * - التشغيل التلقائي
 * - التنقل بين الصور
 * - حالة تحميل الصور
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface HeroImage {
  url: string;
  publicId: string;
}

interface UseHeroCarouselProps {
  heroImages: HeroImage[];
  autoPlayInterval?: number;
}

interface UseHeroCarouselReturn {
  // State
  currentIndex: number;
  direction: number;
  isPlaying: boolean;
  imageLoaded: Record<number, boolean>;
  showControls: boolean;
  images: HeroImage[];
  hasMultipleImages: boolean;
  
  // Actions
  goToSlide: (index: number) => void;
  goToPrevious: () => void;
  goToNext: () => void;
  togglePlayPause: () => void;
  handleImageLoad: (index: number) => void;
  setShowControls: (show: boolean) => void;
}

export const useHeroCarousel = ({
  heroImages,
  autoPlayInterval = 5000,
}: UseHeroCarouselProps): UseHeroCarouselReturn => {
  // ==========================================================================
  // STATE - الحالة
  // ==========================================================================
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const [showControls, setShowControls] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ==========================================================================
  // COMPUTED VALUES - القيم المحسوبة
  // ==========================================================================
  const images = heroImages.length > 0 ? heroImages : [];
  const hasMultipleImages = images.length > 1;

  // ==========================================================================
  // AUTO-PLAY - التشغيل التلقائي
  // ==========================================================================
  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (hasMultipleImages && isPlaying) {
      intervalRef.current = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, autoPlayInterval);
    }
  }, [hasMultipleImages, isPlaying, images.length, autoPlayInterval]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoPlay]);

  // Reset currentIndex if images change
  useEffect(() => {
    if (currentIndex >= images.length && images.length > 0) {
      setCurrentIndex(0);
    }
  }, [images.length, currentIndex]);

  // ==========================================================================
  // NAVIGATION HANDLERS - دوال التنقل
  // ==========================================================================
  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  const goToPrevious = useCallback(() => {
    if (images.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToNext = useCallback(() => {
    if (images.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // ==========================================================================
  // IMAGE LOADING HANDLER - دالة تحميل الصور
  // ==========================================================================
  const handleImageLoad = useCallback((index: number) => {
    setImageLoaded((prev) => ({ ...prev, [index]: true }));
  }, []);

  // ==========================================================================
  // RETURN - الإرجاع
  // ==========================================================================
  return {
    // State
    currentIndex,
    direction,
    isPlaying,
    imageLoaded,
    showControls,
    images,
    hasMultipleImages,
    
    // Actions
    goToSlide,
    goToPrevious,
    goToNext,
    togglePlayPause,
    handleImageLoad,
    setShowControls,
  };
};

export default useHeroCarousel;
