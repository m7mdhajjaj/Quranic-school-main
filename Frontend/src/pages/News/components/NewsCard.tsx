import { useState } from 'react';
import type { NewsCardProps } from '../utils/types';
import AddedAgo from '@/components/UI/AddedAgo';
import { Button, Card } from '@/components/UI';
import { ArrowLeft, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import ImageSkeleton from '@/components/skeletons/ImageSkeleton';

const NewsCard = ({
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
  const displayDate = news.createdAt || news.date;

  // استخراج الصور - دعم الصور المتعددة أو الصورة الواحدة
  const images = news.images && news.images.length > 0
    ? news.images.map(img => img.url).filter(url => url && url.trim() !== '')
    : news.image && news.image.trim() !== ''
    ? [news.image]
    : [];

  const hasMultipleImages = images.length > 1;
  
  // Log للتحقق من الصور
  if (index === 0) {
    console.log('📸 NewsCard:', news.title);
    console.log('  - عدد الصور:', images.length);
    console.log('  - hasMultipleImages:', hasMultipleImages);
    if (images.length > 0) {
      console.log('  - أول صورة:', images[0]);
    }
  }

  // استخراج author ID بشكل صحيح (قد يكون string أو object)
  const newsAuthorId = typeof news.author === 'string' 
    ? news.author 
    : news.author?._id;

  // التحقق من صلاحيات التعديل/الحذف
  const canEditOrDelete = 
    isTeacherOrAdmin && 
    (currentUserRole === 'admin' || newsAuthorId === currentUserId);

  return (
    <div data-aos="fade-up" data-aos-delay={index * 100}>
      <Card
        variant="gradient"
        padding="none"
        hover={true}
        className="relative group overflow-hidden animate-fadeIn bg-gradient-to-br from-emerald-50 via-white to-emerald-100 border border-emerald-100"
      >
      <div className="relative overflow-hidden h-60 sm:h-64 md:h-72 flex items-center justify-center bg-gradient-to-t from-emerald-100 to-white">
        {/* Image Skeleton */}
        {imageLoading && !imageError && (
          <div className="absolute inset-0">
            <ImageSkeleton />
          </div>
        )}
        
        {/* Main Image */}
        <img
            src={images[currentImageIndex] || 'https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+الخبر'}
            alt={`${news.title} - صورة ${currentImageIndex + 1}`}
            loading={index < 2 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={index === 0 ? 'high' : 'auto'}
            className={`w-full h-full object-cover rounded-t-3xl transition-all duration-500 shadow-sm group-hover:brightness-105 group-hover:scale-100 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => {
              setImageLoading(false);
              setImageError(false);
            }}
            onError={(e) => {
              const imgElement = e.target as HTMLImageElement;
              const originalSrc = images[currentImageIndex];
              console.warn('⚠️ فشل تحميل الصورة:', originalSrc);
              setImageLoading(false);
              setImageError(true);

              // إذا كان placeholder، لا تفعل شيء
              if (originalSrc?.includes('placehold.co')) return;
              
              // محاولة إصلاح المسار للصور المحلية
              if (originalSrc?.includes('uploads/news/')) {
                if (originalSrc.includes('/api/uploads/')) {
                  imgElement.src = originalSrc.replace('/api/uploads/', '/uploads/');
                  setImageError(false);
                  return;
                }
                if (originalSrc.startsWith('uploads/')) {
                  imgElement.src = originalSrc;
                  setImageError(false);
                  return;
                }
              }
              
              // استخدام صورة بديلة
              imgElement.src = 'https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+غير+متوفرة';
              setImageError(false);
            }}
          />
          
          {/* Navigation Arrows for Multiple Images */}
          {hasMultipleImages && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => 
                    prev === 0 ? images.length - 1 : prev - 1
                  );
                  setImageLoading(true);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2.5 transition-all z-30 backdrop-blur-sm shadow-xl hover:scale-110 opacity-90 hover:opacity-100"
                aria-label="الصورة السابقة"
              >
                <ChevronLeft size={24} strokeWidth={3} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => 
                    prev === images.length - 1 ? 0 : prev + 1
                  );
                  setImageLoading(true);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2.5 transition-all z-30 backdrop-blur-sm shadow-xl hover:scale-110 opacity-90 hover:opacity-100"
                aria-label="الصورة التالية"
              >
                <ChevronRight size={24} strokeWidth={3} />
              </button>
              
              {/* Image Counter and Badge */}
              <div className="absolute top-3 left-3 flex flex-col gap-2 z-30">
                <div className="bg-emerald-600 text-white text-sm font-bold px-3 py-1.5 rounded-full backdrop-blur-sm shadow-lg flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>
              
              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                      setImageLoading(true);
                    }}
                    className={`h-2.5 rounded-full transition-all shadow-md ${
                      idx === currentImageIndex
                        ? 'bg-emerald-500 w-8'
                        : 'bg-white/70 hover:bg-white w-2.5'
                    }`}
                    aria-label={`الذهاب للصورة ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
          {/* Author top right, Date top left */}
          {news.authorName && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1">
              <span className="bg-white/90 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full shadow border border-teal-100 flex items-center gap-1 backdrop-blur-sm">
                <svg
                  className="w-4 h-4 text-teal-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2-7 4v1a1 1 0 001 1h12a1 1 0 001-1v-1c0-2-3-4-7-4z" />
                </svg>
                الناشر: {news.authorName}
              </span>
            </div>
          )}
        </div>
        <div className="px-6 pt-4 flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-emerald-700">أخبار</h3>
          <AddedAgo date={displayDate} />
        </div>
        <div className="p-6 pt-2 pb-4 flex flex-col gap-3">
          <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-emerald-800 transition-colors mb-2 line-clamp-2 group-hover:text-emerald-900 leading-tight">
            {news.title}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed line-clamp-4 mb-3">
            {news.content}
          </p>
          <div className="flex justify-between items-center mt-2 gap-1.5 sm:gap-2">
            <Button
              variant="primary"
              size="md"
              className="rounded-xl shadow-md hover:shadow-lg group/btn flex-1 max-w-[130px] sm:max-w-[150px] text-[10px] xs:text-xs sm:text-sm"
            >
              <span>اقرأ المزيد</span>
              <ArrowLeft
                size={14}
                className="group-hover/btn:translate-x-1 transition-transform sm:w-4 sm:h-4"
              />
            </Button>
            {canEditOrDelete && (
              <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                <Button
                  variant="warning"
                  size="md"
                  className="rounded-lg shadow-md hover:shadow-lg px-2 sm:px-3 text-[10px] xs:text-xs sm:text-sm"
                  title="تعديل الخبر"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(news);
                  }}
                >
                  <Edit size={14} className="sm:w-4 sm:h-4" />
                  <span>تعديل</span>
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  className="rounded-lg shadow-md hover:shadow-lg px-2 sm:px-3 text-[10px] xs:text-xs sm:text-sm"
                  title="حذف الخبر"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(news._id);
                  }}
                >
                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                  <span>حذف</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NewsCard;
