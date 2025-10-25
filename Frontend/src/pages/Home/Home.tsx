import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getHeroImage, uploadHeroImage } from '../../Api/uploadApi';
import {
  showSuccessMessage,
  showErrorMessage,
} from '../../components/utils/sweetalertUtils';
import { HeroSection, VisionSection, ValuesSection } from './components';

const Home = () => {
  const { user: currentUser } = useAuth();

  // Hero Image State
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroImageLoading, setHeroImageLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      easing: 'ease-in-out',
    });
  }, []);

  // Load Hero Image
  useEffect(() => {
    const fetchHeroImage = async () => {
      setHeroImageLoading(true);
      try {
        const data = await getHeroImage();
        if (data.success && data.url) {
          setHeroImage(data.url);
        }
      } catch (error) {
        console.error('Error fetching hero image:', error);
      } finally {
        setHeroImageLoading(false);
      }
    };

    fetchHeroImage();
  }, []);

  // Check if user is teacher or admin
  const isTeacherOrAdmin =
    currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  // Handle Hero Image Upload
  const handleHeroImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showErrorMessage(
        'خطأ في نوع الملف',
        'يرجى اختيار صورة صالحة (PNG, JPG, JPEG)'
      );
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorMessage(
        'خطأ في حجم الملف',
        'حجم الصورة يجب أن يكون أقل من 5 ميجابايت'
      );
      return;
    }

    setUploading(true);

    try {
      const data = await uploadHeroImage(file);

      if (data.success && data.url) {
        setHeroImage(data.url);
        showSuccessMessage('تم التحديث بنجاح', 'تم تحديث صورة الهيرو بنجاح');
      } else {
        showErrorMessage(
          'فشل في الرفع',
          'حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى'
        );
      }
    } catch (error) {
      console.error('Error uploading hero image:', error);
      showErrorMessage(
        'خطأ في الاتصال',
        'حدث خطأ أثناء رفع الصورة. يرجى التحقق من الاتصال بالإنترنت'
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file input click
  const handleEditButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100"
      dir="rtl"
    >
      <div className="container mx-auto py-12 px-4">
        {/* Hero Section */}
        <HeroSection
          currentUser={currentUser}
          heroImage={heroImage}
          heroImageLoading={heroImageLoading}
          uploading={uploading}
          isTeacherOrAdmin={isTeacherOrAdmin}
          onImageChange={handleHeroImageChange}
          onEditButtonClick={handleEditButtonClick}
          fileInputRef={fileInputRef}
        />

        {/* Vision Section */}
        <VisionSection />

        {/* Values Section */}
        <ValuesSection />
      </div>
    </div>
  );
};

export default Home;
