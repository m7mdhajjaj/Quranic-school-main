
// import { NavLink, useNavigate } from 'react-router-dom';
// import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
// import NotificationHeader from './NotificationHeader';
// import { io, Socket } from 'socket.io-client';
// import axios from 'axios';
// import { API_BASE_URL } from '../config';

// interface User {
//   _id: string;
//   name: string;
//   role?: 'student' | 'teacher' | 'admin' | string;
//   firstName?: string;
//   lastName?: string;
// }

// const API_ORIGIN = API_BASE_URL;

// /** Axios instance */
// const api = axios.create({
//   baseURL: API_ORIGIN,
//   withCredentials: false,
// });

// /** Attach token automatically */
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers = config.headers ?? {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// const Header = () => {
//   // ---------- state ----------
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [profileMenuOpen, setProfileMenuOpen] = useState(false);
//   const [avatarUrl, setAvatarUrl] = useState<string>('');
//   const [avatarLoading, setAvatarLoading] = useState(false);
//   const [logoLoaded, setLogoLoaded] = useState(false);
//   const [officialPhotoLoaded, setOfficialPhotoLoaded] = useState(false);

//   const profileMenuRef = useRef<HTMLDivElement>(null);
//   const navigate = useNavigate();

//   // ---------- helpers ----------
//   const isTeacherOrAdmin =
//     currentUser?.role === 'teacher' || currentUser?.role === 'admin';

//   const getUserGender = (user: User | null) => {
//     if (!user) return 'male';
//     const name = user.firstName || user.name || '';
//     if (/a$|ة$|ه$|ya$|ia$|ina$/i.test(name.trim())) return 'female';
//     return 'male';
//   };
//   const userGender = getUserGender(currentUser);

//   const toggleMenu = () => setIsMenuOpen((v) => !v);



//   const handleLogout = useCallback(() => {
//     localStorage.removeItem('user');
//     localStorage.removeItem('token');
//     localStorage.removeItem('userId');

//     socket?.disconnect();
//     setSocket(null);

//     setAvatarUrl('');
//     setAvatarLoading(false);

//     setCurrentUser(null);
//     setIsMenuOpen(false);
//     setProfileMenuOpen(false);
// //dasdd
//     navigate('/login', { replace: true });
//   }, [socket, navigate]);

//   // ---------- simple avatar URL with loading ----------
//   const fetchUserAvatar = useCallback(
//     (userId: string, role: string) => {
//       if (!userId) return;
      
//       setAvatarLoading(true);
      
//       // Add minimum loading time to show skeleton (prevent flash)
//       const minLoadingTime = 300; // 300ms minimum
//       const startTime = Date.now();
      
//       // Simple direct URL to avatar endpoint with token for auth
//       const token = localStorage.getItem('token');
//       const endpoint = role === 'student' ? 'students' : 'teachers';
//       const avatarUrl = `${API_ORIGIN}/api/${endpoint}/${userId}/avatar?t=${Date.now()}${token ? `&token=${token}` : ''}`;
      
//       // Test if avatar exists by creating an image element
//       const img = new Image();
      
//       const handleLoadComplete = (success: boolean, url?: string) => {
//         const elapsedTime = Date.now() - startTime;
//         const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
//         // Ensure minimum loading time to prevent skeleton flash
//         setTimeout(() => {
//           if (success && url) {
//             setAvatarUrl(url);
//           } else {
//             setAvatarUrl('');
//           }
//           setAvatarLoading(false);
//         }, remainingTime);
//       };
      
//       // Add timeout for slow connections
//       const timeout = setTimeout(() => {
//         img.onload = null;
//         img.onerror = null;
//         handleLoadComplete(false);
//       }, 8000); // 8 second timeout
      
//       img.onload = () => {
//         clearTimeout(timeout);
//         handleLoadComplete(true, avatarUrl);
//       };
//       img.onerror = () => {
//         clearTimeout(timeout);
//         handleLoadComplete(false);
//       };
      
//       img.src = avatarUrl;
//     },
//     []
//   );

//   // ---------- init user ----------
//   useEffect(() => {
//     const userJson = localStorage.getItem('user');
//     if (userJson) {
//       try {
//         const userData = JSON.parse(userJson) as User;
//         setCurrentUser(userData);
//         if (userData._id && userData.role) {
//           fetchUserAvatar(userData._id, userData.role);
//         }
//       } catch (err) {
//         console.error('Error parsing user data:', err);
//         navigate('/login', { replace: true });
//       }
//     }
//   }, [fetchUserAvatar, navigate]);

//   // ---------- init socket (always) to ensure NotificationHeader renders ----------
//   useEffect(() => {
//     const token = localStorage.getItem('token') || undefined;

//     const s = io(API_ORIGIN, {
//       transports: ['websocket', 'polling'],
//       auth: token ? { token } : undefined,
//       reconnection: true,
//       reconnectionAttempts: Infinity,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//     });

//     const onConnect = () => setSocket(s);
//     const onDisconnect = () => setSocket(null);
//     const onError = (e: Error) => {
//       if (process.env.NODE_ENV !== 'production') console.error('socket error', e);
//       setSocket(s); // نبقي المرجع موجودًا حتى لو لم يتصل بعد
//     };

//     s.on('connect', onConnect);
//     s.on('disconnect', onDisconnect);
//     s.on('connect_error', onError);
//     s.on('error', onError);

//     return () => {
//       s.off('connect', onConnect);
//       s.off('disconnect', onDisconnect);
//       s.off('connect_error', onError);
//       s.off('error', onError);
//       s.disconnect();
//     };
//   }, []);

//   // ---------- close profile menu on outside click / esc ----------
//   useEffect(() => {
//     if (!profileMenuOpen) return;
//     const onDown = (e: MouseEvent) => {
//       if (
//         profileMenuRef.current &&
//         !profileMenuRef.current.contains(e.target as Node)
//       )
//         setProfileMenuOpen(false);
//     };
//     const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setProfileMenuOpen(false);

//     document.addEventListener('mousedown', onDown);
//     document.addEventListener('keydown', onKey);
//     return () => {
//       document.removeEventListener('mousedown', onDown);
//       document.removeEventListener('keydown', onKey);
//     };
//   }, [profileMenuOpen]);



//   // ---------- nav items ----------
//   const primaryNavItems = useMemo(
//     () => [
//       {
//         to: '/',
//         label: 'الصفحة الرئيسية',
//         icon:
//           'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
//         stroke: true,
//       },
//       {
//         to: '/news',
//         label: 'الأخبار',
//         icon:
//           'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15',
//         stroke: true,
//       },
//       {
//         to: '/goals',
//         label: 'الأهداف',
//         icon:
//           'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
//         stroke: true,
//       },
//       {
//         to: '/daily-marks',
//         label: 'العلامات اليومية',
//         icon:
//           'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
//         stroke: true,
//       },
//       {
//         to: '/test',
//         label: 'الاختبارات',
//         icon:
//           'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
//         stroke: true,
//       },
//       {
//         to: '/exam-schedule',
//         label: 'جدول الامتحانات',
//         icon:
//           'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
//         stroke: true,
//       },
//       {
//         to: '/prayer-times',
//         label: 'مواقيت الصلاة',
//         icon:
//           'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
//         stroke: true,
//       },
//     ],
//     []
//   );

//   const secondaryNavItems = useMemo(() => {
//     const base = [
//       {
//         to: '/quran',
//         label: 'القرآن الكريم',
//         icon:
//           'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
//         stroke: true,
//       },
//       {
//         to: '/quran-audio',
//         label: 'القرآن الصوتي',
//         icon:
//           'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 9v6l6-3-6-3z',
//         stroke: true,
//       },
//       {
//         to: '/arrangement',
//         label: 'الترتيب',
//         icon:
//           'M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 113 0v1m0 0V11m0-5.5a1.5 1.5 0 113 0v3m-3-3a1.5 1.5 0 113 0v3m-3-3a1.5 1.5 0 113 0v3',
//         stroke: true,
//       },
//       {
//         to: '/activities',
//         label: 'الأنشطة',
//         icon:
//           'M19 11H5m14-7H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM9 10h6m-6 4h6m-6 4h6',
//         stroke: true,
//       },
//       {
//         to: '/absence',
//         label: 'الحضور والغياب',
//         icon:
//           'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
//         stroke: true,
//       },
//       {
//         to: '/reports',
//         label: 'التقارير',
//         icon:
//           'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
//         stroke: true,
//       },
//       {
//         to: '/chat',
//         label: 'تواصل مع المعلم',
//         icon:
//           'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
//         stroke: true,
//       },
//       {
//         to: '/timetable',
//         label: 'جدول الحصص',
//         icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
//         stroke: true,
//       },
//     ] as const;

//     if (!isTeacherOrAdmin) return base;
//     return [
//       ...base.slice(0, 7),
//       {
//         to: '/managment',
//         label: 'الإدارة',
//         icon:
//           'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zm4.675 7.683a3 3 0 11-6 0 3 3 0 016 0z',
//         stroke: true,
//       },
//       ...base.slice(7),
//     ];
//   }, [isTeacherOrAdmin]);

//   // ---------- ui helpers ----------
//   const renderIcon = (d: string, stroke = false) => (
//     <svg
//       className="w-4 h-4 lg:w-5 lg:h-5"
//       fill={stroke ? 'none' : 'currentColor'}
//       stroke={stroke ? 'currentColor' : undefined}
//       viewBox="0 0 24 24"
//       aria-hidden="true"
//     >
//       <path
//         strokeLinecap={stroke ? 'round' : undefined}
//         strokeLinejoin={stroke ? 'round' : undefined}
//         strokeWidth={stroke ? 2 : undefined}
//         fillRule={!stroke ? 'evenodd' : undefined}
//         clipRule={!stroke ? 'evenodd' : undefined}
//         d={d}
//       />
//     </svg>
//   );

//   // Generic Image Skeleton Component
//   const ImageSkeleton = ({ className, variant = 'default' }: { 
//     className: string; 
//     variant?: 'default' | 'avatar' | 'logo';
//   }) => (
//     <div
//       className={`${className} relative overflow-hidden flex items-center justify-center ${
//         variant === 'logo' 
//           ? 'bg-gradient-to-br from-blue-200/80 to-indigo-300/80 dark:from-blue-600/80 dark:to-indigo-700/80'
//           : variant === 'avatar'
//           ? 'bg-gradient-to-br from-emerald-200/80 to-teal-300/80 dark:from-emerald-600/80 dark:to-teal-700/80'
//           : 'bg-gradient-to-br from-gray-200/80 to-gray-300/80 dark:from-gray-600/80 dark:to-gray-700/80'
//       } backdrop-blur-sm`}
//       aria-label="جاري تحميل الصورة"
//     >
//       {/* Multiple shimmer layers for depth */}
//       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-gray-300/50 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
//       <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/30 dark:via-gray-400/30 to-transparent animate-[shimmer_2.5s_ease-in-out_infinite] animation-delay-500" />
      
//       {/* Pulsing background with breathing effect */}
//       <div className="absolute inset-0 bg-white/30 dark:bg-gray-400/30 animate-[pulse-slow_3s_ease-in-out_infinite]" />
      
//       {/* Subtle border shimmer */}
//       <div className="absolute inset-0 border border-white/40 dark:border-gray-300/40 animate-pulse rounded-[inherit]" />
      
//       {/* Loading dots */}
//       <div className="absolute inset-0 flex items-center justify-center z-10">
//         <div className="flex space-x-0.5">
//           <div className="w-1 h-1 bg-gray-500/80 dark:bg-gray-400/80 rounded-full animate-[bounce_1.4s_ease-in-out_infinite] animation-delay-0"></div>
//           <div className="w-1 h-1 bg-gray-500/80 dark:bg-gray-400/80 rounded-full animate-[bounce_1.4s_ease-in-out_infinite] animation-delay-200"></div>
//           <div className="w-1 h-1 bg-gray-500/80 dark:bg-gray-400/80 rounded-full animate-[bounce_1.4s_ease-in-out_infinite] animation-delay-400"></div>
//         </div>
//       </div>
//     </div>
//   );

//   const AvatarSkeleton = () => (
//     <div
//       className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 overflow-hidden flex items-center justify-center ${
//         userGender === 'female'
//           ? 'bg-gradient-to-br from-pink-400 to-fuchsia-500 border-pink-200/50 shadow-pink-500/30'
//           : 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-200/50 shadow-emerald-500/30'
//       } shadow-lg relative`}
//       aria-label="جاري تحميل الصورة"
//     >
//       {/* Shimmer effect */}
//       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full" />
      
//       {/* Pulsing background */}
//       <div className="w-full h-full bg-white/20 rounded-full animate-pulse" />
      
//       {/* Loading dots */}
//       <div className="absolute inset-0 flex items-center justify-center">
//         <div className="flex space-x-1">
//           <div className="w-1 h-1 bg-white/70 rounded-full animate-[bounce_1.4s_ease-in-out_infinite] animation-delay-0"></div>
//           <div className="w-1 h-1 bg-white/70 rounded-full animate-[bounce_1.4s_ease-in-out_infinite] animation-delay-200"></div>
//           <div className="w-1 h-1 bg-white/70 rounded-full animate-[bounce_1.4s_ease-in-out_infinite] animation-delay-400"></div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderUserAvatar = () => {
//     if (avatarLoading) return <AvatarSkeleton />;

//     return (
//       <button
//         type="button"
//         className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center ${
//           userGender === 'female'
//             ? 'bg-gradient-to-br from-pink-400 to-fuchsia-500 border-pink-200/50 shadow-pink-500/30'
//             : 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-200/50 shadow-emerald-500/30'
//         } shadow-lg group relative`}
//         aria-label="القائمة الشخصية"
//         onClick={() => {
//           // Retry loading avatar if it failed and not currently loading
//           if (!avatarUrl && !avatarLoading && currentUser?._id && currentUser?.role) {
//             fetchUserAvatar(currentUser._id, currentUser.role);
//           }
//         }}
//       >
//         {avatarUrl ? (
//           <img
//             src={avatarUrl}
//             alt="صورة المستخدم"
//             className="object-cover w-full h-full rounded-full transition-opacity duration-200 opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]"
//             onLoad={(e) => {
//               (e.target as HTMLImageElement).style.opacity = '1';
//             }}
//             onError={() => {
//               setAvatarUrl('');
//             }}
//           />
//         ) : currentUser ? (
//           <div className="relative w-full h-full flex items-center justify-center">
//             <span className="text-white font-bold text-sm lg:text-base drop-shadow-sm">
//               {(currentUser.firstName || currentUser.name || '').charAt(0)}
//             </span>
//             {/* Subtle retry indicator on hover */}
//             <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center">
//               <svg className="w-3 h-3 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//               </svg>
//             </div>
//           </div>
//         ) : (
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-4 w-4 lg:h-5 lg:w-5 text-white"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//             aria-hidden="true"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//             />
//           </svg>
//         )}
//       </button>
//     );
//   };

//   // ---------- render ----------
//   return (
//     <>
//       {/* Main Header */}
//       <header
//         className="sticky top-0 z-50 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-500 text-white shadow-2xl border-b border-emerald-400/20"
//         dir="rtl"
//       >
//         {/* زر الإشعارات منفصل في أقصى اليسار */}
//         {currentUser && (
//           <div className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-[60] hidden md:block">
//             <div className="bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-md border border-white/30 rounded-full p-1 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:from-white/25 hover:to-white/20">
//               <NotificationHeader
//                 userId={currentUser._id}
//                 socket={socket}
//                 apiUrl={API_ORIGIN}
//               />
//             </div>
//           </div>
//         )}

//         <div className="container mx-auto px-3 lg:px-6 relative">
//           {/* الصف الرئيسي */}
//           <div className="flex items-center justify-between py-2 lg:py-3">
//             {/* RIGHT: Logo + Academy Name */}
//             <div className="flex items-center justify-start gap-3">
//               <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center shadow-lg relative overflow-hidden">
//                 {!logoLoaded && (
//                   <ImageSkeleton 
//                     className="w-8 h-8 lg:w-10 lg:h-10 rounded-full absolute inset-0 m-auto" 
//                     variant="logo"
//                   />
//                 )}
//                 <img
//                   src="/src/images/logo.jpg"
//                   alt="لوغو الأكاديمية"
//                   className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover transition-all duration-500 ${
//                     logoLoaded 
//                       ? 'opacity-100 scale-100' 
//                       : 'opacity-0 scale-95'
//                   }`}
//                   onLoad={() => setLogoLoaded(true)}
//                   onError={(e) => {
//                     setLogoLoaded(true);
//                     (e.target as HTMLImageElement).style.display = 'none';
//                   }}
//                 />
//               </div>
//               <div>
//                 <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-l from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-sm">
//                   مدرسة القرآن الكريم
//                 </h1>
//                 <p className="text-xs lg:text-sm text-emerald-100/80 font-medium hidden lg:block">
//                   أكاديمية مدرسة الهجرة للقرآن الكريم وعلومه
//                 </p>
//               </div>
//             </div>

//             {/* CENTER: Desktop Nav */}
//             <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
//               {primaryNavItems.map((item) => (
//                 <NavLink
//                   key={item.to}
//                   to={item.to}
//                   className={({ isActive }) =>
//                     `px-2 lg:px-3 py-2 rounded-xl text-xs lg:text-sm font-medium transition-all duration-300 flex items-center gap-1.5 lg:gap-2 backdrop-blur-sm ${
//                       isActive
//                         ? 'bg-white/25 text-white shadow-lg border border-white/30 scale-105'
//                         : 'text-emerald-100 hover:bg-white/15 hover:text-white hover:scale-105 border border-transparent hover:border-white/20'
//                     }`
//                   }
//                 >
//                   {renderIcon(item.icon, item.stroke)}
//                   <span className="whitespace-nowrap">{item.label}</span>
//                 </NavLink>
//               ))}
//             </nav>

//             {/* LEFT: Profile + Notifications Mobile + Mobile Button */}
//             <div className="flex items-center gap-2 lg:gap-3">
//               {/* زر الإشعارات للجوال */}
//               {currentUser && (
//                 <div className="md:hidden">
//                   <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-1 hover:bg-white/20 transition-all duration-300">
//                     <NotificationHeader
//                       userId={currentUser._id}
//                       socket={socket}
//                       apiUrl={API_ORIGIN}
//                     />
//                   </div>
//                 </div>
//               )}

//               {/* Profile */}
//               <div className="hidden md:flex items-center relative" ref={profileMenuRef}>
//                 <div
//                   role="button"
//                   tabIndex={0}
//                   className="flex items-center gap-2 lg:gap-3 cursor-pointer p-2 lg:p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:shadow-lg hover:scale-105"
//                   onClick={() => setProfileMenuOpen((v) => !v)}
//                   onKeyDown={(e) =>
//                     (e.key === 'Enter' || e.key === ' ') &&
//                     setProfileMenuOpen((v) => !v)
//                   }

//                   aria-haspopup="menu"
//                   aria-expanded={profileMenuOpen}
//                   aria-controls="profile-menu"
//                 >
//                   {renderUserAvatar()}
//                   {currentUser && (
//                     <span className="hidden lg:block text-sm lg:text-base font-semibold text-white max-w-28 lg:max-w-32 truncate drop-shadow-sm">
//                       {currentUser.firstName && currentUser.lastName
//                         ? `${currentUser.firstName} ${currentUser.lastName}`
//                         : currentUser.firstName || currentUser.name || ''}
//                     </span>
//                   )}
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className={`h-3 w-3 lg:h-4 lg:w-4 text-white transition-transform duration-300 ${
//                       profileMenuOpen ? 'rotate-180' : ''
//                     }`}
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M19 9l-7 7-7-7"
//                     />
//                   </svg>
//                 </div>

//                 {profileMenuOpen && (
//                   <div
//                     id="profile-menu"
//                     className="absolute right-0 top-full mt-2 w-72 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/80 py-2 z-[100]"
//                   >
//                     <div className="px-6 py-4 border-b border-gray-100/80 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-2xl">
//                       <div className="flex items-center gap-3">
//                         {renderUserAvatar()}
//                         <div>
//                           <span className="block text-emerald-800 font-bold text-lg">
//                             {currentUser?.firstName && currentUser?.lastName
//                               ? `${currentUser.firstName} ${currentUser.lastName}`
//                               : currentUser?.firstName || currentUser?.name}
//                           </span>
//                           <span className="block text-emerald-600 text-sm mt-1 font-medium">
//                             {currentUser?.role === 'teacher'
//                               ? 'معلم'
//                               : currentUser?.role === 'admin'
//                               ? 'مدير'
//                               : 'طالب'}
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="py-2">
//                       <button
//                         onClick={() => {
//                           setProfileMenuOpen(false);
//                           navigate('/profile');
//                         }}

//                         className="w-full text-right py-3 px-6 text-gray-700 hover:bg-emerald-50/80 hover:text-emerald-700 transition-all duration-200 flex items-center gap-3 group"
//                       >
//                         <div className="p-1.5 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
//                           <svg
//                             className="w-4 h-4 text-emerald-600"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                             />
//                           </svg>
//                         </div>
//                         <span className="font-medium">الملف الشخصي</span>
//                       </button>

//                       <button
//                         onClick={() => {
//                           setProfileMenuOpen(false);
//                           navigate('/change-password');
//                         }}
//                         className="w-full text-right py-3 px-6 text-gray-700 hover:bg-blue-50/80 hover:text-blue-700 transition-all duration-200 flex items-center gap-3 group"
//                       >
//                         <div className="p-1.5 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
//                           <svg
//                             className="w-4 h-4 text-blue-600"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z"
//                             />
//                           </svg>
//                         </div>
//                         <span className="font-medium">تغيير كلمة المرور</span>
//                       </button>

//                       <div className="border-t border-gray-100 my-2" />

//                       <button
//                         onClick={() => {
//                           setProfileMenuOpen(false);
//                           handleLogout();
//                         }}
//                         className="w-full text-right py-3 px-6 text-red-600 hover:bg-red-50/80 hover:text-red-700 transition-all duration-200 flex items-center gap-3 group"
//                       >
//                         <div className="p-1.5 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
//                           <svg
//                             className="w-4 h-4 text-red-600"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
//                             />
//                           </svg>
//                         </div>
//                         <span className="font-medium">تسجيل الخروج</span>
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Mobile menu button */}
//               <div className="md:hidden">
//                 <button
//                   onClick={toggleMenu}
//                   className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-md border border-white/20 hover:scale-105"
//                   aria-label="فتح القائمة"
//                   aria-expanded={isMenuOpen}
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     {isMenuOpen ? (
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     ) : (
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                     )}
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Secondary Navigation Bar - Desktop */}
//           <div className="hidden md:block border-top border-emerald-400/30 pt-2 pb-2">
//             <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20">
//               <nav className="flex items-center justify-center gap-1 flex-wrap">
//                 {secondaryNavItems.map((item) => (
//                   <NavLink
//                     key={item.to}
//                     to={item.to}
//                     className={({ isActive }) =>
//                       `px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-300 flex items-center gap-1 lg:gap-1.5 ${
//                         isActive
//                           ? 'bg-white/20 text-white shadow-md border border-white/30'
//                           : 'text-emerald-100 hover:bg-white/15 hover:text-white hover:scale-105 border border-transparent hover:border-white/20'
//                       }`
//                     }
//                   >
//                     {renderIcon(item.icon, item.stroke)}
//                     <span className="whitespace-nowrap hidden lg:inline">{item.label}</span>
//                   </NavLink>
//                 ))}
//               </nav>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Mobile Drawer */}
//       {isMenuOpen && (
//         <div className="md:hidden fixed inset-0 z-40">
//           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleMenu} />
//           <div
//             className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 shadow-2xl overflow-y-auto"
//             dir="rtl"
//           >
//             <div className="p-6">
//               {/* mobile header */}
//               <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-500/30">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center relative overflow-hidden">
//                     {!officialPhotoLoaded && (
//                       <ImageSkeleton 
//                         className="w-7 h-7 rounded-full absolute inset-0 m-auto" 
//                         variant="avatar"
//                       />
//                     )}
//                     <img
//                       src="/src/images/officialPhoto.jpg"
//                       alt="Logo"
//                       className={`w-7 h-7 rounded-full object-cover transition-all duration-500 ${
//                         officialPhotoLoaded 
//                           ? 'opacity-100 scale-100' 
//                           : 'opacity-0 scale-95'
//                       }`}
//                       onLoad={() => setOfficialPhotoLoaded(true)}
//                       onError={(e) => {
//                         setOfficialPhotoLoaded(true);
//                         (e.target as HTMLImageElement).style.display = 'none';
//                       }}
//                     />
//                   </div>
//                   <div>
//                     <h2 className="text-lg font-bold text-white">القائمة الرئيسية</h2>
//                     <p className="text-emerald-200 text-sm">مدرسة القرآن الكريم</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={toggleMenu}
//                   className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md border border-white/20"
//                   aria-label="إغلاق القائمة"
//                 >
//                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>

//               {/* mobile profile */}
//               {currentUser && (
//                 <div className="flex items-center gap-4 mb-6 p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
//                   {renderUserAvatar()}
//                   <div className="flex-1">
//                     <div className="text-white font-semibold text-lg">
//                       {currentUser.firstName && currentUser.lastName
//                         ? `${currentUser.firstName} ${currentUser.lastName}`
//                         : currentUser.firstName || currentUser.name || ''}
//                     </div>
//                     <div className="text-emerald-200 text-sm">
//                       {currentUser.role === 'teacher'
//                         ? 'معلم'
//                         : currentUser.role === 'admin'
//                         ? 'مدير'
//                         : 'طالب'}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* nav */}
//               <div className="space-y-1">
//                 {[...primaryNavItems, ...secondaryNavItems].map((item) => (
//                   <NavLink
//                     key={item.to}
//                     to={item.to}
//                     onClick={() => setIsMenuOpen(false)}
//                     className={({ isActive }) =>
//                       `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
//                         isActive
//                           ? 'bg-white/20 text-white shadow-lg border border-white/30'
//                           : 'text-emerald-100 hover:bg-white/15 hover:text-white hover:translate-x-1'
//                       }`
//                     }
//                   >
//                     <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
//                       {renderIcon(item.icon, item.stroke)}
//                     </div>
//                     <span className="font-medium flex-1">{item.label}</span>
//                     <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                     </svg>
//                   </NavLink>
//                 ))}
//               </div>

//               {/* actions */}
//               {currentUser ? (
//                 <div className="space-y-2 border-top border-emerald-500/30 pt-4 mt-6">
//                   <button
//                     onClick={() => {
//                       setIsMenuOpen(false);
//                       navigate('/profile');
//                     }}
//                     className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-white/15 hover:text-white transition-all duration-300 group hover:translate-x-1"
//                   >
//                     <div className="p-2 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                       </svg>
//                     </div>
//                     <span className="font-medium flex-1">الملف الشخصي</span>
//                   </button>

//                   <button
//                     onClick={() => {
//                       setIsMenuOpen(false);
//                       navigate('/change-password');
//                     }}
//                     className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-white/15 hover:text-white transition-all duration-300 group hover:translate-x-1"
//                   >
//                     <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
//                       </svg>
//                     </div>
//                     <span className="font-medium flex-1">تغيير كلمة المرور</span>
//                   </button>

//                   <button
//                     onClick={() => {
//                       setIsMenuOpen(false);
//                       handleLogout();
//                     }}
//                     className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-all duration-300 group hover:translate-x-1"
//                   >
//                     <div className="p-2 rounded-lg bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                       </svg>
//                     </div>
//                     <span className="font-medium flex-1">تسجيل الخروج</span>
//                   </button>
//                 </div>
//               ) : (
//                 <div className="border-t border-emerald-500/30 pt-4 mt-6">
//                   <button
//                     onClick={() => {
//                       setIsMenuOpen(false);
//                       navigate('/login');
//                     }}
//                     className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
//                     </svg>
//                     تسجيل الدخول
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Header;



import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import NotificationHeader from './NotificationHeader';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface User {
  _id: string;
  name: string;
  role?: 'student' | 'teacher' | 'admin' | string;
  firstName?: string;
  lastName?: string;
}

const API_ORIGIN = API_BASE_URL;

/** Axios instance */
const api = axios.create({
  baseURL: API_ORIGIN,
  withCredentials: false,
});

/** Attach token automatically */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const Header = () => {
  // ---------- state ----------
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [officialPhotoLoaded, setOfficialPhotoLoaded] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ---------- helpers ----------
  const isTeacherOrAdmin =
    currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  const getUserGender = (user: User | null) => {
    if (!user) return 'male';
    const name = user.firstName || user.name || '';
    if (/a$|ة$|ه$|ya$|ia$|ina$/i.test(name.trim())) return 'female';
    return 'male';
  };
  const userGender = getUserGender(currentUser);

  const toggleMenu = () => setIsMenuOpen((v) => !v);



  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');

    socket?.disconnect();
    setSocket(null);

    setAvatarUrl('');
    setAvatarLoading(false);

    setCurrentUser(null);
    setIsMenuOpen(false);
    setProfileMenuOpen(false);
//dasdd
    navigate('/login', { replace: true });
  }, [socket, navigate]);

  // ---------- simple avatar URL with loading ----------
  const fetchUserAvatar = useCallback(
    (userId: string, role: string) => {
      if (!userId) return;
      
      setAvatarLoading(true);
      
      // Add minimum loading time to show skeleton (prevent flash)
      const minLoadingTime = 300; // 300ms minimum
      const startTime = Date.now();
      
      // Simple direct URL to avatar endpoint with token for auth
      const token = localStorage.getItem('token');
      const endpoint = role === 'student' ? 'students' : 'teachers';
      const avatarUrl = `${API_ORIGIN}/api/${endpoint}/${userId}/avatar?t=${Date.now()}${token ? `&token=${token}` : ''}`;
      
      // Test if avatar exists by creating an image element
      const img = new Image();
      
      const handleLoadComplete = (success: boolean, url?: string) => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        // Ensure minimum loading time to prevent skeleton flash
        setTimeout(() => {
          if (success && url) {
            setAvatarUrl(url);
          } else {
            setAvatarUrl('');
          }
          setAvatarLoading(false);
        }, remainingTime);
      };
      
      // Add timeout for slow connections
      const timeout = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        handleLoadComplete(false);
      }, 8000); // 8 second timeout
      
      img.onload = () => {
        clearTimeout(timeout);
        handleLoadComplete(true, avatarUrl);
      };
      img.onerror = () => {
        clearTimeout(timeout);
        handleLoadComplete(false);
      };
      
      img.src = avatarUrl;
    },
    []
  );

  // ---------- init user ----------
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const userData = JSON.parse(userJson) as User;
        setCurrentUser(userData);
        if (userData._id && userData.role) {
          fetchUserAvatar(userData._id, userData.role);
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
        navigate('/login', { replace: true });
      }
    }
  }, [fetchUserAvatar, navigate]);

  // ---------- init socket (always) to ensure NotificationHeader renders ----------
  useEffect(() => {
    const token = localStorage.getItem('token') || undefined;

    const s = io(API_ORIGIN, {
      transports: ['websocket', 'polling'],
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    const onConnect = () => setSocket(s);
    const onDisconnect = () => setSocket(null);
    const onError = (e: Error) => {
      if (process.env.NODE_ENV !== 'production') console.error('socket error', e);
      setSocket(s); // نبقي المرجع موجودًا حتى لو لم يتصل بعد
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('connect_error', onError);
    s.on('error', onError);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('connect_error', onError);
      s.off('error', onError);
      s.disconnect();
    };
  }, []);

  // ---------- close profile menu on outside click / esc ----------
  useEffect(() => {
    if (!profileMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      )
        setProfileMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setProfileMenuOpen(false);

    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [profileMenuOpen]);



  // ---------- nav items ----------
  const primaryNavItems = useMemo(
    () => [
      {
        to: '/',
        label: 'الصفحة الرئيسية',
        icon:
          'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
        stroke: true,
      },
      {
        to: '/news',
        label: 'الأخبار',
        icon:
          'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15',
        stroke: true,
      },
      {
        to: '/goals',
        label: 'الأهداف',
        icon:
          'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
        stroke: true,
      },
      {
        to: '/daily-marks',
        label: 'العلامات اليومية',
        icon:
          'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
        stroke: true,
      },
      {
        to: '/test',
        label: 'الاختبارات',
        icon:
          'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
        stroke: true,
      },
      {
        to: '/exam-schedule',
        label: 'جدول الامتحانات',
        icon:
          'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        stroke: true,
      },
      {
        to: '/prayer-times',
        label: 'مواقيت الصلاة',
        icon:
          'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
        stroke: true,
      },
    ],
    []
  );

  const secondaryNavItems = useMemo(() => {
    const base = [
      {
        to: '/quran',
        label: 'القرآن الكريم',
        icon:
          'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
        stroke: true,
      },
      {
        to: '/quran-audio',
        label: 'القرآن الصوتي',
        icon:
          'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 9v6l6-3-6-3z',
        stroke: true,
      },
      {
        to: '/arrangement',
        label: 'الترتيب',
        icon:
          'M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 113 0v1m0 0V11m0-5.5a1.5 1.5 0 113 0v3m-3-3a1.5 1.5 0 113 0v3m-3-3a1.5 1.5 0 113 0v3',
        stroke: true,
      },
      {
        to: '/activities',
        label: 'الأنشطة',
        icon:
          'M19 11H5m14-7H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM9 10h6m-6 4h6m-6 4h6',
        stroke: true,
      },
      {
        to: '/absence',
        label: 'الحضور والغياب',
        icon:
          'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
        stroke: true,
      },
      {
        to: '/reports',
        label: 'التقارير',
        icon:
          'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        stroke: true,
      },
      {
        to: '/chat',
        label: 'تواصل مع المعلم',
        icon:
          'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
        stroke: true,
      },
      {
        to: '/timetable',
        label: 'جدول الحصص',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        stroke: true,
      },
    ] as const;

    if (!isTeacherOrAdmin) return base;
    return [
      ...base.slice(0, 7),
      {
        to: '/managment',
        label: 'الإدارة',
        icon:
          'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zm4.675 7.683a3 3 0 11-6 0 3 3 0 016 0z',
        stroke: true,
      },
      ...base.slice(7),
    ];
  }, [isTeacherOrAdmin]);

  // ---------- ui helpers ----------
  const renderIcon = (d: string, stroke = false) => (
    <svg
      className="w-4 h-4 lg:w-5 lg:h-5"
      fill={stroke ? 'none' : 'currentColor'}
      stroke={stroke ? 'currentColor' : undefined}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap={stroke ? 'round' : undefined}
        strokeLinejoin={stroke ? 'round' : undefined}
        strokeWidth={stroke ? 2 : undefined}
        fillRule={!stroke ? 'evenodd' : undefined}
        clipRule={!stroke ? 'evenodd' : undefined}
        d={d}
      />
    </svg>
  );

  // Generic Image Skeleton Component
  const ImageSkeleton = ({ className, variant = 'default' }: { 
    className: string; 
    variant?: 'default' | 'avatar' | 'logo';
  }) => (
    <div
      className={`${className} relative overflow-hidden flex items-center justify-center ${
        variant === 'logo' 
          ? 'bg-gradient-to-br from-blue-200/80 to-indigo-300/80 dark:from-blue-600/80 dark:to-indigo-700/80'
          : variant === 'avatar'
          ? 'bg-gradient-to-br from-emerald-200/80 to-teal-300/80 dark:from-emerald-600/80 dark:to-teal-700/80'
          : 'bg-gradient-to-br from-gray-200/80 to-gray-300/80 dark:from-gray-600/80 dark:to-gray-700/80'
      } backdrop-blur-sm`}
      aria-label="جاري تحميل الصورة"
    >
      {/* Multiple shimmer layers for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-gray-300/50 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/30 dark:via-gray-400/30 to-transparent animate-[shimmer_2.5s_ease-in-out_infinite] animation-delay-500" />
      
      {/* Pulsing background with breathing effect */}
      <div className="absolute inset-0 bg-white/30 dark:bg-gray-400/30 animate-[pulse-slow_3s_ease-in-out_infinite]" />
      
      {/* Subtle border shimmer */}
      <div className="absolute inset-0 border border-white/40 dark:border-gray-300/40 animate-pulse rounded-[inherit]" />
      
      {/* Loading dots */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="flex space-x-0.5">
          <div className="w-1 h-1 bg-gray-500/80 dark:bg-gray-400/80 rounded-full animate-[bounce_1.4s_ease-in-out_infinite] animation-delay-0"></div>
          <div className="w-1 h-1 bg-gray-500/80 dark:bg-gray-400/80 rounded-full animate-[bounce_1.4s_ease-in-out_infinite] animation-delay-200"></div>
          <div className="w-1 h-1 bg-gray-500/80 dark:bg-gray-400/80 rounded-full animate-[bounce_1.4s_ease-in-out_infinite] animation-delay-400"></div>
        </div>
      </div>
    </div>
  );

  const AvatarSkeleton = () => (
    <div
      className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 overflow-hidden flex items-center justify-center ${
        userGender === 'female'
          ? 'bg-gradient-to-br from-pink-400 to-fuchsia-500 border-pink-200/50 shadow-pink-500/30'
          : 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-200/50 shadow-emerald-500/30'
      } shadow-lg relative`}
      aria-label="جاري تحميل الصورة"
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full" />
      
      {/* Pulsing background */}
      <div className="w-full h-full bg-white/20 rounded-full animate-pulse" />
      
      {/* Loading dots */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-white/70 rounded-full animate-[bounce_1.4s_ease-in-out_infinite] animation-delay-0"></div>
          <div className="w-1 h-1 bg-white/70 rounded-full animate-[bounce_1.4s_ease-in-out_infinite] animation-delay-200"></div>
          <div className="w-1 h-1 bg-white/70 rounded-full animate-[bounce_1.4s_ease-in-out_infinite] animation-delay-400"></div>
        </div>
      </div>
    </div>
  );

  const renderUserAvatar = () => {
    if (avatarLoading) return <AvatarSkeleton />;

    return (
      <button
        type="button"
        className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center ${
          userGender === 'female'
            ? 'bg-gradient-to-br from-pink-400 to-fuchsia-500 border-pink-200/50 shadow-pink-500/30'
            : 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-200/50 shadow-emerald-500/30'
        } shadow-lg group relative`}
        aria-label="القائمة الشخصية"
        onClick={() => {
          // Retry loading avatar if it failed and not currently loading
          if (!avatarUrl && !avatarLoading && currentUser?._id && currentUser?.role) {
            fetchUserAvatar(currentUser._id, currentUser.role);
          }
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="صورة المستخدم"
            className="object-cover w-full h-full rounded-full transition-opacity duration-200 opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]"
            onLoad={(e) => {
              (e.target as HTMLImageElement).style.opacity = '1';
            }}
            onError={() => {
              setAvatarUrl('');
            }}
          />
        ) : currentUser ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <span className="text-white font-bold text-sm lg:text-base drop-shadow-sm">
              {(currentUser.firstName || currentUser.name || '').charAt(0)}
            </span>
            {/* Subtle retry indicator on hover */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 lg:h-5 lg:w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
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

  // ---------- render ----------
  return (
    <>
      {/* Main Header */}
      <header
        className="sticky top-0 z-50 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-500 text-white shadow-2xl border-b border-emerald-400/20"
        dir="rtl"
      >
        {/* زر الإشعارات منفصل في أقصى اليسار */}
        {currentUser && (
          <div className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-[60] hidden md:block">
            <div className="bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-md border border-white/30 rounded-full p-1 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:from-white/25 hover:to-white/20">
              <NotificationHeader
                userId={currentUser._id}
                socket={socket}
                apiUrl={API_ORIGIN}
              />
            </div>
          </div>
        )}

        <div className="container mx-auto px-3 lg:px-6 relative">
          {/* الصف الرئيسي */}
          <div className="flex items-center justify-between py-2 lg:py-3">
            {/* RIGHT: Logo + Academy Name */}
            <div className="flex items-center justify-start gap-3">
              <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center shadow-lg relative overflow-hidden">
                {!logoLoaded && (
                  <ImageSkeleton 
                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-full absolute inset-0 m-auto" 
                    variant="logo"
                  />
                )}
                <img
                  src="/src/images/logo.jpg"
                  alt="لوغو الأكاديمية"
                  className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover transition-all duration-500 ${
                    logoLoaded 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-95'
                  }`}
                  onLoad={() => setLogoLoaded(true)}
                  onError={(e) => {
                    setLogoLoaded(true);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-l from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-sm">
                  مدرسة القرآن الكريم
                </h1>
                <p className="text-xs lg:text-sm text-emerald-100/80 font-medium hidden lg:block">
                  أكاديمية مدرسة الهجرة للقرآن الكريم وعلومه
                </p>
              </div>
            </div>

            {/* CENTER: Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {primaryNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-2 lg:px-3 py-2 rounded-xl text-xs lg:text-sm font-medium transition-all duration-300 flex items-center gap-1.5 lg:gap-2 backdrop-blur-sm ${
                      isActive
                        ? 'bg-white/25 text-white shadow-lg border border-white/30 scale-105'
                        : 'text-emerald-100 hover:bg-white/15 hover:text-white hover:scale-105 border border-transparent hover:border-white/20'
                    }`
                  }
                >
                  {renderIcon(item.icon, item.stroke)}
                  <span className="whitespace-nowrap">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* LEFT: Profile + Notifications Mobile + Mobile Button */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* زر الإشعارات للجوال */}
              {currentUser && (
                <div className="md:hidden">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-1 hover:bg-white/20 transition-all duration-300">
                    <NotificationHeader
                      userId={currentUser._id}
                      socket={socket}
                      apiUrl={API_ORIGIN}
                    />
                  </div>
                </div>
              )}

              {/* Profile */}
              <div className="hidden md:flex items-center relative" ref={profileMenuRef}>
                <div
                  role="button"
                  tabIndex={0}
                  className="flex items-center gap-2 lg:gap-3 cursor-pointer p-2 lg:p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:shadow-lg hover:scale-105"
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  onKeyDown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') &&
                    setProfileMenuOpen((v) => !v)
                  }

                  aria-haspopup="menu"
                  aria-expanded={profileMenuOpen}
                  aria-controls="profile-menu"
                >
                  {renderUserAvatar()}
                  {currentUser && (
                    <span className="hidden lg:block text-sm lg:text-base font-semibold text-white max-w-28 lg:max-w-32 truncate drop-shadow-sm">
                      {currentUser.firstName && currentUser.lastName
                        ? `${currentUser.firstName} ${currentUser.lastName}`
                        : currentUser.firstName || currentUser.name || ''}
                    </span>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3 w-3 lg:h-4 lg:w-4 text-white transition-transform duration-300 ${
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

                {profileMenuOpen && (
                  <div
                    id="profile-menu"
                    className="absolute right-0 top-full mt-2 w-72 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/80 py-2 z-[100]"
                  >
                    <div className="px-6 py-4 border-b border-gray-100/80 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-2xl">
                      <div className="flex items-center gap-3">
                        {renderUserAvatar()}
                        <div>
                          <span className="block text-emerald-800 font-bold text-lg">
                            {currentUser?.firstName && currentUser?.lastName
                              ? `${currentUser.firstName} ${currentUser.lastName}`
                              : currentUser?.firstName || currentUser?.name}
                          </span>
                          <span className="block text-emerald-600 text-sm mt-1 font-medium">
                            {currentUser?.role === 'teacher'
                              ? 'معلم'
                              : currentUser?.role === 'admin'
                              ? 'مدير'
                              : 'طالب'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate('/profile');
                        }}

                        className="w-full text-right py-3 px-6 text-gray-700 hover:bg-emerald-50/80 hover:text-emerald-700 transition-all duration-200 flex items-center gap-3 group"
                      >
                        <div className="p-1.5 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                          <svg
                            className="w-4 h-4 text-emerald-600"
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
                        <span className="font-medium">الملف الشخصي</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate('/change-password');
                        }}
                        className="w-full text-right py-3 px-6 text-gray-700 hover:bg-blue-50/80 hover:text-blue-700 transition-all duration-200 flex items-center gap-3 group"
                      >
                        <div className="p-1.5 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                          <svg
                            className="w-4 h-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z"
                            />
                          </svg>
                        </div>
                        <span className="font-medium">تغيير كلمة المرور</span>
                      </button>

                      <div className="border-t border-gray-100 my-2" />

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-right py-3 px-6 text-red-600 hover:bg-red-50/80 hover:text-red-700 transition-all duration-200 flex items-center gap-3 group"
                      >
                        <div className="p-1.5 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
                          <svg
                            className="w-4 h-4 text-red-600"
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
                        <span className="font-medium">تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-md border border-white/20 hover:scale-105"
                  aria-label="فتح القائمة"
                  aria-expanded={isMenuOpen}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Navigation Bar - Desktop */}
          <div className="hidden md:block border-top border-emerald-400/30 pt-2 pb-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20">
              <nav className="flex items-center justify-center gap-1 flex-wrap">
                {secondaryNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-300 flex items-center gap-1 lg:gap-1.5 ${
                        isActive
                          ? 'bg-white/20 text-white shadow-md border border-white/30'
                          : 'text-emerald-100 hover:bg-white/15 hover:text-white hover:scale-105 border border-transparent hover:border-white/20'
                      }`
                    }
                  >
                    {renderIcon(item.icon, item.stroke)}
                    <span className="whitespace-nowrap hidden lg:inline">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleMenu} />
          <div
            className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 shadow-2xl overflow-y-auto"
            dir="rtl"
          >
            <div className="p-6">
              {/* mobile header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center relative overflow-hidden">
                    {!officialPhotoLoaded && (
                      <ImageSkeleton 
                        className="w-7 h-7 rounded-full absolute inset-0 m-auto" 
                        variant="avatar"
                      />
                    )}
                    <img
                      src="/src/images/officialPhoto.jpg"
                      alt="Logo"
                      className={`w-7 h-7 rounded-full object-cover transition-all duration-500 ${
                        officialPhotoLoaded 
                          ? 'opacity-100 scale-100' 
                          : 'opacity-0 scale-95'
                      }`}
                      onLoad={() => setOfficialPhotoLoaded(true)}
                      onError={(e) => {
                        setOfficialPhotoLoaded(true);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">القائمة الرئيسية</h2>
                    <p className="text-emerald-200 text-sm">مدرسة القرآن الكريم</p>
                  </div>
                </div>
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md border border-white/20"
                  aria-label="إغلاق القائمة"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* mobile profile */}
              {currentUser && (
                <div className="flex items-center gap-4 mb-6 p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                  {renderUserAvatar()}
                  <div className="flex-1">
                    <div className="text-white font-semibold text-lg">
                      {currentUser.firstName && currentUser.lastName
                        ? `${currentUser.firstName} ${currentUser.lastName}`
                        : currentUser.firstName || currentUser.name || ''}
                    </div>
                    <div className="text-emerald-200 text-sm">
                      {currentUser.role === 'teacher'
                        ? 'معلم'
                        : currentUser.role === 'admin'
                        ? 'مدير'
                        : 'طالب'}
                    </div>
                  </div>
                </div>
              )}

              {/* nav */}
              <div className="space-y-1">
                {[...primaryNavItems, ...secondaryNavItems].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                        isActive
                          ? 'bg-white/20 text-white shadow-lg border border-white/30'
                          : 'text-emerald-100 hover:bg-white/15 hover:text-white hover:translate-x-1'
                      }`
                    }
                  >
                    <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                      {renderIcon(item.icon, item.stroke)}
                    </div>
                    <span className="font-medium flex-1">{item.label}</span>
                    <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </NavLink>
                ))}
              </div>

              {/* actions */}
              {currentUser ? (
                <div className="space-y-2 border-top border-emerald-500/30 pt-4 mt-6">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-white/15 hover:text-white transition-all duration-300 group hover:translate-x-1"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="font-medium flex-1">الملف الشخصي</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/change-password');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-white/15 hover:text-white transition-all duration-300 group hover:translate-x-1"
                  >
                    <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                      </svg>
                    </div>
                    <span className="font-medium flex-1">تغيير كلمة المرور</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-all duration-300 group hover:translate-x-1"
                  >
                    <div className="p-2 rounded-lg bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <span className="font-medium flex-1">تسجيل الخروج</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-emerald-500/30 pt-4 mt-6">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/login');
                    }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
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
