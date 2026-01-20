import { useState, memo, lazy, Suspense, useCallback } from 'react';
import type { NewsCardProps } from '../Types/types';
import AddedAgo from '@/components/UI/AddedAgo';
import { Button, Card, DropdownMenu } from '@/components/UI';
import { ArrowLeft, Edit, Trash2, ChevronLeft, ChevronRight, Globe, Users } from 'lucide-react';
import ImageSkeleton from '@/components/skeletons/ImageSkeleton';
import { useFadeInOnScroll } from '../hooks/useFadeInOnScroll';
import {
  extractNewsImages,
  getImageLoadingStrategy,
  getSafeImageUrl,
  getFallbackImage,
  isPlaceholder,
  fixLocalImagePath,
  extractAuthorInfo,
  canUserModifyNews,
} from '../utils/imageHelpers';

// Lazy load gallery modal - only loads when user clicks to view
const NewsGalleryModal = lazy(() => import('./NewsGalleryModal'));

const NewsCard = memo(({
  news,
  index,
  isTeacherOrAdmin,
  currentUserId,
  currentUserRole,
  onEdit,
  onDelete,
}: NewsCardProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  // Use lightweight fade-in animation (replaces AOS for better performance)
  const fadeInRef = useFadeInOnScroll({ 
    threshold: 0.1, 
    triggerOnce: true 
  });

  // Extract data using helper functions (DRY principle)
  const displayDate = news.createdAt || news.date;
  const images = extractNewsImages(news);
  const hasMultipleImages = images.length > 1;
  const { authorId: newsAuthorId, authorName } = extractAuthorInfo(news.author);
  const canEditOrDelete = canUserModifyNews(isTeacherOrAdmin, currentUserRole, newsAuthorId, currentUserId);
  const loadingStrategy = getImageLoadingStrategy(index);

  // Memoized handlers for better performance
  const handleImageLoad = useCallback(() => {
    queueMicrotask(() => {
      setImageLoading(false);
      setImageError(false);
    });
  }, []);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const imgElement = e.target as HTMLImageElement;
    const originalSrc = images[currentImageIndex];
    
    queueMicrotask(() => {
      setImageLoading(false);
      setImageError(true);
    });

    if (isPlaceholder(originalSrc)) return;
    
    const fixedPath = fixLocalImagePath(originalSrc);
    if (fixedPath) {
      imgElement.src = fixedPath;
      queueMicrotask(() => setImageError(false));
      return;
    }
    
    imgElement.src = getFallbackImage();
    queueMicrotask(() => setImageError(false));
  }, [images, currentImageIndex]);

  const handlePrevImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    queueMicrotask(() => {
      setCurrentImageIndex((prev) => prev === 0 ? images.length - 1 : prev - 1);
      setImageLoading(true);
    });
  }, [images.length]);

  const handleNextImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    queueMicrotask(() => {
      setCurrentImageIndex((prev) => prev === images.length - 1 ? 0 : prev + 1);
      setImageLoading(true);
    });
  }, [images.length]);

  const handleImageIndicatorClick = useCallback((e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    queueMicrotask(() => {
      setCurrentImageIndex(idx);
      setImageLoading(true);
    });
  }, []);

  const handleOpenGallery = useCallback(() => {
    setIsGalleryOpen(true);
  }, []);

  const handleCloseGallery = useCallback(() => {
    setIsGalleryOpen(false);
  }, []);

  return (
    <div ref={fadeInRef}>
      <Suspense fallback={null}>
        <NewsGalleryModal
          isOpen={isGalleryOpen}
          title={news.title}
          content={news.content}
          images={images}
          initialIndex={currentImageIndex}
          onClose={handleCloseGallery}
        />
      </Suspense>
      <Card
        variant="gradient"
        padding="none"
        hover={true}
        className="relative group overflow-hidden animate-fadeIn bg-white border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 rounded-2xl"
      >
      <div className="relative overflow-hidden h-72 sm:h-80 md:h-96 flex items-center justify-center bg-gradient-to-br from-slate-100 to-emerald-50">
        {/* Image Skeleton */}
        {imageLoading && !imageError && (
          <div className="absolute inset-0">
            <ImageSkeleton />
          </div>
        )}
        
        {/* Main Image */}
        <img
            src={getSafeImageUrl(images[currentImageIndex], 'صورة+الخبر')}
            alt={`${news.title} - صورة ${currentImageIndex + 1}`}
            width="600"
            height="400"
            loading={loadingStrategy.loading}
            decoding={loadingStrategy.decoding}
            fetchPriority={loadingStrategy.fetchPriority}
            className={`w-full h-full object-cover rounded-t-xl transition-all duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ contentVisibility: 'auto' }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          {/* Navigation Arrows for Multiple Images */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 hover:from-emerald-700 hover:via-teal-800 hover:to-slate-800 text-white rounded-full p-2.5 transition-all z-30 backdrop-blur-sm shadow-xl hover:scale-110 opacity-90 hover:opacity-100"
                aria-label="الصورة السابقة"
              >
                <ChevronLeft size={24} strokeWidth={3} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 hover:from-emerald-700 hover:via-teal-800 hover:to-slate-800 text-white rounded-full p-2.5 transition-all z-30 backdrop-blur-sm shadow-xl hover:scale-110 opacity-90 hover:opacity-100"
                aria-label="الصورة التالية"
              >
                <ChevronRight size={24} strokeWidth={3} />
              </button>
              
              {/* Image Counter */}
              <div className="absolute top-3 left-3 z-30">
                <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-lg">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>
              
              {/* Image Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => handleImageIndicatorClick(e, idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? 'bg-white w-6'
                        : 'bg-white/50 hover:bg-white/70 w-1.5'
                    }`}
                    aria-label={`الذهاب للصورة ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
          {/* Actions top right */}
          {canEditOrDelete && (
            <div className="absolute top-3 right-3 z-20" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu
                items={[
                  {
                    label: 'تعديل',
                    icon: <Edit size={18} />,
                    onClick: () => onEdit(news),
                    variant: 'warning',
                  },
                  {
                    label: 'حذف',
                    icon: <Trash2 size={18} />,
                    onClick: () => onDelete(news._id),
                    variant: 'danger',
                  },
                ]}
                position="right"
              />
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col gap-3 bg-gradient-to-br from-white via-white to-emerald-50/30">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Visibility Badge */}
              {news.visibility === 'group' ? (
                <span className="flex items-center gap-1 bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200/60 font-medium" title="طلاب المعلم">
                  <Users size={12} />
                  <span>طلاب المعلم</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-gradient-to-r from-slate-50 to-slate-100/50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/60 font-medium" title="عام للجميع">
                  <Globe size={12} />
                  <span>عام</span>
                </span>
              )}

              {authorName && (
                <span className="flex items-center gap-1 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                  <span className="font-medium">نشر بواسطة:</span> {authorName}
                </span>
              )}
            </div>
            <AddedAgo date={displayDate} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 line-clamp-2 leading-tight">
            {news.title}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
            {news.content}
          </p>
          <div className="flex justify-end mt-2">
            <Button
              variant="primary"
              size="md"
              className="rounded-xl shadow-md hover:shadow-lg group/btn px-6 py-2.5 text-sm bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 hover:from-emerald-700 hover:via-teal-800 hover:to-slate-800 border-0"
              onClick={handleOpenGallery}
            >
              <span>اقرأ المزيد</span>
              <ArrowLeft
                size={16}
                className="group-hover/btn:translate-x-1 transition-transform"
              />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  // Compare primitive values first (faster)
  if (
    prevProps.news._id !== nextProps.news._id ||
    prevProps.index !== nextProps.index ||
    prevProps.isTeacherOrAdmin !== nextProps.isTeacherOrAdmin ||
    prevProps.currentUserId !== nextProps.currentUserId ||
    prevProps.currentUserRole !== nextProps.currentUserRole
  ) {
    return false;
  }

  // Compare news content (only if primitives match)
  if (
    prevProps.news.title !== nextProps.news.title ||
    prevProps.news.content !== nextProps.news.content ||
    prevProps.news.image !== nextProps.news.image
  ) {
    return false;
  }

  // Compare images array (most expensive, do last)
  const prevImages = prevProps.news.images || [];
  const nextImages = nextProps.news.images || [];
  
  if (prevImages.length !== nextImages.length) {
    return false;
  }

  // Quick check: compare first and last image URLs (usually sufficient)
  if (prevImages.length > 0) {
    if (
      prevImages[0]?.url !== nextImages[0]?.url ||
      prevImages[prevImages.length - 1]?.url !== nextImages[nextImages.length - 1]?.url
    ) {
      return false;
    }
  }

  return true; // Props are equal, skip re-render
});

NewsCard.displayName = 'NewsCard';

export default NewsCard;
