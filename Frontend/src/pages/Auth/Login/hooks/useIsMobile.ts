import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768; // px — matches Tailwind's md breakpoint

/**
 * Returns `true` when the viewport width is below the mobile breakpoint.
 * Uses `matchMedia` for efficient, listener-based detection.
 */
export const useIsMobile = (breakpoint = MOBILE_BREAKPOINT): boolean => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    // Set initial value (SSR-safe)
    setIsMobile(mql.matches);

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
};
