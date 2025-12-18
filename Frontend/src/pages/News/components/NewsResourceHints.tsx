import { useEffect } from 'react';
import type { INews } from '@/Api/newsApi';

interface NewsResourceHintsProps {
  newsItems: INews[];
}

/**
 * Optimized resource hints component
 * Only preconnects to CDN, no image preloading (to avoid unused preload warnings)
 */
const NewsResourceHints = ({ newsItems }: NewsResourceHintsProps) => {
  useEffect(() => {
    if (!newsItems.length) return;

    // Only preconnect to CDNs (no preloading to avoid "not used" warnings)
    const linkElements: HTMLLinkElement[] = [];

    // Extract unique domains from news images
    const uniqueDomains = new Set<string>();
    
    newsItems.slice(0, 5).forEach(item => {
      const imageUrl = item.images?.[0]?.url || item.image;
      if (imageUrl && !imageUrl.includes('placehold.co')) {
        try {
          const url = new URL(imageUrl);
          uniqueDomains.add(`${url.protocol}//${url.hostname}`);
        } catch {
          // Invalid URL, skip
        }
      }
    });

    // Add preconnect for discovered domains (max 2 to avoid overhead)
    Array.from(uniqueDomains).slice(0, 2).forEach(domain => {
      // Check if preconnect already exists
      const existing = document.querySelector(`link[rel="preconnect"][href="${domain}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
        linkElements.push(link);
      }
    });

    // Cleanup function
    return () => {
      linkElements.forEach(link => {
        if (link.parentNode === document.head) {
          document.head.removeChild(link);
        }
      });
    };
  }, [newsItems]);

  return null; // This component doesn't render anything
};

export default NewsResourceHints;
