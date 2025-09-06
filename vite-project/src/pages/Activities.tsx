import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Activity {
  _id: string;
  title: string;
  description: string;
  date: string;
  image: string; // URL for the image preview
  category: string;
}

interface ActivityFormData {
  _id?: string;
  title: string;
  description: string;
  date: string;
  image: string; // URL for the image preview
  category: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  role: string;
  groups?: string[];
}

const API_URL = "http://localhost:5005/api/activities";

const Activities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // User role management
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isTeacherOrAdmin, setIsTeacherOrAdmin] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentActivity, setCurrentActivity] = useState<ActivityFormData>({
    title: "",
    description: "",
    date: "",
    image: "",
    category: "درس",
  });

  // Fetch activities from API and check user role
  useEffect(() => {
    // Check user authentication status
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const userData = JSON.parse(userJson) as User;
        setCurrentUser(userData);

        // Check if the user is a teacher or admin
        if (userData.role === "teacher" || userData.role === "admin") {
          setIsTeacherOrAdmin(true);
        } else {
          setIsTeacherOrAdmin(false);
        }
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    } else {
      // Uncomment if you want to redirect unauthenticated users
      // navigate("/login");
    }

    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL);
        setActivities(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError("حدث خطأ أثناء جلب الأنشطة");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Handle file selection for image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);

      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        setCurrentActivity({
          ...currentActivity,
          image: imageUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const [filter, setFilter] = useState<string>("الكل");

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      easing: "ease-in-out",
    });
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setCurrentActivity({ ...currentActivity, [name]: value });
  };

  const openAddModal = () => {
    setModalMode("add");
    setCurrentActivity({
      title: "",
      description: "",
      date: "",
      image: "",
      category: "درس",
    });
    setSelectedImage(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (activity: Activity) => {
    setModalMode("edit");
    setCurrentActivity({
      _id: activity._id,
      title: activity.title,
      description: activity.description,
      date: activity.date,
      image: activity.image,
      category: activity.category,
    });
    setSelectedImage(null);
    setImagePreview(activity.image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async () => {
    if (
      !currentActivity.title ||
      !currentActivity.description ||
      !currentActivity.date
    )
      return;

    try {
      const formData = new FormData();
      formData.append("title", currentActivity.title);
      formData.append("description", currentActivity.description);
      formData.append("date", currentActivity.date);
      formData.append("category", currentActivity.category);

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      let response: any;

      if (modalMode === "add") {
        response = await axios.post(API_URL, formData);
        setActivities([...activities, response.data.activity]);
      } else {
        // Edit mode
        response = await axios.put(
          `${API_URL}/${currentActivity._id}`,
          formData
        );
        setActivities(
          activities.map((activity) =>
            activity._id === currentActivity._id
              ? response.data.activity
              : activity
          )
        );
      }

      closeModal();
    } catch (err) {
      console.error("Error saving activity:", err);
      setError("حدث خطأ أثناء حفظ النشاط");
    }
  };

  const deleteActivity = async (_id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا النشاط؟")) {
      try {
        await axios.delete(`${API_URL}/${_id}`);
        setActivities(activities.filter((activity) => activity._id !== _id));
      } catch (err) {
        console.error("Error deleting activity:", err);
        setError("حدث خطأ أثناء حذف النشاط");
      }
    }
  };

  const filteredActivities =
    filter === "الكل"
      ? activities
      : activities.filter((activity) => activity.category === filter);

  const categories = [
    "الكل",
    ...Array.from(new Set(activities.map((a) => a.category))),
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4"
      dir="rtl">
      <div className="container mx-auto">
        <div className="text-center mb-16" data-aos="fade-down">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            أنشطة المدرسة القرآنية
          </h1>
          <div className="w-24 h-1 bg-emerald-600 mx-auto mb-6"></div>
          <p className="text-slate-600 text-lg max-w-3xl mx-auto">
            أنشطة وفعاليات متنوعة للطلاب لتعزيز مهارات الحفظ والتجويد والتلاوة
          </p>

          {isTeacherOrAdmin && (
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button
                onClick={openAddModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-md flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                إضافة نشاط جديد
              </button>
            </div>
          )}
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-4">
          {categories.map((category) => (
            <button
              key={category}
              className={`py-2 px-4 rounded-full ${
                filter === category
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
              onClick={() => setFilter(category)}>
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActivities.map((activity) => (
              <div
                key={activity._id}
                className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg"
                data-aos="fade-up">
                <div className="h-80 relative overflow-hidden">
                  <img
                    src={
                      activity.image.startsWith("http")
                        ? activity.image
                        : `http://localhost:5005/${activity.image}`
                    }
                    alt={activity.title}
                    className="w-full h-full object-contain bg-gray-50"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {activity.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-800">
                      {activity.title}
                    </h3>
                    {isTeacherOrAdmin && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(activity)}
                          className="text-blue-500 hover:text-blue-700">
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
                        </button>
                        <button
                          onClick={() => deleteActivity(activity._id)}
                          className="text-red-500 hover:text-red-700">
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
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-slate-600 mb-4 line-clamp-3">
                    {activity.description}
                  </p>

                  <div className="flex items-center text-slate-500 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-1"
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
                    {formatDate(activity.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredActivities.length === 0 && (
          <div className="text-center py-16">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-xl font-medium text-slate-600 mt-4">
              لا توجد أنشطة بهذا التصنيف
            </h3>
            {isTeacherOrAdmin && (
              <p className="text-slate-500 mt-2">
                يمكنك إضافة نشاط جديد من خلال الزر أعلاه
              </p>
            )}
          </div>
        )}

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
            role="alert">
            <strong className="font-bold">خطأ! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Add/Edit Activity Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              className="bg-black opacity-50 absolute inset-0"
              onClick={closeModal}></div>
            <div className="bg-white rounded-lg shadow-lg p-5 max-w-md mx-auto relative z-10 w-full">
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
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

              <h2 className="text-xl font-bold mb-4 text-center">
                {modalMode === "add" ? "إضافة نشاط جديد" : "تعديل النشاط"}
              </h2>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-1"
                    htmlFor="title">
                    عنوان النشاط
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={currentActivity.title}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="عنوان النشاط"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-1"
                      htmlFor="category">
                      التصنيف
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={currentActivity.category}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                      <option value="درس">درس</option>
                      <option value="رحلة">رحلة</option>
                      <option value="مسابقة">مسابقة</option>
                      <option value="محاضرة">محاضرة</option>
                      <option value="فعالية">فعالية</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-1"
                      htmlFor="date">
                      تاريخ النشاط
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={currentActivity.date}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-1"
                    htmlFor="description">
                    وصف النشاط
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={currentActivity.description}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="وصف النشاط"
                    rows={3}></textarea>
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-1"
                    htmlFor="image">
                    صورة النشاط
                  </label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />

                  {/* Image Preview */}
                  <div className="mt-2 h-48 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                    {imagePreview || currentActivity.image ? (
                      <img
                        src={
                          imagePreview ||
                          (currentActivity.image.startsWith("http")
                            ? currentActivity.image
                            : `http://localhost:5005/${currentActivity.image}`)
                        }
                        alt="معاينة الصورة"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-gray-400 text-center p-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 mx-auto mb-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        اختر صورة للمعاينة
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-1"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {modalMode === "add" ? "إضافة" : "تحديث"}
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-1"
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;
