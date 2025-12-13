import { useState, useEffect } from 'react';
import UserHeader from './Header/UserHeader';
import { UserSidebar } from './Sidebar';
import { ChangePasswordModal } from '@/pages/Auth/ChangePass';
import { Footer } from '../Footer';

interface UserLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

/**
 * UserLayout Component
 *
 * Provides a consistent layout structure for teacher and student pages with:
 * - UserHeader (sticky header with page title, breadcrumb, notifications, user menu)
 * - UserSidebar (collapsible sidebar with navigation based on user role)
 * - Main content area
 *
 * NOTE: This layout does NOT include:
 * - Regular Header (only UserHeader)
 * - Regular Footer (user pages have no footer)
 *
 * @param children - User page content to render
 */
const UserLayout: React.FC<UserLayoutProps> = ({ children, showFooter = false }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);

  const handleChangePasswordClick = () => {
    setIsChangePasswordModalOpen(true);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* UserHeader - For teacher and student (NOT regular Header) */}
      <UserHeader
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onChangePasswordClick={handleChangePasswordClick}
      />

      {/* UserSidebar - For teacher and student */}
      <UserSidebar
        isCollapsed={sidebarCollapsed}
        isMobileOpen={sidebarOpen}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onMobileToggle={() => setSidebarOpen(!sidebarOpen)}
        onMobileClose={() => setSidebarOpen(false)}
        onChangePasswordClick={handleChangePasswordClick}
      />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area - User pages */}
      <div
        className={`min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100 transition-all duration-300 pt-14 sm:pt-16 lg:pt-16 ${
          isMobile
            ? 'mr-0'
            : sidebarCollapsed
              ? 'lg:mr-[80px]'
              : 'lg:mr-[280px]'
        }`}
        dir="rtl">
        {children}
      </div>

      {/* Footer - Only for teacher and student with proper sidebar margin */}
      {showFooter && (
        <div
          className={`transition-all duration-300 ${
            isMobile
              ? 'mr-0'
              : sidebarCollapsed
                ? 'lg:mr-[80px]'
                : 'lg:mr-[280px]'
          }`}
        >
          <Footer />
        </div>
      )}

      {/* Change Password Modal - Shared between Header and Sidebar */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </>
  );
};

export default UserLayout;
