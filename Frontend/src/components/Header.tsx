import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import NotificationHeader from './NotificationHeader';
import io from 'socket.io-client';

interface User {
  _id: string;
  name: string;
  role?: string;
  firstName?: string;
  lastName?: string;
}

const Header = () => {
  // State Management
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Computed Values
  const isTeacherOrAdmin =
    currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  const userGender = getUserGender(currentUser);

  // Helper Functions
  function getUserGender(user: User | null) {
    if (!user) return 'male';
    const name = user.firstName || user.name || '';
    if (/a$|ة$|ه$|ya$|ia$|ina$|ina$/i.test(name.trim())) return 'female';
    return 'male';
  }

  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen);
  }

  function handleLogout() {
    // Clear storage and disconnect socket
    localStorage.removeItem('user');
    if (socket) {
      socket.disconnect();
    }

    // Reset state
    setCurrentUser(null);
    setSocket(null);
    setIsMenuOpen(false);

    // Handle browser history
    window.history.pushState(null, '', window.location.href);
    window.history.replaceState(null, '', '/login');

    navigate('/login', { replace: true });

    // Prevent back navigation after logout
    setTimeout(() => {
      window.history.pushState(null, '', '/login');
      const preventBackAfterLogout = () => {
        const userInStorage = localStorage.getItem('user');
        if (!userInStorage) {
          window.history.pushState(null, '', '/login');
          navigate('/login', { replace: true });
        }
      };
      window.addEventListener('popstate', preventBackAfterLogout);
    }, 100);
  }

  // Effects
  useEffect(() => {
    if (!profileMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (!userJson) return;

    try {
      const parsed = JSON.parse(userJson) as User;
      setCurrentUser(parsed);

      // Initialize socket connection
      const socketInstance = io('http://localhost:5005');
      setSocket(socketInstance);

      socketInstance.emit('login', {
        userId: parsed._id,
        role: parsed.role || 'student',
        firstName: parsed.name,
      });

      return () => {
        socketInstance.disconnect();
      };
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }, [navigate]);

  // Navigation Items Configuration
  const mainNavItems = [
    {
      to: '/',
      label: 'الرئيسية',
      icon: 'M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z',
    },
    {
      to: '/news',
      label: 'الأخبار',
      icon: 'M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z',
    },
    {
      to: '/goals',
      label: 'الأهداف',
      icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
    },
    {
      to: '/daily-marks',
      label: 'العلامات اليومية',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      stroke: true,
    },
    {
      to: '/test',
      label: 'الاختبارات',
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
      stroke: true,
    },
    {
      to: '/exam-schedule',
      label: 'جدول الامتحانات',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      stroke: true,
    },
    {
      to: '/prayer-times',
      label: 'مواقيت الصلاة',
      icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
      stroke: true,
    },
  ];

  const secondaryNavItems = [
    {
      to: '/quran',
      label: 'القرآن الكريم',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      stroke: true,
    },
    {
      to: '/quran-audio',
      label: 'القرآن الصوتي',
      icon: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 9v6l6-3-6-3z',
      stroke: true,
    },
    {
      to: '/arrangement',
      label: 'الترتيب',
      icon: 'M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 113 0v1m0 0V11m0-5.5a1.5 1.5 0 113 0v3m-3-3a1.5 1.5 0 113 0v3m-3-3a1.5 1.5 0 113 0v3',
      stroke: true,
    },
    {
      to: '/activities',
      label: 'الأنشطة',
      icon: 'M19 11H5m14-7H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM9 10h6m-6 4h6m-6 4h6',
      stroke: true,
    },
    {
      to: '/absence',
      label: 'الحضور والغياب',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      stroke: true,
    },
    {
      to: '/reports',
      label: 'التقارير',
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      stroke: true,
    },
    {
      to: '/chat',
      label: 'تواصل مع المعلم',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      stroke: true,
    },
    ...(isTeacherOrAdmin
      ? [
          {
            to: '/managment',
            label: 'الإدارة',
            icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zm4.675 7.683a3 3 0 11-6 0 3 3 0 016 0z',
            stroke: true,
          },
        ]
      : []),
    {
      to: '/timetable',
      label: 'جدول الحصص',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      stroke: true,
    },
  ];

  // Component Renderers
  const renderIcon = (icon: string, stroke = false) => (
    <svg
      className="w-5 h-5"
      fill={stroke ? 'none' : 'currentColor'}
      stroke={stroke ? 'currentColor' : undefined}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap={stroke ? 'round' : undefined}
        strokeLinejoin={stroke ? 'round' : undefined}
        strokeWidth={stroke ? 2 : undefined}
        fillRule={!stroke ? 'evenodd' : undefined}
        clipRule={!stroke ? 'evenodd' : undefined}
        d={icon}
      />
    </svg>
  );

  const renderNavLink = ({ to, label, icon, stroke }: any) => (
    <li key={to}>
      <NavLink
        to={to}
        className={({ isActive }) =>
          isActive
            ? 'px-4 py-2 bg-white/30 text-white rounded-lg transition-all duration-300 shadow-md font-semibold'
            : 'px-4 py-2 text-white/90 hover:bg-white/20 hover:text-white rounded-lg transition-all duration-300'
        }
      >
        {label}
      </NavLink>
    </li>
  );

  const renderMobileNavLink = ({ to, label, icon, stroke }: any) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        isActive
          ? 'flex items-center gap-3 px-4 py-3 bg-white/20 text-white rounded-lg backdrop-blur-sm border border-white/30 font-semibold'
          : 'flex items-center gap-3 px-4 py-3 text-white/90 hover:bg-white/10 hover:text-white rounded-lg backdrop-blur-sm transition-all duration-300'
      }
      onClick={toggleMenu}
    >
      {renderIcon(icon, stroke)}
      {label}
    </NavLink>
  );

  const renderUserAvatar = (size = 'default') => {
    const sizeClasses = {
      default: 'h-11 w-11 lg:h-13 lg:w-13',
      mobile: 'h-12 w-12',
    };

    return (
      <button
        className={`${sizeClasses[size]} rounded-full border-2 shadow-lg flex items-center justify-center transition-transform hover:scale-105 ${
          userGender === 'female'
            ? 'bg-gradient-to-br from-pink-400 to-fuchsia-500 border-pink-300'
            : 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-300'
        }`}
      >
        {currentUser ? (
          <span className="text-white font-bold text-lg lg:text-xl">
            {(currentUser.firstName || currentUser.name || '').charAt(0)}
          </span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Main Header */}
      <header
        className="sticky top-0 z-50 bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg"
        dir="rtl"
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between py-1 lg:py-2">
            {/* User Profile Section - Far Left */}
            <div className="flex items-center gap-4 order-first">
              <div
                className="hidden md:flex items-center relative"
                ref={profileMenuRef}
              >
                <div
                  className="flex items-center gap-3 cursor-pointer p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                >
                  {renderUserAvatar()}

                  {currentUser && (
                    <span className="hidden lg:block text-base font-semibold text-white max-w-32 truncate">
                      {currentUser.firstName || currentUser.name || ''}
                    </span>
                  )}

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-white transition-transform duration-300 ${profileMenuOpen ? 'rotate-180' : ''}`}
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
                </div>

                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-72 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-100/80 py-2 z-[100]">
                    <div className="px-5 py-4 border-b border-gray-100/80">
                      <span className="block text-emerald-700 font-bold text-lg">
                        {currentUser?.firstName || currentUser?.name}
                      </span>
                      <span className="block text-gray-500 text-sm mt-1">
                        {currentUser?.role === 'teacher'
                          ? 'معلم'
                          : currentUser?.role === 'admin'
                            ? 'مدير'
                            : 'طالب'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/change-password');
                      }}
                      className="w-full text-right py-3 px-5 text-gray-700 hover:bg-emerald-50/80 hover:text-emerald-600 transition-colors flex items-center gap-3"
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
                          d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2a2 2 0 002-2M9 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H9z"
                        />
                      </svg>
                      تغيير كلمة المرور
                    </button>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-right py-3 px-5 text-red-600 hover:bg-red-50/80 transition-colors flex items-center gap-3"
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
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Logo - Center */}
            <div className="flex items-center justify-center flex-1">
              <div className="flex items-center gap-3 animate-shimmer">
                <img
                  onClick={() => navigate('/')}
                  src="/src/images/logo.jpg"
                  alt="مدرسة القرآن"
                  className="cursor-pointer h-8 w-8 lg:h-10 lg:w-10 rounded-full border-2 border-white shadow-lg transition-all duration-500 hover:scale-110 hover:rotate-12 hover:border-amber-300 hover:shadow-amber-300/50"
                />
                <div className="text-center">
                  <h1 className="text-sm lg:text-base font-bold text-white leading-tight hover:text-amber-200 transition-colors duration-300">
                    أكاديمية مدرسة المهاجرين
                  </h1>
                  <p className="text-xs lg:text-sm text-white/90 leading-tight hover:text-amber-100 transition-colors duration-300">
                    لتعليم القرآن الكريم وعلومه
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              {currentUser && (
                <div className="relative">
                  <NotificationHeader
                    userId={currentUser._id}
                    socket={socket}
                    apiUrl="http://localhost:5005"
                  />
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden z-[60] relative p-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                onClick={toggleMenu}
                aria-label="Toggle Menu"
              >
                <div
                  className={`w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ${isMenuOpen ? 'transform rotate-45 translate-y-2' : ''}`}
                ></div>
                <div
                  className={`w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}
                ></div>
                <div
                  className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'transform -rotate-45 -translate-y-2' : ''}`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:block border-t border-white/10">
          <div className="container mx-auto px-4 lg:px-6">
            <nav className="py-0.5">
              <div className="rounded-2xl bg-white/5 backdrop-blur-md py-1.5 px-3 shadow-xl border border-white/10 animate-shimmer hover:border-amber-200/30 transition-all duration-500">
                <div className="flex flex-col gap-2">
                  <ul
                    className="flex flex-wrap justify-center gap-2 text-base font-medium"
                    dir="rtl"
                  >
                    {mainNavItems.map(renderNavLink)}
                  </ul>
                  <ul
                    className="flex flex-wrap justify-center gap-2 text-base font-medium"
                    dir="rtl"
                  >
                    {secondaryNavItems.map(renderNavLink)}
                  </ul>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[55] lg:hidden"
          onClick={toggleMenu}
        >
          <div
            className="fixed inset-y-0 right-0 w-80 bg-gradient-to-br from-emerald-900/98 to-teal-800/98 backdrop-blur-md shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <div className="flex items-center gap-3">
                {renderUserAvatar('mobile')}
                {currentUser && (
                  <div>
                    <div className="text-white font-bold text-lg">
                      {currentUser.firstName || currentUser.name}
                    </div>
                    <div className="text-white/70 text-sm">
                      {currentUser?.role === 'teacher'
                        ? 'معلم'
                        : currentUser?.role === 'admin'
                          ? 'مدير'
                          : 'طالب'}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={toggleMenu}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Close Menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Mobile Navigation Items */}
            <div className="p-4">
              <nav className="space-y-2">
                {[...mainNavItems, ...secondaryNavItems].map(
                  renderMobileNavLink
                )}
              </nav>

              {/* Mobile Action Buttons */}
              <div className="mt-8 space-y-3 pt-6 border-t border-white/20">
                {currentUser && (
                  <button
                    onClick={() => {
                      navigate('/change-password');
                      toggleMenu();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-amber-500/90 hover:bg-amber-500 text-white rounded-lg backdrop-blur-sm transition-all duration-300 font-semibold"
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
                        d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2a2 2 0 002-2M9 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H9z"
                      />
                    </svg>
                    تغيير كلمة المرور
                  </button>
                )}

                <button
                  onClick={() => {
                    if (currentUser) {
                      handleLogout();
                    } else {
                      navigate('/login');
                    }
                    toggleMenu();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg backdrop-blur-sm transition-all duration-300 font-semibold ${
                    currentUser
                      ? 'bg-red-500/90 hover:bg-red-500 text-white'
                      : 'bg-emerald-500/90 hover:bg-emerald-500 text-white'
                  }`}
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
                      d={
                        currentUser
                          ? 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                          : 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
                      }
                    />
                  </svg>
                  {currentUser ? 'تسجيل الخروج' : 'تسجيل الدخول'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
