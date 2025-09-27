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
  gender?: string;
}

const API_URL = "http://localhost:5005/api";

const Header = () => {
  // State Management
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Computed Values
  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  const userGender = getUserGender(currentUser);

  // Helper Functions
  function getUserGender(user: User | null) {
    if (!user) return 'male';
    
    // Check explicit gender field first
    if (user.gender) {
      if (user.gender === 'أنثى' || user.gender === 'انثى' || user.gender === 'female') {
        return 'female';
      }
      if (user.gender === 'ذكر' || user.gender === 'male') {
        return 'male';
      }
    }
    
    // Fallback to name pattern detection
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
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    if (socket) {
      socket.disconnect();
    }

    // Clean up avatar URL
    if (avatarUrl && avatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(avatarUrl);
    }

    // Reset state
    setCurrentUser(null);
    setSocket(null);
    setAvatarUrl("");
    setIsMenuOpen(false);
    setProfileMenuOpen(false);

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
        }
      };
      window.addEventListener('popstate', preventBackAfterLogout);
      
      return () => window.removeEventListener('popstate', preventBackAfterLogout);
    }, 100);
  }

  // Fetch user avatar from database
  const fetchUserAvatar = async (userId: string, userRole: string) => {
    if (!userId || avatarLoading) return;
    
    setAvatarLoading(true);
    try {
      const endpoint = userRole === 'student' ? 'students' : 'teachers';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/${endpoint}/${userId}/avatar`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        if (blob.size > 0) {
          // Clean up previous avatar URL
          if (avatarUrl && avatarUrl.startsWith('blob:')) {
            URL.revokeObjectURL(avatarUrl);
          }
          
          const imageUrl = URL.createObjectURL(blob);
          setAvatarUrl(imageUrl);
        } else {
          setAvatarUrl("");
        }
      } else {
        setAvatarUrl("");
      }
    } catch (error) {
      console.error('Error fetching avatar:', error);
      setAvatarUrl("");
    } finally {
      setAvatarLoading(false);
    }
  };

  // Initialize user and socket connection
  useEffect(() => {
    // Load user from localStorage
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const userData = JSON.parse(userJson) as User;
        setCurrentUser(userData);
        
        // Fetch user avatar
        if (userData._id && userData.role) {
          fetchUserAvatar(userData._id, userData.role);
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
        navigate('/login');
      }
    }

    // Initialize socket connection
    const token = localStorage.getItem('token');
    if (token && userJson) {
      try {
        const socketConnection = io('http://localhost:5005', {
          auth: { token },
          transports: ['websocket', 'polling']
        });

        socketConnection.on('connect', () => {
          console.log('Socket connected');
          setSocket(socketConnection);
        });

        socketConnection.on('disconnect', () => {
          console.log('Socket disconnected');
        });

        socketConnection.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });

        return () => {
          socketConnection.disconnect();
        };
      } catch (err) {
        console.error('Socket initialization error:', err);
      }
    }
  }, [navigate]);

  // Handle click outside profile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileMenuOpen]);

  // Navigation Items Configuration
  const primaryNavItems = [
    {
      to: '/',
      label: 'الصفحة الرئيسية',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      stroke: true,
    },
    {
      to: '/news',
      label: 'الأخبار',
      icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15',
      stroke: true,
    },
    {
      to: '/goals',
      label: 'الأهداف',
      icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
      stroke: true,
    },
    {
      to: '/daily-marks',
      label: 'العلامات اليومية',
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
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

  const renderUserAvatar = () => {
    const getInitials = () => {
      if (currentUser?.firstName) {
        return currentUser.firstName.charAt(0);
      }
      if (currentUser?.name) {
        return currentUser.name.charAt(0);
      }
      return '؟';
    };

    return (
      <button
        className={`w-10 h-10 lg:w-11 lg:h-11 rounded-full border-2 overflow-hidden transition-all duration-300 hover:scale-105 flex items-center justify-center ${
          userGender === 'female'
            ? 'bg-gradient-to-br from-pink-400 to-fuchsia-500 border-pink-300'
            : 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-300'
        }`}
      >
        {avatarLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : avatarUrl ? (
          <img
            src={avatarUrl}
            alt="avatar"
            className="object-cover w-full h-full rounded-full min-w-0 min-h-0"
            onError={() => {
              console.log('Avatar failed to load, falling back to initials');
              setAvatarUrl("");
            }}
          />
        ) : (
          <span className="text-white font-bold text-lg lg:text-xl">
            {getInitials()}
          </span>
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
                      {currentUser.firstName && currentUser.lastName
                        ? `${currentUser.firstName} ${currentUser.lastName}`
                        : currentUser.firstName || currentUser.name || ''}
                    </span>
                  )}

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-white transition-transform duration-300 ${
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
                </div>

                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-72 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-100/80 py-2 z-[100]">
                    <div className="px-5 py-4 border-b border-gray-100/80">
                      <span className="block text-emerald-700 font-bold text-lg">
                        {currentUser?.firstName && currentUser?.lastName
                          ? `${currentUser.firstName} ${currentUser.lastName}`
                          : currentUser?.firstName || currentUser?.name}
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
                        navigate('/profile');
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      الملف الشخصي
                    </button>

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
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                      تغيير كلمة المرور
                    </button>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-right py-3 px-5 text-red-600 hover:bg-red-50/80 hover:text-red-700 transition-colors flex items-center gap-3"
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

              {/* Notifications */}
              {currentUser && socket && (
                <NotificationHeader 
                  userId={currentUser._id} 
                  socket={socket}
                  apiUrl={API_URL}
                />
              )}
            </div>

            {/* School Title - Center */}
            <div className="text-center flex-1">
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-l from-white to-emerald-100 bg-clip-text text-transparent">
                مدرسة القرآن الكريم
              </h1>
            </div>

            {/* Mobile Menu Button - Far Right */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
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

            {/* Desktop Navigation - Right */}
            <nav className="hidden md:flex items-center gap-1">
              {primaryNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'bg-white/20 text-white shadow-md'
                        : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {renderIcon(item.icon, item.stroke)}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Secondary Navigation Bar - Desktop */}
          <div className="hidden md:block border-t border-emerald-500/30 pt-2 pb-1">
            <nav className="flex items-center justify-center gap-1 flex-wrap">
              {secondaryNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-emerald-200 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {renderIcon(item.icon, item.stroke)}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={toggleMenu}>
          <div className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-gradient-to-b from-emerald-600 to-emerald-800 shadow-2xl overflow-y-auto" dir="rtl">
            <div className="p-6">
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">القائمة الرئيسية</h2>
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile User Profile */}
              {currentUser && (
                <div className="flex items-center gap-3 mb-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  {renderUserAvatar()}
                  <div>
                    <div className="text-white font-semibold">
                      {currentUser.firstName && currentUser.lastName
                        ? `${currentUser.firstName} ${currentUser.lastName}`
                        : currentUser.firstName || currentUser.name || ''}
                    </div>
                    <div className="text-emerald-200 text-sm">
                      {currentUser?.role === 'teacher'
                        ? 'معلم'
                        : currentUser?.role === 'admin'
                          ? 'مدير'
                          : 'طالب'}
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Primary Navigation */}
              <div className="space-y-2 mb-6">
                <h3 className="text-emerald-200 text-sm font-medium mb-3">التنقل الرئيسي</h3>
                {primaryNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-white/20 text-white shadow-md'
                          : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    {renderIcon(item.icon, item.stroke)}
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </div>

              {/* Mobile Secondary Navigation */}
              <div className="space-y-2 mb-6">
                <h3 className="text-emerald-200 text-sm font-medium mb-3">خدمات إضافية</h3>
                {secondaryNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-white/20 text-white shadow-md'
                          : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    {renderIcon(item.icon, item.stroke)}
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </div>

              {/* Mobile Profile Actions */}
              {currentUser && (
                <div className="space-y-2 border-t border-emerald-500/30 pt-4">
                  <h3 className="text-emerald-200 text-sm font-medium mb-3">إعدادات الحساب</h3>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-100 hover:bg-white/10 hover:text-white transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">الملف الشخصي</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/change-password');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-100 hover:bg-white/10 hover:text-white transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span className="font-medium">تغيير كلمة المرور</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">تسجيل الخروج</span>
                  </button>
                </div>
              )}

              {/* Mobile Login Button (if not logged in) */}
              {!currentUser && (
                <div className="border-t border-emerald-500/30 pt-4">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/login');
                    }}
                    className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      currentUser
                        ? 'bg-red-500/90 hover:bg-red-500 text-white'
                        : 'bg-emerald-500/90 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    تسجيل الدخول
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;