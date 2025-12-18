import { useEffect, useRef } from 'react';

interface UseFadeInOnScrollOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Custom hook for fade-in animations on scroll using Intersection Observer
 * Replaces AOS library for better performance (no message handler violations)
 * 
 * @param options - Configuration options
 * @returns ref - Attach this to the element you want to animate
 */
export const useFadeInOnScroll = (options: UseFadeInOnScrollOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
  } = options;

  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: just show the element immediately
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
      return;
    }

    // Set initial state
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate in
            entry.target.setAttribute('style', 
              'opacity: 1; transform: translateY(0); transition: opacity 0.6s ease-out, transform 0.6s ease-out;'
            );
            
            // Disconnect after first trigger if triggerOnce is true
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            // Animate out if not triggerOnce
            entry.target.setAttribute('style', 
              'opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease-out, transform 0.6s ease-out;'
            );
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return elementRef;
};
