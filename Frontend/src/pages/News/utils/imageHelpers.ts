/**
 * Image helper utilities (DRY principle)
 * Centralized image handling logic used across News components
 */

/**
 * Extract images from news item (supports both single and multiple images)
 */
export const extractNewsImages = (news: {
  images?: Array<{ url: string }>;
  image?: string;
}): string[] => {
  if (news.images && news.images.length > 0) {
    return news.images
      .map(img => img.url)
      .filter(url => url && url.trim() !== '');
  }
  
  if (news.image && news.image.trim() !== '') {
    return [news.image];
  }
  
  return [];
};

/**
 * Get image loading strategy based on index
 */
export const getImageLoadingStrategy = (index: number) => ({
  loading: (index < 4 ? 'eager' : 'lazy') as 'eager' | 'lazy',
  decoding: (index < 4 ? 'sync' : 'async') as 'sync' | 'async',
  fetchPriority: (index < 2 ? 'high' : 'auto') as 'high' | 'auto',
});

/**
 * Get placeholder image URL
 */
export const getPlaceholderImage = (text: string = 'صورة+الخبر') => 
  `https://placehold.co/600x400/e9f5f2/1f6357?text=${text}`;

/**
 * Get fallback image URL
 */
export const getFallbackImage = () => 
  getPlaceholderImage('صورة+غير+متوفرة');

/**
 * Check if URL is a placeholder
 */
export const isPlaceholder = (url: string) => 
  url?.includes('placehold.co');

/**
 * Attempt to fix local image path
 */
export const fixLocalImagePath = (originalSrc: string): string | null => {
  if (!originalSrc?.includes('uploads/news/')) {
    return null;
  }
  
  if (originalSrc.includes('/api/uploads/')) {
    return originalSrc.replace('/api/uploads/', '/uploads/');
  }
  
  if (originalSrc.startsWith('uploads/')) {
    return originalSrc;
  }
  
  return null;
};

/**
 * Get safe image URL with fallback
 */
export const getSafeImageUrl = (url: string | undefined, fallbackText?: string): string => {
  if (!url || url.trim() === '') {
    return getPlaceholderImage(fallbackText);
  }
  return url;
};

/**
 * Extract author information
 */
export const extractAuthorInfo = (author: string | { _id?: string; name?: string; firstName?: string; lastName?: string } | undefined) => {
  const authorId = typeof author === 'string' 
    ? author 
    : author?._id;

  const authorName = typeof author === 'object' && author !== null
    ? (author.name || `${author.firstName || ''} ${author.lastName || ''}`.trim())
    : '';

  return { authorId, authorName };
};

/**
 * Check if user can edit/delete news
 */
export const canUserModifyNews = (
  isTeacherOrAdmin: boolean,
  currentUserRole: string | undefined,
  newsAuthorId: string | undefined,
  currentUserId: string | undefined
): boolean => {
  return isTeacherOrAdmin && 
    (currentUserRole === 'admin' || newsAuthorId === currentUserId);
};
