import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getHeroImage, uploadHeroImage } from "@/Api/uploadApi";

// Define HeroImage type locally to avoid cache issues
export interface HeroImage {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  createdAt?: string;
}
import { showErrorMessage } from "@/utils/sweetalertUtils";
import { showSuccessToast } from "@/utils/toastUtils";
import { HeroSection, VisionSection, ValuesSection } from "./components";

const Home = () => {
  const { user: currentUser } = useAuth();

  // Hero Image State (single image)
  const [heroImage, setHeroImage] = useState<HeroImage | null>(null);
  const [heroImageLoading, setHeroImageLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize AOS
  useEffect(() => {
    // Initialize AOS with settings
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-in-out",
      offset: 50,
      delay: 0,
      anchorPlacement: "top-bottom",
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

  // Load Hero Image
  const fetchHeroImage = useCallback(async () => {
    setHeroImageLoading(true);
    try {
      const data = await getHeroImage();
      if (data.success && data.url) {
        setHeroImage({ url: data.url, publicId: data.publicId || "" });
      }
    } catch (error) {
      console.error("Error fetching hero image:", error);
    } finally {
      setHeroImageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeroImage();
  }, [fetchHeroImage]);

  // Check if user is teacher or admin
  const isTeacherOrAdmin =
    currentUser?.role === "teacher" || currentUser?.role === "admin";

  // Handle Hero Image Upload
  const handleHeroImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showErrorMessage(
        "خطأ في نوع الملف",
        "يرجى اختيار صورة صالحة (PNG, JPG, JPEG)",
      );
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorMessage(
        "خطأ في حجم الملف",
        "حجم الصورة يجب أن يكون أقل من 5 ميجابايت",
      );
      return;
    }

    setUploading(true);

    try {
      const data = await uploadHeroImage(file);

      if (data.success && data.url) {
        // Use the URL directly from upload response (Cloudinary search has indexing delay)
        setHeroImage({ url: data.url, publicId: data.publicId || "" });
        showSuccessToast("✅ تم رفع الصورة بنجاح");
      } else {
        showErrorMessage(
          "فشل في الرفع",
          "حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى",
        );
      }
    } catch (error) {
      console.error("Error uploading hero image:", error);
      showErrorMessage(
        "خطأ في الاتصال",
        "حدث خطأ أثناء رفع الصورة. يرجى التحقق من الاتصال بالإنترنت",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
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
      className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20"
      dir="rtl">
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
