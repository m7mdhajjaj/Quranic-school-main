import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom";
interface User {
  _id: string;
  name?: string;
  role?: string;
  firstName?: string;
  fatherName?: string;
  lastName?: string;
  group?: string;
}

const Home = () => {
  const navigate = useNavigate();
  // State for the hero image
  const [heroImage, setHeroImage] = useState<string>(
    "/src/images/officialPhoto.jpg"
  );
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      easing: "ease-in-out",
    });
  }, []);

  // Load user data
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) return;
    try {
      const parsed = JSON.parse(userJson) as User;
      setCurrentUser(parsed);
    } catch (e) {
      // ignore
    }
  }, []);

  // Load hero image from database
  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const response = await fetch(`${API_URL}/settings/hero-image`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.heroImage) {
            // If it's a relative path starting with /uploads/, prepend the base URL
            if (data.heroImage.startsWith("/uploads/")) {
              setHeroImage(`http://localhost:5005${data.heroImage}`);
            } else {
              setHeroImage(data.heroImage);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching hero image:", error);
        // Keep default image on error
      }
    };

    fetchHeroImage();
  }, []);

  const isTeacherOrAdmin =
    currentUser?.role === "teacher" || currentUser?.role === "admin";

  // Function to handle image change
  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("heroImage", file);

      // Upload to server
      const response = await fetch(`${API_URL}/settings/hero-image`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.heroImage) {
          // Update the image with the server URL
          const imageUrl = `http://localhost:5005${data.heroImage}`;
          setHeroImage(imageUrl);
          console.log("Hero image updated successfully:", imageUrl);
        }
      } else {
        console.error("Failed to upload hero image");
        alert("فشل في رفع الصورة. يرجى المحاولة مرة أخرى.");
      }
    } catch (error) {
      console.error("Error uploading hero image:", error);
      alert("حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى.");
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Function to trigger file input click
  const handleEditButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100"
      dir="rtl">
      {/* Removed personalized greeting from above hero section */}
      <div className="container mx-auto py-12 px-4">
        {/* Hero Section */}{" "}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between bg-white rounded-2xl overflow-hidden shadow-lg">
          {/* Text Content */}
          <div
            className="w-full md:w-1/2 p-8 md:p-12"
            data-aos="fade-right"
            data-aos-delay="200">
            {/* Personalized Greeting inside hero section */}
            {currentUser && (
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-emerald-700 mb-4 leading-snug">
                  {currentUser.role === "student"
                    ? `أهلاً وسهلاً بك في أكاديمية المهاجرين، الطالب العزيز ${
                        currentUser.firstName || ""
                      } ${currentUser.fatherName || ""} ${
                        currentUser.lastName || ""
                      }`.trim()
                    : `أهلاً وسهلاً بك في أكاديمية المهاجرين، المعلم الفاضل ${
                        currentUser.firstName || currentUser.name || ""
                      } ${currentUser.lastName || ""}`.trim()}
                </h2>
                <div className="mx-auto max-w-2xl">
                  <p className="text-xl md:text-2xl text-gray-700 mb-3 font-medium">
                    يسرنا انضمامك إلى أكاديمية المهاجرين، حيث نؤمن أنك جزء من
                    رحلة التميز في رحاب القرآن الكريم.
                  </p>
                  <p className="text-lg text-gray-600 mb-2">
                    نتمنى لك رحلة تعليمية ملهمة ومليئة بالنجاح، وأن تحقق أهدافك
                    وتصل إلى أعلى درجات التفوق في حفظ وتلاوة وفهم كتاب الله عز
                    وجل.
                  </p>
                  {currentUser.role === "student" && currentUser.group && (
                    <span className="block text-md text-gray-500 mt-2">
                      المجموعة: {currentUser.group}
                    </span>
                  )}
                </div>
              </div>
            )}
            <button
              onClick={() => {
                navigate("/soon");
              }}
              className="bg-emerald-600 text-white px-8 py-3 rounded-full hover:bg-emerald-700 transition duration-300 shadow-md mx-auto block"
              data-aos="zoom-in"
              data-aos-delay="1100">
              ابدأ رحلتك التعليمية
            </button>
          </div>

          {/* Image */}
          <div className="w-full md:w-1/2 p-6 md:p-0" data-aos="fade-left">
            <div className="bg-indigo-900 rounded-tl-[80px] rounded-bl-2xl overflow-hidden relative h-[400px]">
              <img
                src={heroImage}
                alt="مدرسة القرآن"
                className="w-full h-full object-cover brightness-110 contrast-105"
              />
              <div className="absolute inset-0 bg-indigo-900/10"></div>
              {/* Edit button */}
              {isTeacherOrAdmin && (
                <button
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white text-emerald-700 p-2 rounded-full shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={uploading ? "جاري الرفع..." : "تعديل الصورة"}
                  onClick={handleEditButtonClick}
                  disabled={uploading}>
                  {uploading ? (
                    <svg
                      className="h-5 w-5 animate-spin"
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
                  ) : (
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
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  )}
                </button>
              )}
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        </div>{" "}
        {/* Islamic Pattern Background */}
        <div className="relative mt-16 py-10">
          <div
            className="absolute inset-0 opacity-5 bg-repeat"
            style={{
              backgroundImage: "url('/src/images/islamic-pattern.png')",
            }}></div>

          <div className="relative z-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-10">
              رؤيتنا في تعليم القرآن الكريم
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300"
                data-aos="flip-left"
                data-aos-delay="100">
                <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  تلاوة متقنة
                </h3>
                <p className="text-slate-600">
                  تعلم أصول التلاوة الصحيحة وفق أحكام التجويد
                </p>
              </div>{" "}
              <div
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300"
                data-aos="flip-left"
                data-aos-delay="300">
                <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-emerald-600"
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
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  حفظ القرآن
                </h3>
                <p className="text-slate-600">
                  برامج متخصصة لحفظ القرآن الكريم بمنهجية مدروسة
                </p>
              </div>{" "}
              <div
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300"
                data-aos="flip-left"
                data-aos-delay="500">
                <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  علوم القرآن
                </h3>
                <p className="text-slate-600">
                  دراسة تفسير القرآن وعلومه بطرق ميسرة وشاملة
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Values Section - Similar to the photo */}{" "}
        <div className="mt-24 mb-16">
          <div className="text-center mb-12">
            <h2
              className="text-2xl md:text-3xl font-bold text-slate-800 mb-3"
              data-aos="fade-down">
              قيمنا في أكاديمية ازهار الحمد
            </h2>
            <div
              className="w-24 h-1 bg-emerald-600 mx-auto"
              data-aos="zoom-in"
              data-aos-duration="800"></div>
          </div>{" "}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* First Row */}
            <div
              className="bg-teal-900 text-white p-6 rounded-lg shadow-lg"
              data-aos="zoom-in-up"
              data-aos-delay="100">
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-teal-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">التحفيز</h3>
              <p className="text-center text-white/90 text-sm">
                نؤمن بأن التحفيز وجود الإنجاز فكلما زاد التحفيز زاد الإنجاز بإذن
                الله تعالى
              </p>
            </div>{" "}
            <div
              className="bg-teal-900 text-white p-6 rounded-lg shadow-lg"
              data-aos="zoom-in-up"
              data-aos-delay="200">
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-teal-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">العمل</h3>
              <p className="text-center text-white/90 text-sm">
                العمل بالقرآن غايتنا لنكون على عقيدة نقية على خطى خير البرية ﷺ
                نصر بالقرآن أوطاننا ونسعد به مجتمعاتنا
              </p>
            </div>{" "}
            <div
              className="bg-teal-900 text-white p-6 rounded-lg shadow-lg"
              data-aos="zoom-in-up"
              data-aos-delay="300">
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-teal-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">الدعاء</h3>
              <p className="text-center text-white/90 text-sm">
                سر نجاح وتميز المؤمن
              </p>
            </div>
            {/* Second Row */}{" "}
            <div
              className="bg-teal-900 text-white p-6 rounded-lg shadow-lg"
              data-aos="zoom-in-up"
              data-aos-delay="400">
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-teal-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">التطوير</h3>
              <p className="text-center text-white/90 text-sm">
                شغف يتجدد وينجاح بتحقيق
              </p>
            </div>{" "}
            <div
              className="bg-teal-900 text-white p-6 rounded-lg shadow-lg"
              data-aos="zoom-in-up"
              data-aos-delay="500">
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-teal-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">الصبر</h3>
              <p className="text-center text-white/90 text-sm">أساس كل إنجاز</p>
            </div>{" "}
            <div
              className="bg-teal-900 text-white p-6 rounded-lg shadow-lg"
              data-aos="zoom-in-up"
              data-aos-delay="600">
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-teal-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">التعاون</h3>
              <p className="text-center text-white/90 text-sm">
                به تحقق النجاحات وتكون الإنجازات
              </p>
            </div>
            {/* Third Row */}{" "}
            <div
              className="bg-teal-900 text-white p-6 rounded-lg shadow-lg"
              data-aos="zoom-in-up"
              data-aos-delay="700">
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-teal-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">
                العطاء والإحسان
              </h3>
              <p className="text-center text-white/90 text-sm">
                ثمرة من ثمرات صحبة القرآن وأجمله وأبسطه الكلمة الطيبة
              </p>
            </div>{" "}
            <div
              className="bg-teal-900 text-white p-6 rounded-lg shadow-lg"
              data-aos="zoom-in-up"
              data-aos-delay="800">
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-teal-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">الحلم</h3>
              <p className="text-center text-white/90 text-sm">
                بداية كل نجاح ما رأيك أن تحلم الآن بحفظك للقرآن؟
              </p>
            </div>{" "}
            <div
              className="bg-teal-900 text-white p-6 rounded-lg shadow-lg"
              data-aos="zoom-in-up"
              data-aos-delay="900">
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-teal-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">الطموح</h3>
              <p className="text-center text-white/90 text-sm">
                من دونه لن نصل ولن نواصل!
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* <div data-aos="fade-up" data-aos-duration="1500" data-aos-anchor-placement="top-bottom">
          <Footer />
        </div> */}
    </div>
  );
};

export default Home;
