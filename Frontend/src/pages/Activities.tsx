import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Swal from "sweetalert2";
import {
  getAllActivities,
  createActivity,
  updateActivity,
  deleteActivity as deleteActivityApi,
  type Activity,
} from "../Api/activityApi";
import { uploadActivityImage } from "../Api/uploadApi";
import { API_BASE_URL } from "../config/config";
import { useActivitiesSocket } from "../Socket";

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

const Activities = () => {
  // استخدام نظام Socket الجديد مع Heartbeat تلقائي كل 30 ثانية
  const {
    isConnected: socketConnected,
    lastUpdate: socketLastUpdate,
    socketId,
  } = useActivitiesSocket();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // User role management
  const [, setCurrentUser] = useState<User | null>(null);
  const [isTeacherOrAdmin, setIsTeacherOrAdmin] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentActivity, setCurrentActivity] = useState<ActivityFormData>({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0], // تاريخ اليوم بصيغة YYYY-MM-DD
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
        const data = await getAllActivities();
        setActivities(data);
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

  // إعادة جلب البيانات عند تحديث Socket
  useEffect(() => {
    if (!socketLastUpdate) return;

    console.log('🔄 Socket update detected in Activities, refetching...');
    
    const refetchActivities = async () => {
      try {
        const data = await getAllActivities();
        setActivities(data);
      } catch (err) {
        console.error("Error refetching activities after socket update:", err);
      }
    };

    refetchActivities();
  }, [socketLastUpdate]);

  // Handle file selection for image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

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
      date: new Date().toISOString().split("T")[0], // تاريخ اليوم بصيغة YYYY-MM-DD
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
      image: activity.image || "",
      category: activity.category || "درس",
    });
    setSelectedImage(null);
    setImagePreview(activity.image || null);
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

    setLoading(true);

    try {
      let imageUrl = currentActivity.image;

      // رفع الصورة على Cloudinary إذا تم اختيار ملف جديد
      if (selectedImage) {
        try {
          console.log("Uploading image to Cloudinary...");
          const uploadResult = await uploadActivityImage(selectedImage);

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
            "https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+نشاط";
        }
      }

      // إعداد بيانات النشاط
      const activityData = {
        title: currentActivity.title,
        description: currentActivity.description,
        date: currentActivity.date,
        category: currentActivity.category || "درس",
        imageUrl: imageUrl || "",
      };

      console.log("Sending activity data:", activityData);

      let savedActivity: Activity;

      if (modalMode === "add") {
        savedActivity = await createActivity(activityData);
        setActivities([...activities, savedActivity]);

        await Swal.fire({
          icon: "success",
          title: "تم الإضافة",
          text: "تم إضافة النشاط بنجاح",
          confirmButtonColor: "#059669",
          timer: 2000,
        });
      } else {
        // Edit mode
        savedActivity = await updateActivity(
          currentActivity._id!,
          activityData
        );
        setActivities(
          activities.map((activity) =>
            activity._id === currentActivity._id ? savedActivity : activity
          )
        );

        await Swal.fire({
          icon: "success",
          title: "تم التحديث",
          text: "تم تحديث النشاط بنجاح",
          confirmButtonColor: "#059669",
          timer: 2000,
        });
      }

      closeModal();
    } catch (err) {
      console.error("Error saving activity:", err);
      setError("حدث خطأ أثناء حفظ النشاط");

      await Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء حفظ النشاط، يرجى المحاولة مرة أخرى",
        confirmButtonColor: "#DC2626",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (_id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا النشاط؟")) {
      try {
        await deleteActivityApi(_id);
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
              أنشطة المدرسة القرآنية
            </h1>
            {/* Socket Connection Indicator - للمطورين فقط */}
            {import.meta.env.DEV && (
              <div className="relative group">
                <div
                  className={`w-3 h-3 rounded-full ${
                    socketConnected ? "bg-green-500" : "bg-yellow-500"
                  } animate-pulse`}
                  title={socketConnected ? "متصل" : "غير متصل"}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  <div className="text-center">
                    <div className="font-semibold mb-1">
                      {socketConnected ? "✓ متصل بالسوكت" : "⚠ غير متصل"}
                    </div>
                    {socketId && (
                      <div className="text-gray-300 text-xs">ID: {socketId.substring(0, 8)}...</div>
                    )}
                    {socketLastUpdate && (
                      <div className="text-gray-300 text-xs mt-1">
                        آخر تحديث: {new Date(socketLastUpdate).toLocaleTimeString('ar-EG')}
                      </div>
                    )}
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                </div>
              </div>
            )}
          </div>
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

        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {categories.map((category) => {
            const count = category === "الكل" 
              ? activities.length 
              : activities.filter(a => a.category === category).length;
            
            return (
              <button
                key={category}
                className={`py-2.5 px-5 rounded-full font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 ${
                  filter === category
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white scale-105"
                    : "bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-emerald-100"
                }`}
                onClick={() => setFilter(category || "")}>
                {category}
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  filter === category
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-emerald-700"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md overflow-hidden animate-fadeIn">
                {/* Image Skeleton with Shimmer */}
                <div className="h-80 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                </div>

                {/* Content Skeleton */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    {/* Title Skeleton */}
                    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg w-2/3"></div>
                    {/* Badge Skeleton */}
                    <div className="h-6 w-16 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
                  </div>

                  {/* Description Skeleton */}
                  <div className="space-y-3 mb-4">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-full"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-5/6"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4"></div>
                  </div>

                  {/* Date Skeleton */}
                  <div className="flex items-center gap-2 mt-4">
                    <div className="h-5 w-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActivities.map((activity) => (
              <div
                key={activity._id}
                className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg animate-fadeIn"
                data-aos="fade-up">
                <div className="h-80 relative overflow-hidden group">
                  <img
                    src={
                      activity.image && activity.image.startsWith("http")
                        ? activity.image
                        : activity.image
                        ? `${API_BASE_URL}/${activity.image}`
                        : "/src/images/default-activity.jpg"
                    }
                    alt={activity.title}
                    className="w-full h-full object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
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
                          title="تعديل النشاط"
                          className="text-blue-500 hover:text-white hover:bg-blue-500 p-2 rounded-lg transition-all duration-200 hover:shadow-md">
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
                          onClick={() => handleDeleteActivity(activity._id!)}
                          title="حذف النشاط"
                          className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-lg transition-all duration-200 hover:shadow-md">
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
          <div className="text-center py-20 animate-fadeIn">
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-700 mb-3">
                لا توجد أنشطة بهذا التصنيف
              </h3>
              <p className="text-slate-500 mb-6">
                {filter === "الكل" 
                  ? "لم يتم إضافة أي أنشطة بعد"
                  : `لا توجد أنشطة في تصنيف "${filter}"`
                }
              </p>
              {isTeacherOrAdmin && (
                <button
                  onClick={openAddModal}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg flex items-center gap-2 mx-auto">
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
                  إضافة نشاط جديد
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mt-8 animate-fadeIn">
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 p-3 rounded-full">
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
                  <p className="text-red-700">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium underline">
                    إعادة المحاولة
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Activity Modal */}
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  {modalMode === "add" ? "إضافة نشاط جديد" : "تعديل النشاط"}
                </h2>
                <button
                  onClick={closeModal}
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
                <form className="space-y-6">
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
                      عنوان النشاط
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={currentActivity.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                      placeholder="أدخل عنوان النشاط"
                      required
                    />
                  </div>

                  {/* Category and Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="category"
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
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        التصنيف
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={currentActivity.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white">
                        <option value="درس">درس</option>
                        <option value="رحلة">رحلة</option>
                        <option value="مسابقة">مسابقة</option>
                        <option value="محاضرة">محاضرة</option>
                        <option value="فعالية">فعالية</option>
                      </select>
                    </div>

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
                        تاريخ النشاط
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={currentActivity.date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Description Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="description"
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
                      وصف النشاط
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={currentActivity.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none resize-none"
                      placeholder="أدخل وصف النشاط"
                      rows={4}
                      required
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
                      صورة النشاط
                    </label>

                    <label
                      htmlFor="image"
                      className="block w-full p-6 border-2 border-dashed border-emerald-300 rounded-lg text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group">
                      <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
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
                    {(imagePreview || currentActivity.image) && (
                      <div className="relative h-64 w-full rounded-lg overflow-hidden border-2 border-emerald-200 bg-gray-50">
                        <img
                          src={
                            imagePreview ||
                            (currentActivity.image.startsWith("http")
                              ? currentActivity.image
                              : `${API_BASE_URL}/${currentActivity.image}`)
                          }
                          alt="معاينة الصورة"
                          className="w-full h-full object-contain"
                        />
                        {selectedImage && (
                          <div className="absolute top-2 right-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                            صورة جديدة
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* Footer Actions */}
              <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t">
                <button
                  onClick={closeModal}
                  disabled={loading}
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
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? (
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
                      {modalMode === "add" ? "إضافة النشاط" : "تحديث النشاط"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default Activities;
