import { Link } from "react-router-dom";
import AOS from "aos";
import { useEffect } from "react";

const NotFound = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6 text-center"
      dir="rtl"
    >
      <div className="w-full max-w-md" data-aos="fade-up">
        <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-emerald-600">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 bg-red-50 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-14 w-14 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          <h1
            className="text-4xl font-bold text-gray-800 mb-2"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            404
          </h1>

          <h2
            className="text-2xl font-bold text-gray-700 mb-4"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            الصفحة غير موجودة
          </h2>

          <p
            className="text-gray-600 mb-6"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>

          <div className="mt-6" data-aos="fade-up" data-aos-delay="400">
            <Link
              to="/"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 inline-flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>

          <div
            className="mt-8 pt-6 border-t border-gray-200"
            data-aos="fade-up"
            data-aos-delay="500"
          >
            <p className="text-sm text-gray-500">
              إذا كنت تعتقد أن هناك خطأ، يرجى التواصل مع إدارة المدرسة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
