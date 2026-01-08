import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Menu as MenuIcon } from 'lucide-react';

// Hooks
import { useAuth } from '@/hooks/useAuth';
import { useNavigation } from '../hooks/useNavigation';
import { useLogo } from '@/components/Hooks/useLogo';

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

// Utils
import { showLogoutConfirmation } from '@/pages/Auth/LogOut/logoutUtils';

// Types
import type { HeaderProps } from '../types/navigation.types';
import type { NavigationItem } from '../types/navigation.types';

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  // ==================== Hooks ====================
  const { user: currentUser, logout: authLogout, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { logoUrl, logoLoading } = useLogo();

  // ==================== State ====================
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // ==================== Refs ====================
  const profileMenuRef = useRef<HTMLButtonElement>(null);

  // ==================== Computed Values ====================
  const isTeacher = currentUser?.role === 'teacher';
  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';
  const isTeacherOrAdmin = isTeacher || isAdmin;
  const { primaryNavItems, secondaryNavItems } = useNavigation({
    isTeacher,
    isAdmin,
    isStudent,
    isTeacherOrAdmin,
  });

  const combinedItems: NavigationItem[] = primaryNavItems;

  // ==================== Handlers ====================
  const handleLogout = useCallback(async () => {
    const confirmed = await showLogoutConfirmation({
      userType: 'user',
      onConfirm: () => {
        setIsMenuOpen(false);
        setProfileMenuOpen(false);
        authLogout();
      },
    });
    if (!confirmed) console.log('تم إلغاء تسجيل الخروج');
  }, [authLogout]);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleChangePasswordClick = () => {
    setIsChangePasswordModalOpen(true);
  };

  // ==================== Effects ====================
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !currentUser) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate, isLoading]);

  // Close menus on ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false);
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  // ==================== Render ====================

  // ==================== Render ====================
  // Show header shell even if user is loading to prevent layout shift
  // but content will be conditionally rendered
  
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
              {/* Combine primary and grouped secondary items into one nav */}
              {isLoading ? (
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
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
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
                      onClose={() => setProfileMenuOpen(false)}
                      onProfileClick={handleProfileClick}
                      onChangePasswordClick={handleChangePasswordClick}
                      onLogout={handleLogout}
                      buttonRef={profileMenuRef}
                    />
                  </div>
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

              {/* Mobile Menu Button - Always Visible if safe, or hide if loading? Better safe. */}
              <div className="lg:hidden">
                <MobileMenuButton
                  isOpen={isMenuOpen}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                />
              </div>
            </div>
          </div>

          {/* ==================== Bottom Row - Removed as per request ==================== */}
          {/* 
          <div className="hidden lg:block pb-2">
            <div className="flex items-center justify-center">
              <div className="max-w-[80%]">
                <TabNavigation items={[]} secondaryItems={secondaryNavItems} />
              </div>
            </div>
          </div> 
          */}
        </div>
      </header>

      {/* ==================== Header Spacer - Adjusted for single row ==================== */}
      <div className="h-16 sm:h-20"></div>

      {/* ==================== Mobile Menu ==================== */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={currentUser}
        primaryItems={primaryNavItems}
        secondaryItems={secondaryNavItems}
        onLogout={handleLogout}
        onProfileClick={handleProfileClick}
      />

      {/* ==================== Change Password Modal ==================== */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </>
  );
};

export default Header;
