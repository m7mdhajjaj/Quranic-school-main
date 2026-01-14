import { useState, useCallback } from "react";
import type { Ripple } from "../components/ClickRipples";

/**
 * Hook for managing click ripple effects
 * هوك لإدارة تأثير الموجة عند الضغط
 */
export const useClickRipples = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const addRipple = useCallback((e: React.MouseEvent) => {
    const newRipple: Ripple = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };
    
    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1000);
  }, []);

  return { ripples, addRipple };
};
