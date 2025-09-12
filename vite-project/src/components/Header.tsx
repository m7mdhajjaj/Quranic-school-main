import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

interface User {
  _id: string;
  name: string;
  role?: string;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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

  const isTeacherOrAdmin =
    currentUser?.role === "teacher" || currentUser?.role === "admin";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
            <li>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive
                    ? "bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full shadow transition duration-300 mx-2"
                    : "bg-white text-emerald-700 px-3 py-1 rounded-full shadow hover:bg-emerald-50 transition duration-300 mx-2"
                }>
                التسجيل
              </NavLink>
            </li>{" "}
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
            <ul className="space-y-6 text-center text-xl">
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
              <li>
                <NavLink
                  to="/login"
                  className="bg-white text-emerald-700 px-4 py-2 rounded-full shadow block w-full"
                  onClick={toggleMenu}>
                  التسجيل
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center">
          <h1 className="text-xl font-bold hidden md:block">
            مدرسة المهاجرين لتعليم القرآن الكريم
          </h1>
          <img
            src="/src/images/logo.jpg"
            alt="مدرسة القرآن"
            className="h-14 w-auto ml-3 rounded-full border-2 border-white shadow-lg mx-3"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
