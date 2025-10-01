// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import Avatar from "./Avatar";
// import { useAvatar, getUserGender } from "../hooks/useAvatar";
// import { useAuth } from "../hooks/useAuth";

// const AdminHeader: React.FC = () => {
//   const { user: currentUser, logout: authLogout } = useAuth();
//   const [profileMenuOpen, setProfileMenuOpen] = useState(false);

//   const profileMenuRef = useRef<HTMLDivElement>(null);
//   const navigate = useNavigate();
//   const location = useLocation();

//   const { avatarUrl, avatarLoading } = useAvatar({
//     userId: currentUser?._id,
//     userRole: currentUser?.role,
//   });

//   const userGender = getUserGender(currentUser);

//   const handleLogout = () => {
//     setProfileMenuOpen(false);
//     authLogout();
//   };

//   useEffect(() => {
//     if (!currentUser) {
//       navigate("/login", { replace: true });
//     }
//   }, [currentUser, navigate]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         profileMenuRef.current &&
//         !profileMenuRef.current.contains(event.target as Node)
//       ) {
//         setProfileMenuOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const isActive = (path: string) => location.pathname === path;

//   return (
//     <header className="bg-[#009C5C] text-white shadow-md">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* ✅ Logo */}
//           <div className="flex items-center">
//             <h1 className="text-lg md:text-xl font-bold">لوحة تحكم الإدارة</h1>
//           </div>

//           {/* ✅ Navigation Links */}
//           <nav className="flex space-x-4 rtl:space-x-reverse">
//             <button
//               onClick={() => navigate("/admin/dashboard")}
//               className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
//                 isActive("/admin/dashboard")
//                   ? "bg-white text-[#009C5C] shadow-sm"
//                   : "hover:bg-[#00B26F] hover:text-white"
//               }`}>
//               الإحصائيات
//             </button>
//             <button
//               onClick={() => navigate("/admin/management")}
//               className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
//                 isActive("/admin/management")
//                   ? "bg-white text-[#009C5C] shadow-sm"
//                   : "hover:bg-[#00B26F] hover:text-white"
//               }`}>
//               الإدارة
//             </button>
//           </nav>

//           {/* ✅ Profile Menu */}
//           <div className="relative" ref={profileMenuRef}>
//             <button
//               onClick={() => setProfileMenuOpen(!profileMenuOpen)}
//               className="flex items-center space-x-2 rtl:space-x-reverse text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B26F]">
//               <Avatar
//                 src={avatarUrl}
//                 userName={currentUser?.firstName || currentUser?.name}
//                 gender={userGender}
//                 loading={avatarLoading}
//                 size="sm"
//               />
//               <span className="hidden sm:block font-medium">
//                 {currentUser?.firstName} {currentUser?.lastName}
//               </span>
//               <svg
//                 className={`w-4 h-4 transition-transform duration-200 ${
//                   profileMenuOpen ? "rotate-180" : ""
//                 }`}
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M19 9l-7 7-7-7"
//                 />
//               </svg>
//             </button>

//             {profileMenuOpen && (
//               <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200">
//                 <button
//                   onClick={() => navigate("/profile")}
//                   className="block w-full text-right px-4 py-2 text-sm hover:bg-gray-100">
//                   الملف الشخصي
//                 </button>
//                 <button
//                   onClick={() => navigate("/change-password")}
//                   className="block w-full text-right px-4 py-2 text-sm hover:bg-gray-100">
//                   تغيير كلمة المرور
//                 </button>
//                 <button
//                   onClick={handleLogout}
//                   className="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50">
//                   تسجيل الخروج
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default AdminHeader;


import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Avatar from "./Avatar";
import { useAvatar, getUserGender } from "../hooks/useAvatar";
import { useAuth } from "../hooks/useAuth";

const AdminHeader: React.FC = () => {
  const { user: currentUser, logout: authLogout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { avatarUrl, avatarLoading } = useAvatar({
    userId: currentUser?._id,
    userRole: currentUser?.role,
  });

  const userGender = getUserGender(currentUser);

  // Handle scroll effect for header shadow/background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle logout with confirmation dialog
  const handleLogout = useCallback(() => {
    const confirmLogout = window.confirm("هل أنت متأكد من تسجيل الخروج؟");
    if (confirmLogout) {
      setProfileMenuOpen(false);
      setMobileMenuOpen(false);
      authLogout();
    }
  }, [authLogout]);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate("/login", { replace: true });
    }
  }, [currentUser, navigate]);

  // Handle click outside for all dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle ESC key to close all menus
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
        setShowNotifications(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, []);

  // Check if current route is active
  const isActive = (path: string) => location.pathname === path;

  // Navigation items configuration
  const navItems = [
    { path: "/admin/dashboard", label: "الإحصائيات", icon: "📊" },
    { path: "/admin/management", label: "الإدارة", icon: "⚙️" },
    { path: "/admin/reports", label: "التقارير", icon: "📈" },
    { path: "/admin/settings", label: "الإعدادات", icon: "🔧" },
  ];

  // Mock notifications (replace with real API call)
  const mockNotifications = [
    { id: 1, message: "طالب جديد تم تسجيله", time: "منذ 5 دقائق", unread: true },
    { id: 2, message: "تحديث في النظام", time: "منذ ساعة", unread: true },
    { id: 3, message: "طلب تغيير كلمة مرور", time: "منذ ساعتين", unread: false },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#009C5C] shadow-lg"
          : "bg-gradient-to-r from-[#009C5C] to-[#00B26F]"
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* ✅ Logo Section */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200">
              <span className="text-3xl">🎓</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl md:text-2xl font-bold text-white">
                لوحة تحكم الإدارة
              </h1>
              <p className="text-sm text-white/80">نظام إدارة المدرسة القرآنية</p>
            </div>
          </div>

          {/* ✅ Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2 rtl:space-x-reverse">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`group relative px-5 py-2.5 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-white text-[#009C5C] shadow-md scale-105"
                    : "text-white hover:bg-white/10"
                }`}>
                <span className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {isActive(item.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#009C5C] rounded-t-lg"></span>
                )}
              </button>
            ))}
          </nav>

          {/* ✅ Right Section: Search, Notifications & Profile */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* Search Button (Desktop only) */}
            <button
              className="hidden lg:flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white"
              aria-label="بحث">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* ✅ Notifications Dropdown */}
            <div className="relative" ref={notificationMenuRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white"
                aria-label="الإشعارات">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {mockNotifications.filter((n) => n.unread).length > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                    {mockNotifications.filter((n) => n.unread).length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl py-2 z-50 border border-gray-200 max-h-96 overflow-y-auto animate-fadeIn">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-bold text-gray-800">
                      الإشعارات
                    </h3>
                  </div>
                  {mockNotifications.length > 0 ? (
                    mockNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-r-4 ${
                          notification.unread
                            ? "border-[#009C5C] bg-green-50/50"
                            : "border-transparent"
                        }`}>
                        <p className="text-sm text-gray-800 font-medium">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <svg
                        className="w-12 h-12 mx-auto mb-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-sm">لا توجد إشعارات جديدة</p>
                    </div>
                  )}
                  <div className="px-4 py-2 border-t border-gray-200">
                    <button className="text-sm text-[#009C5C] hover:text-[#00B26F] font-medium w-full text-center transition-colors">
                      عرض جميع الإشعارات
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ✅ Profile Menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-3 rtl:space-x-reverse bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 transition-all duration-200"
                aria-label="القائمة الشخصية">
                <Avatar
                  src={avatarUrl}
                  userName={currentUser?.firstName || currentUser?.name}
                  gender={userGender}
                  loading={avatarLoading}
                  size="md"
                />
                <div className="hidden md:block text-right">
                  <p className="text-base font-medium text-white">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  <p className="text-sm text-white/70">مدير النظام</p>
                </div>
                <svg
                  className={`w-4 h-4 text-white transition-transform duration-200 ${
                    profileMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl py-2 z-50 border border-gray-200 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-800">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {currentUser?.email || "admin@school.com"}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      navigate("/profile");
                      setProfileMenuOpen(false);
                    }}
                    className="flex items-center w-full text-right px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg
                      className="w-5 h-5 ml-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    الملف الشخصي
                  </button>

                  <button
                    onClick={() => {
                      navigate("/change-password");
                      setProfileMenuOpen(false);
                    }}
                    className="flex items-center w-full text-right px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg
                      className="w-5 h-5 ml-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                    تغيير كلمة المرور
                  </button>

                  <button
                    onClick={() => {
                      navigate("/admin/settings");
                      setProfileMenuOpen(false);
                    }}
                    className="flex items-center w-full text-right px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg
                      className="w-5 h-5 ml-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    الإعدادات
                  </button>

                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-right px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                      <svg
                        className="w-5 h-5 ml-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ✅ Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white"
              aria-label="القائمة">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* ✅ Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/20 animate-slideDown">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full text-right px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-white text-[#009C5C] shadow-md"
                      : "text-white hover:bg-white/10"
                  }`}>
                  <span className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* ✅ Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </header>
  );
};

export default AdminHeader;