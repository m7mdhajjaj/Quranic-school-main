import { useState } from 'react';
import type { NewsCardProps } from '../Types/types';
import AddedAgo from '@/components/UI/AddedAgo';
import { Button, Card, DropdownMenu } from '@/components/UI';
import { ArrowLeft, Edit, Trash2, ChevronLeft, ChevronRight, Globe, Users } from 'lucide-react';
import ImageSkeleton from '@/components/skeletons/ImageSkeleton';
import NewsGalleryModal from './NewsGalleryModal';

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
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const displayDate = news.createdAt || news.date;

  // استخراج الصور - دعم الصور المتعددة أو الصورة الواحدة
  const images = news.images && news.images.length > 0
    ? news.images.map(img => img.url).filter(url => url && url.trim() !== '')
    : news.image && news.image.trim() !== ''
    ? [news.image]
    : [];

  const hasMultipleImages = images.length > 1;

  // استخراج author ID بشكل صحيح (قد يكون string أو object)
  const newsAuthorId = typeof news.author === 'string' 
    ? news.author 
    : news.author?._id;

  // استخراج اسم الناشر
  const authorName = typeof news.author === 'object' && news.author !== null
    ? (news.author.name || `${news.author.firstName || ''} ${news.author.lastName || ''}`.trim())
    : '';

  // التحقق من صلاحيات التعديل/الحذف
  const canEditOrDelete = 
    isTeacherOrAdmin && 
    (currentUserRole === 'admin' || newsAuthorId === currentUserId);

  return (
    <div data-aos="fade-up" data-aos-delay={index * 100}>
      <NewsGalleryModal
        isOpen={isGalleryOpen}
        title={news.title}
        content={news.content}
        images={images}
        initialIndex={currentImageIndex}
        onClose={() => setIsGalleryOpen(false)}
      />
      <Card
        variant="gradient"
        padding="none"
        hover={true}
        className="relative group overflow-hidden animate-fadeIn bg-white border border-emerald-200 shadow-md hover:shadow-lg"
      >
      <div className="relative overflow-hidden h-56 sm:h-64 md:h-72 flex items-center justify-center bg-gray-50">
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
            width="600"
            height="400"
            loading={index < 2 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={index === 0 ? 'high' : 'auto'}
            className={`w-full h-full object-cover rounded-t-xl transition-all duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => {
              setImageLoading(false);
              setImageError(false);
            }}
            onError={(e) => {
              const imgElement = e.target as HTMLImageElement;
              const originalSrc = images[currentImageIndex];
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
              
              {/* Image Counter */}
              <div className="absolute top-3 left-3 z-30">
                <div className="bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>
              
              {/* Image Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                      setImageLoading(true);
                    }}
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
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Visibility Badge */}
              {news.visibility === 'group' ? (
                <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100" title="طلاب المعلم">
                  <Users size={12} />
                  <span>طلاب المعلم</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-md border border-gray-200" title="عام للجميع">
                  <Globe size={12} />
                  <span>عام</span>
                </span>
              )}

              {authorName && (
                <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100">
                  <span className="font-medium">نشر بواسطة:</span> {authorName}
                </span>
              )}
            </div>
            <AddedAgo date={displayDate} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 line-clamp-2 leading-tight">
            {news.title}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {news.content}
          </p>
          <div className="flex justify-end mt-2">
            <Button
              variant="primary"
              size="md"
              className="rounded-xl shadow-md hover:shadow-lg group/btn px-6 py-2.5 text-sm"
              onClick={() => setIsGalleryOpen(true)}
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
};

export default NewsCard;
