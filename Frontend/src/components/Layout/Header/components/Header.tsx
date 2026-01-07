import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

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

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  // ==================== Hooks ====================
  const { user: currentUser, logout: authLogout, isAuthenticated } = useAuth();
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
  const isTeacherOrAdmin = isTeacher || isAdmin;
  const { primaryNavItems, secondaryNavItems } = useNavigation({
    isTeacher,
    isAdmin,
    isTeacherOrAdmin,
  });

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
    if (!isAuthenticated && !currentUser) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

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
  if (!currentUser) {
    return null;
  }

  return (
    <>
      {/* ==================== Header ==================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-[100] bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 shadow-xl backdrop-blur-xl border-b border-white/20 m-0 ${className}`}
        dir="rtl"
      >
        <div className="max-w-[2000px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          {/* ==================== Main Row ==================== */}
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 gap-1 sm:gap-2 md:gap-3 py-1 sm:py-2 overflow-hidden">
            
            {/* ==================== Logo ==================== */}
            <Link
              to="/"
              className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 hover:opacity-90 transition-all duration-300 group flex-shrink-0 min-w-0 max-w-[30%] sm:max-w-[35%]"
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
              <div className="hidden min-[375px]:block min-w-0 overflow-hidden">
                <h1 className="text-xs sm:text-sm md:text-lg lg:text-xl font-bold text-white drop-shadow-lg leading-tight truncate">
                  مدرسة القرآن الكريم
                </h1>
                <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-emerald-50/90 font-medium truncate">
                  أكاديمية مدرسة المهاجرين
                </p>
              </div>
            </Link>

            {/* ==================== Navigation - Desktop ==================== */}
            <div className="hidden sm:flex flex-1 justify-center min-w-0 max-w-[40%] sm:max-w-[45%] md:max-w-[50%] mx-0.5 sm:mx-1 md:mx-2 lg:mx-4 overflow-hidden">
              <TabNavigation items={primaryNavItems} secondaryItems={secondaryNavItems} />
            </div>

            {/* ==================== Right Tools ==================== */}
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 flex-shrink-0 min-w-0 max-w-[30%] sm:max-w-[25%]">
              
              {/* Notifications */}
              <div className="relative">
                <NotificationHeader userId={currentUser._id} />
              </div>

              {/* Divider */}
              <div className="hidden min-[375px]:block h-6 sm:h-8 w-px bg-white/30"></div>

              {/* Profile Menu */}
              <div className="relative z-[200]">
                <button
                  ref={profileMenuRef}
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
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
                  <div className="hidden sm:flex flex-col items-start min-w-0 mr-1 sm:mr-1.5 lg:mr-2 overflow-hidden">
                    <span className="text-white text-[10px] sm:text-xs md:text-sm font-semibold truncate max-w-[60px] sm:max-w-[80px] md:max-w-[100px]">
                      {currentUser?.firstName && currentUser?.lastName
                        ? `${currentUser.firstName} ${currentUser.lastName}`
                        : currentUser?.firstName || "المستخدم"}
                    </span>
                    <span className="text-emerald-100 text-[9px] sm:text-[10px] md:text-xs font-medium truncate">
                      {currentUser?.role === "teacher" ? "معلم" : currentUser?.role === "admin" ? "مدير" : "طالب"}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`w-4 h-4 sm:w-[18px] sm:h-[18px] text-white transition-transform duration-200 flex-shrink-0 hidden min-[375px]:block ${
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

              {/* Mobile Menu Button */}
              <div className="sm:hidden">
                <MobileMenuButton
                  isOpen={isMenuOpen}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== Header Spacer ==================== */}
      <div className="h-14 sm:h-16 md:h-20"></div>

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
