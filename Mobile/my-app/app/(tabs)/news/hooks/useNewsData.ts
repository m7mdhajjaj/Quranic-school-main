import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
  INews,
} from "@/Api/newsApi";
import { useAuth } from "@/hooks/useAuth";

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
    visibility: "general",
  });
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllNews();
      if (response && Array.isArray(response)) {
        setNewsItems(response);
      }
    } catch (err) {
      console.error("Failed to fetch news:", err);
      setError("حدث خطأ أثناء جلب الأخبار");
      Alert.alert("خطأ", "حدث خطأ أثناء جلب الأخبار، يرجى المحاولة مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setNewNews({
      title: "",
      content: "",
      date: new Date().toISOString().split("T")[0],
      visibility: "general",
    });
    setSelectedImages([]);
    setIsModalOpen(true);
    setIsEditMode(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingNewsId(null);
    setSelectedImages([]);
    setNewNews({
      title: "",
      content: "",
      date: new Date().toISOString().split("T")[0],
      visibility: "general",
    });
  };

  const handleInputChange = (name: string, value: string) => {
    setNewNews((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddNews = async () => {
    if (!newNews.title || !newNews.content) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", newNews.title || "");
      formData.append("content", newNews.content || "");
      formData.append("author", user?._id || "");
      const defaultVisibility = user?.role === "admin" ? "general" : "group";
      formData.append(
        "visibility",
        (newNews.visibility as string) || defaultVisibility
      );

      if (selectedImages.length > 0) {
        selectedImages.forEach((imageUri, index) => {
          const imageFile = {
            uri: imageUri,
            type: "image/jpeg",
            name: `news-image-${index}.jpg`,
          } as any;
          formData.append("images", imageFile);
        });
      }

      if (isEditMode && editingNewsId) {
        const response = await updateNews(editingNewsId, formData);
        if (response) {
          setNewsItems(
            newsItems.map((item) =>
              item._id === editingNewsId ? response : item
            )
          );
          Alert.alert("نجح", "تم تحديث الخبر بنجاح ✅");
        }
      } else {
        const response = await createNews(formData);
        if (response) {
          setNewsItems([response, ...newsItems]);
          Alert.alert("نجح", "تم إضافة الخبر بنجاح ✅");
        }
      }

      handleCloseModal();
    } catch (err) {
      console.error("Failed to save news:", err);
      Alert.alert("خطأ", "حدث خطأ أثناء حفظ الخبر، يرجى المحاولة مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditNews = (news: INews) => {
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
      visibility: news.visibility || "general",
    });
    const existingImages =
      news.images && news.images.length > 0
        ? news.images.map((img) => img.url)
        : news.image
          ? [news.image]
          : [];
    setSelectedImages(existingImages);
    setIsEditMode(true);
    setEditingNewsId(news._id);
    setIsModalOpen(true);
  };

  const handleDeleteNews = async (_id: string) => {
    Alert.alert(
      "هل أنت متأكد؟",
      "سيتم حذف هذا الخبر نهائياً ولا يمكن التراجع عن هذا الإجراء!",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "نعم، احذف",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteNews(_id);
              setNewsItems(newsItems.filter((item) => item._id !== _id));
              Alert.alert("نجح", "تم حذف الخبر بنجاح ✅");
            } catch (err) {
              console.error("Failed to delete news:", err);
              Alert.alert("خطأ", "حدث خطأ أثناء حذف الخبر");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handlePickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("تنبيه", "نحتاج إلى إذن للوصول إلى الصور");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      setSelectedImages((prev) => [...prev, ...newImages].slice(0, 10));
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    isModalOpen,
    isEditMode,
    isLoading,
    error,
    newsItems,
    newNews,
    selectedImages,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handlePickImages,
    handleRemoveImage,
    handleAddNews,
    handleEditNews,
    handleDeleteNews,
    loadNews,
  };
};
