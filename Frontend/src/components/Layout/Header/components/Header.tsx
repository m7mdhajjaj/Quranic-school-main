import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Home, Target, Mail, Shield, LogIn, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Hooks
import { useHeader } from '../hooks/useHeader';

// Components
import { Logo } from '@/components/UI';
import Avatar from '@/components/Avatar/Avatar';
import { NotificationHeader } from '@/components/Notifications';
import ProfileMenu from '../../ProfileMenu';
import TabNavigation from './Navigation/TabNavigation';
import MobileMenuButton from './MobileMenu/MobileMenuButton';
import MobileMenu from './MobileMenu/MobileMenu';

// Modals
import { ChangePasswordModal } from '@/pages/Auth/ChangePass';

// Types
import type { HeaderProps } from '../types/navigation.types';
import { Info } from 'lucide-react';

// ============================================================================
// Guest Navigation Items
// ============================================================================
const GUEST_NAV_ITEMS = [
  { path: '/home', label: 'الرئيسية', icon: Home },
  { path: '/about', label: 'نبذة عنا', icon: Info },
  { path: '/goals', label: 'الأهداف', icon: Target },
  { path: '/contact', label: 'تواصل معنا', icon: Mail },
];

// ============================================================================
// Header Component
// ============================================================================
const Header: React.FC<HeaderProps> = ({ className = '', isGuest = false }) => {
  const navigate = useNavigate();
  
  // Use custom hook for all logic
  const {
    currentUser,
    isLoading,
    logoUrl,
    logoLoading,
    primaryNavItems,
    secondaryNavItems,
    combinedItems,
    isMenuOpen,
    profileMenuOpen,
    isChangePasswordModalOpen,
    profileMenuRef,
    handleLogout,
    handleProfileClick,
    handleChangePasswordClick,
    toggleMobileMenu,
    toggleProfileMenu,
    closeMobileMenu,
    closeProfileMenu,
    closeChangePasswordModal,
    isGuestPathActive,
  } = useHeader({ isGuest });
  
  return (
    <>
      {/* ==================== Header ==================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-[100] bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 shadow-2xl backdrop-blur-xl border-b-2 border-white/30 m-0 ${className}`}
        dir="rtl"
      >
        <div className="max-w-[2000px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          {/* ==================== Top Row - Logo, Navigation & Tools ==================== */}
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 gap-2 sm:gap-3 md:gap-4 py-2">
            
            {/* ==================== Logo ==================== */}
            <Link
              to="/"
              className="flex items-center gap-1 sm:gap-1.5 md:gap-2 hover:opacity-90 transition-all duration-300 group flex-shrink-0"
            >
              <div className="relative transition-transform duration-300 group-hover:scale-110 flex-shrink-0">
                <Logo
                  logoUrl={logoUrl}
                  logoLoading={logoLoading}
                  size="sm"
                  alt="مدرسة القرآن الكريم"
                  showGlow={false}
                  variant="header"
                />
              </div>
              <div className="block flex-shrink min-w-0">
                <h1 className="text-sm md:text-base lg:text-lg font-bold text-white drop-shadow-lg leading-tight truncate">
                  مدرسة القرآن الكريم
                </h1>
                <p className="text-[10px] md:text-xs text-emerald-50/95 font-medium truncate">
                  أكاديمية مدرسة المهاجرين
                </p>
              </div>
            </Link>

            {/* ==================== Navigation - Desktop ==================== */}
            <div className="hidden lg:flex flex-1 justify-center px-2 lg:px-4">
              {isGuest ? (
                // Guest Navigation
                <nav className="flex items-center gap-1">
                  {GUEST_NAV_ITEMS.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isGuestPathActive(item.path)
                          ? 'bg-white/25 text-white shadow-lg'
                          : 'text-white/90 hover:bg-white/15 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              ) : isLoading ? (
                 <div className="flex items-center gap-2 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-9 w-24 bg-white/20 rounded-xl" />
                    ))}
                 </div>
              ) : (
                 <TabNavigation items={combinedItems} />
              )}
            </div>

            {/* ==================== Right Tools ==================== */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
              
              {currentUser ? (
                <>
                  {/* Notifications */}
                  <div className="relative">
                    <NotificationHeader userId={currentUser._id} />
                  </div>

                  {/* Divider */}
                  <div className="hidden sm:block h-6 sm:h-8 w-px bg-white/30"></div>

                  {/* Profile Menu */}
                  <div className="relative z-[200]">
                    <button
                      ref={profileMenuRef}
                      onClick={toggleProfileMenu}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                      aria-label="قائمة الملف الشخصي"
                      aria-expanded={profileMenuOpen}
                    >
                      <Avatar
                        user={currentUser}
                        size="sm"
                        border="ring"
                        showStatus={true}
                        statusSize="sm"
                        autoFetch={true}
                        userId={currentUser._id}
                        userRole={currentUser.role}
                        className="flex-shrink-0"
                      />
                      <div className="hidden md:flex flex-col items-start overflow-hidden">
                        <span className="text-white text-xs md:text-sm font-semibold truncate max-w-[100px]">
                          {currentUser?.firstName && currentUser?.lastName
                            ? `${currentUser.firstName} ${currentUser.lastName}`
                            : currentUser?.firstName || "المستخدم"}
                        </span>
                        <span className="text-emerald-100 text-[10px] md:text-xs font-medium truncate">
                          {currentUser?.role === "teacher" ? "معلم" : currentUser?.role === "admin" ? "مدير" : "طالب"}
                        </span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`w-4 h-4 text-white transition-transform duration-200 flex-shrink-0 hidden sm:block ${
                          profileMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <ProfileMenu
                      user={currentUser}
                      isOpen={profileMenuOpen}
                      onClose={closeProfileMenu}
                      onProfileClick={handleProfileClick}
                      onChangePasswordClick={handleChangePasswordClick}
                      onLogout={handleLogout}
                      buttonRef={profileMenuRef}
                    />
                  </div>
                </>
              ) : isGuest ? (
                <>
                  {/* Welcome Page Button */}
                  <motion.button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-3 py-2 bg-white/20 text-white font-medium rounded-xl hover:bg-white/30 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">الترحيب</span>
                  </motion.button>

                  {/* Guest Login Button */}
                  <motion.button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">تسجيل الدخول</span>
                  </motion.button>
                </>
              ) : (
                <>
                  {/* Loading State Skeleton */}
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse"></div>
                     <div className="hidden sm:block h-8 w-px bg-white/20"></div>
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse"></div>
                        <div className="hidden md:flex flex-col gap-1">
                           <div className="w-20 h-3 bg-white/20 rounded animate-pulse"></div>
                           <div className="w-12 h-2 bg-white/20 rounded animate-pulse"></div>
                        </div>
                     </div>
                  </div>
                </>
              )}

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <MobileMenuButton
                  isOpen={isMenuOpen}
                  onClick={toggleMobileMenu}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== Header Spacer ==================== */}
      <div className="h-16 sm:h-20"></div>

      {/* ==================== Mobile Menu ==================== */}
      {isGuest ? (
        // Guest Mobile Menu
        <motion.div
          initial={false}
          animate={{
            height: isMenuOpen ? 'auto' : 0,
            opacity: isMenuOpen ? 1 : 0,
          }}
          className="lg:hidden fixed top-16 sm:top-20 left-0 right-0 z-[99] overflow-hidden bg-emerald-700/95 backdrop-blur-lg"
        >
          <nav className="px-4 py-3 space-y-1">
            {GUEST_NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isGuestPathActive(item.path)
                    ? 'bg-white/25 text-white'
                    : 'text-white/90 hover:bg-white/15'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
            {/* Login Button in Mobile Menu */}
            <Link
              to="/login"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-white text-emerald-600 mt-2"
            >
              <LogIn className="w-5 h-5" />
              تسجيل الدخول
            </Link>
          </nav>
        </motion.div>
      ) : (
        <MobileMenu
          isOpen={isMenuOpen}
          onClose={closeMobileMenu}
          user={currentUser}
          primaryItems={primaryNavItems}
          secondaryItems={secondaryNavItems}
          onLogout={handleLogout}
          onProfileClick={handleProfileClick}
        />
      )}

      {/* ==================== Change Password Modal ==================== */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={closeChangePasswordModal}
      />
    </>
  );
};

export default Header;
