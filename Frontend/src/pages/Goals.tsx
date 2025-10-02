import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { GoalsSkeleton } from "../components/Loading/LoadingSkeleton";

const Goals = () => {
  const [loading, setLoading] = useState(true);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      easing: "ease-in-out",
    });

    // Simulate loading for demonstration
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <GoalsSkeleton />;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100"
      dir="rtl">
      <div className="container mx-auto py-12 px-4">
        {/* Header Section */}
        <div className="text-center mb-16" data-aos="fade-down">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            أهـــدافـــنا
          </h1>
          <div className="w-24 h-1 bg-emerald-600 mx-auto mb-6"></div>
          <p className="text-slate-600 text-lg max-w-3xl mx-auto">
            نسعى في مدرسة المهاجرين لتحقيق مجموعة من الأهداف السامية التي تعزز
            الارتقاء بمستوى تعليم القرآن الكريم وخدمته
          </p>
        </div>

        {/* Main Goals Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Goal 1 */}
            <div
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row"
              data-aos="fade-up"
              data-aos-delay="100">
              <div className="bg-emerald-600 text-white p-6 md:w-1/4 flex justify-center items-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
              </div>
              <div className="p-6 md:w-3/4">
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  بناء جيل صالح
                </h3>
                <p className="text-slate-600">
                  بناء جيل صالح على منهج أهل السنة والجماعة، يفهم أصول دينه
                  فهمًا صحيحًا مقرونًا بالأدلة الشرعية من الكتاب والسنة.
                </p>
              </div>
            </div>

            {/* Goal 2 */}
            <div
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row"
              data-aos="fade-up"
              data-aos-delay="200">
              <div className="bg-teal-700 text-white p-6 md:w-1/4 flex justify-center items-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-teal-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
              </div>
              <div className="p-6 md:w-3/4">
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  إعداد جيل حافظ
                </h3>
                <p className="text-slate-600">
                  إعداد جيل حافظ متقن لكتاب الله تعالى، يعمل به، ويتقن تلاوته،
                  ويعي تفسيره ومعانيه.
                </p>
              </div>
            </div>

            {/* Goal 3 */}
            <div
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row"
              data-aos="fade-up"
              data-aos-delay="300">
              <div className="bg-emerald-700 text-white p-6 md:w-1/4 flex justify-center items-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-emerald-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                  </svg>
                </div>
              </div>
              <div className="p-6 md:w-3/4">
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  تأهيل معلمين
                </h3>
                <p className="text-slate-600">
                  تأهيل معلمين للقرآن الكريم بأسلوب حضاري وحديث، يتميزون بروح
                  الشباب والقدرة على التأثير والتجديد.
                </p>
              </div>
            </div>

            {/* Goal 4 */}
            <div
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row"
              data-aos="fade-up"
              data-aos-delay="400">
              <div className="bg-teal-800 text-white p-6 md:w-1/4 flex justify-center items-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-teal-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </div>
              </div>
              <div className="p-6 md:w-3/4">
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  غرس القيم
                </h3>
                <p className="text-slate-600">
                  غرس القيم والأخلاق الإسلامية المستمدة من القرآن الكريم.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Goals */}
        <div
          className="bg-gradient-to-r from-teal-900 to-emerald-800 rounded-2xl shadow-lg py-10 px-6 mb-16"
          data-aos="fade-up"
          data-aos-duration="1200">
          <h2 className="text-2xl font-bold text-white text-center mb-10">
            أهدافنا الإضافية
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Additional Goal 1 */}
            <div
              className="bg-white/10 backdrop-blur-sm p-6 rounded-lg"
              data-aos="zoom-in"
              data-aos-delay="100">
              <div className="w-14 h-14 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-3">
                ربط الطلاب بالسلف
              </h3>
              <p className="text-white/80 text-center">
                ربط الطلاب بسير السلف الصالح من أهل القرآن وأثرهم في الأمة.
              </p>
            </div>

            {/* Additional Goal 2 */}
            <div
              className="bg-white/10 backdrop-blur-sm p-6 rounded-lg"
              data-aos="zoom-in"
              data-aos-delay="200">
              <div className="w-14 h-14 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-3">
                إشراك الأسرة
              </h3>
              <p className="text-white/80 text-center">
                إشراك الأسرة في متابعة أبنائهم وتعزيز دورها في ترسيخ الحفظ
                والمتابعة.
              </p>
            </div>

            {/* Additional Goal 3 */}
            <div
              className="bg-white/10 backdrop-blur-sm p-6 rounded-lg"
              data-aos="zoom-in"
              data-aos-delay="300">
              <div className="w-14 h-14 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-3">
                تنمية الثقة
              </h3>
              <p className="text-white/80 text-center">
                تنمية الثقة بالنفس والقدرة على الإلقاء من خلال مشاركات قرآنية
                صوتية وتفسيرية.
              </p>
            </div>
          </div>
        </div>

        {/* Quote Section */}
        <div
          className="bg-white rounded-xl shadow-md p-8 text-center mb-16 relative overflow-hidden"
          data-aos="fade-up"
          data-aos-offset="200">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-600 to-teal-500"></div>
          <svg
            className="w-16 h-16 text-emerald-100 mx-auto mb-6"
            fill="currentColor"
            viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <p className="text-xl text-slate-700 mb-6">
            "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ"
          </p>
          <p className="text-sm text-slate-500">- حديث شريف رواه البخاري -</p>
        </div>
      </div>

      {/* <Footer /> */}
    </div>
  );
};

export default Goals;
