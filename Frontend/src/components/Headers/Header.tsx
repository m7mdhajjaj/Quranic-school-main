



import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import NotificationHeader from '../NotificationHeader';
import { useAuth } from '../../hooks/useAuth';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { showLogoutConfirmation } from '../../utils/logoutUtils';
import { API_BASE_URL, API_URL } from '../../config';
import { Award, BookOpen, CalendarDays, ClipboardList, FileCheck2, Headphones, Home, LogOut, Medal, MessageSquare, Newspaper, PieChart, Settings2, Sparkles, Target, User, UserCheck } from 'lucide-react';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const Header = () => {
  const {
    user: currentUser,
    logout: authLogout,
    isAuthenticated,
    token,
  } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isTeacherOrAdmin =
    currentUser?.role === "teacher" || currentUser?.role === "admin";

  const handleLogout = useCallback(async () => {
    const confirmed = await showLogoutConfirmation({
      userType: "user",
      onConfirm: () => {
        socket?.disconnect();
        setSocket(null);
        setIsMenuOpen(false);
        setProfileMenuOpen(false);
        authLogout();
      },
    });
    if (!confirmed) console.log("تم إلغاء تسجيل الخروج");
  }, [socket, authLogout]);

  useEffect(() => {
    if (!isAuthenticated && !currentUser) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  useEffect(() => {
    const s = io(API_BASE_URL, {
      transports: ["polling"],
      upgrade: false,
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      path: "/socket.io",
    });

    const onConnect = () => setSocket(s);
    const onDisconnect = () => setSocket(null);
    const onError = (e: Error) => {
      if (import.meta.env.MODE !== "production")
        console.error("socket error", e);
      setSocket(s);
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("connect_error", onError);
    s.on("error", onError);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("connect_error", onError);
      s.off("error", onError);
      s.disconnect();
    };
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
        setIsMenuOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, []);

  const primaryNavItems = useMemo(
    () => [
      {
        to: "/",
        label: "الرئيسية",
        icon: Home,
        color: "from-blue-500 to-cyan-500",
      },
      {
        to: "/news",
        label: "الأخبار",
        icon: Newspaper,
        color: "from-purple-500 to-pink-500",
      },
      {
        to: "/goals",
        label: "الأهداف",
        icon: Target,
        color: "from-green-500 to-emerald-500",
      },
      {
        to: "/daily-marks",
        label: "العلامات",
        icon: Award,
        color: "from-orange-500 to-red-500",
      },
      {
        to: "/test",
        label: "الاختبارات",
        icon: FileCheck2,
        color: "from-indigo-500 to-purple-500",
      },
    ],
    []
  );

  const secondaryNavItems = useMemo(() => {
    const base = [
      {
        to: "/quran",
        label: "القرآن الكريم",
        icon: BookOpen,
        color: "from-teal-500 to-cyan-500",
      },
      {
        to: "/quran-audio",
        label: "الصوتي",
        icon: Headphones,
        color: "from-blue-500 to-indigo-500",
      },
      {
        to: "/arrangement",
        label: "الترتيب",
        icon: Medal,
        color: "from-yellow-500 to-orange-500",
      },
      {
        to: "/activities",
        label: "الأنشطة",
        icon: Sparkles,
        color: "from-pink-500 to-rose-500",
      },
      {
        to: "/absence",
        label: "الحضور",
        icon: UserCheck,
        color: "from-red-500 to-pink-500",
      },
      {
        to: "/reports",
        label: "التقارير",
        icon: PieChart,
        color: "from-purple-500 to-indigo-500",
      },
      {
        to: "/timetable",
        label: "الجدول",
        icon: CalendarDays,
        color: "from-emerald-500 to-green-500",
      },
      {
        to: "/exam-schedule",
        label: "الامتحانات",
        icon: ClipboardList,
        color: "from-violet-500 to-purple-500",
      },
      {
        to: "/chat",
        label: "المحادثات",
        icon: MessageSquare,
        color: "from-green-500 to-teal-500",
      },
    ];
    if (!isTeacherOrAdmin) return base;
    return [
      ...base,
      {
        to: "/managment",
        label: "الإدارة",
        icon: Settings2,
        color: "from-gray-500 to-slate-500",
      },
    ];
  }, [isTeacherOrAdmin]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 shadow-2xl"
        dir="rtl">
        <div className="max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8">
          {/* الصف الأول - الرئيسي */}
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            {/* اللوجو */}
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-90 transition-all duration-300 group flex-shrink-0">
              <div className="relative w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <img
                  src="/src/images/logo.jpg"
                  alt="Logo"
                  className="w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                  onLoad={() => setLogoLoaded(true)}
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse-ring"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-white drop-shadow-lg leading-tight">
                  مدرسة القرآن الكريم
                </h1>
                <p className="text-xs md:text-sm text-emerald-100/90 font-medium">
                  أكاديمية مدرسة المهاجرين
                </p>
              </div>
            </Link>

            {/* التنقل الرئيسي - Desktop */}
            <nav className="hidden xl:flex items-center gap-2 flex-1 justify-center max-w-3xl">
              {primaryNavItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `group relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                        isActive
                          ? "bg-white text-emerald-600 shadow-lg"
                          : "text-white hover:bg-white/20"
                      }`
                    }>
                    {({ isActive }) => (
                      <>
                        <span className="flex items-center gap-2">
                          <IconComponent
                            size={20}
                            className={`group-hover:scale-125 transition-transform ${
                              isActive ? "text-emerald-600" : "text-white/70"
                            }`}
                          />
                          <span>{item.label}</span>
                        </span>
                        {isActive && (
                          <span
                            className={`absolute -bottom-3 left-0 right-0 h-1 bg-gradient-to-r ${item.color} rounded-full animate-gradient-slide`}></span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* الأدوات اليمنى */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* البحث مخفي */}

              {/* الإشعارات */}
              {currentUser && (
                <div className="relative">
                  <NotificationHeader
                    userId={currentUser._id}
                    socket={socket}
                    apiUrl={API_BASE_URL}
                  />
                </div>
              )}

              {/* الملف الشخصي */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all hover:scale-105 backdrop-blur-md">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/30 flex items-center justify-center font-bold text-sm">
                    {currentUser?.firstName?.[0] || "👤"}
                  </div>
                  <span className="hidden md:block text-sm font-semibold truncate max-w-24">
                    {currentUser?.firstName || "المستخدم"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
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

                {profileMenuOpen && (
                  <div className="absolute left-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-down z-50">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-emerald-600 font-bold text-xl shadow-lg">
                          {currentUser?.firstName?.[0] || "👤"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm truncate">
                            {currentUser?.firstName && currentUser?.lastName
                              ? `${currentUser.firstName} ${currentUser.lastName}`
                              : currentUser?.firstName || "المستخدم"}
                          </p>
                          {currentUser?.email && (
                            <p className="text-white/80 text-xs truncate">
                              {currentUser.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate("/profile");
                        }}
                        className="w-full px-6 py-3 text-right flex items-center gap-3 text-gray-700 hover:bg-emerald-50 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-emerald-600"
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
                        </div>
                        <span className="font-medium">الملف الشخصي</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate("/change-password");
                        }}
                        className="w-full px-6 py-3 text-right flex items-center gap-3 text-gray-700 hover:bg-blue-50 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-blue-600"
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
                        </div>
                        <span className="font-medium">تغيير كلمة المرور</span>
                      </button>

                      <div className="h-px bg-gray-200 my-2 mx-4"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full px-6 py-3 text-right flex items-center gap-3 text-red-600 hover:bg-red-50 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-red-100 group-hover:bg-red-200 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-red-600"
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
                        </div>
                        <span className="font-medium">تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* زر القائمة */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="xl:hidden p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
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
          </div>

          {/* الصف الثاني - التنقل الثانوي */}
          <div className="hidden xl:flex items-center border-t border-white/20 py-3">
            <div className="flex-1">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-2.5 border border-white/20">
                <nav className="flex items-center justify-center gap-2">
                  {secondaryNavItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `group relative px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap hover:scale-105 ${
                            isActive
                              ? "bg-white text-emerald-600 shadow-lg border border-emerald-200"
                              : "text-emerald-100 hover:bg-white/20 hover:text-white"
                          }`
                        }>
                        {({ isActive }) => (
                          <>
                            <IconComponent
                              size={18}
                              className={
                                isActive
                                  ? "text-emerald-600"
                                  : "text-emerald-100"
                              }
                            />
                            <span>{item.label}</span>
                            {isActive && (
                              <span
                                className={`absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r ${item.color} rounded-full animate-gradient-slide`}></span>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="h-32 xl:h-40"></div>

      {/* قائمة الموبايل */}
      {isMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-40 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 shadow-2xl overflow-y-auto animate-slide-in-right">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-500/30">
                <h2 className="text-lg font-bold text-white">
                  القائمة الرئيسية
                </h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {currentUser && (
                <div className="flex items-center gap-4 mb-6 p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-emerald-600 font-bold text-lg shadow-lg">
                    {currentUser?.firstName?.[0] || "👤"}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-lg truncate">
                      {currentUser.firstName && currentUser.lastName
                        ? `${currentUser.firstName} ${currentUser.lastName}`
                        : currentUser.firstName || "المستخدم"}
                    </div>
                    <div className="text-emerald-200 text-sm">
                      {currentUser.role === "teacher"
                        ? "معلم"
                        : currentUser.role === "admin"
                        ? "مدير"
                        : "طالب"}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {[...primaryNavItems, ...secondaryNavItems].map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? "bg-white/20 text-white shadow-lg"
                            : "text-emerald-100 hover:bg-white/15 hover:text-white"
                        }`
                      }>
                      {({ isActive }) => (
                        <>
                          <IconComponent
                            size={22}
                            className={
                              isActive ? "text-white" : "text-white/70"
                            }
                          />
                          <span className="font-medium flex-1">
                            {item.label}
                          </span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>

              <div className="space-y-2 border-t border-emerald-500/30 pt-4 mt-6">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-white/15 hover:text-white transition-all">
                  <User size={20} className="text-emerald-200" />
                  <span className="font-medium flex-1">الملف الشخصي</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-all">
                  <LogOut size={20} className="text-red-400" />
                  <span className="font-medium flex-1">تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slide-down {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes gradient-slide {
          0% { transform: scaleX(0); transform-origin: left; }
          100% { transform: scaleX(1); transform-origin: left; }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
        .animate-gradient-slide {
          animation: gradient-slide 0.4s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;
