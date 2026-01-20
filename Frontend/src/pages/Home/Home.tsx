import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAllHeroImages, uploadHeroImage, deleteHeroImage } from '@/Api/uploadApi';

// Define HeroImage type locally to avoid cache issues
export interface HeroImage {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  createdAt?: string;
}
import {
  showErrorMessage,
  showConfirmMessage,
} from '@/utils/sweetalertUtils';
import { showSuccessToast } from '@/utils/toastUtils';
import { HeroSection, VisionSection, ValuesSection } from './components';

const Home = () => {
  const { user: currentUser } = useAuth();

  // Hero Images State (for carousel)
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [heroImageLoading, setHeroImageLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize AOS
  useEffect(() => {
    // Initialize AOS with settings
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-in-out',
      offset: 50,
      delay: 0,
      anchorPlacement: 'top-bottom',
    });

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      AOS.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Refresh AOS when hero images load
  useEffect(() => {
    if (!heroImageLoading) {
      setTimeout(() => {
        AOS.refresh();
      }, 100);
    }
  }, [heroImageLoading]);

  // Load Hero Images
  const fetchHeroImages = useCallback(async () => {
    setHeroImageLoading(true);
    try {
      const data = await getAllHeroImages();
      if (data.success && data.images) {
        setHeroImages(data.images);
      }
    } catch (error) {
      console.error('Error fetching hero images:', error);
    } finally {
      setHeroImageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeroImages();
  }, [fetchHeroImages]);

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
        // Refresh the images list
        await fetchHeroImages();
        showSuccessToast('✅ تم إضافة الصورة للكاروسيل بنجاح');
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

  // Handle Delete Image
  const handleDeleteImage = async (publicId: string) => {
    const result = await showConfirmMessage(
      'هل أنت متأكد؟',
      'سيتم حذف هذه الصورة من الكاروسيل نهائياً',
      'حذف',
      'إلغاء'
    );

    if (!result.isConfirmed) return;

    try {
      const response = await deleteHeroImage(publicId);
      if (response.success) {
        // Remove from local state
        setHeroImages((prev) => prev.filter((img) => img.publicId !== publicId));
        showSuccessToast('✅ تم حذف الصورة بنجاح');
      } else {
        showErrorMessage('فشل في الحذف', response.message || 'حدث خطأ أثناء الحذف');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      showErrorMessage('خطأ', 'حدث خطأ أثناء حذف الصورة');
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
      className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20"
      dir="rtl"
    >
      <div className="container mx-auto py-12 px-4">
        {/* Hero Section - Carousel */}
        <HeroSection
          currentUser={currentUser}
          heroImages={heroImages}
          heroImageLoading={heroImageLoading}
          uploading={uploading}
          isTeacherOrAdmin={isTeacherOrAdmin}
          onImageChange={handleHeroImageChange}
          onEditButtonClick={handleEditButtonClick}
          onDeleteImage={handleDeleteImage}
          fileInputRef={fileInputRef}
          isGuest={!currentUser}
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
