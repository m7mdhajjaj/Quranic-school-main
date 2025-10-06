// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth';
// import { showLogoutConfirmation } from '../../utils/logoutUtils';

// const AdminHeader: React.FC = () => {
//   const { user: currentUser, logout: authLogout } = useAuth();
//   const [profileMenuOpen, setProfileMenuOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [showNotifications, setShowNotifications] = useState(false);

//   const profileMenuRef = useRef<HTMLDivElement>(null);
//   const notificationMenuRef = useRef<HTMLDivElement>(null);

//   const navigate = useNavigate();
//   const location = useLocation();

//   // Handle scroll effect
//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 10);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   // Handle logout
//   const handleLogout = useCallback(async () => {
//     const confirmed = await showLogoutConfirmation({
//       userType: 'admin',
//       userName: currentUser?.firstName || 'المدير',
//       customMessage: 'ستحتاج إلى إعادة تسجيل الدخول للوصول لوحة التحكم مرة أخرى',
//       onConfirm: () => {
//         setProfileMenuOpen(false);
//         setMobileMenuOpen(false);
//         authLogout();
//       },
//       onCancel: () => {
//         console.log('👤 المدير ألغى عملية تسجيل الخروج');
//       }
//     });

//     if (!confirmed) {
//       console.log('❌ تم إلغاء تسجيل الخروج من قبل المدير');
//     } else {
//       console.log('✅ تم تسجيل خروج المدير بنجاح');
//     }
//   }, [authLogout, currentUser]);

//   // Redirect if not authenticated
//   useEffect(() => {
//     if (!currentUser) {
//       navigate('/login', { replace: true });
//     }
//   }, [currentUser, navigate]);

//   // Handle click outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         profileMenuRef.current &&
//         !profileMenuRef.current.contains(event.target as Node)
//       ) {
//         setProfileMenuOpen(false);
//       }
//       if (
//         notificationMenuRef.current &&
//         !notificationMenuRef.current.contains(event.target as Node)
//       ) {
//         setShowNotifications(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Close profile menu when mobile menu opens
//   useEffect(() => {
//     if (mobileMenuOpen) {
//       setProfileMenuOpen(false);
//     }
//   }, [mobileMenuOpen]);

//   // Close mobile menu on route change
//   useEffect(() => {
//     setMobileMenuOpen(false);
//   }, [location.pathname]);

//   // Handle ESC key
//   useEffect(() => {
//     const handleEscKey = (event: KeyboardEvent) => {
//       if (event.key === 'Escape') {
//         setProfileMenuOpen(false);
//         setShowNotifications(false);
//         setMobileMenuOpen(false);
//       }
//     };

//     document.addEventListener('keydown', handleEscKey);
//     return () => document.removeEventListener('keydown', handleEscKey);
//   }, []);

//   const isActive = (path: string) => location.pathname === path;

//   const navItems = [
//     {
//       path: '/admin/dashboard',
//       label: 'الإحصائيات',
//       icon: '📊',
//       gradient: 'from-blue-500 to-cyan-500',
//     },
//     {
//       path: '/admin/teachers',
//       label: 'المعلمين',
//       icon: '👨‍🏫',
//       gradient: 'from-purple-500 to-pink-500',
//     },
//     {
//       path: '/admin/students',
//       label: 'الطلاب',
//       icon: '👨‍🎓',
//       gradient: 'from-green-500 to-emerald-500',
//     },
//     {
//       path: '/admin/groups',
//       label: 'الحلقات',
//       icon: '�',
//       gradient: 'from-orange-500 to-red-500',
//     },
//     {
//       path: '/admin/settings',
//       label: 'إعدادات التواصل',
//       icon: '⚙️',
//       gradient: 'from-gray-500 to-slate-500',
//     },
//   ];

//   const mockNotifications = [
//     {
//       id: 1,
//       message: 'طالب جديد تم تسجيله',
//       time: 'منذ 5 دقائق',
//       unread: true,
//       icon: '👨‍🎓',
//       color: 'bg-blue-500',
//     },
//     {
//       id: 2,
//       message: 'تحديث في النظام',
//       time: 'منذ ساعة',
//       unread: true,
//       icon: '🔔',
//       color: 'bg-purple-500',
//     },
//     {
//       id: 3,
//       message: 'طلب تغيير كلمة مرور',
//       time: 'منذ ساعتين',
//       unread: false,
//       icon: '🔐',
//       color: 'bg-orange-500',
//     },
//     {
//       id: 4,
//       message: 'تقرير جديد متاح',
//       time: 'منذ 3 ساعات',
//       unread: false,
//       icon: '📊',
//       color: 'bg-green-500',
//     },
//   ];

//   const unreadCount = mockNotifications.filter((n) => n.unread).length;

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
//         <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16 sm:h-18 md:h-20">
//             {/* Right Section - Logo and Text */}
//             <div className="flex items-center gap-2 sm:gap-3 md:gap-4 cursor-pointer hover:opacity-90 transition-opacity duration-300" onClick={() => navigate('/admin/dashboard')}>
//               <div
//                 className={`relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg sm:shadow-xl transition-all duration-500 transform hover:scale-110 hover:rotate-6 ${
//                   scrolled
//                     ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
//                     : 'bg-white'
//                 }`}
//               >
//                 <span className="text-xl sm:text-2xl md:text-3xl animate-bounce-slow">🎓</span>
//                 <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full animate-ping"></div>
//               </div>
//               <div className="hidden sm:block">
//                 <h1
//                   className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold transition-colors duration-500 ${
//                     scrolled
//                       ? 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent'
//                       : 'text-white'
//                   }`}
//                 >
//                   لوحة تحكم الإدارة
//                 </h1>
//                 <p
//                   className={`text-xs sm:text-sm transition-colors duration-500 hidden md:block ${
//                     scrolled ? 'text-gray-600' : 'text-white/90'
//                   }`}
//                 >
//                   نظام إدارة المدرسة القرآنية
//                 </p>
//               </div>
//             </div>

//             {/* Desktop Navigation */}
//             <nav className="hidden md:flex items-center gap-1 lg:gap-2">
//               {navItems.map((item, index) => (
//                 <button
//                   key={item.path}
//                   onClick={() => {
//                     navigate(item.path);
//                     setProfileMenuOpen(false);
//                   }}
//                   className={`group relative px-2 sm:px-3 lg:px-5 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
//                     isActive(item.path)
//                       ? scrolled
//                         ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
//                         : 'bg-white text-emerald-600 shadow-lg'
//                       : scrolled
//                         ? 'text-gray-700 hover:bg-gray-100'
//                         : 'text-white hover:bg-white/20'
//                   }`}
//                   data-animation-index={index}
//                 >
//                   <span className="flex items-center gap-1 lg:gap-2">
//                     <span className="text-sm lg:text-lg transition-transform duration-300 group-hover:scale-125">
//                       {item.icon}
//                     </span>
//                     <span className="hidden md:inline text-xs md:text-sm lg:text-base">{item.label}</span>
//                   </span>
//                   {isActive(item.path) && (
//                     <span
//                       className={`absolute bottom-0 left-0 right-0 h-0.5 lg:h-1 rounded-t-lg bg-gradient-to-r ${item.gradient} animate-slide-in`}
//                     ></span>
//                   )}
//                 </button>
//               ))}
//             </nav>

//             {/* Left Section - Profile and Actions */}
//             <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
//               {/* Notifications */}
//               <div className="relative" ref={notificationMenuRef}>
//                 <button
//                   onClick={() => setShowNotifications(!showNotifications)}
//                   className={`relative p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-110 ${
//                     scrolled
//                       ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                       : 'bg-white/20 text-white hover:bg-white/30'
//                   }`}
//                 >
//                   <svg
//                     className="w-4 h-4 sm:w-5 sm:h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
//                     />
//                   </svg>
//                   {unreadCount > 0 && (
//                     <span className="absolute -top-0.5 -left-0.5 sm:-top-1 sm:-left-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce-slow shadow-lg">
//                       {unreadCount}
//                     </span>
//                   )}
//                 </button>

//                 {showNotifications && (
//                   <div className="absolute left-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-scale-in z-50">
//                     <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
//                       <div className="flex items-center justify-between">
//                         <h3 className="text-lg font-bold text-white flex items-center gap-2">
//                           <span className="animate-pulse">🔔</span>
//                           الإشعارات
//                         </h3>
//                         {unreadCount > 0 && (
//                           <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
//                             {unreadCount} جديد
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                     <div className="max-h-96 overflow-y-auto">
//                       {mockNotifications.map((notification, index) => (
//                         <div
//                           key={notification.id}
//                           className={`px-6 py-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] notification-item ${
//                             notification.unread ? 'bg-blue-50/50' : ''
//                           }`}
//                           data-animation-delay={index * 50}
//                         >
//                           <div className="flex items-start gap-3">
//                             <div
//                               className={`w-10 h-10 ${notification.color} rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0 animate-bounce-slow`}
//                             >
//                               <span className="text-lg">
//                                 {notification.icon}
//                               </span>
//                             </div>
//                             <div className="flex-1 min-w-0">
//                               <p
//                                 className={`text-sm ${notification.unread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
//                               >
//                                 {notification.message}
//                               </p>
//                               <div className="flex items-center gap-2 mt-1">
//                                 <span className="text-xs text-gray-500">
//                                   {notification.time}
//                                 </span>
//                                 {notification.unread && (
//                                   <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
//                       <button className="w-full text-center text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors py-2 rounded-lg hover:bg-emerald-50">
//                         عرض جميع الإشعارات
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Spacer */}
//               <div className="w-4"></div>

//               {/* Profile Menu */}
//               <div className="relative" ref={profileMenuRef}>
//                 <button
//                   onClick={() => setProfileMenuOpen(!profileMenuOpen)}
//                   className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 ${
//                     scrolled
//                       ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
//                       : 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30'
//                   }`}
//                 >
//                   <div
//                     className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
//                       scrolled
//                         ? 'bg-white text-emerald-600'
//                         : 'bg-white/20 text-white'
//                     }`}
//                   >
//                     {currentUser?.firstName?.[0] || 'A'}
//                   </div>
//                   <span className="text-xs sm:text-sm font-semibold hidden lg:block">
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
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M19 9l-7 7-7-7"
//                     />
//                   </svg>
//                 </button>

//                 {profileMenuOpen && !mobileMenuOpen && (
//                   <div className="absolute left-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-scale-in z-50">
//                     <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5">
//                       <div className="flex items-center gap-3">
//                         <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-emerald-600 font-bold text-lg shadow-lg">
//                           {currentUser?.firstName?.[0] || 'A'}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-white font-bold text-sm truncate">
//                             {currentUser?.firstName && currentUser?.lastName
//                               ? `${currentUser.firstName} ${currentUser.lastName}`
//                               : currentUser?.firstName || 'المستخدم'}
//                           </p>
//                           {currentUser?.email && (
//                             <p className="text-white/80 text-xs truncate">
//                               {currentUser.email}
//                             </p>
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
//                           <svg
//                             className="w-5 h-5 text-emerald-600"
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
//                         className="w-full px-6 py-3 text-right flex items-center gap-3 text-gray-700 hover:bg-blue-50 transition-all duration-200 group"
//                       >
//                         <div className="w-10 h-10 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
//                           <svg
//                             className="w-5 h-5 text-blue-600"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
//                             />
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
//                           <svg
//                             className="w-5 h-5 text-red-600"
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

//               {/* Mobile Menu Button */}
//               <button
//                 onClick={() => {
//                   setMobileMenuOpen(!mobileMenuOpen);
//                   if (!mobileMenuOpen) {
//                     setProfileMenuOpen(false);
//                   }
//                 }}
//                 className={`md:hidden p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-300 ${
//                   scrolled
//                     ? 'bg-gray-100 text-gray-700'
//                     : 'bg-white/20 text-white'
//                 }`}
//                 title="فتح القائمة"
//                 aria-label="فتح القائمة"
//               >
//                 <svg
//                   className="w-5 h-5 sm:w-6 sm:h-6"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   {mobileMenuOpen ? (
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   ) : (
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M4 6h16M4 12h16M4 18h16"
//                     />
//                   )}
//                 </svg>
//               </button>
//             </div>
//           </div>

//           {/* Enhanced Mobile Navigation */}
//           {mobileMenuOpen && (
//             <div className="md:hidden pb-6 pt-4 border-t border-white/20 animate-slide-down">
//               <div className="space-y-4">
//                 {/* User Profile Section */}
//                 <div className={`px-4 py-3 rounded-xl ${
//                   scrolled ? 'bg-gray-50' : 'bg-white/10'
//                 } backdrop-blur-sm`}>
//                   <div className="flex items-center gap-3">
//                     <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
//                       scrolled ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' : 'bg-white text-emerald-600'
//                     }`}>
//                       {currentUser?.firstName?.charAt(0) || 'A'}
//                     </div>
//                     <div>
//                       <p className={`font-medium text-sm ${scrolled ? 'text-gray-900' : 'text-white'}`}>
//                         {currentUser?.firstName || 'المشرف'}
//                       </p>
//                       <p className={`text-xs ${scrolled ? 'text-gray-600' : 'text-white/70'}`}>
//                         مشرف النظام
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Navigation Items */}
//                 <nav className="space-y-2">
//                   <div className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
//                     scrolled ? 'text-gray-500' : 'text-white/70'
//                   }`}>
//                     الإدارة الرئيسية
//                   </div>
//                   {navItems.map((item, index) => (
//                     <button
//                       key={item.path}
//                       onClick={() => {
//                         navigate(item.path);
//                         setMobileMenuOpen(false);
//                         setProfileMenuOpen(false);
//                       }}
//                       className={`w-full px-4 py-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between group mobile-nav-item touch-manipulation ${
//                         isActive(item.path)
//                           ? scrolled
//                             ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg active-item`
//                             : 'bg-white text-emerald-600 shadow-lg active-item'
//                           : scrolled
//                             ? 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
//                             : 'text-white hover:bg-white/20 active:bg-white/30'
//                       }`}
//                       data-animation-delay={index * 50}
//                     >
//                       <div className="flex items-center gap-3">
//                         <span className="text-xl">{item.icon}</span>
//                         <span>{item.label}</span>
//                       </div>
//                       <svg 
//                         className={`w-4 h-4 transform transition-transform ${
//                           isActive(item.path) ? 'rotate-0' : 'group-hover:-translate-x-1'
//                         }`}
//                         fill="none" 
//                         stroke="currentColor" 
//                         viewBox="0 0 24 24"
//                       >
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                       </svg>
//                     </button>
//                   ))}
//                 </nav>

//                 {/* Quick Actions */}
//                 <div className="space-y-2">
//                   <div className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
//                     scrolled ? 'text-gray-500' : 'text-white/70'
//                   }`}>
//                     إجراءات سريعة
//                   </div>
                  
//                   <button
//                     onClick={() => {
//                       setShowNotifications(!showNotifications);
//                       setMobileMenuOpen(false);
//                       setProfileMenuOpen(false);
//                     }}
//                     className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between group ${
//                       scrolled 
//                         ? 'text-gray-700 hover:bg-gray-100' 
//                         : 'text-white hover:bg-white/20'
//                     }`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <span className="text-xl">🔔</span>
//                       <span>الإشعارات</span>
//                       {unreadCount > 0 && (
//                         <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
//                           {unreadCount}
//                         </span>
//                       )}
//                     </div>
//                     <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                     </svg>
//                   </button>

//                   <button
//                     onClick={() => {
//                       navigate('/profile');
//                       setMobileMenuOpen(false);
//                       setProfileMenuOpen(false);
//                     }}
//                     className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between group mobile-nav-item ${
//                       scrolled 
//                         ? 'text-gray-700 hover:bg-gray-100' 
//                         : 'text-white hover:bg-white/20'
//                     }`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <span className="text-xl">👤</span>
//                       <span>الملف الشخصي</span>
//                     </div>
//                     <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                     </svg>
//                   </button>

//                   <button
//                     onClick={() => {
//                       navigate('/change-password');
//                       setMobileMenuOpen(false);
//                       setProfileMenuOpen(false);
//                     }}
//                     className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between group mobile-nav-item ${
//                       scrolled 
//                         ? 'text-gray-700 hover:bg-gray-100' 
//                         : 'text-white hover:bg-white/20'
//                     }`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <span className="text-xl">🔐</span>
//                       <span>تغيير كلمة المرور</span>
//                     </div>
//                     <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                     </svg>
//                   </button>

//                   <button
//                     onClick={() => {
//                       navigate('/admin/reports');
//                       setMobileMenuOpen(false);
//                       setProfileMenuOpen(false);
//                     }}
//                     className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between group mobile-nav-item ${
//                       scrolled 
//                         ? 'text-gray-700 hover:bg-gray-100' 
//                         : 'text-white hover:bg-white/20'
//                     }`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <span className="text-xl">📈</span>
//                       <span>التقارير</span>
//                     </div>
//                     <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                     </svg>
//                   </button>
//                 </div>

//                 {/* Logout Button */}
//                 <div className="pt-4 border-t border-white/20">
//                   <button
//                     onClick={() => {
//                       setMobileMenuOpen(false);
//                       setProfileMenuOpen(false);
//                       handleLogout();
//                     }}
//                     className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between group mobile-nav-item ${
//                       scrolled 
//                         ? 'text-red-600 hover:bg-red-50' 
//                         : 'text-white hover:bg-red-500/20'
//                     }`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <span className="text-xl">🚪</span>
//                       <span>تسجيل الخروج</span>
//                     </div>
//                     <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </header>

//       {/* Mobile Menu Overlay */}
//       {mobileMenuOpen && (
//         <div 
//           className={`fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in ${
//             scrolled ? 'mobile-overlay-scrolled' : 'mobile-overlay-default'
//           }`}
//           onClick={() => {
//             setMobileMenuOpen(false);
//             setProfileMenuOpen(false);
//           }}
//         />
//       )}

//       {/* Spacer to prevent content from being hidden under fixed header */}
//       <div className="h-20"></div>

//       <style>{`
//         @keyframes bounce-slow {
//           0%, 100% { transform: translateY(0); }
//           50% { transform: translateY(-5px); }
//         }

//         @keyframes slide-in {
//           from {
//             transform: scaleX(0);
//             opacity: 0;
//           }
//           to {
//             transform: scaleX(1);
//             opacity: 1;
//           }
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

//         @keyframes slide-down {
//           from {
//             max-height: 0;
//             opacity: 0;
//           }
//           to {
//             max-height: 500px;
//             opacity: 1;
//           }
//         }

//         @keyframes fade-in {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }

//         .animate-bounce-slow {
//           animation: bounce-slow 3s ease-in-out infinite;
//         }

//         .animate-slide-in {
//           animation: slide-in 0.3s ease-out;
//         }

//         .animate-slide-in-right {
//           animation: slide-in-right 0.3s ease-out;
//         }

//         .animate-scale-in {
//           animation: scale-in 0.3s ease-out;
//         }

//         .animate-slide-down {
//           animation: slide-down 0.3s ease-out;
//         }

//         .animate-fade-in {
//           animation: fade-in 0.3s ease-out;
//         }

//         .mobile-overlay-scrolled {
//           top: 80px;
//         }

//         .mobile-overlay-default {
//           top: 64px;
//         }

//         .mobile-nav-item {
//           transform: translateX(0);
//         }

//         .mobile-nav-item:hover {
//           transform: translateX(-2px) scale(0.98);
//         }

//         .mobile-nav-item.active-item {
//           transform: scale(0.98);
//           box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
//         }

//         .mobile-nav-item:active {
//           transform: scale(0.95);
//         }

//         /* Animation delays for staggered effects */
//         .notification-item[data-animation-delay="0"] {
//           animation-delay: 0ms;
//         }
//         .notification-item[data-animation-delay="50"] {
//           animation-delay: 50ms;
//         }
//         .notification-item[data-animation-delay="100"] {
//           animation-delay: 100ms;
//         }
//         .notification-item[data-animation-delay="150"] {
//           animation-delay: 150ms;
//         }
//         .notification-item[data-animation-delay="200"] {
//           animation-delay: 200ms;
//         }

//         .mobile-nav-item[data-animation-delay="0"] {
//           animation-delay: 0ms;
//         }
//         .mobile-nav-item[data-animation-delay="50"] {
//           animation-delay: 50ms;
//         }
//         .mobile-nav-item[data-animation-delay="100"] {
//           animation-delay: 100ms;
//         }
//         .mobile-nav-item[data-animation-delay="150"] {
//           animation-delay: 150ms;
//         }
//         .mobile-nav-item[data-animation-delay="200"] {
//           animation-delay: 200ms;
//         }

//         /* Responsive navigation improvements */
//         @media (max-width: 1024px) {
//           nav button {
//             padding: 0.5rem 0.75rem;
//           }
//           nav button span:last-child {
//             font-size: 0.75rem;
//           }
//         }

//         @media (max-width: 868px) {
//           nav button span:last-child {
//             font-size: 0.7rem;
//           }
//         }

//         @media (max-width: 768px) {
//           .mobile-overlay-scrolled {
//             top: 80px;
//           }
//           .mobile-overlay-default {
//             top: 64px;
//           }
//         }

//         /* Touch improvements for mobile */
//         .touch-manipulation {
//           touch-action: manipulation;
//           -webkit-tap-highlight-color: transparent;
//         }

//         /* Better mobile menu animations */
//         @media (max-width: 768px) {
//           .mobile-nav-item {
//             min-height: 48px;
//           }
//         }

//         /* Custom scrollbar for notifications */
//         .overflow-y-auto::-webkit-scrollbar {
//           width: 6px;
//         }

//         .overflow-y-auto::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 10px;
//         }

//         .overflow-y-auto::-webkit-scrollbar-thumb {
//           background: linear-gradient(to bottom, #10b981, #14b8a6);
//           border-radius: 10px;
//         }

//         .overflow-y-auto::-webkit-scrollbar-thumb:hover {
//           background: linear-gradient(to bottom, #059669, #0d9488);
//         }
//       `}</style>
//     </>
//   );
// };

// export default AdminHeader;


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { showLogoutConfirmation } from '../../utils/logoutUtils';

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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout
  const handleLogout = useCallback(async () => {
    const confirmed = await showLogoutConfirmation({
      userType: 'admin',
      userName: currentUser?.firstName || 'المدير',
      customMessage: 'ستحتاج إلى إعادة تسجيل الدخول للوصول لوحة التحكم مرة أخرى',
      onConfirm: () => {
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
        authLogout();
      },
      onCancel: () => {
        console.log('المدير ألغى عملية تسجيل الخروج');
      }
    });

    if (!confirmed) {
      console.log('تم إلغاء تسجيل الخروج من قبل المدير');
    } else {
      console.log('تم تسجيل خروج المدير بنجاح');
    }
  }, [authLogout, currentUser]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  // Handle click outside
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

  // Close profile menu when mobile menu opens
  useEffect(() => {
    if (mobileMenuOpen) {
      setProfileMenuOpen(false);
    }
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle ESC key
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

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      path: '/admin/dashboard',
      label: 'الإحصائيات',
      icon: '📊',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      path: '/admin/teachers',
      label: 'المعلمين',
      icon: '👨‍🏫',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      path: '/admin/students',
      label: 'الطلاب',
      icon: '👨‍🎓',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      path: '/admin/groups',
      label: 'الحلقات',
      icon: '📚',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      path: '/admin/settings',
      label: 'الإعدادات',
      icon: '⚙️',
      gradient: 'from-gray-500 to-slate-500',
    },
  ];

  const mockNotifications = [
    {
      id: 1,
      message: 'طالب جديد تم تسجيله',
      time: 'منذ 5 دقائق',
      unread: true,
      icon: '👨‍🎓',
      color: 'bg-blue-500',
    },
    {
      id: 2,
      message: 'تحديث في النظام',
      time: 'منذ ساعة',
      unread: true,
      icon: '🔔',
      color: 'bg-purple-500',
    },
    {
      id: 3,
      message: 'طلب تغيير كلمة مرور',
      time: 'منذ ساعتين',
      unread: false,
      icon: '🔐',
      color: 'bg-orange-500',
    },
    {
      id: 4,
      message: 'تقرير جديد متاح',
      time: 'منذ 3 ساعات',
      unread: false,
      icon: '📊',
      color: 'bg-green-500',
    },
  ];

  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-gray-200'
            : 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600'
        }`}
        dir="rtl"
      >
        <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-23">
            
            {/* اللوغو والعنوان - اليمين */}
            <div className="flex items-center space-x-reverse space-x-2 mr-4">
              <div 
                className="flex items-center space-x-reverse space-x-2 cursor-pointer hover:opacity-90 transition-all duration-300 hover:scale-105" 
                onClick={() => navigate('/admin/dashboard')}
              >
                <div
                  className={`relative w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 transform hover:scale-110 hover:rotate-6 ${
                    scrolled
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                      : 'bg-white'
                  }`}
                >
                  <span className="text-2xl md:text-3xl animate-pulse">🎓</span>
                  <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full animate-ping shadow-lg"></div>
                </div>
                <div className="hidden sm:block">
                  <h1
                    className={`text-lg md:text-xl lg:text-2xl font-bold transition-colors duration-500 ${
                      scrolled
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent'
                        : 'text-white'
                    }`}
                  >
                    لوحة الإدارة
                  </h1>
                  <p
                    className={`text-sm transition-colors duration-500 ${
                      scrolled ? 'text-gray-600' : 'text-white/90'
                    }`}
                  >
                    نظام إدارة متطور
                  </p>
                </div>
              </div>
            </div>

            {/* التنقل - الوسط - عرض محسن ومتناسق */}
            <nav className="hidden md:flex items-center space-x-reverse space-x-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 flex-1 max-w-4xl mx-4 lg:mx-8 justify-center">
              {navItems.map((item, index) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setProfileMenuOpen(false);
                  }}
                  className={`group relative px-4 md:px-6 py-3 rounded-xl text-sm md:text-base font-medium transition-all duration-300 transform hover:scale-105 nav-item flex-1 ${
                    isActive(item.path)
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg active-nav-item`
                      : scrolled
                        ? 'text-gray-700 hover:bg-gray-100/50'
                        : 'text-white hover:bg-white/20'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="flex items-center space-x-reverse space-x-2">
                    <span className="text-lg md:text-xl transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 nav-icon">
                      {item.icon}
                    </span>
                    <span className="text-sm md:text-base font-semibold whitespace-nowrap">{item.label}</span>
                  </span>
                  {isActive(item.path) && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
                  )}
                </button>
              ))}
            </nav>

            {/* الإعدادات والإشعارات - منفصلين ومحركين يميناً */}
            <div className="flex items-center space-x-reverse space-x-3 mr-2 md:mr-4">
              
              {/* زر الإعدادات (بدون منطق) */}
              <button
                className={`relative p-3 rounded-xl transition-all duration-500 transform hover:scale-110 overflow-hidden group ${
                  scrolled
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title="الإعدادات"
              >
                <div className="relative z-10">
                  <svg className="w-6 h-6 transform transition-transform duration-500 group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              {/* الإشعارات */}
              <div className="relative" ref={notificationMenuRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                    scrolled
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <svg
                    className="w-6 h-6"
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
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -left-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce shadow-lg">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute left-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-scale-in z-50">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white flex items-center space-x-reverse space-x-2">
                          <span className="animate-pulse">🔔</span>
                          <span>الإشعارات</span>
                        </h3>
                        {unreadCount > 0 && (
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                            {unreadCount} جديد
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {mockNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-6 py-4 border-b border-gray-100 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 ${
                            notification.unread ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-reverse space-x-3">
                            <div
                              className={`w-10 h-10 ${notification.color} rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0 animate-pulse`}
                            >
                              <span className="text-lg">
                                {notification.icon}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm ${notification.unread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
                              >
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-reverse space-x-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  {notification.time}
                                </span>
                                {notification.unread && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                      <button className="w-full text-center text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors py-2 rounded-lg hover:bg-emerald-50">
                        عرض جميع الإشعارات
                      </button>
                    </div>
                  </div>
                )}
              </div>

            {/* فاصل */}
            <div className="hidden md:block w-px h-8 bg-white/30 mx-3"></div>

            {/* قائمة الملف الشخصي - منفصلة */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className={`flex items-center space-x-reverse space-x-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    scrolled
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                      : 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30'
                  }`}
                >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-base ${
                      scrolled
                        ? 'bg-white text-emerald-600'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {currentUser?.firstName?.[0] || 'A'}
                  </div>
                <span className="text-base font-semibold hidden lg:block">
                  {currentUser?.firstName || 'المشرف'}
                </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${profileMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {profileMenuOpen && !mobileMenuOpen && (
                  <div className="absolute left-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-scale-in z-50">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5">
                      <div className="flex items-center space-x-reverse space-x-3">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-emerald-600 font-bold text-lg shadow-lg">
                          {currentUser?.firstName?.[0] || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm truncate">
                            {currentUser?.firstName && currentUser?.lastName
                              ? `${currentUser.firstName} ${currentUser.lastName}`
                              : currentUser?.firstName || 'المستخدم'}
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
                          navigate('/profile');
                        }}
                        className="w-full px-6 py-3 text-right flex items-center space-x-reverse space-x-3 text-gray-700 hover:bg-emerald-50 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors">
                          <svg
                            className="w-5 h-5 text-emerald-600"
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
                        className="w-full px-6 py-3 text-right flex items-center space-x-reverse space-x-3 text-gray-700 hover:bg-blue-50 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                          <svg
                            className="w-5 h-5 text-blue-600"
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
                        </div>
                        <span className="font-medium">تغيير كلمة المرور</span>
                      </button>

                      <div className="h-px my-2 mx-4 bg-gray-200"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full px-6 py-3 text-right flex items-center space-x-reverse space-x-3 text-red-600 hover:bg-red-50 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors">
                          <svg
                            className="w-5 h-5 text-red-600"
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

              {/* زر القائمة الجوال */}
              <button
                onClick={() => {
                  setMobileMenuOpen(!mobileMenuOpen);
                  if (!mobileMenuOpen) {
                    setProfileMenuOpen(false);
                  }
                }}
                className={`lg:hidden p-2.5 rounded-xl transition-all duration-300 ${
                  scrolled
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title="فتح القائمة"
                aria-label="فتح القائمة"
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

          {/* القائمة الجوال */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-6 pt-4 border-t border-white/20 animate-slide-down">
              <div className="space-y-4">
                {/* قسم الملف الشخصي */}
                <div className={`px-4 py-3 rounded-xl backdrop-blur-sm ${
                  scrolled ? 'bg-gray-50' : 'bg-white/10'
                }`}>
                  <div className="flex items-center space-x-reverse space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      scrolled ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' : 'bg-white text-emerald-600'
                    }`}>
                      {currentUser?.firstName?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                        {currentUser?.firstName || 'المشرف'}
                      </p>
                      <p className={`text-xs ${scrolled ? 'text-gray-600' : 'text-white/70'}`}>
                        مشرف النظام
                      </p>
                    </div>
                  </div>
                </div>

                {/* عناصر التنقل */}
                <nav className="space-y-3">
                  <div className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    scrolled ? 'text-gray-500' : 'text-white/70'
                  }`}>
                    الإدارة الرئيسية
                  </div>
                  {navItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                        setProfileMenuOpen(false);
                      }}
                      className={`w-full px-4 py-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between group mobile-nav-item touch-manipulation ${
                        isActive(item.path)
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg active-item`
                          : scrolled
                            ? 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                            : 'text-white hover:bg-white/20 active:bg-white/30'
                      }`}
                    >
                      <div className="flex items-center space-x-reverse space-x-3">
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      <svg 
                        className={`w-4 h-4 transform transition-transform ${
                          isActive(item.path) ? 'rotate-0' : 'group-hover:-translate-x-1'
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  ))}
                </nav>

                {/* إجراءات سريعة */}
                <div className="space-y-3">
                  <div className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    scrolled ? 'text-gray-500' : 'text-white/70'
                  }`}>
                    إجراءات سريعة
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setMobileMenuOpen(false);
                      setProfileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between group ${
                      scrolled 
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-reverse space-x-3">
                      <span className="text-xl">🔔</span>
                      <span>الإشعارات</span>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                      setProfileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between group mobile-nav-item ${
                      scrolled 
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-reverse space-x-3">
                      <span className="text-xl">👤</span>
                      <span>الملف الشخصي</span>
                    </div>
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/change-password');
                      setMobileMenuOpen(false);
                      setProfileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between group mobile-nav-item ${
                      scrolled 
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-reverse space-x-3">
                      <span className="text-xl">🔐</span>
                      <span>تغيير كلمة المرور</span>
                    </div>
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>

                {/* زر تسجيل الخروج */}
                <div className="pt-4 border-t border-white/20">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between group mobile-nav-item ${
                      scrolled 
                        ? 'text-red-600 hover:bg-red-50' 
                        : 'text-white hover:bg-red-500/20'
                    }`}
                  >
                    <div className="flex items-center space-x-reverse space-x-3">
                      <span className="text-xl">🚪</span>
                      <span>تسجيل الخروج</span>
                    </div>
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden animate-fade-in bg-black/50"
          style={{ top: '80px' }}
          onClick={() => {
            setMobileMenuOpen(false);
            setProfileMenuOpen(false);
          }}
        />
      )}

      {/* Spacer to prevent content from being hidden under fixed header */}
      <div className="h-23"></div>

      <style>{`
        /* RTL Support - Space-x-reverse utility */
        .space-x-reverse > :not([hidden]) ~ :not([hidden]) {
          --tw-space-x-reverse: 1;
          margin-right: calc(var(--tw-space-x) * var(--tw-space-x-reverse));
          margin-left: calc(var(--tw-space-x) * calc(1 - var(--tw-space-x-reverse)));
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        @keyframes navItemFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }

        .nav-item {
          position: relative;
        }

        .nav-item:hover .nav-icon {
          animation: navItemFloat 0.6s ease-in-out;
        }

        .active-nav-item {
          position: relative;
          overflow: hidden;
        }

        .active-nav-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer 2s infinite;
          transition: left 0.5s;
        }

        @keyframes scale-in {
          from {
            transform: scale(0.95) translateY(-10px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes slide-down {
          from {
            max-height: 0;
            opacity: 0;
          }
          to {
            max-height: 500px;
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .mobile-nav-item {
          transform: translateX(0);
        }

        .mobile-nav-item:hover {
          transform: translateX(-2px) scale(0.98);
        }

        .mobile-nav-item.active-item {
          transform: scale(0.98);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .mobile-nav-item:active {
          transform: scale(0.95);
        }

        /* Touch improvements for mobile */
        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #14b8a6);
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #059669, #0d9488);
        }

        /* Enhanced hover effects */
        .nav-item:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        .nav-item.active-nav-item:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }

        /* Responsive breakpoints */
        @media (max-width: 768px) {
          .mobile-nav-item {
            min-height: 48px;
          }
        }

        /* Better focus states */
        .nav-item:focus-visible {
          outline: 2px solid rgba(16, 185, 129, 0.5);
          outline-offset: 2px;
        }

        /* Smooth transitions for all interactive elements */
        button, .nav-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Prevent text selection on interactive elements */
        .nav-item, button {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
      `}</style>
    </>
  );
};

export default AdminHeader;