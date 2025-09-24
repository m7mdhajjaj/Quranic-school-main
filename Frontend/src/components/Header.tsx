import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import NotificationHeader from "./NotificationHeader";
import io from "socket.io-client";

interface User {
  _id: string;
  name: string;
  role?: string;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) return;
    try {
      const parsed = JSON.parse(userJson) as User;
      setCurrentUser(parsed);

      // إنشاء اتصال Socket.IO للإشعارات
      const socketInstance = io("http://localhost:5005");
      setSocket(socketInstance);

      // تسجيل دخول المستخدم في Socket
      socketInstance.emit("login", {
        userId: parsed._id,
        role: parsed.role || "student",
        firstName: parsed.name,
      });

      return () => {
        socketInstance.disconnect();
        // إزالة event listener عند إلغاء تحميل المكون
        window.removeEventListener("popstate", preventBackAfterLogout);
      };
    } catch (e) {
      // ignore
    }
  }, []);

  const isTeacherOrAdmin =
    currentUser?.role === "teacher" || currentUser?.role === "admin";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // إزالة بيانات المستخدم من localStorage
    localStorage.removeItem("user");

    // قطع اتصال Socket إذا كان موجوداً
    if (socket) {
      socket.disconnect();
    }

    // تحديث الحالة
    setCurrentUser(null);
    setSocket(null);

    // إغلاق القائمة المنسدلة في الموبايل
    setIsMenuOpen(false);

    // تنظيف تاريخ المتصفح ومنع العودة
    window.history.pushState(null, "", window.location.href);
    window.history.replaceState(null, "", "/login");

    // إعادة التوجيه إلى صفحة تسجيل الدخول
    navigate("/login", { replace: true });

    // منع استخدام زر الرجوع بعد تسجيل الخروج
    setTimeout(() => {
      window.history.pushState(null, "", "/login");
      window.addEventListener("popstate", preventBackAfterLogout);
    }, 100);
  };

  const preventBackAfterLogout = () => {
    // التحقق من عدم وجود مستخدم مسجل
    const userInStorage = localStorage.getItem("user");
    if (!userInStorage) {
      window.history.pushState(null, "", "/login");
      navigate("/login", { replace: true });
    }
  };

  return (
    <header
      className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md p-4 rounded-b-lg"
      dir="rtl">
      <div className="container mx-auto flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden z-10 relative"
          onClick={toggleMenu}
          aria-label="Toggle Menu">
          <div
            className={`w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ${
              isMenuOpen ? "transform rotate-45 translate-y-2" : ""
            }`}></div>
          <div
            className={`w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ${
              isMenuOpen ? "opacity-0" : "opacity-100"
            }`}></div>
          <div
            className={`w-6 h-0.5 bg-white transition-all duration-300 ${
              isMenuOpen ? "transform -rotate-45 -translate-y-2" : ""
            }`}></div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:block mt-0">
          <ul
            className="flex flex-wrap space-x-reverse space-x-6 text-base font-medium"
            dir="rtl">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "px-2 py-1 bg-white/20 rounded transition duration-300 flex items-center"
                    : "px-2 py-1 hover:bg-white/20 rounded transition duration-300 flex items-center"
                }>
                الرئيسيه
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/news"
                className={({ isActive }) =>
                  isActive
                    ? "px-2 py-1 bg-white/20 rounded transition duration-300"
                    : "px-2 py-1 hover:bg-white/20 rounded transition duration-300"
                }>
                الاخبار
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/goals"
                className={({ isActive }) =>
                  isActive
                    ? "px-2 py-1 bg-white/20 rounded transition duration-300"
                    : "px-2 py-1 hover:bg-white/20 rounded transition duration-300"
                }>
                الاهداف
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/daily-marks"
                className={({ isActive }) =>
                  isActive
                    ? "px-2 py-1 bg-white/20 rounded transition duration-300"
                    : "px-2 py-1 hover:bg-white/20 rounded transition duration-300"
                }>
                العلامات اليوميه
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/test"
                className={({ isActive }) =>
                  isActive
                    ? "px-2 py-1 bg-white/20 rounded transition duration-300"
                    : "px-2 py-1 hover:bg-white/20 rounded transition duration-300"
                }>
                الاختبارات
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/prayer-times"
                className={({ isActive }) =>
                  isActive
                    ? "px-2 py-1 bg-white/20 rounded transition duration-300"
                    : "px-2 py-1 hover:bg-white/20 rounded transition duration-300"
                }>
                مواقيت الصلاة
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/quran"
                className={({ isActive }) =>
                  isActive
                    ? "px-2 py-1 bg-white/20 rounded transition duration-300"
                    : "px-2 py-1 hover:bg-white/20 rounded transition duration-300"
                }>
                القرآن الكريم
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/quran-audio"
                className={({ isActive }) =>
                  isActive
                    ? "px-2 py-1 bg-white/20 rounded transition duration-300"
                    : "px-2 py-1 hover:bg-white/20 rounded transition duration-300"
                }>
                القرآن الصوتي
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/arrangement"
                className={({ isActive }) =>
                  isActive
                    ? "px-2 py-1 bg-white/20 rounded transition duration-300"
                    : "px-2 py-1 hover:bg-white/20 rounded transition duration-300"
                }>
                الترتيب
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/activities"
                className={({ isActive }) =>
                  isActive
                    ? "px-2 py-1 bg-white/20 rounded transition duration-300"
                    : "px-2 py-1 hover:bg-white/20 rounded transition duration-300"
                }>
                الانشطه
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/absence"
                className={({ isActive }) =>
                  isActive
                    ? "px-2 py-1 bg-white/20 rounded transition duration-300"
                    : "px-2 py-1 hover:bg-white/20 rounded transition duration-300"
                }>
                الحضور والغياب
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  isActive
                    ? "px-2 py-1 bg-white/20 rounded transition duration-300"
                    : "px-2 py-1 hover:bg-white/20 rounded transition duration-300"
                }>
                التقارير
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/chat"
                className={({ isActive }) =>
                  isActive
                    ? "px-2 py-1 bg-white/20 rounded transition duration-300"
                    : "px-2 py-1 hover:bg-white/20 rounded transition duration-300"
                }>
                تواصل مع المعلم
              </NavLink>
            </li>
            {isTeacherOrAdmin && (
              <li>
                <NavLink
                  to="/managment"
                  className={({ isActive }) =>
                    isActive
                      ? "px-2 py-1 bg-white/20 rounded transition duration-300"
                      : "px-2 py-1 hover:bg-white/20 rounded transition duration-300"
                  }>
                  الادارة
                </NavLink>
              </li>
            )}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/change-password"
                  className={({ isActive }) =>
                    isActive
                      ? "bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full shadow transition duration-300 "
                      : "bg-yellow-200 text-yellow-700 px-3 py-1 rounded-full shadow hover:bg-yellow-50 transition duration-300 mx-3"
                  }>
                  تغيير كلمة المرور
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1 rounded-full shadow hover:bg-red-600 transition duration-300">
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive
                    ? "bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full shadow transition duration-300"
                    : "bg-white text-emerald-700 px-3 py-1 rounded-full shadow hover:bg-emerald-50 transition duration-300"
                }>
                التسجيل
              </NavLink>
            )}
          </ul>
        </nav>

        {/* Mobile Navigation */}
        <div
          className={`fixed inset-0 bg-emerald-900/95 z-40 transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          } md:hidden`}>
          {/* Close Button (X) */}
          <button
            onClick={toggleMenu}
            className="absolute left-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close Menu">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
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

          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <ul className="grid grid-cols-2 gap-6 text-center text-xl w-full">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 bg-white/20 rounded-lg block w-full"
                      : "px-4 py-2 hover:bg-white/10 rounded-lg block w-full"
                  }
                  onClick={toggleMenu}>
                  الرئيسيه
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/news"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 bg-white/20 rounded-lg block w-full"
                      : "px-4 py-2 hover:bg-white/10 rounded-lg block w-full"
                  }
                  onClick={toggleMenu}>
                  الاخبار
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/goals"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 bg-white/20 rounded-lg block w-full"
                      : "px-4 py-2 hover:bg-white/10 rounded-lg block w-full"
                  }
                  onClick={toggleMenu}>
                  الاهداف
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/daily-marks"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 bg-white/20 rounded-lg block w-full"
                      : "px-4 py-2 hover:bg-white/10 rounded-lg block w-full"
                  }
                  onClick={toggleMenu}>
                  العلامات اليوميه
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/test"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 bg-white/20 rounded-lg block w-full"
                      : "px-4 py-2 hover:bg-white/10 rounded-lg block w-full"
                  }
                  onClick={toggleMenu}>
                  الاختبارات
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/prayer-times"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 bg-white/20 rounded-lg block w-full"
                      : "px-4 py-2 hover:bg-white/10 rounded-lg block w-full"
                  }
                  onClick={toggleMenu}>
                  مواقيت الصلاة
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/quran"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 bg-white/20 rounded-lg block w-full"
                      : "px-4 py-2 hover:bg-white/10 rounded-lg block w-full"
                  }
                  onClick={toggleMenu}>
                  القرآن الكريم
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/quran-audio"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 bg-white/20 rounded-lg block w-full"
                      : "px-4 py-2 hover:bg-white/10 rounded-lg block w-full"
                  }
                  onClick={toggleMenu}>
                  القرآن الصوتي
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/arrangement"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 bg-white/20 rounded-lg block w-full"
                      : "px-4 py-2 hover:bg-white/10 rounded-lg block w-full"
                  }
                  onClick={toggleMenu}>
                  الترتيب
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/activities"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 bg-white/20 rounded-lg block w-full"
                      : "px-4 py-2 hover:bg-white/10 rounded-lg block w-full"
                  }
                  onClick={toggleMenu}>
                  الانشطه
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/absence"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 bg-white/20 rounded-lg block w-full"
                      : "px-4 py-2 hover:bg-white/10 rounded-lg block w-full"
                  }
                  onClick={toggleMenu}>
                  الحضور والغياب
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/reports"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 bg-white/20 rounded-lg block w-full"
                      : "px-4 py-2 hover:bg-white/10 rounded-lg block w-full"
                  }
                  onClick={toggleMenu}>
                  التقارير
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/chat"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 bg-white/20 rounded-lg block w-full"
                      : "px-4 py-2 hover:bg-white/10 rounded-lg block w-full"
                  }
                  onClick={toggleMenu}>
                  تواصل مع المعلم
                </NavLink>
              </li>

              {isTeacherOrAdmin && (
                <li>
                  <NavLink
                    to="/managment"
                    className={({ isActive }) =>
                      isActive
                        ? "px-4 py-2 bg-white/20 rounded-lg block w-full"
                        : "px-4 py-2 hover:bg-white/10 rounded-lg block w-full"
                    }
                    onClick={toggleMenu}>
                    الادارة
                  </NavLink>
                </li>
              )}

              {currentUser && (
                <li className="col-span-2">
                  <NavLink
                    to="/change-password"
                    className="bg-yellow-200 text-yellow-700 px-4 py-2 rounded-full shadow block w-full"
                    onClick={toggleMenu}>
                    تغيير كلمة المرور
                  </NavLink>
                </li>
              )}
              <li className="col-span-2">
                {currentUser ? (
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-full shadow hover:bg-red-600 block w-full">
                    تسجيل الخروج
                  </button>
                ) : (
                  <NavLink
                    to="/login"
                    className="bg-white text-emerald-700 px-4 py-2 rounded-full shadow block w-full"
                    onClick={toggleMenu}>
                    التسجيل
                  </NavLink>
                )}
              </li>
            </ul>
          </div>
        </div>

        {!isMenuOpen && (
          <div className="flex items-center gap-4">
            {/* إضافة مكون الإشعارات للمستخدمين المسجلين */}
            {currentUser && (
              <NotificationHeader
                userId={currentUser._id}
                socket={socket}
                apiUrl="http://localhost:5005"
              />
            )}

            <h1 className="text-xl font-bold hidden md:block">
              مدرسة المهاجرين لتعليم القرآن الكريم
            </h1>
            <img
              src="/src/images/logo.jpg"
              alt="مدرسة القرآن"
              className="h-14 w-auto ml-3 rounded-full border-2 border-white shadow-lg mx-3"
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
