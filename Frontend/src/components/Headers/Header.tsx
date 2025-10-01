


// import { NavLink, useNavigate, Link } from 'react-router-dom';
// import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
// import NotificationHeader from './NotificationHeader';
// import Avatar from './Avatar';
// import { useAvatar, getUserGender } from '../hooks/useAvatar';
// import { useAuth } from '../hooks/useAuth';
// import { io, Socket } from 'socket.io-client';
// import axios from 'axios';
// import { showLogoutConfirmation } from '../utils/logoutUtils';
// import { API_BASE_URL, API_URL } from '../config';

// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: false,
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers = config.headers ?? {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// const Header = () => {
//   const { user: currentUser, logout: authLogout, isAuthenticated, token } = useAuth();
  
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [profileMenuOpen, setProfileMenuOpen] = useState(false);
//   const [logoLoaded, setLogoLoaded] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [searchOpen, setSearchOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');

//   const profileMenuRef = useRef<HTMLDivElement>(null);
//   const searchRef = useRef<HTMLDivElement>(null);
//   const navigate = useNavigate();

//   const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
//   const userGender = getUserGender(currentUser);

//   const { avatarUrl, avatarLoading } = useAvatar({
//     userId: currentUser?._id,
//     userRole: currentUser?.role,
//   });

//   // Handle scroll
//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 10);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const handleLogout = useCallback(async () => {
//     const confirmed = await showLogoutConfirmation({
//       userType: 'user',
//       onConfirm: () => {
//         socket?.disconnect();
//         setSocket(null);
//         setIsMenuOpen(false);
//         setProfileMenuOpen(false);
//         authLogout();
//       }
//     });
    
//     if (!confirmed) {
//       console.log('تم إلغاء تسجيل الخروج');
//     }
//   }, [socket, authLogout]);

//   useEffect(() => {
//     if (!isAuthenticated && !currentUser) {
//       navigate('/login', { replace: true });
//     }
//   }, [isAuthenticated, currentUser, navigate]);

//   // Socket initialization
//   useEffect(() => {
//     const s = io(API_BASE_URL, {
//       transports: ['polling'],
//       upgrade: false,
//       auth: token ? { token } : undefined,
//       reconnection: true,
//       reconnectionAttempts: Infinity,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//       path: '/socket.io',
//     });

//     const onConnect = () => setSocket(s);
//     const onDisconnect = () => setSocket(null);
//     const onError = (e: Error) => {
//       if (import.meta.env.MODE !== 'production') console.error('socket error', e);
//       setSocket(s);
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
//   }, [token]);

//   // Click outside handlers
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
//         setProfileMenuOpen(false);
//       }
//       if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
//         setSearchOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // ESC key handler
//   useEffect(() => {
//     const handleEscKey = (event: KeyboardEvent) => {
//       if (event.key === 'Escape') {
//         setProfileMenuOpen(false);
//         setIsMenuOpen(false);
//         setSearchOpen(false);
//       }
//     };

//     document.addEventListener('keydown', handleEscKey);
//     return () => document.removeEventListener('keydown', handleEscKey);
//   }, []);

//   const primaryNavItems = useMemo(() => [
//     { to: '/', label: 'الرئيسية', icon: '🏠', gradient: 'from-blue-500 to-cyan-500' },
//     { to: '/news', label: 'الأخبار', icon: '📰', gradient: 'from-purple-500 to-pink-500' },
//     { to: '/goals', label: 'الأهداف', icon: '🎯', gradient: 'from-green-500 to-emerald-500' },
//     { to: '/daily-marks', label: 'العلامات', icon: '✓', gradient: 'from-orange-500 to-red-500' },
//     { to: '/test', label: 'الاختبارات', icon: '📝', gradient: 'from-indigo-500 to-purple-500' },
//   ], []);

//   const secondaryNavItems = useMemo(() => {
//     const base = [
//       { to: '/quran', label: 'القرآن', icon: '📖', gradient: 'from-teal-500 to-cyan-500' },
//       { to: '/quran-audio', label: 'القرآن الصوتي', icon: '🎧', gradient: 'from-blue-500 to-indigo-500' },
//       { to: '/arrangement', label: 'الترتيب', icon: '🏆', gradient: 'from-yellow-500 to-orange-500' },
//       { to: '/activities', label: 'الأنشطة', icon: '🎨', gradient: 'from-pink-500 to-rose-500' },
//       { to: '/absence', label: 'الحضور', icon: '📋', gradient: 'from-red-500 to-pink-500' },
//       { to: '/reports', label: 'التقارير', icon: '📊', gradient: 'from-purple-500 to-indigo-500' },
//       { to: '/chat', label: 'المحادثات', icon: '💬', gradient: 'from-green-500 to-teal-500' },
//     ];

//     if (!isTeacherOrAdmin) return base;
//     return [
//       ...base,
//       { to: '/managment', label: 'الإدارة', icon: '⚙️', gradient: 'from-gray-500 to-slate-500' },
//     ];
//   }, [isTeacherOrAdmin]);

//   const ImageSkeleton = ({ className, variant = 'default' }: { className: string; variant?: 'default' | 'avatar' | 'logo' }) => (
//     <div className={`${className} relative overflow-hidden flex items-center justify-center ${
//       variant === 'logo' ? 'bg-gradient-to-br from-emerald-200 to-teal-300' :
//       variant === 'avatar' ? 'bg-gradient-to-br from-blue-200 to-indigo-300' :
//       'bg-gradient-to-br from-gray-200 to-gray-300'
//     }`}>
//       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
//       <div className="absolute inset-0 flex items-center justify-center">
//         <div className="flex gap-1">
//           <div className="w-1 h-1 bg-gray-500/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
//           <div className="w-1 h-1 bg-gray-500/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
//           <div className="w-1 h-1 bg-gray-500/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderUserAvatar = () => (
//     <Avatar
//       src={avatarUrl}
//       userName={currentUser?.firstName || currentUser?.name}
//       gender={userGender}
//       loading={avatarLoading}
//       size="md"
//       clickable={true}
//       showStatus={true}
//     />
//   );

//   return (
//     <>
//       <header
//         className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
//           scrolled
//             ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-gray-200'
//             : 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600'
//         }`}
//         dir="rtl"
//       >
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-20">
            
//             {/* Logo Section */}
//             <Link 
//               to="/" 
//               className="flex items-center gap-4 hover:opacity-90 transition-opacity duration-200 group"
//             >
//               <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 transform hover:scale-110 hover:rotate-6 ${
//                 scrolled ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-white'
//               }`}>
//                 {!logoLoaded && <ImageSkeleton className="w-10 h-10 rounded-full absolute" variant="logo" />}
//                 <img
//                   src="/src/images/logo.jpg"
//                   alt="Logo"
//                   className={`w-10 h-10 rounded-full object-cover transition-all duration-500 ${
//                     logoLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
//                   }`}
//                   onLoad={() => setLogoLoaded(true)}
//                   onError={() => setLogoLoaded(true)}
//                 />
//                 <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
//               </div>
//               <div className="hidden md:block">
//                 <h1 className={`text-xl md:text-2xl font-bold transition-colors duration-500 ${
//                   scrolled ? 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent' : 'text-white'
//                 }`}>
//                   مدرسة القرآن الكريم
//                 </h1>
//                 <p className={`text-sm transition-colors duration-500 ${
//                   scrolled ? 'text-gray-600' : 'text-white/90'
//                 }`}>
//                   أكاديمية مدرسة الهجرة للقرآن الكريم
//                 </p>
//               </div>
//             </Link>

//             {/* Desktop Navigation */}
//             <nav className="hidden lg:flex items-center gap-2">
//               {primaryNavItems.map((item, index) => (
//                 <NavLink
//                   key={item.to}
//                   to={item.to}
//                   className={({ isActive }) =>
//                     `group relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
//                       isActive
//                         ? scrolled
//                           ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
//                           : 'bg-white text-emerald-600 shadow-lg'
//                         : scrolled
//                         ? 'text-gray-700 hover:bg-gray-100'
//                         : 'text-white hover:bg-white/20'
//                     }`
//                   }
//                   style={{ animationDelay: `${index * 50}ms` }}
//                 >
//                   <span className="flex items-center gap-2">
//                     <span className="text-lg transition-transform duration-300 group-hover:scale-125">{item.icon}</span>
//                     <span>{item.label}</span>
//                   </span>
//                 </NavLink>
//               ))}
//             </nav>

//             {/* Right Section */}
//             <div className="flex items-center gap-3">
              
//               {/* Search */}
//               <div className="hidden lg:block relative" ref={searchRef}>
//                 {searchOpen ? (
//                   <div className="flex items-center gap-2 animate-slide-in-right">
//                     <input
//                       type="text"
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       placeholder="ابحث هنا..."
//                       className={`w-64 px-4 py-2 rounded-xl border-2 focus:outline-none transition-all duration-300 ${
//                         scrolled
//                           ? 'border-emerald-300 focus:border-emerald-500 bg-white'
//                           : 'border-white/30 focus:border-white bg-white/20 text-white placeholder-white/70'
//                       }`}
//                       autoFocus
//                     />
//                     <button
//                       onClick={() => setSearchOpen(false)}
//                       className={`p-2 rounded-xl transition-all duration-300 ${
//                         scrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'
//                       }`}
//                     >
//                       <svg className={`w-5 h-5 ${scrolled ? 'text-gray-600' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                       </svg>
//                     </button>
//                   </div>
//                 ) : (
//                   <button
//                     onClick={() => setSearchOpen(true)}
//                     className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 ${
//                       scrolled ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/20 text-white hover:bg-white/30'
//                     }`}
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                     </svg>
//                   </button>
//                 )}
//               </div>

//               {/* Notifications */}
//               {currentUser && (
//                 <div className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 ${
//                   scrolled ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/20 hover:bg-white/30'
//                 }`}>
//                   <NotificationHeader
//                     userId={currentUser._id}
//                     socket={socket}
//                     apiUrl={API_BASE_URL}
//                   />
//                 </div>
//               )}

//               {/* Profile Menu */}
//               <div className="relative" ref={profileMenuRef}>
//                 <button
//                   onClick={() => setProfileMenuOpen(!profileMenuOpen)}
//                   className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${
//                     scrolled 
//                       ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' 
//                       : 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30'
//                   }`}
//                 >
//                   <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//                     scrolled ? 'bg-white text-emerald-600' : 'bg-white/20 text-white'
//                   }`}>
//                     {currentUser?.firstName?.[0] || 'م'}
//                   </div>
//                   <span className="text-sm font-semibold hidden md:block">
//                     {currentUser?.firstName && currentUser?.lastName
//                       ? `${currentUser.firstName} ${currentUser.lastName}`
//                       : currentUser?.firstName || 'المستخدم'}
//                   </span>
//                   <svg
//                     className={`w-4 h-4 transition-transform duration-300 ${profileMenuOpen ? 'rotate-180' : ''}`}
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </button>

//                 {profileMenuOpen && (
//                   <div className="absolute left-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-scale-in z-50">
//                     <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5">
//                       <div className="flex items-center gap-3">
//                         <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-emerald-600 font-bold text-lg shadow-lg">
//                           {currentUser?.firstName?.[0] || 'م'}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-white font-bold text-sm truncate">
//                             {currentUser?.firstName && currentUser?.lastName
//                               ? `${currentUser.firstName} ${currentUser.lastName}`
//                               : currentUser?.firstName || 'المستخدم'}
//                           </p>
//                           {currentUser?.email && (
//                             <p className="text-white/80 text-xs truncate">{currentUser.email}</p>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="py-2">
//                       <button
//                         onClick={() => {
//                           setProfileMenuOpen(false);
//                           navigate('/profile');
//                         }}
//                         className="w-full px-6 py-3 text-right flex items-center gap-3 text-gray-700 hover:bg-emerald-50 transition-all duration-200 group"
//                       >
//                         <div className="w-10 h-10 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors">
//                           <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                           </svg>
//                         </div>
//                         <span className="font-medium">الملف الشخصي</span>
//                       </button>

//                       <button
//                         onClick={() => {
//                           setProfileMenuOpen(false);
//                           navigate('/change-password');
//                         }}
//                         className="w-full px-6 py-3 text-right flex items-center gap-3 text-gray-700 hover:bg-blue-50 transition-all duration-200 group"
//                       >
//                         <div className="w-10 h-10 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
//                           <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
//                           </svg>
//                         </div>
//                         <span className="font-medium">تغيير كلمة المرور</span>
//                       </button>

//                       <div className="h-px bg-gray-200 my-2 mx-4"></div>

//                       <button
//                         onClick={handleLogout}
//                         className="w-full px-6 py-3 text-right flex items-center gap-3 text-red-600 hover:bg-red-50 transition-all duration-200 group"
//                       >
//                         <div className="w-10 h-10 rounded-xl bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors">
//                           <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                           </svg>
//                         </div>
//                         <span className="font-medium">تسجيل الخروج</span>
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Mobile Menu Button */}
//               <button
//                 onClick={() => setIsMenuOpen(!isMenuOpen)}
//                 className={`lg:hidden p-2.5 rounded-xl transition-all duration-300 ${
//                   scrolled ? 'bg-gray-100 text-gray-700' : 'bg-white/20 text-white'
//                 }`}
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   {isMenuOpen ? (
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   ) : (
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                   )}
//                 </svg>
//               </button>
//             </div>
//           </div>

//           {/* Secondary Navigation - Desktop */}
//           <div className="hidden lg:flex items-center justify-between border-t border-white/20 pt-3 pb-3">
//             <div className="flex-1">
//               <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-2.5 border border-white/20">
//                 <nav className="flex items-center justify-center gap-2 overflow-x-auto">
//                   {secondaryNavItems.map((item) => (
//                     <NavLink
//                       key={item.to}
//                       to={item.to}
//                       className={({ isActive }) =>
//                         `px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
//                           isActive
//                             ? 'bg-white/25 text-white shadow-lg border border-white/40 scale-105'
//                             : 'text-emerald-100 hover:bg-white/20 hover:text-white hover:scale-105'
//                         }`
//                       }
//                     >
//                       <span className="text-lg">{item.icon}</span>
//                       <span>{item.label}</span>
//                     </NavLink>
//                   ))}
//                 </nav>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Spacer */}
//       <div className="h-32"></div>

//       {/* Mobile Menu */}
//       {isMenuOpen && (
//         <div className="lg:hidden fixed inset-0 z-40">
//           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
//           <div className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 shadow-2xl overflow-y-auto animate-slide-in-right">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-500/30">
//                 <h2 className="text-lg font-bold text-white">القائمة الرئيسية</h2>
//                 <button
//                   onClick={() => setIsMenuOpen(false)}
//                   className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
//                 >
//                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>

//               {currentUser && (
//                 <div className="flex items-center gap-4 mb-6 p-4 bg-white/10 rounded-2xl">
//                   {renderUserAvatar()}
//                   <div className="flex-1">
//                     <div className="text-white font-semibold text-lg">
//                       {currentUser.firstName && currentUser.lastName
//                         ? `${currentUser.firstName} ${currentUser.lastName}`
//                         : currentUser.firstName || currentUser.name || ''}
//                     </div>
//                     <div className="text-emerald-200 text-sm">
//                       {currentUser.role === 'teacher' ? 'معلم' :
//                        currentUser.role === 'admin' ? 'مدير' : 'طالب'}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="space-y-1">
//                 {[...primaryNavItems, ...secondaryNavItems].map((item) => (
//                   <NavLink
//                     key={item.to}
//                     to={item.to}
//                     onClick={() => setIsMenuOpen(false)}
//                     className={({ isActive }) =>
//                       `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
//                         isActive
//                           ? 'bg-white/20 text-white shadow-lg'
//                           : 'text-emerald-100 hover:bg-white/15 hover:text-white'
//                       }`
//                     }
//                   >
//                     <span className="text-xl">{item.icon}</span>
//                     <span className="font-medium flex-1">{item.label}</span>
//                   </NavLink>
//                 ))}
//               </div>

//               <div className="space-y-2 border-t border-emerald-500/30 pt-4 mt-6">
//                 <button
//                   onClick={() => {
//                     setIsMenuOpen(false);
//                     navigate('/profile');
//                   }}
//                   className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-white/15 hover:text-white transition-all"
//                 >
//                   <span className="text-lg">👤</span>
//                   <span className="font-medium flex-1">الملف الشخصي</span>
//                 </button>

//                 <button
//                   onClick={() => {
//                     setIsMenuOpen(false);
//                     handleLogout();
//                   }}
//                   className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-all"
//                 >
//                   <span className="text-lg">🚪</span>
//                   <span className="font-medium flex-1">تسجيل الخروج</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <style>{`
//         @keyframes shimmer {
//           0% { transform: translateX(-100%); }
//           100% { transform: translateX(100%); }
//         }

//         @keyframes slide-in-right {
//           from {
//             transform: translateX(-20px);
//             opacity: 0;
//           }
//           to {
//             transform: translateX(0);
//             opacity: 1;
//           }
//         }

//         @keyframes scale-in {
//           from {
//             transform: scale(0.95) translateY(-10px);
//             opacity: 0;
//           }
//           to {
//             transform: scale(1) translateY(0);
//             opacity: 1;
//           }
//         }

//         .animate-shimmer {
//           animation: shimmer 2s ease-in-out infinite;
//         }

//         .animate-slide-in-right {
//           animation: slide-in-right 0.3s ease-out;
//         }

//         .animate-scale-in {
//           animation: scale-in 0.3s ease-out;
//         }

//         .animate-ping {
//           animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
//         }

//         @keyframes ping {
//           75%, 100% {
//             transform: scale(2);
//             opacity: 0;
//           }
//         }

//         .overflow-x-auto::-webkit-scrollbar {
//           height: 4px;
//         }

//         .overflow-x-auto::-webkit-scrollbar-track {
//           background: rgba(255, 255, 255, 0.1);
//         }

//         .overflow-x-auto::-webkit-scrollbar-thumb {
//           background: rgba(255, 255, 255, 0.3);
//           border-radius: 2px;
//         }

//         .overflow-x-auto::-webkit-scrollbar-thumb:hover {
//           background: rgba(255, 255, 255, 0.5);
//         }
//       `}</style>
//     </>
//   );
// };

// export default Header;

import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import NotificationHeader from '../NotificationHeader';
import Avatar from '../Avatar';
import { useAvatar, getUserGender } from '../../hooks/useAvatar';
import { useAuth } from '../../hooks/useAuth';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { showLogoutConfirmation } from '../../utils/logoutUtils';
import { API_BASE_URL, API_URL } from '../../config';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const Header = () => {
  const { user: currentUser, logout: authLogout, isAuthenticated, token } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  const userGender = getUserGender(currentUser);

  const { avatarUrl, avatarLoading } = useAvatar({
    userId: currentUser?._id,
    userRole: currentUser?.role,
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = useCallback(async () => {
    const confirmed = await showLogoutConfirmation({
      userType: 'user',
      onConfirm: () => {
        socket?.disconnect();
        setSocket(null);
        setIsMenuOpen(false);
        setProfileMenuOpen(false);
        authLogout();
      }
    });
    
    if (!confirmed) {
      console.log('تم إلغاء تسجيل الخروج');
    }
  }, [socket, authLogout]);

  useEffect(() => {
    if (!isAuthenticated && !currentUser) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  useEffect(() => {
    const s = io(API_BASE_URL, {
      transports: ['polling'],
      upgrade: false,
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      path: '/socket.io',
    });

    const onConnect = () => setSocket(s);
    const onDisconnect = () => setSocket(null);
    const onError = (e: Error) => {
      if (import.meta.env.MODE !== 'production') console.error('socket error', e);
      setSocket(s);
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
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false);
        setIsMenuOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  const primaryNavItems = useMemo(() => [
    { to: '/', label: 'الرئيسية', icon: '🏠', gradient: 'from-blue-500 to-cyan-500' },
    { to: '/news', label: 'الأخبار', icon: '📰', gradient: 'from-purple-500 to-pink-500' },
    { to: '/goals', label: 'الأهداف', icon: '🎯', gradient: 'from-green-500 to-emerald-500' },
    { to: '/daily-marks', label: 'العلامات', icon: '✓', gradient: 'from-orange-500 to-red-500' },
    { to: '/test', label: 'الاختبارات', icon: '📝', gradient: 'from-indigo-500 to-purple-500' },
  ], []);

  const secondaryNavItems = useMemo(() => {
    const base = [
      { to: '/quran', label: 'القرآن', icon: '📖', gradient: 'from-teal-500 to-cyan-500' },
      { to: '/quran-audio', label: 'القرآن الصوتي', icon: '🎧', gradient: 'from-blue-500 to-indigo-500' },
      { to: '/arrangement', label: 'الترتيب', icon: '🏆', gradient: 'from-yellow-500 to-orange-500' },
      { to: '/activities', label: 'الأنشطة', icon: '🎨', gradient: 'from-pink-500 to-rose-500' },
      { to: '/absence', label: 'الحضور', icon: '📋', gradient: 'from-red-500 to-pink-500' },
      { to: '/reports', label: 'التقارير', icon: '📊', gradient: 'from-purple-500 to-indigo-500' },
      { to: '/chat', label: 'المحادثات', icon: '💬', gradient: 'from-green-500 to-teal-500' },
    ];

    if (!isTeacherOrAdmin) return base;
    return [...base, { to: '/managment', label: 'الإدارة', icon: '⚙️', gradient: 'from-gray-500 to-slate-500' }];
  }, [isTeacherOrAdmin]);

  const ImageSkeleton = ({ className, variant = 'default' }: { className: string; variant?: 'default' | 'avatar' | 'logo' }) => (
    <div className={`${className} relative overflow-hidden flex items-center justify-center ${
      variant === 'logo' ? 'bg-gradient-to-br from-emerald-200 to-teal-300' :
      variant === 'avatar' ? 'bg-gradient-to-br from-blue-200 to-indigo-300' :
      'bg-gradient-to-br from-gray-200 to-gray-300'
    }`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-gray-500/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1 h-1 bg-gray-500/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1 h-1 bg-gray-500/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );

  const renderUserAvatar = () => (
    <Avatar
      src={avatarUrl}
      userName={currentUser?.firstName || currentUser?.name}
      gender={userGender}
      loading={avatarLoading}
      size="md"
      clickable={true}
      showStatus={true}
    />
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white shadow-2xl border-b border-gray-200'
            : 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600'
        }`}
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity duration-200 group">
              <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 transform hover:scale-110 hover:rotate-6 ${
                scrolled ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-white'
              }`}>
                {!logoLoaded && <ImageSkeleton className="w-10 h-10 rounded-full absolute" variant="logo" />}
                <img
                  src="/src/images/logo.jpg"
                  alt="Logo"
                  className={`w-10 h-10 rounded-full object-cover transition-all duration-500 ${
                    logoLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                  onLoad={() => setLogoLoaded(true)}
                  onError={() => setLogoLoaded(true)}
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <div className="hidden md:block">
                <h1 className={`text-xl md:text-2xl font-bold transition-colors duration-500 ${
                  scrolled ? 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent' : 'text-white'
                }`}>
                  مدرسة القرآن الكريم
                </h1>
                <p className={`text-sm transition-colors duration-500 ${
                  scrolled ? 'text-gray-600' : 'text-white/90'
                }`}>
                  أكاديمية مدرسة الهجرة للقرآن الكريم
                </p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-2">
              {primaryNavItems.map((item, index) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? scrolled
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                          : 'bg-white text-emerald-600 shadow-lg'
                        : scrolled
                        ? 'text-gray-800 hover:bg-gray-100 font-semibold'
                        : 'text-white hover:bg-white/20'
                    }`
                  }
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-2">
                        <span className="text-lg transition-transform duration-300 group-hover:scale-125">{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      {isActive && (
                        <span className={`absolute bottom-0 left-0 right-0 h-1 rounded-t-lg bg-gradient-to-r ${item.gradient} animate-slide-in`}></span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              
              <div className="hidden lg:block relative" ref={searchRef}>
                {searchOpen ? (
                  <div className="flex items-center gap-2 animate-slide-in-right">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث هنا..."
                      className={`w-64 px-4 py-2 rounded-xl border-2 focus:outline-none transition-all duration-300 ${
                        scrolled
                          ? 'border-emerald-300 focus:border-emerald-500 bg-white text-gray-800'
                          : 'border-white/30 focus:border-white bg-white/20 text-white placeholder-white/70'
                      }`}
                      autoFocus
                    />
                    <button
                      onClick={() => setSearchOpen(false)}
                      className={`p-2 rounded-xl transition-all duration-300 ${
                        scrolled ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/20 text-white'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                      scrolled ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                )}
              </div>

              {currentUser && (
                <div className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                  scrolled ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/20 hover:bg-white/30'
                }`}>
                  <NotificationHeader userId={currentUser._id} socket={socket} apiUrl={API_BASE_URL} />
                </div>
              )}

              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    scrolled 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' 
                      : 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    scrolled ? 'bg-white text-emerald-600' : 'bg-white/20 text-white'
                  }`}>
                    {currentUser?.firstName?.[0] || 'م'}
                  </div>
                  <span className="text-sm font-semibold hidden md:block">
                    {currentUser?.firstName && currentUser?.lastName
                      ? `${currentUser.firstName} ${currentUser.lastName}`
                      : currentUser?.firstName || 'المستخدم'}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${profileMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileMenuOpen && (
                  <div className="absolute left-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-scale-in z-50">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-emerald-600 font-bold text-lg shadow-lg">
                          {currentUser?.firstName?.[0] || 'م'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm truncate">
                            {currentUser?.firstName && currentUser?.lastName
                              ? `${currentUser.firstName} ${currentUser.lastName}`
                              : currentUser?.firstName || 'المستخدم'}
                          </p>
                          {currentUser?.email && (
                            <p className="text-white/80 text-xs truncate">{currentUser.email}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate('/profile');
                        }}
                        className="w-full px-6 py-3 text-right flex items-center gap-3 text-gray-700 hover:bg-emerald-50 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="font-medium">الملف الشخصي</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate('/change-password');
                        }}
                        className="w-full px-6 py-3 text-right flex items-center gap-3 text-gray-700 hover:bg-blue-50 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </div>
                        <span className="font-medium">تغيير كلمة المرور</span>
                      </button>

                      <div className="h-px bg-gray-200 my-2 mx-4"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full px-6 py-3 text-right flex items-center gap-3 text-red-600 hover:bg-red-50 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <span className="font-medium">تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`lg:hidden p-2.5 rounded-xl transition-all duration-300 ${
                  scrolled ? 'bg-gray-100 text-gray-700' : 'bg-white/20 text-white'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div className={`hidden lg:flex items-center justify-between border-t pt-3 pb-3 ${
            scrolled ? 'border-gray-200' : 'border-white/20'
          }`}>
            <div className="flex-1">
              <div className={`rounded-2xl px-6 py-2.5 border ${
                scrolled 
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white/10 backdrop-blur-md border-white/20'
              }`}>
                <nav className="flex items-center justify-center gap-2 overflow-x-auto">
                  {secondaryNavItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                          isActive
                            ? scrolled
                              ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105`
                              : 'bg-white/25 text-white shadow-lg border border-white/40 scale-105'
                            : scrolled
                            ? 'text-gray-800 hover:bg-gray-200 hover:scale-105 font-semibold'
                            : 'text-emerald-100 hover:bg-white/20 hover:text-white hover:scale-105'
                        }`
                      }
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="h-32"></div>

      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 shadow-2xl overflow-y-auto animate-slide-in-right">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-500/30">
                <h2 className="text-lg font-bold text-white">القائمة الرئيسية</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {currentUser && (
                <div className="flex items-center gap-4 mb-6 p-4 bg-white/10 rounded-2xl">
                  {renderUserAvatar()}
                  <div className="flex-1">
                    <div className="text-white font-semibold text-lg">
                      {currentUser.firstName && currentUser.lastName
                        ? `${currentUser.firstName} ${currentUser.lastName}`
                        : currentUser.firstName || currentUser.name || ''}
                    </div>
                    <div className="text-emerald-200 text-sm">
                      {currentUser.role === 'teacher' ? 'معلم' :
                       currentUser.role === 'admin' ? 'مدير' : 'طالب'}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {[...primaryNavItems, ...secondaryNavItems].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                        isActive
                          ? 'bg-white/20 text-white shadow-lg'
                          : 'text-emerald-100 hover:bg-white/15 hover:text-white'
                      }`
                    }
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium flex-1">{item.label}</span>
                  </NavLink>
                ))}
              </div>

              <div className="space-y-2 border-t border-emerald-500/30 pt-4 mt-6">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-white/15 hover:text-white transition-all"
                >
                  <span className="text-lg">👤</span>
                  <span className="font-medium flex-1">الملف الشخصي</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-all"
                >
                  <span className="text-lg">🚪</span>
                  <span className="font-medium flex-1">تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes slide-in-right {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.95) translateY(-10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes slide-in {
          from { transform: scaleX(0); opacity: 0; }
          to { transform: scaleX(1); opacity: 1; }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .overflow-x-auto::-webkit-scrollbar {
          height: 4px;
        }
        .overflow-x-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  );
};

export default Header;