import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import {
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
  type INews,
} from '../../../Api/newsApi';
import { useNewsSocket } from '../../../Socket';
import { validateNewsForm } from '../../../Validation/NewsValidation';
import {
  showSuccessToast,
  showErrorToast,
} from '../../../components/utils/toastUtils';
import { useAuth } from '../../../hooks/useAuth';

export const useNewsData = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newsItems, setNewsItems] = useState<INews[]>([]);
  const [newNews, setNewNews] = useState<Partial<INews>>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Get current user for author field
  const { user } = useAuth();

  // Socket Connection
  const {
    isConnected: socketConnected,
    lastUpdate: socketLastUpdate,
    socketId,
  } = useNewsSocket();

  // Load news on mount
  useEffect(() => {
    loadNews();
  }, []);

  // Auto-refresh when socket receives updates
  useEffect(() => {
    if (socketLastUpdate) {
      console.log('🔄 News Socket update received, refreshing news...');
      refreshNews();
    }
  }, [socketLastUpdate]);

  const loadNews = async () => {
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
    // Don't show loading spinner for live updates
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
      date: new Date().toISOString().split('T')[0],
      image: 'https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+جديدة',
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

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showErrorToast('يجب اختيار صورة فقط');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setSelectedFile(file);
    const imageUrl = URL.createObjectURL(file);
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
      selectedFile: selectedFile,
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
      console.log('  - Has image:', !!selectedFile);

      // Add the image file if selected
      if (selectedFile) {
        formData.append('image', selectedFile);
        console.log('  - Image name:', selectedFile.name);
        console.log('  - Image size:', selectedFile.size);
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

          showSuccessToast('تم تحديث الخبر بنجاح');
        }
      } else {
        const response = await createNews(formData);
        console.log('News created successfully:', response);

        if (response) {
          setNewsItems([response, ...newsItems]);

          showSuccessToast('تم إضافة الخبر بنجاح');
        }
      }
    } catch (err) {
      console.error('Failed to save news:', err);
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Error details:', error.response?.data);
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
      image: news.image,
    });
    setSelectedFile(null);
    setIsEditMode(true);
    setEditingNewsId(news._id);
    setIsModalOpen(true);
  };

  const handleDeleteNews = async (_id: string) => {
    const confirmed = await window.confirm(
      'هل أنت متأكد من حذف هذا الخبر؟ لا يمكن التراجع عن هذا الإجراء!'
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      await deleteNews(_id);
      setNewsItems(newsItems.filter((item) => item._id !== _id));

      showSuccessToast('تم حذف الخبر بنجاح');
    } catch (err) {
      console.error('Failed to delete news:', err);
      showErrorToast('حدث خطأ أثناء حذف الخبر، يرجى المحاولة مرة أخرى');
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
    selectedFile,
    fileInputRef,
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
