// ============================================================================
// useFeatureCard.ts - Hook لإدارة حالة بطاقة الميزة
// ============================================================================

import { useState, useCallback } from 'react';

export const useFeatureCard = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleHoverStart = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleHoverEnd = useCallback(() => {
    setIsHovered(false);
  }, []);

  return {
    isHovered,
    handleHoverStart,
    handleHoverEnd,
  };
};
