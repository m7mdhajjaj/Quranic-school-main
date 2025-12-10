import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { showCenteredSwal } from '@/components/utils/sweetalertUtils';
import {
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
  type INews,
} from '@/Api/newsApi';
import { validateNewsForm } from '@/Validation/NewsValidation';
import {
  showSuccessToast,
  showErrorToast,
} from '@/components/utils/toastUtils';
import { useAuth } from '@/hooks/useAuth';

export const useNewsData = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  // ✅ loading واحد لكل شيء
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [newsItems, setNewsItems] = useState<INews[]>([]);

  // دالة للحصول على التاريخ المحلي الصحيح
  const getLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [newNews, setNewNews] = useState<Partial<INews>>({
    title: '',
    content: '',
    date: getLocalDate(),
  });

  const [selectedFile, setSelectedFile] = useState<File | File[] | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Get current user for author field
  const { user } = useAuth();

  // ✅ تحميل الأخبار عند فتح الصفحة أول مرة فقط
  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    // ✅ يظهر loading spinner في الصفحة الرئيسية
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllNews();
      console.log('Fetched news data:', response);

      if (response && Array.isArray(response)) {
        setNewsItems(response);
        console.log('Formatted news items:', response);
      }
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setError('حدث خطأ أثناء جلب الأخبار، يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNews = async () => {
    // ✅ تحديث صامت - لا يظهر loading spinner
    setError(null);
    try {
      const response = await getAllNews();
      if (response && Array.isArray(response)) {
        setNewsItems(response);
        console.log('✅ News refreshed via Socket update');
      }
    } catch (err) {
      console.error('Failed to refresh news:', err);
      setError('حدث خطأ أثناء تحديث الأخبار');
    }
  };

  const handleOpenModal = () => {
    // تعيين التاريخ الحالي تلقائياً عند فتح المودال
    setNewNews({
      title: '',
      content: '',
      date: getLocalDate(),
      image: undefined,
    });
    setFieldErrors({});
    setSelectedFile(null);
    setIsModalOpen(true);
    setIsEditMode(false);
  };

  const handleCloseModal = () => {
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
    });
  };

  const handleInputChange = async (
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

    // Validate field after user stops typing (debounce)
    if (value.trim()) {
      const { validateField } = await import(
        '../../../Validation/NewsValidation'
      );
      const validation = await validateField(name, value);
      if (!validation.isValid && validation.message) {
        setFieldErrors((prev) => ({
          ...prev,
          [name]: validation.message!,
        }));
      }
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement> | File[]) => {
    let filesArray: File[];
    
    // التحقق إذا كان Event أو Array من Files
    if (Array.isArray(e)) {
      // Array من Files من MultiImageUpload
      filesArray = e;
      console.log('📸 استلام ملفات من MultiImageUpload:', filesArray.length);
    } else {
      // Event عادي من input
      const files = e.target.files;
      if (!files || files.length === 0) return;
      filesArray = Array.from(files);
      console.log('📸 استلام ملفات من input:', filesArray.length);
    }

    if (filesArray.length === 0) {
      setSelectedFile(null);
      setNewNews((prev) => ({
        ...prev,
        image: undefined,
      }));
      return;
    }

    // التحقق من أن جميع الملفات صور
    const invalidFiles = filesArray.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      showErrorToast('يجب اختيار صور فقط');
      return;
    }

    // التحقق من حجم الملفات
    const oversizedFiles = filesArray.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      showErrorToast('حجم كل صورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    // التحقق من العدد الأقصى
    if (filesArray.length > 10) {
      showErrorToast('يمكنك رفع حتى 10 صور فقط');
      return;
    }

    // حفظ الملفات
    setSelectedFile(filesArray as any);
    console.log('✅ تم حفظ', filesArray.length, 'صور');
    
    // إنشاء معاينة للصورة الأولى فقط (للتوافق مع الإصدار السابق)
    const imageUrl = URL.createObjectURL(filesArray[0]);
    setNewNews((prev) => ({
      ...prev,
      image: imageUrl,
    }));
  };

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 handleAddNews called');
    console.log('📝 Form data:', {
      title: newNews.title,
      content: newNews.content,
      date: newNews.date,
      image: newNews.image,
      selectedFile: selectedFile,
    });

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

    // Check if there are any errors
    console.log('✅ Validation errors:', validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      console.log('❌ Validation failed, showing errors under fields');
      setFieldErrors(validationErrors);

      // Scroll to first error with a small delay to ensure DOM is updated
      setTimeout(() => {
        const firstErrorField = document.querySelector('.border-red-500');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, 100);

      return;
    }

    console.log('✅ Validation passed, proceeding to save...');
    console.log('🔄 Setting isLoading to true...');
    // ✅ loading واحد لكل العمليات
    setIsLoading(true);
    console.log('Adding/updating news with image:', selectedFile);

    try {
      // Create FormData to send to backend (backend will handle Cloudinary upload)
      const formData = new FormData();
      formData.append('title', newNews.title || 'خبر جديد');
      formData.append('content', newNews.content || 'محتوى الخبر');
      formData.append('author', user?._id || 'unknown');

      // Log what we're sending
      console.log('📤 Sending news data:');
      console.log('  - Title:', newNews.title);
      console.log('  - Content length:', newNews.content?.length || 0);
      console.log('  - Author:', user?._id);
      console.log('  - User Name:', user?.firstName || user?.name);
      console.log('  - Has images:', !!selectedFile);

      // Add the image files if selected (support multiple files)
      if (selectedFile) {
        if (Array.isArray(selectedFile)) {
          // Multiple images
          console.log('📤 إضافة صور متعددة إلى FormData...');
          selectedFile.forEach((file, index) => {
            formData.append('images', file);
            console.log(`  ✅ صورة ${index + 1}: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
          });
          console.log(`📸 إجمالي الصور: ${selectedFile.length}`);
        } else {
          // Single image (backward compatibility)
          formData.append('images', selectedFile);
          console.log('📤 إضافة صورة واحدة:', selectedFile.name);
        }
      } else {
        console.log('⚠️ لا توجد صور محددة!');
      }

      if (isEditMode && editingNewsId !== null) {
        const response = await updateNews(editingNewsId, formData);
        console.log('News updated successfully:', response);

        if (response) {
          setNewsItems(
            newsItems.map((item) =>
              item._id === editingNewsId ? response : item
            )
          );

          // عرض Toast مع صوت النجاح
          showSuccessToast('تم تحديث الخبر بنجاح ✅');
        }
      } else {
        const response = await createNews(formData);
        console.log('News created successfully:', response);

        if (response) {
          setNewsItems([response, ...newsItems]);

          // عرض Toast مع صوت النجاح
          showSuccessToast('تم إضافة الخبر بنجاح ✅');
        }
      }
    } catch (err) {
      console.error('Failed to save news:', err);
      const error = err as {
        response?: { data?: { message?: string; errors?: string[] } };
      };
      console.error('Error details:', error.response?.data);

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

  const handleEditNews = (news: INews) => {
    // Convert date to yyyy-MM-dd format if needed
    let formattedDate = new Date().toISOString().split('T')[0];

    if (news.date) {
      try {
        const dateObj = new Date(news.date);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toISOString().split('T')[0];
        }
      } catch (error) {
        console.warn('Invalid date format, using current date:', error);
      }
    }

    setNewNews({
      title: news.title,
      content: news.content,
      date: formattedDate,
      // Use first image from images array or fallback to single image
      image: news.images && news.images.length > 0 ? news.images[0].url : news.image,
      images: news.images, // Keep reference to all images
    });
    setSelectedFile(null);
    setIsEditMode(true);
    setEditingNewsId(news._id);
    setIsModalOpen(true);
  };

  const handleDeleteNews = async (_id: string) => {
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
      setNewsItems(newsItems.filter((item) => item._id !== _id));
      // عرض Toast مع صوت النجاح
      showSuccessToast('تم حذف الخبر بنجاح ✅');
    } catch (err) {
      console.error('Failed to delete news:', err);
      // عرض Toast مع صوت الفشل
      showErrorToast('حدث خطأ أثناء حذف الخبر، يرجى المحاولة مرة أخرى ❌');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    isModalOpen,
    isEditMode,
    isLoading,
    error,
    newsItems,
    newNews,
    fieldErrors,
    socketConnected,
    socketLastUpdate,
    socketId,

    // Actions
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleFileChange,
    handleAddNews,
    handleEditNews,
    handleDeleteNews,
    refreshNews,
  };
};
