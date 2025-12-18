import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { showCenteredSwal } from '@/utils/sweetalertUtils';
import {
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
  type INews,
} from '@/Api/newsApi';
import { validateField, validateNewsForm } from '@/Validation/NewsValidation';
import {
  showSuccessToast,
  showErrorToast,
} from '@/utils/toastUtils';
import { useAuth } from '@/hooks/useAuth';
import { scheduleIdleTask, scheduleAnimationTask, getLocalDate, formatDate } from '../utils/performanceHelpers';

export const useNewsData = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  // ✅ loading واحد لكل شيء
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [newsItems, setNewsItems] = useState<INews[]>([]);

  // Memoize initial news state to prevent recreation
  const initialNewsState = useMemo(() => ({
    title: '',
    content: '',
    date: getLocalDate(),
    visibility: 'general' as const,
  }), []);

  const [newNews, setNewNews] = useState<Partial<INews>>(initialNewsState);

  const [selectedFile, setSelectedFile] = useState<File | File[] | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Get current user for author field
  const { user } = useAuth();

  // Debounce timers for per-field validation
  const validateTimersRef = useRef<Record<string, number>>({});

  // ✅ تحميل الأخبار عند فتح الصفحة أول مرة فقط
  useEffect(() => {
    // Defer news loading slightly to allow critical resources to load first
    const timer = setTimeout(() => {
      loadNews();
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  const loadNews = async () => {
    // ✅ يظهر loading spinner في الصفحة الرئيسية
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllNews();

      if (response && Array.isArray(response)) {
        setNewsItems(response);
      }
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setError('حدث خطأ أثناء جلب الأخبار، يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = useCallback(() => {
    // تعيين التاريخ الحالي تلقائياً عند فتح المودال
    setNewNews({
      title: '',
      content: '',
      date: getLocalDate(),
      image: undefined,
      visibility: 'general',
    });
    setFieldErrors({});
    setSelectedFile(null);
    setIsModalOpen(true);
    setIsEditMode(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingNewsId(null);
    setSelectedFile(null);
    setFieldErrors({}); // Clear all validation errors
    setNewNews({
      title: '',
      content: '',
      date: getLocalDate(),
      image: undefined, // لا صورة افتراضية
      visibility: 'general',
    });
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewNews((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error immediately when user starts typing
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });

    // Validate field after user stops typing (debounced)
    const existing = validateTimersRef.current[name];
    if (existing) {
      window.clearTimeout(existing);
    }

    // Use performance helper for idle validation
    validateTimersRef.current[name] = window.setTimeout(() => {
      scheduleIdleTask(async () => {
        if (!value.trim()) return;
        const validation = await validateField(name, value);
        if (!validation.isValid && validation.message) {
          setFieldErrors((prev) => ({
            ...prev,
            [name]: validation.message!,
          }));
        }
      });
    }, 300);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement> | File[]) => {
    let filesArray: File[];
    
    // التحقق إذا كان Event أو Array من Files
    if (Array.isArray(e)) {
      // Array من Files من MultiImageUpload (تم التحقق منها مسبقاً)
      filesArray = e;
    } else {
      // Event عادي من input (احتياطي)
      const files = e.target.files;
      if (!files || files.length === 0) return;
      filesArray = Array.from(files);
      
      // التحقق فقط في حالة الإدخال المباشر (ليس من MultiImageUpload)
      const invalidFiles = filesArray.filter(file => !file.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        showErrorToast('يجب اختيار صور فقط');
        return;
      }
    }

    if (filesArray.length === 0) {
      setSelectedFile(null);
      setNewNews((prev) => ({
        ...prev,
        image: undefined,
      }));
      return;
    }

    // حفظ الملفات
    setSelectedFile(filesArray as any);
  };

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setFieldErrors({});

    // Frontend Validation - Set errors to display under fields
    const validationErrors = await validateNewsForm({
      title: newNews.title || '',
      content: newNews.content || '',
      date: newNews.date || new Date().toISOString().split('T')[0],
      imageUrl: newNews.image,
      selectedFile: Array.isArray(selectedFile) ? selectedFile[0] : selectedFile,
    });

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);

      // Scroll to first error using performance helper
      scheduleAnimationTask(() => {
        const firstErrorField = document.querySelector('.border-red-500');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      });

      return;
    }

    // ✅ loading واحد لكل العمليات
    setIsLoading(true);

    try {
      // Create FormData to send to backend (backend will handle Cloudinary upload)
      const formData = new FormData();
      formData.append('title', newNews.title || 'خبر جديد');
      formData.append('content', newNews.content || 'محتوى الخبر');
      formData.append('author', user?._id || 'unknown');
      // Default visibility to 'group' for teachers, 'general' for admins
      const defaultVisibility = user?.role === 'admin' ? 'general' : 'group';
      formData.append('visibility', (newNews.visibility as string) || defaultVisibility);

      // Add the image files if selected (support multiple files)
      if (selectedFile) {
        if (Array.isArray(selectedFile)) {
          // Multiple images
          selectedFile.forEach((file) => {
            formData.append('images', file);
          });
        } else {
          // Single image (backward compatibility)
          formData.append('images', selectedFile);
        }
      }

      if (isEditMode && editingNewsId !== null) {
        const response = await updateNews(editingNewsId, formData);

        if (response) {
          setNewsItems((prev) =>
            prev.map((item) => (item._id === editingNewsId ? response : item))
          );

          // عرض Toast مع صوت النجاح
          showSuccessToast('تم تحديث الخبر بنجاح ✅');
        }
      } else {
        const response = await createNews(formData);

        if (response) {
          setNewsItems((prev) => [response, ...prev]);

          // عرض Toast مع صوت النجاح
          showSuccessToast('تم إضافة الخبر بنجاح ✅');
        }
      }
    } catch (err) {
      console.error('Failed to save news:', err);
      const error = err as {
        response?: { data?: { message?: string; errors?: string[] } };
      };

      // إذا كانت هناك أخطاء تحقق من الخادم، اعرضها في النموذج
      if (
        error.response?.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        const serverErrors: Record<string, string> = {};
        error.response.data.errors.forEach((errorMsg: string) => {
          // تحليل رسائل الأخطاء وربطها بالحقول
          if (errorMsg.includes('العنوان')) {
            serverErrors.title = errorMsg;
          } else if (errorMsg.includes('المحتوى')) {
            serverErrors.content = errorMsg;
          } else if (errorMsg.includes('التاريخ')) {
            serverErrors.date = errorMsg;
          } else if (errorMsg.includes('الصورة')) {
            serverErrors.image = errorMsg;
          } else {
            // خطأ عام يظهر كـ toast
            showErrorToast(errorMsg);
          }
        });

        if (Object.keys(serverErrors).length > 0) {
          setFieldErrors(serverErrors);
          // عرض Toast مع صوت الفشل
          showErrorToast('يرجى تصحيح الأخطاء في النموذج ❌');
          return; // لا تغلق النموذج
        }
      }

      // خطأ عام من الخادم - عرض Toast مع صوت الفشل
      showErrorToast(
        error.response?.data?.message ||
          'حدث خطأ أثناء حفظ الخبر، يرجى المحاولة مرة أخرى'
      );
    } finally {
      setIsLoading(false);
      handleCloseModal();
    }
  };

  const handleEditNews = useCallback((news: INews) => {
    const formattedDate = formatDate(news.date);

    setNewNews({
      title: news.title,
      content: news.content,
      date: formattedDate,
      // Use first image from images array or fallback to single image
      image: news.images && news.images.length > 0 ? news.images[0].url : news.image,
      images: news.images, // Keep reference to all images
      visibility: news.visibility || 'general',
    });
    setSelectedFile(null);
    setIsEditMode(true);
    setEditingNewsId(news._id);
    setIsModalOpen(true);
  }, []);

  const handleDeleteNews = useCallback(async (_id: string) => {
    const result = await showCenteredSwal({
      title: 'هل أنت متأكد؟',
      text: 'سيتم حذف هذا الخبر نهائياً ولا يمكن التراجع عن هذا الإجراء!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف الخبر',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setIsLoading(true);
    try {
      await deleteNews(_id);
      setNewsItems((prev) => prev.filter((item) => item._id !== _id));
      // عرض Toast مع صوت النجاح
      showSuccessToast('تم حذف الخبر بنجاح ✅');
    } catch (err) {
      console.error('Failed to delete news:', err);
      // عرض Toast مع صوت الفشل
      showErrorToast('حدث خطأ أثناء حذف الخبر، يرجى المحاولة مرة أخرى ❌');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isModalOpen,
    isEditMode,
    isLoading,
    error,
    newsItems,
    newNews,
    fieldErrors,
  
    // Actions
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleFileChange,
    handleAddNews,
    handleEditNews,
    handleDeleteNews,
  };
};
