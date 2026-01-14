import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, LoadingSpinner } from '@/components/UI';
import { 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play,
  Trash2,
  Plus,
  Images
} from 'lucide-react';
import ImageSkeleton from '@/components/skeletons/ImageSkeleton';
import { useHeroCarousel } from './hooks';

interface User {
  role?: string;
  firstName?: string;
  fatherName?: string;
  lastName?: string;
  name?: string;
  group?: string;
}

interface HeroImage {
  url: string;
  publicId: string;
}

interface HeroSectionProps {
  currentUser: User | null;
  heroImages: HeroImage[];
  heroImageLoading: boolean;
  uploading: boolean;
  isTeacherOrAdmin: boolean;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEditButtonClick: () => void;
  onDeleteImage?: (publicId: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

// Slide transition variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 1.1,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.9,
  }),
};

// Ken Burns effect variants
const kenBurnsVariants = {
  initial: { scale: 1 },
  animate: { 
    scale: 1.15,
    transition: { 
      duration: 8,
      ease: "linear"
    }
  }
};

const HeroSection = ({
  currentUser,
  heroImages,
  heroImageLoading,
  uploading,
  isTeacherOrAdmin,
  onImageChange,
  onEditButtonClick,
  onDeleteImage,
  fileInputRef,
}: HeroSectionProps) => {
  const navigate = useNavigate();
  
  // Use the carousel hook
  const {
    currentIndex,
    direction,
    isPlaying,
    imageLoaded,
    showControls,
    images,
    hasMultipleImages,
    goToSlide,
    goToPrevious,
    goToNext,
    togglePlayPause,
    handleImageLoad,
    setShowControls,
  } = useHeroCarousel({ heroImages });

  return (
    <div className="flex flex-col-reverse lg:flex-row items-stretch justify-between bg-white rounded-xl lg:rounded-2xl overflow-hidden shadow-lg">
      {/* Text Content */}
      <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center">
        {currentUser && (
          <div className="text-center mb-6 lg:mb-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-emerald-700 mb-3 md:mb-4 leading-tight lg:leading-snug"
            >
              {currentUser.role === 'student'
                ? `أهلاً وسهلاً بك في أكاديمية المهاجرين، الطالب العزيز ${
                    currentUser.firstName || ''
                  } ${currentUser.fatherName || ''} ${
                    currentUser.lastName || ''
                  }`.trim()
                : `أهلاً وسهلاً بك في أكاديمية المهاجرين، المعلم الفاضل ${
                    currentUser.firstName || currentUser.name || ''
                  } ${currentUser.lastName || ''}`.trim()}
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto max-w-2xl"
            >
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-2 md:mb-3 font-medium">
                يسرنا انضمامك إلى أكاديمية المهاجرين، حيث نؤمن أنك جزء من رحلة
                التميز في رحاب القرآن الكريم.
              </p>
              <p className="text-base sm:text-lg text-gray-600 mb-2">
                نتمنى لك رحلة تعليمية ملهمة ومليئة بالنجاح، وأن تحقق أهدافك وتصل
                إلى أعلى درجات التفوق في حفظ وتلاوة وفهم كتاب الله عز وجل.
              </p>
              {currentUser.role === 'student' && currentUser.group && (
                <span className="block text-sm md:text-md text-gray-500 mt-2">
                  المجموعة: {currentUser.group}
                </span>
              )}
            </motion.div>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center"
        >
          <Button
            onClick={() => navigate('/soon')}
            variant="primary"
            size="lg"
            className="rounded-full shadow-md text-base sm:text-lg px-6 sm:px-8"
          >
            ابدأ رحلتك التعليمية
          </Button>
        </motion.div>
      </div>

      {/* Carousel */}
      <div 
        className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-0 relative"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <div className="rounded-2xl lg:rounded-tl-[80px] lg:rounded-bl-2xl lg:rounded-tr-none lg:rounded-br-none overflow-hidden relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-full lg:min-h-[500px]">
          {heroImageLoading ? (
            <ImageSkeleton />
          ) : images.length > 0 ? (
            <>
              {/* Main Carousel */}
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.4 },
                    scale: { duration: 0.4 }
                  }}
                  className="absolute inset-0"
                >
                  {!imageLoaded[currentIndex] && <ImageSkeleton />}
                  <motion.img
                    src={images[currentIndex].url}
                    alt={`صورة ${currentIndex + 1}`}
                    variants={kenBurnsVariants}
                    initial="initial"
                    animate="animate"
                    className={`w-full h-full object-cover transition-opacity duration-500 ${
                      imageLoaded[currentIndex] ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => handleImageLoad(currentIndex)}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

              {/* Navigation Arrows */}
              {hasMultipleImages && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showControls ? 1 : 0 }}
                  className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-10"
                >
                  <button
                    onClick={goToPrevious}
                    className="p-2 sm:p-3 bg-white/90 hover:bg-white rounded-full shadow-lg backdrop-blur-sm transition-all transform hover:scale-110 pointer-events-auto group"
                    aria-label="السابق"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700 group-hover:text-emerald-800" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="p-2 sm:p-3 bg-white/90 hover:bg-white rounded-full shadow-lg backdrop-blur-sm transition-all transform hover:scale-110 pointer-events-auto group"
                    aria-label="التالي"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700 group-hover:text-emerald-800" />
                  </button>
                </motion.div>
              )}

              {/* Bottom Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
                {/* Dots Indicator */}
                {hasMultipleImages && (
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all duration-300 rounded-full ${
                          index === currentIndex
                            ? 'w-8 h-2 bg-white'
                            : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`انتقل إلى الصورة ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Play/Pause Button */}
                {hasMultipleImages && (
                  <button
                    onClick={togglePlayPause}
                    className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full transition-all"
                    aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white" />
                    )}
                  </button>
                )}

                {/* Image Counter */}
                {hasMultipleImages && (
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <Images className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">
                      {currentIndex + 1} / {images.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Admin Controls */}
              {isTeacherOrAdmin && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showControls ? 1 : 0 }}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-2 z-20"
                >
                  {/* Add New Image */}
                  <Button
                    onClick={onEditButtonClick}
                    disabled={uploading}
                    variant="ghost"
                    size="md"
                    className="bg-white/90 hover:bg-white text-emerald-700 rounded-full shadow-lg backdrop-blur-sm !p-2 sm:!p-3"
                    title={uploading ? 'جاري الرفع...' : 'إضافة صورة جديدة'}
                  >
                    {uploading ? (
                      <LoadingSpinner size="sm" color="emerald" />
                    ) : (
                      <Plus size={18} className="sm:w-5 sm:h-5" />
                    )}
                  </Button>

                  {/* Delete Current Image */}
                  {onDeleteImage && images.length > 0 && (
                    <Button
                      onClick={() => onDeleteImage(images[currentIndex].publicId)}
                      variant="ghost"
                      size="md"
                      className="bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-lg backdrop-blur-sm !p-2 sm:!p-3"
                      title="حذف هذه الصورة"
                    >
                      <Trash2 size={18} className="sm:w-5 sm:h-5" />
                    </Button>
                  )}
                </motion.div>
              )}
            </>
          ) : (
            // No Images Placeholder
            <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2 animate-pulse delay-300" />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500" />
              </div>
              
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 text-center"
              >
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Images className="w-12 h-12 text-white" />
                </div>
                <p className="text-white/90 text-xl font-bold mb-2">لم يتم إضافة صور بعد</p>
                <p className="text-white/70 text-sm">قم بإضافة صور لعرضها في الكاروسيل</p>
              </motion.div>

              {/* Add Button for Admin */}
              {isTeacherOrAdmin && (
                <Button
                  onClick={onEditButtonClick}
                  disabled={uploading}
                  variant="ghost"
                  size="md"
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 hover:bg-white text-emerald-700 rounded-full shadow-lg backdrop-blur-sm !p-2 sm:!p-3"
                  title={uploading ? 'جاري الرفع...' : 'إضافة صورة'}
                >
                  {uploading ? (
                    <LoadingSpinner size="sm" color="emerald" />
                  ) : (
                    <Plus size={18} className="sm:w-5 sm:h-5" />
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImageChange}
            accept="image/*"
            className="hidden"
            aria-label="رفع صورة الهيرو"
          />
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
