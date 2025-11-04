import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChangePasswordModal } from '@/pages/Auth/ChangePass';
import { showLogoutConfirmation } from '@/components/utils/logoutUtils';
import NotificationHeader from '@/components/Notifications/NotificationHeader';

// Import custom hooks
import { useNavigation } from '../hooks/useNavigation';
import { useLogo } from '@/components/Hooks/useLogo';
import { Logo } from '@/components/UI';
import PrimaryNavigation from './Navigation/PrimaryNavigation';
import SecondaryNavigation from './Navigation/SecondaryNavigation';
import ProfileButton from './ProfileMenu/ProfileButton';
import ProfileMenu from './ProfileMenu/ProfileMenu';
import MobileMenuButton from './MobileMenu/MobileMenuButton';
import MobileMenu from './MobileMenu/MobileMenu';

import type { HeaderProps } from '../types/navigation.types';

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { user: currentUser, logout: authLogout, isAuthenticated } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Custom hooks
  const { logoUrl, logoLoading } = useLogo();
  const isTeacher = currentUser?.role === 'teacher';
  const isAdmin = currentUser?.role === 'admin';
  const isTeacherOrAdmin = isTeacher || isAdmin;
  const { primaryNavItems, secondaryNavItems } = useNavigation({
    isTeacher,
    isAdmin,
    isTeacherOrAdmin,
  });

  // Handlers
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

  // Effects
  useEffect(() => {
    if (!isAuthenticated && !currentUser) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
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
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  if (!currentUser) {
    return null; // أو مكون تحميل
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 shadow-2xl backdrop-blur-sm ${className}`}
        dir="rtl"
      >
        <div className="max-w-[2000px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {/* الصف الأول - الرئيسي */}
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 lg:h-20 gap-2 sm:gap-3 md:gap-4">
            {/* اللوجو */}
            <Link
              to="/"
              className="flex items-center gap-2 md:gap-3 hover:opacity-90 transition-all duration-300 group flex-shrink-0 min-w-0"
            >
              <div className="relative transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 flex-shrink-0">
                <Logo
                  logoUrl={logoUrl}
                  logoLoading={logoLoading}
                  size="sm"
                  alt="مدرسة القرآن الكريم"
                  showGlow={false}
                  variant="header"
                />
              </div>
              <div className="hidden sm:block min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white drop-shadow-lg leading-tight truncate">
                  مدرسة القرآن الكريم
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-emerald-100/90 font-medium truncate">
                  أكاديمية مدرسة المهاجرين
                </p>
              </div>
            </Link>

            {/* التنقل الرئيسي - Desktop */}
            <PrimaryNavigation items={primaryNavItems} />

            {/* الأدوات اليمنى */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
              {/* الإشعارات */}
              <div className="relative">
                <NotificationHeader userId={currentUser._id} />
              </div>

              {/* خط فاصل عمودي */}
              <div className="hidden sm:block h-6 md:h-8 w-px bg-white/30 mx-1"></div>

              {/* الملف الشخصي */}
              <div className="relative" ref={profileMenuRef}>
                <ProfileButton
                  user={currentUser}
                  isOpen={profileMenuOpen}
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                />

                <ProfileMenu
                  user={currentUser}
                  isOpen={profileMenuOpen}
                  onClose={() => setProfileMenuOpen(false)}
                  onProfileClick={handleProfileClick}
                  onChangePasswordClick={handleChangePasswordClick}
                  onLogout={handleLogout}
                />
              </div>

              {/* خط فاصل عمودي - قبل زر القائمة */}
              <div className="xl:hidden h-6 md:h-8 w-px bg-white/30 mx-1"></div>

              {/* زر القائمة */}
              <MobileMenuButton
                isOpen={isMenuOpen}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              />
            </div>
          </div>

          {/* الصف الثاني - التنقل الثانوي */}
          <SecondaryNavigation items={secondaryNavItems} />
        </div>
      </header>

      {/* مسافة بديلة للهيدر */}
      <div className="h-28 sm:h-32 md:h-36 xl:h-40"></div>

      {/* قائمة الموبايل */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={currentUser}
        primaryItems={primaryNavItems}
        secondaryItems={secondaryNavItems}
        onLogout={handleLogout}
        onProfileClick={handleProfileClick}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </>
  );
};

export default Header;
