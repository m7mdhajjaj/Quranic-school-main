import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { showLogoutConfirmation } from '../utils/logoutUtils';

const AdminHeader: React.FC = () => {
  const { user: currentUser, logout: authLogout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();



  // Handle scroll effect for header shadow/background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout with confirmation dialog
  const handleLogout = useCallback(async () => {
    const confirmed = await showLogoutConfirmation({
      userType: 'admin',
      onConfirm: () => {
        // تنفيذ عملية logout
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
        authLogout();
      }
    });
    
    if (!confirmed) {
      // تم الإلغاء - لا نفعل شيء
      console.log('تم إلغاء تسجيل الخروج من الأدمن');
    }
  }, [authLogout]);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle ESC key to close all menus
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false);
        setShowNotifications(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  // Check if current route is active
  const isActive = (path: string) => location.pathname === path;

  // Navigation items configuration
  const navItems = [
    { path: '/admin/dashboard', label: 'الإحصائيات', icon: '📊' },
    { path: '/admin/teachers', label: 'إدارة المعلمين', icon: '👨‍🏫' },
    { path: '/admin/students', label: 'إدارة الطلاب', icon: '👨‍🎓' },
    { path: '/admin/reports', label: 'التقارير', icon: '📈' },
    { path: '/admin/settings', label: 'الإعدادات', icon: '🔧' },
  ];

  // Mock notifications (replace with real API call)
  const mockNotifications = [
    {
      id: 1,
      message: 'طالب جديد تم تسجيله',
      time: 'منذ 5 دقائق',
      unread: true,
    },
    { id: 2, message: 'تحديث في النظام', time: 'منذ ساعة', unread: true },
    {
      id: 3,
      message: 'طلب تغيير كلمة مرور',
      time: 'منذ ساعتين',
      unread: false,
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#009C5C] shadow-lg'
          : 'bg-gradient-to-r from-[#009C5C] to-[#00B26F]'
      }`}
    >
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
              <p className="text-sm text-white/80">
                نظام إدارة المدرسة القرآنية
              </p>
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
                    ? 'bg-white text-[#009C5C] shadow-md scale-105'
                    : 'text-white hover:bg-white/10'
                }`}
              >
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
              aria-label="بحث"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
                aria-label="الإشعارات"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
                            ? 'border-[#009C5C] bg-green-50/50'
                            : 'border-transparent'
                        }`}
                      >
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
                        viewBox="0 0 24 24"
                      >
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
                type="button"
                className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:shadow-lg hover:scale-105"
                onClick={() => setProfileMenuOpen((v) => !v)}
                aria-haspopup="menu"
                {...(profileMenuOpen && { 'aria-expanded': true })}
                aria-controls="profile-menu"
              >
                {currentUser && (
                  <span className="text-sm font-semibold text-white truncate drop-shadow-sm">
                    {currentUser.firstName && currentUser.lastName
                      ? `${currentUser.firstName} ${currentUser.lastName}`
                      : currentUser.firstName || currentUser.name || ''}
                  </span>
                )}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-3 w-3 text-white transition-transform duration-300 ${
                    profileMenuOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
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
                <div
                  id="profile-menu"
                  className="absolute left-1/2 transform -translate-x-1/2 top-full mt-3 w-52 bg-white/96 backdrop-blur-2xl rounded-2xl shadow-2xl border border-emerald-100/50 py-1 z-[100] animate-in slide-in-from-top-5 duration-200"
                >
                  <div className="px-3 py-2.5 border-b border-emerald-100/60 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 rounded-t-2xl">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <span className="block text-emerald-800 font-bold text-sm">
                          {currentUser?.firstName && currentUser?.lastName
                            ? `${currentUser.firstName} ${currentUser.lastName}`
                            : currentUser?.firstName || currentUser?.name}
                        </span>
                        {currentUser?.email && (
                          <span
                            className="block text-emerald-500/80 text-xs mt-0.5"
                            title={currentUser.email}
                          >
                            {currentUser.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full text-right py-2 px-3 text-gray-700 hover:bg-emerald-50/80 hover:text-emerald-700 transition-all duration-200 flex items-center gap-2 group"
                    >
                      <div className="p-1 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                        <svg
                          className="w-3 h-3 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <span className="font-medium text-sm">الملف الشخصي</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/change-password');
                      }}
                      className="w-full text-right py-2 px-3 text-gray-700 hover:bg-blue-50/80 hover:text-blue-700 transition-all duration-200 flex items-center gap-2 group"
                    >
                      <div className="p-1 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                        <svg
                          className="w-3 h-3 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1 1 21 9z"
                          />
                        </svg>
                      </div>
                      <span className="font-medium text-sm">
                        تغيير كلمة المرور
                      </span>
                    </button>

                    <div className="border-t border-gray-100 my-1.5" />

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-right py-2 px-3 text-red-600 hover:bg-red-50/80 hover:text-red-700 transition-all duration-200 flex items-center gap-2 group"
                    >
                      <div className="p-1 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
                        <svg
                          className="w-3 h-3 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                      </div>
                      <span className="font-medium text-sm">تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ✅ Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white"
              aria-label="القائمة"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
                      ? 'bg-white text-[#009C5C] shadow-md'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
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
