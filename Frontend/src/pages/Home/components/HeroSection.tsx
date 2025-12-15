import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button, LoadingSpinner } from '@/components/UI';
import { Edit2 } from 'lucide-react';
import ImageSkeleton from '@/components/skeletons/ImageSkeleton';

interface User {
  role?: string;
  firstName?: string;
  fatherName?: string;
  lastName?: string;
  name?: string;
  group?: string;
}

interface HeroSectionProps {
  currentUser: User | null;
  heroImage: string | null;
  heroImageLoading: boolean;
  uploading: boolean;
  isTeacherOrAdmin: boolean;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEditButtonClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const HeroSection = ({
  currentUser,
  heroImage,
  heroImageLoading,
  uploading,
  isTeacherOrAdmin,
  onImageChange,
  onEditButtonClick,
  fileInputRef,
}: HeroSectionProps) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="flex flex-col-reverse lg:flex-row items-stretch justify-between bg-white rounded-xl lg:rounded-2xl overflow-hidden shadow-lg">
      {/* Text Content */}
      <div
        className="w-full lg:w-1/2 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center"
      >
        {/* Personalized Greeting inside hero section - LCP Element (renders immediately) */}
        {currentUser && (
          <div className="text-center mb-6 lg:mb-8">
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-emerald-700 mb-3 md:mb-4 leading-tight lg:leading-snug lcp-element"
              fetchPriority="high"
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
            </h2>
            <div className="mx-auto max-w-2xl" data-aos="fade-up" data-aos-delay="100">
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
            </div>
          </div>
        )}
        <div
          data-aos="zoom-in"
          data-aos-delay="300"
          className="flex justify-center"
        >
          <Button
            onClick={() => {
              navigate('/soon');
            }}
            variant="primary"
            size="lg"
            className="rounded-full shadow-md text-base sm:text-lg px-6 sm:px-8"
          >
            ابدأ رحلتك التعليمية
          </Button>
        </div>
      </div>

      {/* Image */}
      <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-0" data-aos="fade-left">
        <div className="rounded-2xl lg:rounded-tl-[80px] lg:rounded-bl-2xl lg:rounded-tr-none lg:rounded-br-none overflow-hidden relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-full lg:min-h-[500px]">
          {heroImage ? (
            <>
              {!imageLoaded && <ImageSkeleton />}
              <img
                src={heroImage}
                alt="مدرسة القرآن"
                className={`w-full h-full object-cover brightness-110 contrast-105 transition-opacity duration-500 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              <div className="absolute inset-0 bg-indigo-900/10"></div>
            </>
          ) : heroImageLoading ? (
            <ImageSkeleton />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-800 to-indigo-900 flex items-center justify-center">
              <svg
                className="w-24 h-24 text-white/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Edit button for teachers/admins */}
          {isTeacherOrAdmin && !heroImageLoading && (
            <Button
              onClick={onEditButtonClick}
              disabled={uploading}
              variant="ghost"
              size="md"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 hover:bg-white text-emerald-700 rounded-full shadow-lg backdrop-blur-sm !p-2 sm:!p-3"
              title={uploading ? 'جاري الرفع...' : 'تعديل صورة الهيرو'}
            >
              {uploading ? (
                <LoadingSpinner size="sm" color="emerald" />
              ) : (
                <Edit2 size={18} className="sm:w-5 sm:h-5" />
              )}
            </Button>
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
    </div>
  );
};

export default HeroSection;
