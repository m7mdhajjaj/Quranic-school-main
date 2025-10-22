import { useNavigate } from 'react-router-dom';
import HomeSkeleton from '../../../components/Skeleton/HomeSkeleton';

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
            <button
              onClick={() => {
                navigate('/soon');
              }}
              className="bg-emerald-600 text-white px-8 py-3 rounded-full hover:bg-emerald-700 transition duration-300 shadow-md mx-auto block"
              data-aos="zoom-in"
              data-aos-delay="1100"
            >
              ابدأ رحلتك التعليمية
            </button>
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
                <button
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-emerald-700 p-3 rounded-full shadow-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  title={uploading ? 'جاري الرفع...' : 'تعديل صورة الهيرو'}
                  onClick={onEditButtonClick}
                  disabled={uploading}
                >
                  {uploading ? (
                    <svg
                      className="h-5 w-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  )}
                </button>
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
