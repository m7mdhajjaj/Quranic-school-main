import { useState, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import {
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
  type INews,
} from "../../../Api/newsApi";
import { uploadNewsImage } from "../../../Api/uploadApi";
import { useNewsSocket } from "../../../Socket";
import { validateNewsForm } from "../../../Validation/NewsValidation";
import { showSuccessMessage, showErrorMessage } from "../../../utils/sweetalertUtils";
import Swal from "sweetalert2";

export const useNewsData = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newsItems, setNewsItems] = useState<INews[]>([]);
  const [newNews, setNewNews] = useState<Partial<INews>>({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    image: "https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+جديدة",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Socket Connection
  const { isConnected: socketConnected, lastUpdate: socketLastUpdate, socketId } = useNewsSocket();

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
      console.log("Fetched news data:", response);

      if (response && Array.isArray(response)) {
        setNewsItems(response);
        console.log("Formatted news items:", response);
      }
    } catch (err) {
      console.error("Failed to fetch news:", err);
      setError("حدث خطأ أثناء جلب الأخبار، يرجى المحاولة مرة أخرى");

      // Add default news if no data is available
      setNewsItems([
        {
          _id: "1",
          title: "افتتاح معرض القرآن السنوي",
          date: "10 مايو 2024",
          content:
            "نتشرف بدعوتكم لحضور معرض القرآن السنوي الذي سيقام في مقر المدرسة، حيث سيتم عرض إبداعات الطلاب وإنجازاتهم في حفظ وتجويد القرآن الكريم.",
          image:
            "https://placehold.co/600x400/e9f5f2/1f6357?text=معرض+القرآن",
        },
        {
          _id: "2",
          title: "مسابقة التجويد والترتيل",
          date: "15 يونيو 2024",
          content:
            "تعلن المدرسة عن بدء التسجيل لمسابقة التجويد والترتيل السنوية. نرحب بمشاركة جميع الطلاب من مختلف الفئات العمرية وسيتم توزيع جوائز قيمة على الفائزين.",
          image:
            "https://placehold.co/600x400/e9f5f2/1f6357?text=مسابقة+التجويد",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllNews();
      if (response && Array.isArray(response)) {
        setNewsItems(response);
      }
    } catch (err) {
      console.error("Failed to refresh news:", err);
      setError("حدث خطأ أثناء تحديث الأخبار");
    } finally {
      setIsLoading(false);
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
      title: "",
      content: "",
      date: new Date().toISOString().split("T")[0],
      image: "https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+جديدة",
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
      const { validateField } = await import("../../../Validation/NewsValidation");
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

    if (!file.type.startsWith("image/")) {
      await showErrorMessage("خطأ", "يجب اختيار صورة فقط");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      await showErrorMessage("خطأ", "حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
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
    console.log("🚀 handleAddNews called");
    console.log("📝 Form data:", { 
      title: newNews.title, 
      content: newNews.content, 
      date: newNews.date,
      image: newNews.image,
      selectedFile: selectedFile 
    });

    // Clear previous errors
    setFieldErrors({});

    // Frontend Validation - Set errors to display under fields
    const validationErrors = await validateNewsForm({
      title: newNews.title || "",
      content: newNews.content || "",
      date: newNews.date || new Date().toISOString().split("T")[0],
      imageUrl: newNews.image,
      selectedFile: selectedFile,
    });

    // Check if there are any errors
    console.log("✅ Validation errors:", validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      console.log("❌ Validation failed, showing errors under fields");
      setFieldErrors(validationErrors);
      
      // Scroll to first error with a small delay to ensure DOM is updated
      setTimeout(() => {
        const firstErrorField = document.querySelector('.border-red-500');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      return;
    }

    console.log("✅ Validation passed, proceeding to save...");
    setIsLoading(true);
    console.log("Adding/updating news with image:", selectedFile);

    try {
      let imageUrl = newNews.image;
      let imagePublicId = null;

      if (selectedFile) {
        try {
          console.log("Uploading image to Cloudinary...");
          const uploadResult = await uploadNewsImage(selectedFile);

          if (uploadResult.success && uploadResult.url) {
            imageUrl = uploadResult.url;
            imagePublicId = uploadResult.publicId;
            console.log("Image uploaded successfully:", imageUrl);
            console.log("Image publicId:", imagePublicId);
          }
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError);
          await showErrorMessage(
            "خطأ في رفع الصورة",
            "فشل رفع الصورة، سيتم استخدام صورة افتراضية"
          );
          imageUrl =
            "https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+الخبر";
        }
      }

      const newsData: Partial<INews> & { imageUrl?: string } = {
        title: newNews.title || "خبر جديد",
        content: newNews.content || "محتوى الخبر",
        date: newNews.date || new Date().toISOString().split("T")[0],
        imageUrl: imageUrl || "",
        ...(imagePublicId && { imagePublicId }),
      };

      if (isEditMode && editingNewsId !== null) {
        const response = await updateNews(editingNewsId, newsData);
        console.log("News updated successfully:", response);

        if (response) {
          setNewsItems(
            newsItems.map((item) =>
              item._id === editingNewsId ? response : item
            )
          );

          await showSuccessMessage(
            "تم التحديث",
            "تم تحديث الخبر بنجاح"
          );
        }
      } else {
        const response = await createNews(newsData);
        console.log("News created successfully:", response);

        if (response) {
          setNewsItems([response, ...newsItems]);

          await showSuccessMessage(
            "تم الإضافة",
            "تم إضافة الخبر بنجاح"
          );
        }
      }
    } catch (err) {
      console.error("Failed to save news:", err);
      await showErrorMessage(
        "خطأ",
        "حدث خطأ أثناء حفظ الخبر، يرجى المحاولة مرة أخرى"
      );
    } finally {
      setIsLoading(false);
      handleCloseModal();
    }
  };

  const handleEditNews = (news: INews) => {
    // Convert date to yyyy-MM-dd format if needed
    let formattedDate = new Date().toISOString().split("T")[0];
    
    if (news.date) {
      try {
        const dateObj = new Date(news.date);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toISOString().split("T")[0];
        }
      } catch (error) {
        console.warn("Invalid date format, using current date:", error);
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
    const result = await Swal.fire({
      title: "تأكيد الحذف",
      text: "هل أنت متأكد من حذف هذا الخبر؟ لا يمكن التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      position: "center",
      backdrop: "rgba(0, 0, 0, 0.2)",
      customClass: {
        popup: "!rounded-xl !shadow-2xl",
        title: "!text-xl !font-bold !text-gray-800",
        confirmButton:
          "!bg-gradient-to-r !from-red-600 !to-rose-600 hover:!from-red-700 hover:!to-rose-700 !text-white !font-bold !px-6 !py-2.5 !rounded-lg !shadow-lg hover:!shadow-xl !transition-all !duration-200",
        cancelButton:
          "!bg-gradient-to-r !from-gray-500 !to-gray-600 hover:!from-gray-600 hover:!to-gray-700 !text-white !font-bold !px-6 !py-2.5 !rounded-lg !shadow-lg hover:!shadow-xl !transition-all !duration-200",
      },
    });

    if (!result.isConfirmed) return;

    setIsLoading(true);
    try {
      await deleteNews(_id);
      setNewsItems(newsItems.filter((item) => item._id !== _id));

      await showSuccessMessage(
        "تم الحذف",
        "تم حذف الخبر بنجاح"
      );
    } catch (err) {
      console.error("Failed to delete news:", err);
      await showErrorMessage(
        "خطأ",
        "حدث خطأ أثناء حذف الخبر، يرجى المحاولة مرة أخرى"
      );
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
