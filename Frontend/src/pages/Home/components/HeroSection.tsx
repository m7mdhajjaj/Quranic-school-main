import { useNavigate } from 'react-router-dom';
import HomeSkeleton from '../../../components/shared/Skeleton/HomeSkeleton';
import { Button, LoadingSpinner } from '../../../components/shared';
import { Edit2 } from 'lucide-react';

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

  // Show skeleton while loading
  if (heroImageLoading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="flex flex-col-reverse md:flex-row items-center justify-between bg-white rounded-2xl overflow-hidden shadow-lg">
      {/* Text Content */}
      <div
            className="w-full md:w-1/2 p-8 md:p-12"
            data-aos="fade-right"
            data-aos-delay="200"
          >
            {/* Personalized Greeting inside hero section */}
            {currentUser && (
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-emerald-700 mb-4 leading-snug">
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
                <div className="mx-auto max-w-2xl">
                  <p className="text-xl md:text-2xl text-gray-700 mb-3 font-medium">
                    يسرنا انضمامك إلى أكاديمية المهاجرين، حيث نؤمن أنك جزء من
                    رحلة التميز في رحاب القرآن الكريم.
                  </p>
                  <p className="text-lg text-gray-600 mb-2">
                    نتمنى لك رحلة تعليمية ملهمة ومليئة بالنجاح، وأن تحقق أهدافك
                    وتصل إلى أعلى درجات التفوق في حفظ وتلاوة وفهم كتاب الله عز
                    وجل.
                  </p>
                  {currentUser.role === 'student' && currentUser.group && (
                    <span className="block text-md text-gray-500 mt-2">
                      المجموعة: {currentUser.group}
                    </span>
                  )}
                </div>
              </div>
            )}
            <div data-aos="zoom-in" data-aos-delay="1100" className="flex justify-center">
              <Button
                onClick={() => {
                  navigate('/soon');
                }}
                variant="primary"
                size="lg"
                className="rounded-full shadow-md"
              >
                ابدأ رحلتك التعليمية
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="w-full md:w-1/2 p-6 md:p-0" data-aos="fade-left">
            <div className="bg-indigo-900 rounded-tl-[80px] rounded-bl-2xl overflow-hidden relative h-[400px]">
              {heroImage ? (
                <>
                  <img
                    src={heroImage}
                    alt="مدرسة القرآن"
                    className="w-full h-full object-cover brightness-110 contrast-105"
                  />
                  <div className="absolute inset-0 bg-indigo-900/10"></div>
                </>
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
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-emerald-700 rounded-full shadow-lg backdrop-blur-sm !p-3"
                  title={uploading ? 'جاري الرفع...' : 'تعديل صورة الهيرو'}
                >
                  {uploading ? <LoadingSpinner size="sm" color="emerald" /> : <Edit2 size={20} />}
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
