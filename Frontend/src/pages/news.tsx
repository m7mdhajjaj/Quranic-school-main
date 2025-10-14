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
    date: new Date().toLocaleDateString("ar-SA"),
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
      date: new Date().toLocaleDateString("ar-SA"),
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
        date: newNews.date || new Date().toLocaleDateString("ar-SA"),
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
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 shadow-md"
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
              <div className="col-span-2 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                <p className="text-center">{error}</p>
                <button
                  onClick={refreshNews}
                  className="mx-auto mt-2 block px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                  إعادة المحاولة
                </button>
              </div>
            ) : newsItems.length === 0 ? (
              <div className="col-span-2 bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
                <p className="text-center">لا توجد أخبار متاحة حالياً</p>
              </div>
            ) : (
              newsItems.map((item, index) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:shadow-xl hover:-translate-y-1"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-64 object-contain bg-gray-50"
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
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-xl font-bold text-emerald-700">
                        {item.title}
                      </h2>
                      <span className="text-sm bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full">
                        {item.date}
                      </span>
                    </div>
                    <p className="text-gray-600">{item.content}</p>{" "}
                    <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                      <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-1">
                        <span>اقرأ المزيد</span>
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
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </button>

                      {isTeacherOrAdmin && (
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition flex items-center gap-1"
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
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-1"
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
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}>
          <div
            className="bg-white rounded-lg p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
            data-aos="zoom-in">
            <h3 className="text-2xl font-bold text-emerald-800 mb-6 border-b pb-3">
              {isEditMode ? "تعديل الخبر" : "إضافة خبر جديد"}
            </h3>

            <form onSubmit={handleAddNews}>
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block mb-1 font-medium text-gray-700">
                  عنوان الخبر
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newNews.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="date"
                  className="block mb-1 font-medium text-gray-700">
                  تاريخ الخبر
                </label>
                <input
                  type="text"
                  id="date"
                  name="date"
                  value={newNews.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={isLoading}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="image"
                  className="block mb-2 font-medium text-gray-700">
                  صورة الخبر
                </label>
                <div className="flex flex-col gap-4">
                  <label
                    htmlFor="image"
                    className="block w-full p-4 border-2 border-dashed border-emerald-300 rounded-lg text-center cursor-pointer hover:border-emerald-500 transition-colors bg-emerald-50/30">
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
                        className="w-12 h-12 text-emerald-400"
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

                  {newNews.image && (
                    <div className="relative h-48 w-full rounded-lg overflow-hidden border-2 border-emerald-200 bg-gray-50">
                      <img
                        src={newNews.image}
                        alt="معاينة"
                        className="h-full w-full object-contain"
                      />
                      {selectedFile && (
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                          صورة جديدة
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="content"
                  className="block mb-1 font-medium text-gray-700">
                  محتوى الخبر
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={newNews.content}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-32"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-end space-x-reverse space-x-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                  disabled={isLoading}>
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition flex items-center gap-2"
                  disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></span>
                      <span>جاري الحفظ...</span>
                    </>
                  ) : isEditMode ? (
                    "تحديث الخبر"
                  ) : (
                    "إضافة الخبر"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default News;
