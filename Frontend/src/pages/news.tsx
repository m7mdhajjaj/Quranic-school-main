import { useState, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Swal from "sweetalert2";
import { useAuth } from "../hooks/useAuth";
import { NewsSkeleton } from "../components/Loading/LoadingSkeleton";
import {
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
  buildNewsImageUrl,
  type INews,
} from "../Api/newsApi";
import { uploadNewsImage } from "../Api/uploadApi";

const News = () => {
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is teacher or admin
  const isTeacherOrAdmin =
    currentUser?.role === "teacher" || currentUser?.role === "admin";
  const [newNews, setNewNews] = useState<Partial<INews>>({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format for date input
    image: "https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+جديدة",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [newsItems, setNewsItems] = useState<INews[]>([]);

  // Initialize AOS and fetch news from API
  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    const loadNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getAllNews();
        console.log("Fetched news data:", response);

        if (response && Array.isArray(response)) {
          // Data is already formatted by the API layer
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

    loadNews();
  }, []);

  // Refresh news function
  const refreshNews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllNews();
      if (response && Array.isArray(response)) {
        // Data is already formatted by the API layer
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
    setNewNews({
      title: "",
      content: "",
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
      image: "https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+جديدة",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewNews((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      await Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "يجب اختيار صورة فقط",
        confirmButtonColor: "#DC2626",
      });
      return;
    }

    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      await Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت",
        confirmButtonColor: "#DC2626",
      });
      return;
    }

    setSelectedFile(file);
    // Create a temporary URL for preview
    const imageUrl = URL.createObjectURL(file);
    setNewNews((prev) => ({
      ...prev,
      image: imageUrl,
    }));
  };

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("Adding/updating news with image:", selectedFile);

    try {
      let imageUrl = newNews.image;

      // رفع الصورة على Cloudinary إذا تم اختيار ملف جديد
      if (selectedFile) {
        try {
          console.log("Uploading image to Cloudinary...");
          const uploadResult = await uploadNewsImage(selectedFile);

          if (uploadResult.success && uploadResult.url) {
            imageUrl = uploadResult.url;
            console.log("Image uploaded successfully:", imageUrl);

            await Swal.fire({
              icon: "success",
              title: "تم رفع الصورة",
              text: "تم رفع الصورة بنجاح",
              confirmButtonColor: "#059669",
              timer: 1500,
              showConfirmButton: false,
            });
          }
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError);
          await Swal.fire({
            icon: "error",
            title: "خطأ في رفع الصورة",
            text: "فشل رفع الصورة، سيتم استخدام صورة افتراضية",
            confirmButtonColor: "#DC2626",
          });
          imageUrl =
            "https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+الخبر";
        }
      }

      // إعداد بيانات الخبر
      const newsData = {
        title: newNews.title || "خبر جديد",
        content: newNews.content || "محتوى الخبر",
        date: newNews.date || new Date().toISOString().split("T")[0],
        imageUrl: imageUrl || "", // Use imageUrl not image
      };

      if (isEditMode && editingNewsId !== null) {
        // Handle edit mode - update existing news
        const response = await updateNews(editingNewsId, newsData);
        console.log("News updated successfully:", response);

        if (response) {
          // Update local state with the updated news
          setNewsItems(
            newsItems.map((item) =>
              item._id === editingNewsId ? response : item
            )
          );

          await Swal.fire({
            icon: "success",
            title: "تم التحديث",
            text: "تم تحديث الخبر بنجاح",
            confirmButtonColor: "#059669",
            timer: 2000,
          });
        }
      } else {
        // Handle add mode - create new news
        const response = await createNews(newsData);
        console.log("News created successfully:", response);

        if (response) {
          // Add the new news to the beginning of the array
          setNewsItems([response, ...newsItems]);

          await Swal.fire({
            icon: "success",
            title: "تم الإضافة",
            text: "تم إضافة الخبر بنجاح",
            confirmButtonColor: "#059669",
            timer: 2000,
          });
        }
      }
    } catch (err) {
      console.error("Failed to save news:", err);
      await Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء حفظ الخبر، يرجى المحاولة مرة أخرى",
        confirmButtonColor: "#DC2626",
      });
    } finally {
      setIsLoading(false);
      handleCloseModal();
    }
  };

  const handleEditNews = (news: INews) => {
    setNewNews({
      title: news.title,
      content: news.content,
      date: news.date,
      image: news.image,
    });
    setSelectedFile(null); // Reset selected file when editing
    setIsEditMode(true);
    setEditingNewsId(news._id);
    setIsModalOpen(true);
  };

  const handleDeleteNews = async (_id: string) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "تأكيد الحذف",
      text: "هل أنت متأكد من حذف هذا الخبر؟ لا يمكن التراجع عن هذا الإجراء!",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
    });

    if (!result.isConfirmed) return;

    setIsLoading(true);
    try {
      await deleteNews(_id);
      setNewsItems(newsItems.filter((item) => item._id !== _id));

      await Swal.fire({
        icon: "success",
        title: "تم الحذف",
        text: "تم حذف الخبر بنجاح",
        confirmButtonColor: "#059669",
        timer: 2000,
      });
    } catch (err) {
      console.error("Failed to delete news:", err);
      await Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء حذف الخبر، يرجى المحاولة مرة أخرى",
        confirmButtonColor: "#DC2626",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-12" dir="rtl">
      <section className="mb-12">
        <div className="flex justify-between items-center mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold text-emerald-800"
            data-aos="fade-down">
            آخر الأخبار والفعاليات
          </h1>

          {isTeacherOrAdmin && (
            <button
              onClick={handleOpenModal}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg font-semibold"
              data-aos="fade-left">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              إضافة خبر جديد
            </button>
          )}
        </div>

        <p
          className="text-lg mb-12 max-w-3xl text-gray-600"
          data-aos="fade-up"
          data-aos-delay="100">
          تابع أحدث أخبار وفعاليات مدرسة المهاجرين لتعليم القرآن الكريم، واطلع
          على الأنشطة والمسابقات القادمة
        </p>

        {isLoading && newsItems.length === 0 ? (
          <NewsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {error && newsItems.length === 0 ? (
              <div className="col-span-2 animate-fadeIn">
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-red-800 mb-1">
                        حدث خطأ!
                      </h3>
                      <p className="text-red-700 mb-4">{error}</p>
                      <button
                        onClick={refreshNews}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        إعادة المحاولة
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : newsItems.length === 0 ? (
              <div className="col-span-2 text-center py-20 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto border border-emerald-100">
                  <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-emerald-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-700 mb-3">
                    لا توجد أخبار متاحة حالياً
                  </h3>
                  <p className="text-slate-500 mb-6">
                    لم يتم نشر أي أخبار بعد. تابعنا للحصول على آخر المستجدات!
                  </p>
                  {isTeacherOrAdmin && (
                    <button
                      onClick={handleOpenModal}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 mx-auto">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      إضافة خبر جديد
                    </button>
                  )}
                </div>
              </div>
            ) : (
              newsItems.map((item, index) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-fadeIn group"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}>
                  <div className="relative overflow-hidden h-64">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                      console.log("Error loading image:", item.image);
                      // Try to modify the URL if there's an issue
                      const imgElement = e.target as HTMLImageElement;
                      const originalSrc = item.image;

                      // If we're already using a placeholder, don't try again
                      if (originalSrc.includes("placehold.co")) {
                        return;
                      }

                      // Try different URL patterns
                      if (originalSrc.includes("uploads/news/")) {
                        // Try removing /api/ if present
                        if (originalSrc.includes("/api/uploads/")) {
                          imgElement.src = originalSrc.replace(
                            "/api/uploads/",
                            "/uploads/"
                          );
                          console.log("Trying fallback 1:", imgElement.src);
                          return;
                        }

                        // Try adding the full domain if it's a relative URL
                        if (originalSrc.startsWith("uploads/")) {
                          imgElement.src = buildNewsImageUrl(originalSrc);
                          console.log("Trying fallback 2:", imgElement.src);
                          return;
                        }
                      }

                      // If all else fails, use a placeholder
                      imgElement.src =
                        "https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+الخبر";
                      console.log("Using placeholder");
                    }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3 gap-3">
                      <h2 className="text-xl font-bold text-emerald-700 group-hover:text-emerald-800 transition-colors flex-1">
                        {item.title}
                      </h2>
                      <span className="text-sm bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full shadow-sm font-medium flex-shrink-0 flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {item.date}
                      </span>
                    </div>
                    <p className="text-gray-600">{item.content}</p>{" "}
                    <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                      <button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-1 shadow-md hover:shadow-lg group/btn">
                        <span>اقرأ المزيد</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </button>

                      {isTeacherOrAdmin && (
                        <div className="flex gap-2">
                          <button
                            title="تعديل الخبر"
                            className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 flex items-center gap-1 shadow-md hover:shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditNews(item);
                            }}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            <span>تعديل</span>
                          </button>
                          <button
                            title="حذف الخبر"
                            className="px-3 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all duration-200 flex items-center gap-1 shadow-md hover:shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNews(item._id);
                            }}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            <span>حذف</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
      {/* 
      <section
        className="bg-emerald-50 p-6 rounded-lg my-12"
        data-aos="fade-up">
        <h2 className="text-2xl font-bold text-emerald-800 mb-6">
          اشترك في نشرتنا الإخبارية
        </h2>
        <p className="mb-4 text-gray-600">
          احصل على آخر الأخبار والتحديثات مباشرة إلى بريدك الإلكتروني
        </p>
        <form className="flex flex-col md:flex-row gap-3">
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            className="flex-1 px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition">
            اشتراك
          </button>
        </form>{" "}
      </section> */}

      {/* Modal for adding new news */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto relative overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                {isEditMode ? "تعديل الخبر" : "إضافة خبر جديد"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-white/90 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <form onSubmit={handleAddNews} className="space-y-6">
                {/* Title Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="title"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    عنوان الخبر
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newNews.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    placeholder="أدخل عنوان الخبر"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Date Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="date"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    تاريخ الخبر (ميلادي)
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={newNews.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    placeholder="اختر التاريخ"
                    disabled={isLoading}
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label
                    htmlFor="image"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    صورة الخبر
                  </label>

                  <label
                    htmlFor="image"
                    className="block w-full p-6 border-2 border-dashed border-emerald-300 rounded-lg text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group">
                    <input
                      type="file"
                      id="image"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isLoading}
                    />

                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="w-12 h-12 text-emerald-400 group-hover:text-emerald-500 transition-colors"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48">
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="text-sm text-emerald-700 font-medium">
                        اضغط لاختيار صورة أو اسحبها هنا
                      </p>
                      <p className="text-xs text-emerald-600">
                        PNG, JPG, GIF حتى 5MB
                      </p>
                    </div>
                  </label>

                  {/* Image Preview */}
                  {newNews.image && (
                    <div className="relative h-64 w-full rounded-lg overflow-hidden border-2 border-emerald-200 bg-gray-50">
                      <img
                        src={newNews.image}
                        alt="معاينة"
                        className="w-full h-full object-contain"
                      />
                      {selectedFile && (
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                          صورة جديدة
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Content Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="content"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                    محتوى الخبر
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={newNews.content}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none resize-none"
                    placeholder="أدخل محتوى الخبر"
                    rows={4}
                    required
                    disabled={isLoading}
                  />
                </div>
              </form>
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                إلغاء
              </button>
              <button
                type="submit"
                onClick={handleAddNews}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {isEditMode ? "تحديث الخبر" : "إضافة الخبر"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }

        /* Custom scrollbar for modal */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>
    </main>
  );
};

export default News;
