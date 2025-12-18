import { useEffect } from 'react';
import type { INews } from '@/Api/newsApi';

interface NewsResourceHintsProps {
  newsItems: INews[];
}

/**
 * Component to add resource hints for better image loading performance
 * Preconnects to image CDNs and preloads first few images
 */
const NewsResourceHints = ({ newsItems }: NewsResourceHintsProps) => {
  useEffect(() => {
    // Only preload first 2-3 images to avoid excessive bandwidth
    const imagesToPreload = newsItems.slice(0, 3).flatMap(item => {
      if (item.images && item.images.length > 0) {
        return item.images[0]?.url || '';
      }
      return item.image || '';
    }).filter(url => url && !url.includes('placehold.co'));

    // Create link elements for preloading
    const linkElements: HTMLLinkElement[] = [];

    // Add preconnect for common image CDNs
    const preconnectDomains = [
      'https://res.cloudinary.com',
      'https://images.unsplash.com',
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      linkElements.push(link);
    });

    // Preload first few images
    imagesToPreload.forEach((url, index) => {
      if (index < 2) { // Only preload first 2 images
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        link.fetchPriority = index === 0 ? 'high' : 'low';
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
