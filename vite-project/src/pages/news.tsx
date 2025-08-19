import { useState, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

interface INews {
  id: number;
  title: string;
  content: string;
  date: string;
  image: string;
}

const News = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
  const [newNews, setNewNews] = useState<Partial<INews>>({
    title: "",
    content: "",
    date: new Date().toLocaleDateString("ar-SA"),
    image: "https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+جديدة",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [newsItems, setNewsItems] = useState<INews[]>([
    {
      id: 1,
      title: "افتتاح معرض القرآن السنوي",
      date: "10 مايو 2024",
      content:
        "نتشرف بدعوتكم لحضور معرض القرآن السنوي الذي سيقام في مقر المدرسة، حيث سيتم عرض إبداعات الطلاب وإنجازاتهم في حفظ وتجويد القرآن الكريم.",
      image: "https://placehold.co/600x400/e9f5f2/1f6357?text=معرض+القرآن",
    },
    {
      id: 2,
      title: "مسابقة التجويد والترتيل",
      date: "15 يونيو 2024",
      content:
        "تعلن المدرسة عن بدء التسجيل لمسابقة التجويد والترتيل السنوية. نرحب بمشاركة جميع الطلاب من مختلف الفئات العمرية وسيتم توزيع جوائز قيمة على الفائزين.",
      image: "https://placehold.co/600x400/e9f5f2/1f6357?text=مسابقة+التجويد",
    },
    {
      id: 3,
      title: "دورة تعليمية جديدة لأحكام التجويد",
      date: "1 سبتمبر 2024",
      content:
        "سيتم افتتاح دورة جديدة لتعليم أحكام التجويد للمبتدئين والمتوسطين، بإشراف نخبة من الأساتذة المتخصصين. الدورة مجانية للطلاب المسجلين في المدرسة.",
      image: "https://placehold.co/600x400/e9f5f2/1f6357?text=دورة+التجويد",
    },
    {
      id: 4,
      title: "احتفال تكريم حفظة القرآن الكريم",
      date: "20 أكتوبر 2024",
      content:
        "تقيم مدرسة المهاجرين حفلًا لتكريم الطلاب الذين أتموا حفظ القرآن الكريم خلال العام الدراسي الحالي، بحضور عدد من الشخصيات البارزة وأولياء الأمور.",
      image: "https://placehold.co/600x400/e9f5f2/1f6357?text=تكريم+الحفظة",
    },
  ]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setNewNews((prev) => ({
        ...prev,
        image: imageUrl,
      }));
    }
  };

  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode && editingNewsId !== null) {
      // Handle edit mode
      setNewsItems(
        newsItems.map((item) =>
          item.id === editingNewsId
            ? {
                ...item,
                title: newNews.title || item.title,
                content: newNews.content || item.content,
                date: newNews.date || item.date,
                image: newNews.image || item.image,
              }
            : item
        )
      );
    } else {
      // Handle add mode
      const newId = Math.max(0, ...newsItems.map((item) => item.id)) + 1;

      const newsToAdd: INews = {
        id: newId,
        title: newNews.title || "خبر جديد",
        content: newNews.content || "محتوى الخبر",
        date: newNews.date || new Date().toLocaleDateString("ar-SA"),
        image:
          newNews.image ||
          "https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+جديدة",
      };

      setNewsItems([newsToAdd, ...newsItems]);
    }

    handleCloseModal();
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
    setEditingNewsId(news.id);
    setIsModalOpen(true);
  };

  const handleDeleteNews = (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الخبر؟")) {
      setNewsItems(newsItems.filter((item) => item.id !== id));
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
        </div>

        <p
          className="text-lg mb-12 max-w-3xl text-gray-600"
          data-aos="fade-up"
          data-aos-delay="100">
          تابع أحدث أخبار وفعاليات مدرسة المهاجرين لتعليم القرآن الكريم، واطلع
          على الأنشطة والمسابقات القادمة
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {newsItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:shadow-xl hover:-translate-y-1"
              data-aos="fade-up"
              data-aos-delay={index * 100}>
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-96 object-cover"
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
                        handleDeleteNews(item.id);
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

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
      </section>

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
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="image"
                  className="block mb-1 font-medium text-gray-700">
                  صورة الخبر
                </label>
                <div className="flex flex-col gap-4">
                  <input
                    type="file"
                    id="image"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {newNews.image && (
                    <div className="h-48 w-full rounded overflow-hidden border border-gray-200">
                      <img
                        src={newNews.image}
                        alt="معاينة"
                        className="h-full w-full object-contain"
                      />
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
                />
              </div>

              <div className="flex justify-end space-x-reverse space-x-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition">
                  {isEditMode ? "تحديث الخبر" : "إضافة الخبر"}
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
